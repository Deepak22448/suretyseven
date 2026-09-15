import path from "node:path";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { DocumentStatusSchema, DocumentTypeSchema, SortOrderSchema, COMMON_ERROR_CODES } from "@suretyseven/shared";
import { AppError } from "../../lib/errors";
import { logger } from "../../lib/logger";
import { sha256 } from "../../lib/hash";
import { UploadFieldsSchema, validateUploadedFile } from "./validation/upload.validation";
import { STORAGE_DIR } from "./documents.constants";
import {
  newDocumentId,
  findByContentHash,
  createDocument,
  findById,
  getHistory,
  listDocuments,
  countsByStatus,
  deleteDocument,
} from "./documents.repo";

export async function uploadDocument(file: Express.Multer.File | undefined, rawFields: unknown) {
  const fileError = validateUploadedFile(file);
  if (fileError) throw new AppError(fileError, `Upload rejected: ${fileError}`, 400);

  const fields = UploadFieldsSchema.safeParse(rawFields);
  if (!fields.success) {
    throw new AppError(
      COMMON_ERROR_CODES.INVALID_REQUEST,
      fields.error.issues.map((i) => i.message).join("; "),
      400,
    );
  }

  const contentHash = sha256(file!.buffer);

  const existing = await findByContentHash(contentHash);
  if (existing) {
    logger.info({ documentId: existing.id, status: existing.status }, "duplicate upload detected");
    return { documentId: existing.id, status: existing.status, duplicate: true };
  }

  const storageDir = path.resolve(STORAGE_DIR);
  await mkdir(storageDir, { recursive: true });
  const storagePath = path.join(storageDir, `${contentHash}.pdf`);
  await writeFile(storagePath, file!.buffer);

  const id = newDocumentId();
  try {
    const doc = await createDocument({
      id,
      filename: file!.originalname,
      documentType: fields.data.documentType,
      metadata: fields.data.metadata,
      contentHash,
      fileSize: file!.size,
      storagePath,
    });
    logger.info({ documentId: doc.id, status: doc.status }, "document uploaded");
    return { documentId: doc.id, status: doc.status, duplicate: false };
  } catch (err: any) {
    // Race: two concurrent identical uploads can both miss the pre-check — the DB unique constraint is the real lock.
    if (err?.code === "P2002") {
      const winner = await findByContentHash(contentHash);
      if (winner) return { documentId: winner.id, status: winner.status, duplicate: true };
    }
    throw err;
  }
}

async function findDocumentOrThrow(id: string) {
  const doc = await findById(id);
  if (!doc) throw new AppError(COMMON_ERROR_CODES.NOT_FOUND, `No document with id ${id}`, 404);
  return doc;
}

export async function getDocumentDetail(id: string) {
  const doc = await findDocumentOrThrow(id);
  return {
    documentId: doc.id,
    filename: doc.filename,
    documentType: doc.documentType,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    attemptCount: doc.attemptCount,
    metadata: doc.metadata,
    result: doc.extractedResult,
    failureReason: doc.failureReason,
  };
}

export async function getDocumentHistoryList(id: string) {
  await findDocumentOrThrow(id);
  const history = await getHistory(id);
  return history.map((h) => ({
    status: h.status,
    timestamp: h.timestamp,
    attemptNumber: h.attemptNumber,
    outcome: h.outcome,
    reason: h.reason,
  }));
}

export async function deleteDocumentById(id: string) {
  const doc = await findDocumentOrThrow(id);
  await deleteDocument(id);
  // Best-effort — an already-missing file shouldn't block the delete the user asked for.
  await unlink(doc.storagePath).catch(() => {});
  logger.info({ documentId: id }, "document deleted");
}

export async function getDocumentStats() {
  const counts = await countsByStatus();
  return {
    total: Object.values(counts).reduce((sum, n) => sum + n, 0),
    uploaded: counts.UPLOADED,
    processing: counts.PROCESSING,
    processed: counts.PROCESSED,
    validationFailed: counts.VALIDATION_FAILED,
    failed: counts.FAILED,
  };
}

export async function listDocumentsPaged(query: {
  status?: unknown;
  documentType?: unknown;
  page?: unknown;
  pageSize?: unknown;
  sortOrder?: unknown;
}) {
  const statusParse = query.status ? DocumentStatusSchema.safeParse(query.status) : undefined;
  if (statusParse && !statusParse.success) {
    throw new AppError(COMMON_ERROR_CODES.INVALID_QUERY, "Invalid status filter", 400);
  }

  const typeParse = query.documentType ? DocumentTypeSchema.safeParse(query.documentType) : undefined;
  if (typeParse && !typeParse.success) {
    throw new AppError(COMMON_ERROR_CODES.INVALID_QUERY, "Invalid documentType filter", 400);
  }

  const sortOrder = SortOrderSchema.safeParse(query.sortOrder).data ?? "desc";

  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));

  const { items, total } = await listDocuments({
    status: statusParse?.data,
    documentType: typeParse?.data,
    page,
    pageSize,
    sortOrder,
  });

  return {
    items: items.map((d) => ({
      documentId: d.id,
      filename: d.filename,
      documentType: d.documentType,
      status: d.status,
      createdAt: d.createdAt,
    })),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

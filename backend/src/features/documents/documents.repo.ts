import { customAlphabet } from "nanoid";
import { Prisma } from "@prisma/client";
import { DocumentStatus, ProcessorOutcome, SortOrder } from "@suretyseven/shared";
import { prisma } from "../../db/client";

const nanoid = customAlphabet("0123456789ABCDEFGHJKMNPQRSTVWXYZ", 8);
export const newDocumentId = () => `DOC-${nanoid()}`;

export function findByContentHash(contentHash: string) {
  return prisma.document.findUnique({ where: { contentHash } });
}

export function createDocument(input: {
  id: string;
  filename: string;
  documentType: string;
  metadata?: Record<string, unknown>;
  contentHash: string;
  fileSize: number;
  storagePath: string;
}) {
  return prisma.$transaction(async (tx) => {
    const doc = await tx.document.create({
      data: { ...input, metadata: (input.metadata as Prisma.InputJsonValue) ?? undefined },
    });
    await tx.documentStatusHistory.create({
      data: { documentId: doc.id, status: "UPLOADED" },
    });
    return doc;
  });
}

export function findById(id: string) {
  return prisma.document.findUnique({ where: { id } });
}

// History rows reference the document via a non-cascading FK — delete them first or the
// document delete fails the constraint.
export function deleteDocument(id: string) {
  return prisma.$transaction([
    prisma.documentStatusHistory.deleteMany({ where: { documentId: id } }),
    prisma.document.delete({ where: { id } }),
  ]);
}

export function getHistory(documentId: string) {
  return prisma.documentStatusHistory.findMany({
    where: { documentId },
    orderBy: { timestamp: "asc" },
  });
}

export async function listDocuments(params: {
  status?: DocumentStatus;
  documentType?: string;
  page: number;
  pageSize: number;
  sortOrder: SortOrder;
}) {
  const where = {
    ...(params.status ? { status: params.status } : {}),
    ...(params.documentType ? { documentType: params.documentType } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: { createdAt: params.sortOrder },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.document.count({ where }),
  ]);
  return { items, total };
}

export async function countsByStatus(): Promise<Record<DocumentStatus, number>> {
  const groups = await prisma.document.groupBy({ by: ["status"], _count: { status: true } });
  const counts: Record<DocumentStatus, number> = {
    UPLOADED: 0,
    PROCESSING: 0,
    PROCESSED: 0,
    VALIDATION_FAILED: 0,
    FAILED: 0,
  };
  for (const g of groups) counts[g.status] = g._count.status;
  return counts;
}

// Single transaction — history and aggregate status must never drift apart.
export function recordEvent(params: {
  documentId: string;
  eventStatus: DocumentStatus;
  attemptNumber?: number;
  outcome?: ProcessorOutcome;
  reason?: string;
  extractedSnapshot?: Record<string, unknown>;
  updateAggregate?: {
    status: DocumentStatus;
    extractedResult?: Record<string, unknown> | null;
    failureReason?: string | null;
  };
}) {
  return prisma.$transaction(async (tx) => {
    await tx.documentStatusHistory.create({
      data: {
        documentId: params.documentId,
        status: params.eventStatus,
        attemptNumber: params.attemptNumber,
        outcome: params.outcome,
        reason: params.reason,
        extractedSnapshot: params.extractedSnapshot as Prisma.InputJsonValue | undefined,
      },
    });
    if (params.updateAggregate) {
      const { extractedResult } = params.updateAggregate;
      await tx.document.update({
        where: { id: params.documentId },
        data: {
          status: params.updateAggregate.status,
          extractedResult:
            extractedResult === null ? Prisma.JsonNull : (extractedResult as Prisma.InputJsonValue | undefined),
          failureReason: params.updateAggregate.failureReason,
        },
      });
    }
  });
}

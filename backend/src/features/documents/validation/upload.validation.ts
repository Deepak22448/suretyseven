import { z } from "zod";
import { DocumentTypeSchema, DOCUMENT_ERROR_CODES, type DocumentErrorCode } from "@suretyseven/shared";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "../documents.constants";

export const UploadFieldsSchema = z.object({
  documentType: DocumentTypeSchema,
  metadata: z
    .string()
    .optional()
    .transform((raw, ctx) => {
      if (!raw) return undefined;
      try {
        return JSON.parse(raw) as Record<string, unknown>;
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "metadata must be valid JSON" });
        return z.NEVER;
      }
    }),
});

export function validateUploadedFile(file: Express.Multer.File | undefined): DocumentErrorCode | null {
  if (!file) return DOCUMENT_ERROR_CODES.MISSING_FILE;
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) return DOCUMENT_ERROR_CODES.INVALID_FILE_TYPE;
  if (file.size > MAX_FILE_SIZE_BYTES) return DOCUMENT_ERROR_CODES.FILE_TOO_LARGE;
  return null;
}

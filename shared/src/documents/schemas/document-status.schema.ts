import { z } from "zod";

export const DOCUMENT_STATUSES = [
  "UPLOADED",
  "PROCESSING",
  "PROCESSED",
  "VALIDATION_FAILED",
  "FAILED",
] as const;
export const DocumentStatusSchema = z.enum(DOCUMENT_STATUSES);
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;

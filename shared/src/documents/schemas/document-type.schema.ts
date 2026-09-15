import { z } from "zod";

export const DOCUMENT_TYPES = [
  "FINANCIAL_STATEMENT",
  "GST_RETURN",
  "BANK_STATEMENT",
  "PROJECT_CONTRACT",
  "OTHER",
] as const;
export const DocumentTypeSchema = z.enum(DOCUMENT_TYPES);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;

import { z } from "zod";
import { DocumentStatusSchema } from "./document-status.schema";
import { DocumentTypeSchema } from "./document-type.schema";

// Shared by document-summary/document-detail so the two can't silently drift.
export const DocumentBaseSchema = z.object({
  documentId: z.string(),
  filename: z.string(),
  documentType: DocumentTypeSchema,
  status: DocumentStatusSchema,
  createdAt: z.string(),
});

import { z } from "zod";
import { DocumentSummarySchema } from "./document-summary.schema";

export const PaginatedDocumentsSchema = z.object({
  items: z.array(DocumentSummarySchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
export type PaginatedDocuments = z.infer<typeof PaginatedDocumentsSchema>;

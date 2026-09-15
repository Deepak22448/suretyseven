import { z } from "zod";
import { DocumentStatusSchema } from "./document-status.schema";

export const UploadResponseSchema = z.object({
  documentId: z.string(),
  status: DocumentStatusSchema,
  duplicate: z.boolean(),
});
export type UploadResponse = z.infer<typeof UploadResponseSchema>;

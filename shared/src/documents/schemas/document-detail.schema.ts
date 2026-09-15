import { z } from "zod";
import { DocumentBaseSchema } from "./document-base.schema";
import { ExtractedResultSchema } from "./extracted-result.schema";

export const DocumentDetailSchema = DocumentBaseSchema.extend({
  updatedAt: z.string(),
  attemptCount: z.number(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  result: ExtractedResultSchema.nullable().optional(),
  failureReason: z.string().nullable().optional(),
});
export type DocumentDetail = z.infer<typeof DocumentDetailSchema>;

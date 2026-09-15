import { z } from "zod";

export const DocumentStatsSchema = z.object({
  total: z.number(),
  uploaded: z.number(),
  processing: z.number(),
  processed: z.number(),
  validationFailed: z.number(),
  failed: z.number(),
});
export type DocumentStats = z.infer<typeof DocumentStatsSchema>;

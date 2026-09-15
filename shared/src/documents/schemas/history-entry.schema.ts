import { z } from "zod";
import { DocumentStatusSchema } from "./document-status.schema";
import { ProcessorOutcomeSchema } from "./processor-outcome.schema";

export const HistoryEntrySchema = z.object({
  status: DocumentStatusSchema,
  timestamp: z.string(),
  attemptNumber: z.number().nullable().optional(),
  outcome: ProcessorOutcomeSchema.nullable().optional(),
  reason: z.string().nullable().optional(),
});
export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;

import { z } from "zod";

export const PROCESSOR_OUTCOMES = ["SUCCESS", "TIMEOUT", "ERROR", "INVALID_RESULT"] as const;
export const ProcessorOutcomeSchema = z.enum(PROCESSOR_OUTCOMES);
export type ProcessorOutcome = z.infer<typeof ProcessorOutcomeSchema>;

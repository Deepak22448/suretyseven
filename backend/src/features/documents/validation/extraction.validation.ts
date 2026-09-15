import { ExtractedResultSchema, type RawExtractedResult } from "@suretyseven/shared";

export type ExtractionValidation =
  | { valid: true }
  | { valid: false; errors: string[] };

// SUCCESS only means the processor didn't error — fields still need validating before use.
export function validateExtraction(raw: RawExtractedResult): ExtractionValidation {
  const result = ExtractedResultSchema.safeParse(raw);
  if (result.success) return { valid: true };
  const errors = result.error.issues.map((issue) => issue.message);
  return { valid: false, errors };
}

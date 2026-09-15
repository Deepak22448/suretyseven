import { z } from "zod";

// Same fields as ExtractedResultSchema but unconstrained/nullable (may be corrupted/missing).
// Not derived from it — that would drag along its strict rules and reject the data this represents.
export const RawExtractedResultSchema = z.object({
  companyName: z.string().nullable().optional(),
  registrationNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  annualRevenue: z.number().nullable().optional(),
  documentDate: z.string().nullable().optional(),
});
export type RawExtractedResult = z.infer<typeof RawExtractedResultSchema>;

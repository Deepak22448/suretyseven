import { z } from "zod";

// Fields the mock processor extracts, and the rules they're validated against.
export const ExtractedResultSchema = z.object({
  companyName: z.string().trim().min(1, "companyName is required"),
  registrationNumber: z.string().trim().min(1, "registrationNumber is required"),
  address: z.string().optional(),
  annualRevenue: z.number().min(0, "annualRevenue must be >= 0"),
  documentDate: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "documentDate must be a valid date"),
});
export type ExtractedResult = z.infer<typeof ExtractedResultSchema>;

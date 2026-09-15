import { z } from "zod";
import { DocumentBaseSchema } from "./document-base.schema";

export const DocumentSummarySchema = DocumentBaseSchema;
export type DocumentSummary = z.infer<typeof DocumentSummarySchema>;

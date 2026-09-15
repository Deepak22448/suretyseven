import { z } from "zod";

export const DocumentFileSchema = z.object({
  filename: z.string(),
  mimeType: z.string(),
  data: z.string(), // base64-encoded file bytes
});
export type DocumentFile = z.infer<typeof DocumentFileSchema>;

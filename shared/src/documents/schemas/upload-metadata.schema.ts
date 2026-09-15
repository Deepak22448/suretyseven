import { z } from "zod";

export const UploadMetadataSchema = z.record(z.string(), z.unknown()).optional();

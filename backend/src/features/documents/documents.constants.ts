import { DOCUMENT_TYPES, ONE_MB } from "@suretyseven/shared";

export const MAX_PROCESSING_ATTEMPTS = 3;
// Overridable so tests can shrink the backoff instead of sleeping 3s per retry.
export const RETRY_BACKOFF_MS = Number(process.env.RETRY_BACKOFF_MS) || 3_000;
export const POLL_INTERVAL_MS = 1_000;
export const MOCK_PROCESSING_DELAY_MS = 1_500;

export const ALLOWED_DOCUMENT_TYPES = DOCUMENT_TYPES;
export const ALLOWED_MIME_TYPES = ["application/pdf"];
export const MAX_FILE_SIZE_BYTES = 10 * ONE_MB;

export const STORAGE_DIR = process.env.STORAGE_DIR ?? "storage";

// Shrinks retry backoff so tests don't sleep 3s per attempt — must run before constants.ts loads.
process.env.RETRY_BACKOFF_MS = "50";
process.env.STORAGE_DIR = "storage/test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://suretyseven:suretyseven@localhost:5432/documents";

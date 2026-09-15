// Fixed to a non-UTC zone so date-filter tests catch local-vs-UTC bugs on any machine, not just ours.
process.env.TZ = "Asia/Kolkata";
// Shrinks retry backoff so tests don't sleep 3s per attempt — must run before constants.ts loads.
process.env.RETRY_BACKOFF_MS = "50";
process.env.STORAGE_DIR = "storage/test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://suretyseven:suretyseven@localhost:5432/documents";

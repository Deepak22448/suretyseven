import type { Document } from "@prisma/client";
import { prisma } from "../../../db/client";
import { RETRY_BACKOFF_MS } from "../documents.constants";

// Claims UPLOADED docs or PROCESSING ones stuck past RETRY_BACKOFF_MS — a stuck row is
// indistinguishable from a crashed one, so this one query handles retries and crash recovery.
// SKIP LOCKED keeps it safe if multiple pollers ever run concurrently.
export async function claimNextDocument(): Promise<Document | null> {
  const rows = await prisma.$queryRaw<Document[]>`
    UPDATE "Document"
    SET status = 'PROCESSING', "updatedAt" = now(), "attemptCount" = "attemptCount" + 1
    WHERE id = (
      SELECT id FROM "Document"
      WHERE status = 'UPLOADED'
         OR (status = 'PROCESSING' AND "updatedAt" < now() - (${RETRY_BACKOFF_MS} * interval '1 millisecond'))
      ORDER BY "createdAt" ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *;
  `;
  return rows[0] ?? null;
}

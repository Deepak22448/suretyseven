import request from "supertest";
import { createApp } from "../backend/src/app";
import { prisma } from "../backend/src/db/client";
import { runOnce } from "../backend/src/features/documents/worker/poller";

export const app = createApp();

// Minimal valid PDF bytes — content doesn't matter, only multer's mimetype check and the hash.
export function samplePdf(uniqueSuffix = ""): Buffer {
  return Buffer.from(`%PDF-1.4\n%Test document ${uniqueSuffix}\n%%EOF`);
}

export async function resetDb() {
  await prisma.documentStatusHistory.deleteMany();
  await prisma.document.deleteMany();
}

// Polls until a terminal status instead of hardcoding a tick count. The delay between ticks
// exceeds RETRY_BACKOFF_MS (50ms in tests/setup.ts) so a stuck row actually becomes reclaimable.
export async function runUntilStatus(documentId: string, statuses: string[], maxTicks = 20) {
  for (let i = 0; i < maxTicks; i++) {
    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (doc && statuses.includes(doc.status)) return doc;
    await runOnce();
    await new Promise((resolve) => setTimeout(resolve, 60));
  }
  throw new Error(`Document ${documentId} did not reach [${statuses.join(", ")}] within ${maxTicks} ticks`);
}

export function uploadPdf(documentType = "FINANCIAL_STATEMENT", suffix = "", filename = "test.pdf") {
  return request(app).post("/documents").field("documentType", documentType).attach("file", samplePdf(suffix), {
    filename,
    contentType: "application/pdf",
  });
}

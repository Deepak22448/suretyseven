import { describe, it, expect, beforeEach } from "vitest";
import { uploadPdf, resetDb, runUntilStatus } from "./helpers";
import { queueMockResults, clearMockResults } from "../backend/src/features/documents/worker/processor";
import { prisma } from "../backend/src/db/client";

describe("Retry: failure followed by a successful retry", () => {
  beforeEach(async () => {
    await resetDb();
    clearMockResults();
  });

  it("retries a TIMEOUT and succeeds on the second attempt", async () => {
    queueMockResults([
      { outcome: "TIMEOUT" },
      {
        outcome: "SUCCESS",
        fields: {
          companyName: "ABC Construction Pvt Ltd",
          registrationNumber: "U12345DL2020PTC123456",
          annualRevenue: 5000000,
          documentDate: "2026-08-15",
        },
      },
    ]);

    const upload = await uploadPdf("FINANCIAL_STATEMENT", "retry-1");
    const documentId = upload.body.documentId;

    const doc = await runUntilStatus(documentId, ["PROCESSED", "FAILED", "VALIDATION_FAILED"]);
    expect(doc.status).toBe("PROCESSED");
    expect(doc.attemptCount).toBe(2);

    const history = await prisma.documentStatusHistory.findMany({
      where: { documentId },
      orderBy: { timestamp: "asc" },
    });
    // UPLOADED, FAILED (attempt 1), PROCESSED (attempt 2) — one retry then success.
    expect(history.map((h) => h.status)).toEqual(["UPLOADED", "FAILED", "PROCESSED"]);
    expect(history[1].reason).toMatch(/will retry/);
  });
});

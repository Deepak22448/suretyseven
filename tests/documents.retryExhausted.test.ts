import { describe, it, expect, beforeEach } from "vitest";
import { uploadPdf, resetDb, runUntilStatus } from "./helpers";
import { queueMockResults, clearMockResults } from "../backend/src/features/documents/worker/processor";

describe("Retry exhaustion", () => {
  beforeEach(async () => {
    await resetDb();
    clearMockResults();
  });

  it("terminates as FAILED after MAX_PROCESSING_ATTEMPTS consecutive ERRORs", async () => {
    queueMockResults([{ outcome: "ERROR" }, { outcome: "ERROR" }, { outcome: "ERROR" }]);

    const upload = await uploadPdf("FINANCIAL_STATEMENT", "exhaust-1");
    const doc = await runUntilStatus(upload.body.documentId, ["PROCESSED", "FAILED", "VALIDATION_FAILED"]);

    expect(doc.status).toBe("FAILED");
    expect(doc.attemptCount).toBe(3);
    expect(doc.failureReason).toBe("PROCESSOR_ERROR_EXHAUSTED");
  });

  it("fails fast on INVALID_RESULT without consuming the full retry budget", async () => {
    queueMockResults([{ outcome: "INVALID_RESULT" }]);

    const upload = await uploadPdf("FINANCIAL_STATEMENT", "invalid-1");
    const doc = await runUntilStatus(upload.body.documentId, ["PROCESSED", "FAILED", "VALIDATION_FAILED"]);

    expect(doc.status).toBe("FAILED");
    expect(doc.attemptCount).toBe(1);
    expect(doc.failureReason).toBe("PROCESSOR_INVALID_RESULT");
  });
});

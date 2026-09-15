import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, resetDb, uploadPdf, runUntilStatus } from "./helpers";
import { queueMockResults, clearMockResults } from "../backend/src/features/documents/worker/processor";

describe("POST /documents/:id/retry", () => {
  beforeEach(async () => {
    await resetDb();
    clearMockResults();
  });

  it("resets a failed document to UPLOADED, continuing the same attempt count", async () => {
    queueMockResults([{ outcome: "INVALID_RESULT" }]);
    const upload = await uploadPdf("FINANCIAL_STATEMENT", "retry-1");
    const documentId = upload.body.documentId;
    await runUntilStatus(documentId, ["FAILED"]);

    const retry = await request(app).post(`/documents/${documentId}/retry`);
    expect(retry.status).toBe(200);
    expect(retry.body.status).toBe("UPLOADED");
    expect(retry.body.attemptCount).toBe(1); // carries over — a manual retry continues the chain, doesn't reset it
    expect(retry.body.failureReason).toBeNull();

    queueMockResults([
      {
        outcome: "SUCCESS",
        fields: {
          companyName: "ABC Construction Pvt Ltd",
          registrationNumber: "U12345DL2020PTC123456",
          annualRevenue: 1_000_000,
          documentDate: "2026-08-15",
        },
      },
    ]);
    const reprocessed = await runUntilStatus(documentId, ["PROCESSED", "FAILED", "VALIDATION_FAILED"]);
    expect(reprocessed.status).toBe("PROCESSED");
  });

  it("rejects retrying a document that isn't in a terminal failure state", async () => {
    const upload = await uploadPdf("FINANCIAL_STATEMENT", "retry-2"); // stays UPLOADED
    const res = await request(app).post(`/documents/${upload.body.documentId}/retry`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("NOT_RETRYABLE");
  });

  it("returns 404 for a nonexistent document", async () => {
    const res = await request(app).post("/documents/DOC-DOESNOTEXIST/retry");
    expect(res.status).toBe(404);
  });
});

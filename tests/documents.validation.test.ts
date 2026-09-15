import { describe, it, expect, beforeEach } from "vitest";
import { uploadPdf, resetDb, runUntilStatus } from "./helpers";
import { queueMockResults, clearMockResults } from "../backend/src/features/documents/worker/processor";

describe("Extraction validation", () => {
  beforeEach(async () => {
    await resetDb();
    clearMockResults();
  });

  it("marks a SUCCESS outcome with invalid fields as VALIDATION_FAILED, not PROCESSED", async () => {
    queueMockResults([
      {
        outcome: "SUCCESS",
        fields: {
          companyName: "", // required, fails
          registrationNumber: "U12345DL2020PTC123456",
          annualRevenue: -100, // must be >= 0, fails
          documentDate: "2026-08-15",
        },
      },
    ]);

    const upload = await uploadPdf("FINANCIAL_STATEMENT", "val-1");
    const doc = await runUntilStatus(upload.body.documentId, ["PROCESSED", "FAILED", "VALIDATION_FAILED"]);

    expect(doc.status).toBe("VALIDATION_FAILED");
    expect(doc.failureReason).toMatch(/companyName is required/);
    expect(doc.failureReason).toMatch(/annualRevenue must be >= 0/);
  });
});

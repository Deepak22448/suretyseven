import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, resetDb, uploadPdf, runUntilStatus } from "./helpers";
import { queueMockResults, clearMockResults } from "../backend/src/features/documents/worker/processor";

describe("Successful processing", () => {
  beforeEach(async () => {
    await resetDb();
    clearMockResults();
  });

  it("moves UPLOADED -> PROCESSING -> PROCESSED and records the extracted result", async () => {
    queueMockResults([
      {
        outcome: "SUCCESS",
        fields: {
          companyName: "ABC Construction Pvt Ltd",
          registrationNumber: "U12345DL2020PTC123456",
          address: "New Delhi",
          annualRevenue: 12500000,
          documentDate: "2026-08-15",
        },
      },
    ]);

    const upload = await uploadPdf("FINANCIAL_STATEMENT", "proc-1");
    const documentId = upload.body.documentId;

    const doc = await runUntilStatus(documentId, ["PROCESSED", "FAILED", "VALIDATION_FAILED"]);
    expect(doc.status).toBe("PROCESSED");
    expect(doc.extractedResult).toMatchObject({ companyName: "ABC Construction Pvt Ltd" });

    const res = await request(app).get(`/documents/${documentId}`);
    expect(res.body.status).toBe("PROCESSED");
    expect(res.body.result.registrationNumber).toBe("U12345DL2020PTC123456");

    const history = await request(app).get(`/documents/${documentId}/history`);
    expect(history.body.map((h: any) => h.status)).toEqual(["UPLOADED", "PROCESSED"]);
  });
});

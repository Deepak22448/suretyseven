import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, resetDb, uploadPdf, runUntilStatus } from "./helpers";
import { queueMockResults, clearMockResults } from "../backend/src/features/documents/worker/processor";

describe("GET /documents — pagination and sorting", () => {
  beforeEach(resetDb);

  it("paginates results and reports totalPages", async () => {
    await uploadPdf("FINANCIAL_STATEMENT", "page-1");
    await uploadPdf("FINANCIAL_STATEMENT", "page-2");
    await uploadPdf("FINANCIAL_STATEMENT", "page-3");

    const page1 = await request(app).get("/documents?page=1&pageSize=2");
    expect(page1.body.items).toHaveLength(2);
    expect(page1.body.totalPages).toBe(2);
    expect(page1.body.total).toBe(3);

    const page2 = await request(app).get("/documents?page=2&pageSize=2");
    expect(page2.body.items).toHaveLength(1);

    const seenIds = new Set([...page1.body.items, ...page2.body.items].map((d: any) => d.documentId));
    expect(seenIds.size).toBe(3); // no overlap, no gaps across pages
  });

  it("sorts by upload date in both directions", async () => {
    const first = await uploadPdf("FINANCIAL_STATEMENT", "sort-1");
    await new Promise((resolve) => setTimeout(resolve, 50));
    const second = await uploadPdf("FINANCIAL_STATEMENT", "sort-2");

    const desc = await request(app).get("/documents?sortOrder=desc");
    expect(desc.body.items[0].documentId).toBe(second.body.documentId);

    const asc = await request(app).get("/documents?sortOrder=asc");
    expect(asc.body.items[0].documentId).toBe(first.body.documentId);
  });
});

describe("GET /documents/stats", () => {
  beforeEach(async () => {
    await resetDb();
    clearMockResults();
  });

  it("counts documents by status", async () => {
    // claimNextDocument always claims the oldest claimable row, so each document below is
    // uploaded and driven to completion before the next exists — otherwise an earlier
    // "leave it UPLOADED" document would get claimed first and consume the wrong queued result.
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
    const processed = await uploadPdf("FINANCIAL_STATEMENT", "stats-processed");
    await runUntilStatus(processed.body.documentId, ["PROCESSED", "FAILED", "VALIDATION_FAILED"]);

    queueMockResults([{ outcome: "INVALID_RESULT" }]);
    const failed = await uploadPdf("FINANCIAL_STATEMENT", "stats-failed");
    await runUntilStatus(failed.body.documentId, ["PROCESSED", "FAILED", "VALIDATION_FAILED"]);

    await uploadPdf("FINANCIAL_STATEMENT", "stats-uploaded"); // left UPLOADED, never claimed

    const stats = await request(app).get("/documents/stats");
    expect(stats.body).toMatchObject({
      total: 3,
      uploaded: 1,
      processing: 0,
      processed: 1,
      failed: 1,
      validationFailed: 0,
    });
  });
});

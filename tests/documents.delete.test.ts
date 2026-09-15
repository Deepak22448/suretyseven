import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, resetDb, uploadPdf } from "./helpers";

describe("DELETE /documents/:id", () => {
  beforeEach(resetDb);

  it("deletes a document and its history, and it's no longer retrievable", async () => {
    const upload = await uploadPdf("FINANCIAL_STATEMENT", "delete-1");
    const documentId = upload.body.documentId;

    const del = await request(app).delete(`/documents/${documentId}`);
    expect(del.status).toBe(204);

    const getAfter = await request(app).get(`/documents/${documentId}`);
    expect(getAfter.status).toBe(404);

    const historyAfter = await request(app).get(`/documents/${documentId}/history`);
    expect(historyAfter.status).toBe(404);
  });

  it("returns 404 for a nonexistent document", async () => {
    const res = await request(app).delete("/documents/DOC-DOESNOTEXIST");
    expect(res.status).toBe(404);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, resetDb, uploadPdf, samplePdf } from "./helpers";

describe("GET /documents/:id/file", () => {
  beforeEach(resetDb);

  it("returns the uploaded file as base64", async () => {
    const upload = await uploadPdf("FINANCIAL_STATEMENT", "file-1");
    const documentId = upload.body.documentId;

    const res = await request(app).get(`/documents/${documentId}/file`);
    expect(res.status).toBe(200);
    expect(res.body.mimeType).toBe("application/pdf");
    expect(Buffer.from(res.body.data, "base64")).toEqual(samplePdf("file-1"));
  });

  it("returns 404 for a nonexistent document", async () => {
    const res = await request(app).get("/documents/DOC-DOESNOTEXIST/file");
    expect(res.status).toBe(404);
  });
});

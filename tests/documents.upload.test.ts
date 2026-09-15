import { describe, it, expect, beforeEach } from "vitest";
import { app, resetDb, uploadPdf, samplePdf } from "./helpers";
import request from "supertest";

describe("POST /documents — upload", () => {
  beforeEach(resetDb);

  it("accepts a valid PDF upload and returns UPLOADED", async () => {
    const res = await uploadPdf("FINANCIAL_STATEMENT", "upload-1");
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ status: "UPLOADED", duplicate: false });
    expect(res.body.documentId).toMatch(/^DOC-/);
  });

  it("rejects a non-PDF file", async () => {
    const res = await request(app)
      .post("/documents")
      .field("documentType", "FINANCIAL_STATEMENT")
      .attach("file", Buffer.from("not a pdf"), { filename: "test.txt", contentType: "text/plain" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_FILE_TYPE");
  });

  it("rejects an upload missing documentType", async () => {
    const res = await request(app)
      .post("/documents")
      .attach("file", samplePdf("no-type"), { filename: "test.pdf", contentType: "application/pdf" });
    expect(res.status).toBe(400);
  });

  it("never leaks a raw stack trace in an error response", async () => {
    const res = await request(app).get("/documents/DOES-NOT-EXIST");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: expect.any(String) } });
    expect(JSON.stringify(res.body)).not.toMatch(/at\s+\S+\s+\(.*:\d+:\d+\)/); // no stack-trace-shaped text
  });
});

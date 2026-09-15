import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, uploadPdf } from "./helpers";
import { prisma } from "../backend/src/db/client";

describe("POST /documents — duplicate detection", () => {
  beforeEach(resetDb);

  it("returns the same documentId when the identical file is uploaded twice", async () => {
    const first = await uploadPdf("FINANCIAL_STATEMENT", "dup-1");
    expect(first.status).toBe(201);

    const second = await uploadPdf("FINANCIAL_STATEMENT", "dup-1");
    expect(second.status).toBe(200);
    expect(second.body.duplicate).toBe(true);
    expect(second.body.documentId).toBe(first.body.documentId);

    const count = await prisma.document.count();
    expect(count).toBe(1); // no second row created
  });

  it("treats different file content as a distinct document", async () => {
    const first = await uploadPdf("FINANCIAL_STATEMENT", "dup-a");
    const second = await uploadPdf("FINANCIAL_STATEMENT", "dup-b");
    expect(second.body.documentId).not.toBe(first.body.documentId);
    expect(second.body.duplicate).toBe(false);
  });
});

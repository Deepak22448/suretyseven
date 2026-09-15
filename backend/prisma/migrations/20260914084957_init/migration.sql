-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'PROCESSED', 'VALIDATION_FAILED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProcessorOutcome" AS ENUM ('SUCCESS', 'TIMEOUT', 'ERROR', 'INVALID_RESULT');

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "metadata" JSONB,
    "contentHash" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "extractedResult" JSONB,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentStatusHistory" (
    "id" SERIAL NOT NULL,
    "documentId" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL,
    "attemptNumber" INTEGER,
    "outcome" "ProcessorOutcome",
    "reason" TEXT,
    "extractedSnapshot" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_contentHash_key" ON "Document"("contentHash");

-- CreateIndex
CREATE INDEX "Document_status_createdAt_idx" ON "Document"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Document_documentType_createdAt_idx" ON "Document"("documentType", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentStatusHistory_documentId_timestamp_idx" ON "DocumentStatusHistory"("documentId", "timestamp");

-- AddForeignKey
ALTER TABLE "DocumentStatusHistory" ADD CONSTRAINT "DocumentStatusHistory_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

import { Router } from "express";
import multer from "multer";
import { MAX_FILE_SIZE_BYTES } from "./documents.constants";
import { withAsyncErrorHandler } from "../../lib/withAsyncErrorHandler";
import {
  uploadDocument,
  getDocument,
  getDocumentHistory,
  getDocumentFile,
  listDocumentsHandler,
  getStats,
  retryDocument,
  deleteDocument,
} from "./documents.controller";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE_SIZE_BYTES } });

export const documentsRouter = Router();

documentsRouter.post("/documents", upload.single("file"), withAsyncErrorHandler(uploadDocument));
documentsRouter.get("/documents", withAsyncErrorHandler(listDocumentsHandler));
documentsRouter.get("/documents/stats", withAsyncErrorHandler(getStats));
documentsRouter.get("/documents/:id", withAsyncErrorHandler(getDocument));
documentsRouter.get("/documents/:id/history", withAsyncErrorHandler(getDocumentHistory));
documentsRouter.get("/documents/:id/file", withAsyncErrorHandler(getDocumentFile));
documentsRouter.post("/documents/:id/retry", withAsyncErrorHandler(retryDocument));
documentsRouter.delete("/documents/:id", withAsyncErrorHandler(deleteDocument));

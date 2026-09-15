import { Router } from "express";
import multer from "multer";
import { MAX_FILE_SIZE_BYTES } from "./documents.constants";
import { withAsyncErrorHandler } from "../../lib/withAsyncErrorHandler";
import {
  uploadDocument,
  getDocument,
  getDocumentHistory,
  listDocumentsHandler,
  getStats,
  deleteDocument,
} from "./documents.controller";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE_SIZE_BYTES } });

export const documentsRouter = Router();

documentsRouter.post("/documents", upload.single("file"), withAsyncErrorHandler(uploadDocument));
documentsRouter.get("/documents", withAsyncErrorHandler(listDocumentsHandler));
// Must precede "/documents/:id" — otherwise Express treats "stats" as the :id.
documentsRouter.get("/documents/stats", withAsyncErrorHandler(getStats));
documentsRouter.get("/documents/:id", withAsyncErrorHandler(getDocument));
documentsRouter.get("/documents/:id/history", withAsyncErrorHandler(getDocumentHistory));
documentsRouter.delete("/documents/:id", withAsyncErrorHandler(deleteDocument));

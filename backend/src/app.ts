import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { documentsRouter } from "./features/documents/documents.routes";
import { toErrorResponse } from "./lib/errors";
import { logger } from "./lib/logger";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use(documentsRouter);

  // Only place raw errors become the safe envelope — routes don't handle this themselves.
  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    const { statusCode, body } = toErrorResponse(err);
    if (statusCode >= 500) {
      logger.error({ path: req.path, err }, "unhandled error");
    }
    res.status(statusCode).json(body);
  });

  return app;
}

import { Request, Response } from "express";
import * as documentsService from "./documents.service";

export async function uploadDocument(req: Request, res: Response) {
  const result = await documentsService.uploadDocument(req.file, req.body);
  return res.status(result.duplicate ? 200 : 201).json(result);
}

export async function getStats(_req: Request, res: Response) {
  const stats = await documentsService.getDocumentStats();
  return res.json(stats);
}

export async function deleteDocument(req: Request, res: Response) {
  await documentsService.deleteDocumentById(req.params.id);
  return res.status(204).send();
}

export async function getDocument(req: Request, res: Response) {
  const doc = await documentsService.getDocumentDetail(req.params.id);
  return res.json(doc);
}

export async function getDocumentHistory(req: Request, res: Response) {
  const history = await documentsService.getDocumentHistoryList(req.params.id);
  return res.json(history);
}

export async function listDocumentsHandler(req: Request, res: Response) {
  const result = await documentsService.listDocumentsPaged(req.query);
  return res.json(result);
}

import axios, { AxiosError } from "axios";
import type {
  CommonErrorCode,
  DocumentDetail,
  DocumentErrorCode,
  DocumentStats,
  DocumentStatus,
  DocumentType,
  ErrorResponse,
  HistoryEntry,
  PaginatedDocuments,
  SortOrder,
  UploadResponse,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(public code: CommonErrorCode | DocumentErrorCode | "UNKNOWN", message: string) {
    super(message);
  }
}

const client = axios.create({ baseURL: API_URL });

client.interceptors.response.use(undefined, (err: AxiosError) => {
  const body = err.response?.data as Partial<ErrorResponse> | undefined;
  return Promise.reject(new ApiError((body?.error?.code as ApiError["code"]) ?? "UNKNOWN", body?.error?.message ?? "Request failed"));
});

export async function uploadDocument(file: File, documentType: DocumentType, metadata?: Record<string, unknown>) {
  const form = new FormData();
  form.append("file", file);
  form.append("documentType", documentType);
  if (metadata) form.append("metadata", JSON.stringify(metadata));
  const res = await client.post<UploadResponse>("/documents", form);
  return res.data;
}

export async function getDocument(id: string) {
  const res = await client.get<DocumentDetail>(`/documents/${id}`);
  return res.data;
}

export async function getDocumentHistory(id: string) {
  const res = await client.get<HistoryEntry[]>(`/documents/${id}/history`);
  return res.data;
}

export async function getDocumentStats() {
  const res = await client.get<DocumentStats>("/documents/stats");
  return res.data;
}

export async function deleteDocument(id: string) {
  await client.delete(`/documents/${id}`);
}

export async function listDocuments(params: {
  status?: DocumentStatus;
  documentType?: DocumentType;
  page?: number;
  pageSize?: number;
  sortOrder?: SortOrder;
}) {
  const res = await client.get<PaginatedDocuments>("/documents", {
    params: {
      status: params.status,
      documentType: params.documentType,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      sortOrder: params.sortOrder ?? "desc",
    },
  });
  return res.data;
}

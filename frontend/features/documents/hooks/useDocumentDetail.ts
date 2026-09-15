"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { DocumentDetail, HistoryEntry } from "../types";
import { getDocument, getDocumentHistory, deleteDocument, ApiError } from "../api";

const ACTIVE_STATUSES = new Set(["UPLOADED", "PROCESSING"]);

export function useDocumentDetail(documentId: string) {
  const router = useRouter();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshDocument = useCallback(async () => {
    try {
      const [fetchedDocument, fetchedHistory] = await Promise.all([
        getDocument(documentId),
        getDocumentHistory(documentId),
      ]);
      setDoc(fetchedDocument);
      setHistory(fetchedHistory);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load document.");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    refreshDocument();
  }, [refreshDocument]);

  // Poll while active — ~2s matches the backend's ~1s tick without hammering the API.
  useEffect(() => {
    if (!doc || !ACTIVE_STATUSES.has(doc.status)) return;
    const interval = setInterval(refreshDocument, 2000);
    return () => clearInterval(interval);
  }, [doc, refreshDocument]);

  async function onDelete() {
    try {
      await deleteDocument(documentId);
      router.push("/documents");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete document.");
    }
  }

  return { doc, history, loading, error, onDelete };
}

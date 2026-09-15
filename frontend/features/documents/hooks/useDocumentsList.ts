"use client";

import { useEffect, useState } from "react";
import type { DocumentSummary, DocumentStats, DocumentStatus, DocumentType, SortOrder } from "../types";
import { listDocuments, getDocumentStats, deleteDocument, ApiError } from "../api";

export function useDocumentsList() {
  const [items, setItems] = useState<DocumentSummary[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [status, setStatus] = useState<DocumentStatus | "">("");
  const [documentType, setDocumentType] = useState<DocumentType | "">("");
  const [filenameInput, setFilenameInput] = useState("");
  const [filename, setFilename] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounced so typing a filename doesn't fire a request per keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilename(filenameInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [filenameInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      listDocuments({
        status: status || undefined,
        documentType: documentType || undefined,
        filename: filename || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        sortOrder,
      }),
      getDocumentStats(),
    ])
      .then(([res, statsRes]) => {
        if (cancelled) return;
        setItems(res.items);
        setTotalPages(res.totalPages);
        setStats(statsRes);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Could not load documents.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [status, documentType, filename, dateFrom, dateTo, page, sortOrder, refreshKey]);

  function onStatusChange(value: DocumentStatus | "") {
    setStatus(value);
    setPage(1);
  }

  function onDocumentTypeChange(value: DocumentType | "") {
    setDocumentType(value);
    setPage(1);
  }

  function onDateFromChange(value: string) {
    setDateFrom(value);
    setPage(1);
  }

  function onDateToChange(value: string) {
    setDateTo(value);
    setPage(1);
  }

  function onSortChange(order: SortOrder) {
    setSortOrder(order);
    setPage(1);
  }

  async function onDelete(documentId: string) {
    try {
      await deleteDocument(documentId);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete document.");
    }
  }

  return {
    items,
    stats,
    status,
    documentType,
    filenameInput,
    dateFrom,
    dateTo,
    page,
    sortOrder,
    totalPages,
    loading,
    error,
    onStatusChange,
    onDocumentTypeChange,
    onFilenameInputChange: setFilenameInput,
    onDateFromChange,
    onDateToChange,
    onSortChange,
    onPageChange: setPage,
    onDelete,
  };
}

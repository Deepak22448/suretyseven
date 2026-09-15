"use client";

import { useState } from "react";
import { getDocumentFile, ApiError } from "../api";

export function useDocumentFilePreview(documentId: string) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setLoading(true);
    setError(null);
    try {
      const file = await getDocumentFile(documentId);
      setDataUrl(`data:${file.mimeType};base64,${file.data}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load file.");
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setDataUrl(null);
    setError(null);
  }

  return { dataUrl, loading, error, open, close };
}

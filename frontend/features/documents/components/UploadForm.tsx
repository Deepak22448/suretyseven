"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DOCUMENT_TYPES, type DocumentType } from "../types";
import { uploadDocument, ApiError } from "../api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type Status = "idle" | "uploading" | "success" | "error";

export function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>(DOCUMENT_TYPES[0]);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setStatus("error");
      setMessage("Please select a file to upload.");
      return;
    }
    setStatus("uploading");
    try {
      const res = await uploadDocument(file, documentType);
      setStatus("success");
      setMessage(
        res.duplicate
          ? `This file was already uploaded as ${res.documentId}.`
          : `Uploaded as ${res.documentId}.`,
      );
      setTimeout(() => router.push(`/documents/${res.documentId}`), 900);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof ApiError ? err.message : "Upload failed. Please try again.");
    }
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {status === "success" && (
            <Alert variant="success">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {status === "error" && (
            <Alert variant="destructive">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="file">Document (PDF)</Label>
            <Input
              id="file"
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="documentType">Document type</Label>
            <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
              <SelectTrigger id="documentType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={status === "uploading"} className="self-start">
            {status === "uploading" ? "Uploading…" : "Upload"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

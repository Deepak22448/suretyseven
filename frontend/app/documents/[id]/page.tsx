"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, RotateCw } from "lucide-react";
import { useDocumentDetail } from "@/features/documents/hooks/useDocumentDetail";
import { DeleteDocumentButton } from "@/features/documents/components/DeleteDocumentButton";
import { DocumentFilePreview } from "@/features/documents/components/DocumentFilePreview";
import { DocumentInfoCard } from "@/features/documents/components/DocumentInfoCard";
import { ExtractedInfoCard } from "@/features/documents/components/ExtractedInfoCard";
import { ProcessingHistoryCard } from "@/features/documents/components/ProcessingHistoryCard";
import { ProcessingFailedAlert } from "@/features/documents/components/ProcessingFailedAlert";
import { ValidationErrors } from "@/features/documents/components/ValidationErrors";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const { doc, history, loading, error, onDelete, onRetry } = useDocumentDetail(params.id);

  if (loading) {
    return (
      <div className="mx-auto max-w-[960px] px-5 pb-16 pt-6">
        <Card>
          <CardContent className="grid gap-2.5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-3.5" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="mx-auto max-w-[960px] px-5 pb-16 pt-6">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error ?? "Document not found."}</AlertDescription>
        </Alert>
        <Button variant="secondary" asChild>
          <Link href="/documents">
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[960px] px-5 pb-16 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{doc.filename}</h1>
        <div className="flex items-center gap-2">
          {(doc.status === "FAILED" || doc.status === "VALIDATION_FAILED") && (
            <Button variant="secondary" onClick={onRetry}>
              <RotateCw className="h-4 w-4" />
              Retry
            </Button>
          )}
          <DeleteDocumentButton documentId={doc.documentId} filename={doc.filename} onConfirm={onDelete} />
          <Button variant="secondary" asChild>
            <Link href="/documents">
              <ArrowLeft className="h-4 w-4" />
              Back to list
            </Link>
          </Button>
        </div>
      </div>

      <DocumentInfoCard doc={doc} />

      <DocumentFilePreview documentId={doc.documentId} filename={doc.filename} />

      {doc.status === "VALIDATION_FAILED" && doc.failureReason && (
        <ValidationErrors reason={doc.failureReason} />
      )}
      {doc.status === "FAILED" && doc.failureReason && <ProcessingFailedAlert reason={doc.failureReason} />}

      <ExtractedInfoCard result={doc.result} />
      <ProcessingHistoryCard history={history} />
    </div>
  );
}

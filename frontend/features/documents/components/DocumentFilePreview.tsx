import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDocumentFilePreview } from "../hooks/useDocumentFilePreview";

export function DocumentFilePreview({ documentId, filename }: { documentId: string; filename: string }) {
  const { dataUrl, loading, error, open, close } = useDocumentFilePreview(documentId);

  if (!dataUrl) {
    return (
      <div className="mb-5 flex flex-col items-start gap-2">
        <Button variant="secondary" onClick={open} disabled={loading}>
          <FileText className="h-4 w-4" />
          {loading ? "Loading…" : "Open file"}
        </Button>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <Card className="mb-5">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>File preview</CardTitle>
        <Button variant="ghost" size="icon" aria-label="Close preview" onClick={close}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <iframe src={dataUrl} title={filename} className="h-[600px] w-full rounded-md border" />
      </CardContent>
    </Card>
  );
}

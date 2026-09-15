import type { DocumentDetail } from "../types";
import { StatusBadge } from "./StatusBadge";
import { fieldGrid, fieldKey, fieldValue } from "./fieldStyles";
import { Card, CardContent } from "@/components/ui/card";

export function DocumentInfoCard({ doc }: { doc: DocumentDetail }) {
  return (
    <Card className="mb-5">
      <CardContent>
        <div className={fieldGrid}>
          <div>
            <div className={fieldKey}>Document ID</div>
            <div className={fieldValue}>{doc.documentId}</div>
          </div>
          <div>
            <div className={fieldKey}>Type</div>
            <div className={fieldValue}>{doc.documentType}</div>
          </div>
          <div>
            <div className={fieldKey}>Status</div>
            <div className={fieldValue}>
              <StatusBadge status={doc.status} />
            </div>
          </div>
          <div>
            <div className={fieldKey}>Uploaded</div>
            <div className={fieldValue}>{new Date(doc.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div className={fieldKey}>Last updated</div>
            <div className={fieldValue}>{new Date(doc.updatedAt).toLocaleString()}</div>
          </div>
          <div>
            <div className={fieldKey}>Attempts</div>
            <div className={fieldValue}>{doc.attemptCount}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

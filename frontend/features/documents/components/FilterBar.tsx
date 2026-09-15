import { DOCUMENT_STATUSES, DOCUMENT_TYPES, type DocumentStatus, type DocumentType } from "../types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function FilterBar({
  status,
  documentType,
  onStatusChange,
  onDocumentTypeChange,
}: {
  status: DocumentStatus | "";
  documentType: DocumentType | "";
  onStatusChange: (v: DocumentStatus | "") => void;
  onDocumentTypeChange: (v: DocumentType | "") => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <Select value={status || "ALL"} onValueChange={(v) => onStatusChange(v === "ALL" ? "" : (v as DocumentStatus))}>
        <SelectTrigger className="w-[180px]" aria-label="Filter by status">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          {DOCUMENT_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={documentType || "ALL"} onValueChange={(v) => onDocumentTypeChange(v === "ALL" ? "" : (v as DocumentType))}>
        <SelectTrigger className="w-[200px]" aria-label="Filter by document type">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All types</SelectItem>
          {DOCUMENT_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

import { DOCUMENT_STATUSES, DOCUMENT_TYPES, type DocumentStatus, type DocumentType } from "../types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export function FilterBar({
  status,
  documentType,
  filenameInput,
  dateFrom,
  dateTo,
  onStatusChange,
  onDocumentTypeChange,
  onFilenameInputChange,
  onDateFromChange,
  onDateToChange,
}: {
  status: DocumentStatus | "";
  documentType: DocumentType | "";
  filenameInput: string;
  dateFrom: string;
  dateTo: string;
  onStatusChange: (v: DocumentStatus | "") => void;
  onDocumentTypeChange: (v: DocumentType | "") => void;
  onFilenameInputChange: (v: string) => void;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <Input
        value={filenameInput}
        onChange={(e) => onFilenameInputChange(e.target.value)}
        placeholder="Search by filename..."
        aria-label="Search by filename"
        className="w-[220px]"
      />

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

      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          aria-label="Uploaded from"
          className="w-[160px]"
        />
        <span className="text-sm text-muted-foreground">to</span>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          aria-label="Uploaded to"
          className="w-[160px]"
        />
      </div>
    </div>
  );
}

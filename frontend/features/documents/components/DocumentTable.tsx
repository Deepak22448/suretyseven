import Link from "next/link";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { DocumentSummary, SortOrder } from "../types";
import { StatusBadge } from "./StatusBadge";
import { DeleteDocumentButton } from "./DeleteDocumentButton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export function DocumentTable({
  items,
  sortOrder,
  onSortChange,
  onDelete,
}: {
  items: DocumentSummary[];
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
  onDelete: (documentId: string) => void;
}) {
  const SortIcon = sortOrder === "asc" ? ArrowUp : ArrowDown;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document ID</TableHead>
          <TableHead>Filename</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <button
              type="button"
              onClick={() => onSortChange(sortOrder === "asc" ? "desc" : "asc")}
              className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-foreground"
            >
              Uploaded
              <SortIcon className="h-3 w-3" />
            </button>
          </TableHead>
          <TableHead className="w-9" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((doc) => (
          <TableRow key={doc.documentId}>
            <TableCell>
              <Link href={`/documents/${doc.documentId}`}>{doc.documentId}</Link>
            </TableCell>
            <TableCell className="max-w-[220px] truncate" title={doc.filename}>
              {doc.filename}
            </TableCell>
            <TableCell>{doc.documentType}</TableCell>
            <TableCell>
              <StatusBadge status={doc.status} />
            </TableCell>
            <TableCell>{new Date(doc.createdAt).toLocaleString()}</TableCell>
            <TableCell>
              <DeleteDocumentButton
                documentId={doc.documentId}
                filename={doc.filename}
                onConfirm={() => onDelete(doc.documentId)}
                iconOnly
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

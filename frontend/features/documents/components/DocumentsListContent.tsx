import type { DocumentSummary, SortOrder } from "../types";
import { DocumentTable } from "./DocumentTable";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";

export function DocumentsListContent({
  loading,
  items,
  hasActiveFilters,
  sortOrder,
  onSortChange,
  onDelete,
}: {
  loading: boolean;
  items: DocumentSummary[];
  hasActiveFilters: boolean;
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
  onDelete: (documentId: string) => void;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="grid gap-2.5">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-3.5" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            title="No documents found"
            hint={hasActiveFilters ? "Try clearing filters." : "Upload a document to get started."}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <DocumentTable items={items} sortOrder={sortOrder} onSortChange={onSortChange} onDelete={onDelete} />
    </Card>
  );
}

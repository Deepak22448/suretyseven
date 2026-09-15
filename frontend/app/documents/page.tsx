"use client";

import { useDocumentsList } from "@/features/documents/hooks/useDocumentsList";
import { FilterBar } from "@/features/documents/components/FilterBar";
import { StatsBar } from "@/features/documents/components/StatsBar";
import { DocumentsListContent } from "@/features/documents/components/DocumentsListContent";
import { Pagination } from "@/components/Pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DocumentsListPage() {
  const list = useDocumentsList();

  return (
    <div className="mx-auto max-w-[960px] px-5 pb-16 pt-6">
      {list.stats && <StatsBar stats={list.stats} />}

      <FilterBar
        status={list.status}
        documentType={list.documentType}
        filenameInput={list.filenameInput}
        dateFrom={list.dateFrom}
        dateTo={list.dateTo}
        onStatusChange={list.onStatusChange}
        onDocumentTypeChange={list.onDocumentTypeChange}
        onFilenameInputChange={list.onFilenameInputChange}
        onDateFromChange={list.onDateFromChange}
        onDateToChange={list.onDateToChange}
      />

      {list.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{list.error}</AlertDescription>
        </Alert>
      )}

      <DocumentsListContent
        loading={list.loading}
        items={list.items}
        hasActiveFilters={Boolean(list.status || list.documentType || list.filenameInput || list.dateFrom || list.dateTo)}
        sortOrder={list.sortOrder}
        onSortChange={list.onSortChange}
        onDelete={list.onDelete}
      />

      {!list.loading && list.items.length > 0 && (
        <Pagination page={list.page} totalPages={list.totalPages} onChange={list.onPageChange} />
      )}
    </div>
  );
}

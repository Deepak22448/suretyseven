import type { HistoryEntry } from "../types";

const DOT: Record<string, { bg: string; icon: string }> = {
  UPLOADED: { bg: "bg-info", icon: "↑" },
  PROCESSING: { bg: "bg-warning", icon: "⟳" },
  PROCESSED: { bg: "bg-success", icon: "✓" },
  VALIDATION_FAILED: { bg: "bg-destructive", icon: "✕" },
  FAILED: { bg: "bg-destructive", icon: "✕" },
};

export function HistoryTimeline({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">No history yet.</p>;
  }
  return (
    <ul className="m-0 list-none p-0">
      {history.map((entry, i) => {
        const isLast = i === history.length - 1;
        // A manual retry reuses the UPLOADED status (that's what puts it back in the poller's
        // queue) but reads confusingly as a second "upload" in the timeline — show its own label/icon instead.
        const isManualRetry = entry.status === "UPLOADED" && entry.reason === "Manual retry";
        const dot = isManualRetry ? { bg: "bg-info", icon: "↻" } : (DOT[entry.status] ?? DOT.UPLOADED);
        const title = isManualRetry ? entry.reason : entry.status;
        return (
          <li key={i} className="relative flex gap-3 pb-[18px]">
            {!isLast && (
              <span className="absolute bottom-0 left-[9px] top-[22px] w-0.5 bg-border" aria-hidden="true" />
            )}
            <span
              className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs text-white ${dot.bg}`}
            >
              {dot.icon}
            </span>
            <div>
              <div className="text-sm font-semibold">
                {title}
                {entry.attemptNumber ? ` · attempt ${entry.attemptNumber}` : ""}
              </div>
              <div className="text-[13px] text-muted-foreground">
                {new Date(entry.timestamp).toLocaleString()}
              </div>
              {entry.reason && !isManualRetry && (
                <div className="mt-0.5 text-[13px] text-foreground">{entry.reason}</div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

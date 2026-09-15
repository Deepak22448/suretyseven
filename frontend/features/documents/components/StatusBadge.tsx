import { Clock, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { DocumentStatus } from "../types";
import { Badge, type BadgeProps } from "@/components/ui/badge";

const STYLES: Record<DocumentStatus, { variant: BadgeProps["variant"]; label: string; icon: typeof Clock }> = {
  UPLOADED: { variant: "info", label: "Uploaded", icon: Clock },
  PROCESSING: { variant: "warning", label: "Processing", icon: Loader2 },
  PROCESSED: { variant: "success", label: "Processed", icon: CheckCircle2 },
  VALIDATION_FAILED: { variant: "destructive", label: "Validation Failed", icon: AlertTriangle },
  FAILED: { variant: "destructive", label: "Failed", icon: XCircle },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const style = STYLES[status];
  const Icon = style.icon;
  return (
    <Badge variant={style.variant} className="gap-1">
      <Icon className={`h-3 w-3 ${status === "PROCESSING" ? "animate-spin" : ""}`} />
      {style.label}
    </Badge>
  );
}

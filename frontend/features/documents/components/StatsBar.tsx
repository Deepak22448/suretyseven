import { FileText, Loader2, CheckCircle2, XCircle, type LucideIcon } from "lucide-react";
import type { DocumentStats } from "../types";
import { Card, CardContent } from "@/components/ui/card";

function Tile({ icon: Icon, label, value, accent }: { icon: LucideIcon; label: string; value: number; accent: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xl font-semibold leading-none">{value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsBar({ stats }: { stats: DocumentStats }) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Tile icon={FileText} label="Total" value={stats.total} accent="bg-primary/10 text-primary" />
      <Tile
        icon={Loader2}
        label="Processing"
        value={stats.uploaded + stats.processing}
        accent="bg-warning-bg text-warning"
      />
      <Tile icon={CheckCircle2} label="Processed" value={stats.processed} accent="bg-success-bg text-success" />
      <Tile
        icon={XCircle}
        label="Failed"
        value={stats.failed + stats.validationFailed}
        accent="bg-destructive-bg text-destructive"
      />
    </div>
  );
}

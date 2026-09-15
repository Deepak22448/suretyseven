import type { HistoryEntry } from "../types";
import { HistoryTimeline } from "./HistoryTimeline";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function ProcessingHistoryCard({ history }: { history: HistoryEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing history</CardTitle>
      </CardHeader>
      <CardContent>
        <HistoryTimeline history={history} />
      </CardContent>
    </Card>
  );
}

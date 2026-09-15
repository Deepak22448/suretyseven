import { fieldGrid, fieldKey, fieldValue } from "./fieldStyles";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function ExtractedInfoCard({ result }: { result: Record<string, unknown> | null | undefined }) {
  return (
    <Card className="mb-5">
      <CardHeader>
        <CardTitle>Extracted information</CardTitle>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className={fieldGrid}>
            {Object.entries(result).map(([key, value]) => (
              <div key={key}>
                <div className={fieldKey}>{key}</div>
                <div className={fieldValue}>{String(value)}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No extracted data yet — processing not complete.</p>
        )}
      </CardContent>
    </Card>
  );
}

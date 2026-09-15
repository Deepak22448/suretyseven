import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function ProcessingFailedAlert({ reason }: { reason: string }) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle>Processing failed</AlertTitle>
      <AlertDescription>{reason}</AlertDescription>
    </Alert>
  );
}

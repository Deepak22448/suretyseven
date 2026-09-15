import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function ValidationErrors({ reason }: { reason: string }) {
  const errors = reason.replace(/^Validation failed:\s*/, "").split(";").map((e) => e.trim()).filter(Boolean);
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle>Validation failed</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-[18px]">
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

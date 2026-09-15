import { Inbox } from "lucide-react";

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-12 px-4 text-center text-muted-foreground">
      <Inbox className="h-8 w-8" strokeWidth={1.5} />
      <p className="text-[15px] font-medium text-foreground">{title}</p>
      {hint && <p className="text-[13px]">{hint}</p>}
    </div>
  );
}

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export function DeleteDocumentButton({
  documentId,
  filename,
  onConfirm,
  iconOnly = false,
}: {
  documentId: string;
  filename: string;
  onConfirm: () => void;
  iconOnly?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {iconOnly ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${filename}`}
            className="h-8 w-8 text-muted-foreground hover:bg-destructive-bg hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" className="text-destructive hover:bg-destructive-bg">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {documentId}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes &quot;{filename}&quot; and its processing history. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

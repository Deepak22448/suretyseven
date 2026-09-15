import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UploadForm } from "@/features/documents/components/UploadForm";
import { Button } from "@/components/ui/button";

export default function NewDocumentPage() {
  return (
    <div className="mx-auto max-w-[960px] px-5 pb-16 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Upload Document</h1>
        <Button variant="secondary" asChild>
          <Link href="/documents">
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </Link>
        </Button>
      </div>
      <UploadForm />
    </div>
  );
}

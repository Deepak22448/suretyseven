import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { FileStack, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans-inter" });

export const metadata: Metadata = {
  title: "Document Processing Pipeline",
  description: "Upload, process and track documents",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background font-sans text-foreground antialiased">
        <header className="sticky top-0 z-50 border-b border-border bg-card">
          <div className="mx-auto flex max-w-[960px] items-center justify-between px-5 py-3.5">
            <Link href="/documents" className="flex items-center gap-2 font-semibold text-foreground hover:no-underline">
              <FileStack className="h-5 w-5 text-primary" />
              Document Pipeline
            </Link>
            <Button asChild size="sm">
              <Link href="/documents/new">
                <Upload className="h-4 w-4" />
                Upload document
              </Link>
            </Button>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

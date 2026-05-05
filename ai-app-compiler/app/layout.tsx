import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI App Compiler",
  description: "Compiler-style natural language to validated executable app configuration."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-mist">
          <header className="border-b border-line bg-white/90 backdrop-blur">
            <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <Link href="/" className="text-lg font-bold text-ink">
                AI App Compiler
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-mist hover:text-ink"
                >
                  Home
                </Link>
                <Link
                  href="/evaluation"
                  className="rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-mist hover:text-ink"
                >
                  Evaluation
                </Link>
              </div>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

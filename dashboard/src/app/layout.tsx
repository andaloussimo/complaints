import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { ToastProvider } from "@/components/toast";

export const metadata: Metadata = {
  title: "Sites Dashboard",
  description: "Create and edit complaint/refund sites.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/85 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white shadow-sm shadow-brand/30">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M8 1.5 2 4v4c0 3.4 2.6 6.2 6 7 3.4-.8 6-3.6 6-7V4L8 1.5Z" fill="currentColor" opacity=".9" />
                    <path d="m5.5 8 1.8 1.8 3.4-3.6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-[15px] font-bold tracking-tight text-gray-900">
                  Sites <span className="text-brand">Dashboard</span>
                </span>
              </Link>
              <Nav />
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SiteHeader } from "@/src/components/layout/site-header";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TinyNotes",
  description: "A minimal note-taking app with authentication and shareable notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-background text-foreground antialiased`}>
        <div className="relative flex min-h-screen flex-col">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,_rgba(47,207,197,0.24),_transparent_50%),radial-gradient(circle_at_82%_0%,_rgba(61,122,255,0.16),_transparent_38%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-72 bg-[radial-gradient(circle_at_bottom,_rgba(18,76,115,0.22),_transparent_52%)]" />
          <SiteHeader />
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}

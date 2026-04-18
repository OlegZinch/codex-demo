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
      <body
        className={`${inter.variable} bg-[color:var(--color-background)] text-[color:var(--color-foreground)] antialiased`}
      >
        <div className="relative flex min-h-screen flex-col">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_top,_rgba(122,211,196,0.26),_transparent_58%)]" />
          <SiteHeader />
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}

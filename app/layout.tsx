import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TinyNotes",
  description: "TinyNotes application scaffold with placeholder routes and layouts.",
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
        {children}
      </body>
    </html>
  );
}

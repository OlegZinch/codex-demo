import type { ReactNode } from "react";

import { AppShell } from "@/src/components/layout/app-shell";

export default async function NotesLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}

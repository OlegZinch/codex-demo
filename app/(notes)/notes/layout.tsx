import type { ReactNode } from "react";

import { AppShell } from "@/src/components/layout/app-shell";
import { requireSession } from "@/src/lib/session";

export default async function NotesLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await requireSession();

  return <AppShell>{children}</AppShell>;
}

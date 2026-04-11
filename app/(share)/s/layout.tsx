import type { ReactNode } from "react";

import { ShareShell } from "@/src/components/layout/share-shell";

export default function ShareLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <ShareShell>{children}</ShareShell>;
}

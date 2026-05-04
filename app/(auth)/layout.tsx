import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AuthShell } from "@/src/components/layout/auth-shell";
import { getCurrentSession } from "@/src/lib/session";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getCurrentSession();

  if (session !== null) {
    redirect("/notes");
  }

  return <AuthShell>{children}</AuthShell>;
}

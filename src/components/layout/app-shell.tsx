import type { ReactNode } from "react";

import { PageShell } from "@/src/components/ui/page-shell";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <PageShell width="wide">
      <div className="grid gap-6">{children}</div>
    </PageShell>
  );
}

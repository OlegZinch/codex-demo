import type { ReactNode } from "react";

import { PageShell } from "@/src/components/ui/page-shell";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <PageShell align="center" justify="center" width="wide">
      {children}
    </PageShell>
  );
}

import type { ReactNode } from "react";

import { PageShell } from "@/src/components/ui/page-shell";
import { SurfaceCard } from "@/src/components/ui/surface-card";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <PageShell align="center" width="narrow">
      <SurfaceCard>
        <div className="grid gap-6">{children}</div>
      </SurfaceCard>
    </PageShell>
  );
}

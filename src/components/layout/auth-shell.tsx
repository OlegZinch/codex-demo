import type { ReactNode } from "react";

import { PageShell } from "@/src/components/ui/page-shell";
import { SurfaceCard } from "@/src/components/ui/surface-card";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <PageShell align="center" width="narrow">
      <div className="grid w-full gap-6">
        <section className="space-y-3 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[color:var(--color-accent-strong)]">
            TinyNotes
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            Authentication Area
          </h2>
          <p className="text-base leading-7 text-[color:var(--color-foreground-muted)]">
            Shared scaffold for future login and registration flows. Real authentication UI and behavior
            are intentionally omitted in this pass.
          </p>
        </section>
        <SurfaceCard>{children}</SurfaceCard>
      </div>
    </PageShell>
  );
}

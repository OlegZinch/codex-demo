import type { ReactNode } from "react";

import { PageShell } from "@/src/components/ui/page-shell";
import { SurfaceCard } from "@/src/components/ui/surface-card";

type ShareShellProps = {
  children: ReactNode;
};

export function ShareShell({ children }: ShareShellProps) {
  return (
    <PageShell align="center" width="narrow">
      <div className="grid w-full gap-6">
        <section className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-accent-strong)]">
            Public Share
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            Shared Note Surface
          </h2>
          <p className="text-base leading-7 text-[color:var(--color-foreground-muted)]">
            Shared-note routes will eventually resolve tokens and render sanitized note content. This
            scaffold only provides the route boundary and dummy content container.
          </p>
        </section>
        <SurfaceCard>{children}</SurfaceCard>
      </div>
    </PageShell>
  );
}

import type { ReactNode } from "react";

import { PageShell } from "@/src/components/ui/page-shell";
import { SurfaceCard } from "@/src/components/ui/surface-card";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <PageShell width="wide">
      <div className="grid gap-6">
        <SurfaceCard tone="subtle">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-accent-strong)]">
                TinyNotes Workspace
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
                Notes Application Shell
              </h2>
              <p className="max-w-2xl text-base leading-7 text-[color:var(--color-foreground-muted)]">
                Shared layout for authenticated notes pages. Navigation, auth enforcement, and live data
                will be added later.
              </p>
            </div>
            <div className="rounded-full border border-[color:var(--color-border-strong)] px-4 py-2 text-sm text-[color:var(--color-foreground-muted)]">
              Placeholder app chrome
            </div>
          </div>
        </SurfaceCard>
        {children}
      </div>
    </PageShell>
  );
}

import { PageShell } from "@/src/components/ui/page-shell";
import { RouteHeader } from "@/src/components/ui/route-header";
import { SurfaceCard } from "@/src/components/ui/surface-card";

export default function NotFound() {
  return (
    <PageShell align="center" width="narrow">
      <SurfaceCard>
        <div className="grid gap-6 text-center">
          <RouteHeader
            description="Custom 404 surface for TinyNotes. Missing routes and missing resources should eventually resolve here."
            eyebrow="Error 404"
            title="Page Not Found"
          />
          <p className="text-base leading-7 text-[color:var(--color-foreground-muted)]">
            The requested page or resource does not exist in this scaffold.
          </p>
        </div>
      </SurfaceCard>
    </PageShell>
  );
}

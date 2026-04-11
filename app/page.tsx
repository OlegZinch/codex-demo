import { RouteHeader } from "@/src/components/ui/route-header";
import { PageShell } from "@/src/components/ui/page-shell";
import { PlaceholderList } from "@/src/components/ui/placeholder-list";
import { SurfaceCard } from "@/src/components/ui/surface-card";

export default function HomePage() {
  return (
    <PageShell width="wide">
      <RouteHeader
        description="Root route scaffold for TinyNotes. The spec eventually requires redirect logic here, but this pass keeps it as static placeholder content only."
        eyebrow="Route /"
        title="TinyNotes Base App Shell"
      />
      <SurfaceCard>
        <div className="grid gap-5">
          <p className="text-base leading-7 text-[color:var(--color-foreground-muted)]">
            This page exists to anchor the route tree while the rest of the application is scaffolded.
            No authentication, redirects, or feature logic have been wired yet.
          </p>
          <PlaceholderList
            items={[
              "Future behavior: redirect authenticated users to /notes.",
              "Future behavior: redirect unauthenticated users to /login.",
              "Current behavior: render static dummy content only.",
            ]}
          />
        </div>
      </SurfaceCard>
    </PageShell>
  );
}

import { SurfaceCard } from "@/src/components/ui/surface-card";

export default function NotesLoading() {
  return (
    <div aria-busy="true" aria-label="Loading notes" className="grid gap-6">
      <div className="h-28 animate-pulse rounded-[28px] bg-surface-muted" />
      <SurfaceCard>
        <div className="grid gap-4">
          <div className="h-5 w-32 animate-pulse rounded-full bg-surface-muted" />
          <div className="h-12 animate-pulse rounded-2xl bg-surface-muted" />
          <div className="h-72 animate-pulse rounded-2xl bg-surface-muted" />
        </div>
      </SurfaceCard>
    </div>
  );
}

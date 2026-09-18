"use client";

import { RouteHeader } from "@/src/components/ui/route-header";
import { SurfaceCard } from "@/src/components/ui/surface-card";

type NotesErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function NotesError({ reset }: NotesErrorProps) {
  return (
    <SurfaceCard>
      <div className="grid gap-5">
        <RouteHeader
          description="Your private note data was not changed. Try loading this page again."
          eyebrow="Something went wrong"
          title="Unable to load notes"
        />
        <button
          className="inline-flex w-fit items-center justify-center rounded-full bg-accent-strong px-5 py-3 text-sm font-semibold text-background transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </div>
    </SurfaceCard>
  );
}

import { RouteHeader } from "@/src/components/ui/route-header";
import { PlaceholderList } from "@/src/components/ui/placeholder-list";
import { SurfaceCard } from "@/src/components/ui/surface-card";

export default function NotesPage() {
  return (
    <SurfaceCard>
      <div className="grid gap-6">
        <RouteHeader
          description="Placeholder notes index page for the future authenticated notes list. Sorting, data loading, and empty states will be implemented later."
          eyebrow="Route /notes"
          title="Notes Index"
        />
        <PlaceholderList
          items={[
            "Future responsibility: list the signed-in user's notes.",
            "Future responsibility: sort notes by updated_at descending.",
            "Current responsibility: provide a static page placeholder only.",
          ]}
        />
      </div>
    </SurfaceCard>
  );
}

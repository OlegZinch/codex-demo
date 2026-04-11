import { RouteHeader } from "@/src/components/ui/route-header";
import { PlaceholderList } from "@/src/components/ui/placeholder-list";
import { SurfaceCard } from "@/src/components/ui/surface-card";

export default function NewNotePage() {
  return (
    <SurfaceCard>
      <div className="grid gap-6">
        <RouteHeader
          description="Placeholder route for future note creation. The real editor, autosave behavior, and submission logic are intentionally absent."
          eyebrow="Route /notes/new"
          title="New Note Page"
        />
        <PlaceholderList
          items={[
            "Reserved for the future note editor experience.",
            "Will eventually create a new note for the authenticated user.",
            "Contains static placeholder content only in this scaffold.",
          ]}
        />
      </div>
    </SurfaceCard>
  );
}

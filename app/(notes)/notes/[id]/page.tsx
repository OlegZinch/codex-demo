import { RouteHeader } from "@/src/components/ui/route-header";
import { PlaceholderList } from "@/src/components/ui/placeholder-list";
import { SurfaceCard } from "@/src/components/ui/surface-card";

type NotePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;

  return (
    <SurfaceCard>
      <div className="grid gap-6">
        <RouteHeader
          description="Placeholder route for the future note detail and editing experience. Real data access, editor logic, and share controls are intentionally not implemented."
          eyebrow={`Route /notes/${id}`}
          title="Note Detail Page"
        />
        <PlaceholderList
          items={[
            "Reserved for viewing and editing a single note.",
            "Will eventually host note metadata, editor state, and share controls.",
            `Current placeholder note identifier: ${id}`,
          ]}
        />
      </div>
    </SurfaceCard>
  );
}

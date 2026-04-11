import { PlaceholderList } from "@/src/components/ui/placeholder-list";
import { RouteHeader } from "@/src/components/ui/route-header";

type SharedNotePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function SharedNotePage({ params }: SharedNotePageProps) {
  const { token } = await params;

  return (
    <div className="grid gap-6">
      <RouteHeader
        description="Placeholder public share page for the future token-resolved note view. Sanitized content rendering and 404 behavior will be added later."
        eyebrow="Route /s/[token]"
        title="Shared Note Page"
      />
      <PlaceholderList
        items={[
          "Reserved for public note rendering via share token.",
          "Will eventually validate token state and render sanitized HTML.",
          `Current placeholder token value: ${token}`,
        ]}
      />
    </div>
  );
}

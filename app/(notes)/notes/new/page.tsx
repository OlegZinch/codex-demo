import { NoteEditorForm } from "@/src/components/notes/note-editor-form";
import { RouteHeader } from "@/src/components/ui/route-header";
import { SurfaceCard } from "@/src/components/ui/surface-card";
import { createEmptyTiptapDocument } from "@/src/lib/tiptap-config";

export default function NewNotePage() {
  return (
    <SurfaceCard>
      <div className="grid gap-6">
        <RouteHeader
          description="Create a private rich-text note. You can edit or share it after it is created."
          eyebrow="New note"
          title="Start writing"
        />
        <NoteEditorForm initialContent={createEmptyTiptapDocument()} mode="create" />
      </div>
    </SurfaceCard>
  );
}

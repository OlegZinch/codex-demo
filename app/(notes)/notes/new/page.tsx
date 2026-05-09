import { RouteHeader } from "@/src/components/ui/route-header";
import { SurfaceCard } from "@/src/components/ui/surface-card";
import { createNoteAction } from "@/src/lib/note-actions";
import { requireSession } from "@/src/lib/session";

type NewNotePageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewNotePage({ searchParams }: NewNotePageProps) {
  await requireSession();
  const { error } = await searchParams;

  return (
    <SurfaceCard>
      <div className="grid gap-6">
        <RouteHeader
          description="Create a private note. Content is stored as TipTap-shaped JSON on the server."
          eyebrow="New note"
          title="Start writing"
        />
        {error === undefined ? null : (
          <p className="rounded-2xl border border-[rgba(255,180,168,0.34)] bg-[rgba(81,23,20,0.32)] px-4 py-3 text-sm leading-6 text-[#ffd6ce]">
            Unable to save that note. Check the content length and try again.
          </p>
        )}
        <form action={createNoteAction} className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Title</span>
            <input
              className="w-full rounded-2xl border border-border bg-[rgba(4,18,31,0.82)] px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-[rgba(191,211,223,0.78)] focus:border-accent-strong focus:bg-[rgba(7,24,41,0.98)] focus:ring-4 focus:ring-[rgba(122,211,196,0.16)]"
              maxLength={140}
              name="title"
              placeholder="Untitled note"
              type="text"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Content</span>
            <textarea
              className="min-h-72 w-full resize-y rounded-2xl border border-border bg-[rgba(4,18,31,0.82)] px-4 py-3 text-sm leading-7 text-foreground outline-none transition placeholder:text-[rgba(191,211,223,0.78)] focus:border-accent-strong focus:bg-[rgba(7,24,41,0.98)] focus:ring-4 focus:ring-[rgba(122,211,196,0.16)]"
              name="content"
              placeholder="Write your note..."
            />
          </label>
          <button
            className="inline-flex w-fit items-center justify-center rounded-full bg-accent-strong px-5 py-3 text-sm font-semibold text-background shadow-[0_18px_34px_rgba(47,207,197,0.2)] transition hover:bg-accent"
            type="submit"
          >
            Create note
          </button>
        </form>
      </div>
    </SurfaceCard>
  );
}

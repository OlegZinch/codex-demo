import Link from "next/link";
import { notFound } from "next/navigation";

import { NoteEditorForm } from "@/src/components/notes/note-editor-form";
import { RouteHeader } from "@/src/components/ui/route-header";
import { SurfaceCard } from "@/src/components/ui/surface-card";
import { deleteNoteAction, disableShareAction, enableShareAction } from "@/src/lib/note-actions";
import { getNoteForUser } from "@/src/lib/notes";
import { requireSession } from "@/src/lib/session";

type NotePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    saved?: string;
    shareUrl?: string;
  }>;
};

export default async function NotePage({ params, searchParams }: NotePageProps) {
  const session = await requireSession();
  const { id } = await params;
  const { error, saved, shareUrl } = await searchParams;
  const note = getNoteForUser(id, session.user.id);

  if (note === null) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <SurfaceCard>
        <div className="grid gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <RouteHeader
              description={`Updated ${formatDate(note.updatedAt)}`}
              eyebrow="Note"
              title={note.title.length === 0 ? "Untitled note" : note.title}
            />
            <Link
              className="inline-flex items-center justify-center rounded-full border border-border-strong bg-[rgba(7,24,41,0.84)] px-4 py-2 text-sm font-medium text-accent transition hover:border-accent-strong hover:text-foreground"
              href="/notes"
            >
              Back to notes
            </Link>
          </div>

          {saved === undefined ? null : (
            <p className="rounded-2xl border border-border-strong bg-[rgba(47,207,197,0.12)] px-4 py-3 text-sm leading-6 text-accent">
              Note saved.
            </p>
          )}
          {error === undefined ? null : (
            <p className="rounded-2xl border border-[rgba(255,180,168,0.34)] bg-[rgba(81,23,20,0.32)] px-4 py-3 text-sm leading-6 text-[#ffd6ce]">
              Unable to save that note. Check the content length and try again.
            </p>
          )}

          <NoteEditorForm
            id={note.id}
            initialContent={note.contentText}
            initialTitle={note.title}
          />
        </div>
      </SurfaceCard>

      <SurfaceCard tone="subtle">
        <div className="grid gap-5">
          <RouteHeader
            description={
              note.shareEnabled
                ? "This note has an active public share token."
                : "Create an unguessable public link for read-only access."
            }
            eyebrow="Sharing"
            title="Public link"
          />
          {shareUrl === undefined ? null : (
            <div className="grid gap-2 rounded-2xl border border-border-strong bg-[rgba(4,18,31,0.82)] p-4">
              <p className="text-sm font-medium text-foreground">Share URL</p>
              <Link
                className="break-all text-sm leading-6 text-accent hover:text-foreground"
                href={shareUrl}
              >
                {shareUrl}
              </Link>
            </div>
          )}
          {note.shareEnabled && shareUrl === undefined ? (
            <p className="text-sm leading-6 text-foreground-muted">
              Sharing is enabled. Generate a new link if you need to copy a fresh token.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <form action={enableShareAction}>
              <input name="id" type="hidden" value={note.id} />
              <button
                className="inline-flex items-center justify-center rounded-full border border-border-strong bg-[rgba(7,24,41,0.84)] px-4 py-2 text-sm font-medium text-accent transition hover:border-accent-strong hover:text-foreground"
                type="submit"
              >
                {note.shareEnabled ? "Generate new link" : "Enable share"}
              </button>
            </form>
            {note.shareEnabled ? (
              <form action={disableShareAction}>
                <input name="id" type="hidden" value={note.id} />
                <button
                  className="inline-flex items-center justify-center rounded-full border border-[rgba(255,180,168,0.34)] bg-[rgba(81,23,20,0.24)] px-4 py-2 text-sm font-medium text-[#ffd6ce] transition hover:border-[rgba(255,180,168,0.58)]"
                  type="submit"
                >
                  Disable share
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard tone="subtle">
        <div className="grid gap-4">
          <RouteHeader
            description="Delete this note and any public share tokens connected to it."
            eyebrow="Danger zone"
            title="Delete note"
          />
          <form action={deleteNoteAction}>
            <input name="id" type="hidden" value={note.id} />
            <button
              className="inline-flex w-fit items-center justify-center rounded-full border border-[rgba(255,180,168,0.34)] bg-[rgba(81,23,20,0.24)] px-4 py-2 text-sm font-medium text-[#ffd6ce] transition hover:border-[rgba(255,180,168,0.58)]"
              type="submit"
            >
              Delete note
            </button>
          </form>
        </div>
      </SurfaceCard>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

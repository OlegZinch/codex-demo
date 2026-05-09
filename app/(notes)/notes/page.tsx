import Link from "next/link";

import { RouteHeader } from "@/src/components/ui/route-header";
import { SurfaceCard } from "@/src/components/ui/surface-card";
import { listNotesForUser } from "@/src/lib/notes";
import { requireSession } from "@/src/lib/session";

export default async function NotesPage() {
  const session = await requireSession();
  const notes = listNotesForUser(session.user.id);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <RouteHeader
          description="Your private notes, sorted by the most recent update."
          eyebrow="Workspace"
          title="Notes"
        />
        <Link
          className="inline-flex items-center justify-center rounded-full bg-accent-strong px-5 py-3 text-sm font-semibold text-background shadow-[0_18px_34px_rgba(47,207,197,0.2)] transition hover:bg-accent"
          href="/notes/new"
        >
          New note
        </Link>
      </div>

      {notes.length === 0 ? (
        <SurfaceCard>
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold text-foreground">No notes yet</h2>
            <p className="max-w-2xl text-sm leading-6 text-foreground-muted">
              Create your first note to start saving private writing in TinyNotes.
            </p>
            <Link
              className="inline-flex w-fit items-center justify-center rounded-full border border-border-strong bg-[rgba(7,24,41,0.84)] px-4 py-2 text-sm font-medium text-accent transition hover:border-accent-strong hover:text-foreground"
              href="/notes/new"
            >
              Create note
            </Link>
          </div>
        </SurfaceCard>
      ) : (
        <div className="grid gap-3">
          {notes.map((note) => (
            <Link
              className="grid gap-3 rounded-[24px] border border-border bg-surface p-5 shadow-[0_18px_44px_rgba(1,9,18,0.28)] transition hover:border-border-strong hover:bg-surface-muted"
              href={`/notes/${note.id}`}
              key={note.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-xl font-semibold text-foreground">
                  {note.title.length === 0 ? "Untitled note" : note.title}
                </h2>
                {note.shareEnabled ? (
                  <span className="rounded-full border border-border-strong px-3 py-1 text-xs font-semibold uppercase text-accent">
                    Shared
                  </span>
                ) : null}
              </div>
              <p className="text-sm leading-6 text-foreground-muted">
                Updated {formatDate(note.updatedAt)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

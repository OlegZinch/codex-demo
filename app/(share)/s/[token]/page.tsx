import { notFound } from "next/navigation";

import { RouteHeader } from "@/src/components/ui/route-header";
import { getSharedNoteByToken } from "@/src/lib/notes";

type SharedNotePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function SharedNotePage({ params }: SharedNotePageProps) {
  const { token } = await params;
  const note = await getSharedNoteByToken(token);

  if (note === null) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <RouteHeader
        description={`Shared note updated ${formatDate(note.updatedAt)}`}
        eyebrow="Shared note"
        title={note.title.length === 0 ? "Untitled note" : note.title}
      />
      <article
        className="grid gap-4 text-base leading-7 text-foreground-muted [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_code]:rounded-lg [&_code]:bg-surface-strong [&_code]:px-1.5 [&_code]:py-1 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:text-foreground [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-5 [&_ol]:list-decimal [&_p]:text-foreground-muted [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-surface-strong [&_pre]:p-4 [&_ul]:list-disc"
        dangerouslySetInnerHTML={{ __html: note.html }}
      />
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  buildShareUrl,
  createNote,
  deleteNote,
  disableShare,
  enableShare,
  updateNote,
} from "@/src/lib/notes";
import { requireSession } from "@/src/lib/session";

export type NoteFormState = {
  message: string | null;
};

export type AutosaveNoteResult =
  | {
      ok: true;
      updatedAt: string;
    }
  | {
      ok: false;
      message: string;
    };

export async function autosaveNoteAction(input: {
  id: string;
  title: string;
  content: string;
}): Promise<AutosaveNoteResult> {
  const session = await requireSession();

  try {
    const updated = updateNote(input.id, session.user.id, input.title, input.content);

    if (!updated) {
      return {
        ok: false,
        message: "Unable to save this note.",
      };
    }

    revalidatePath("/notes");
    revalidatePath(`/notes/${input.id}`);

    return {
      ok: true,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Autosave note failed", error);

    return {
      ok: false,
      message: "Unable to save this note.",
    };
  }
}

export async function createNoteAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  let noteId: string;

  try {
    noteId = createNote(
      session.user.id,
      getFormString(formData, "title"),
      getFormString(formData, "content"),
    );
  } catch (error) {
    console.error("Create note failed", error);
    redirect("/notes/new?error=validation");
  }

  revalidatePath("/notes");
  redirect(`/notes/${noteId}`);
}

export async function updateNoteAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const id = getFormString(formData, "id");
  let updated = false;

  try {
    updated = updateNote(
      id,
      session.user.id,
      getFormString(formData, "title"),
      getFormString(formData, "content"),
    );
  } catch (error) {
    console.error("Update note failed", error);
    redirect(`/notes/${id}?error=validation`);
  }

  if (!updated) {
    redirect("/notes");
  }

  revalidatePath("/notes");
  revalidatePath(`/notes/${id}`);
  redirect(`/notes/${id}?saved=1`);
}

export async function deleteNoteAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const id = getFormString(formData, "id");

  deleteNote(id, session.user.id);

  revalidatePath("/notes");
  redirect("/notes");
}

export async function enableShareAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const id = getFormString(formData, "id");
  const token = await enableShare(id, session.user.id);

  if (token === null) {
    redirect("/notes");
  }

  revalidatePath("/notes");
  revalidatePath(`/notes/${id}`);
  redirect(`/notes/${id}?shareUrl=${encodeURIComponent(buildShareUrl(token))}`);
}

export async function disableShareAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const id = getFormString(formData, "id");

  disableShare(id, session.user.id);

  revalidatePath("/notes");
  revalidatePath(`/notes/${id}`);
  redirect(`/notes/${id}`);
}

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

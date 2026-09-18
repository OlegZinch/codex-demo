"use server";

import type { JSONContent } from "@tiptap/core";
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
import { InvalidNoteContentError } from "@/src/lib/tiptap-content";

type NoteMutationInput = {
  title: string;
  contentJson: JSONContent;
};

type NoteActionError = {
  code: "INTERNAL_ERROR" | "NOT_FOUND" | "VALIDATION_ERROR";
  message: string;
};

export type CreateNoteResult =
  | {
      ok: true;
      noteId: string;
    }
  | {
      ok: false;
      error: NoteActionError;
    };

export type AutosaveNoteResult =
  | {
      ok: true;
      updatedAt: string;
    }
  | {
      ok: false;
      error: NoteActionError;
    };

export async function autosaveNoteAction(
  input: NoteMutationInput & { id: string },
): Promise<AutosaveNoteResult> {
  const session = await requireSession();

  try {
    const updatedAt = updateNote(input.id, session.user.id, input.title, input.contentJson);

    if (updatedAt === null) {
      return {
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Unable to save this note.",
        },
      };
    }

    revalidatePath("/notes");

    return {
      ok: true,
      updatedAt,
    };
  } catch (error) {
    console.error("Autosave note failed", error);
    const validationError = error instanceof InvalidNoteContentError;

    return {
      ok: false,
      error: {
        code: validationError ? "VALIDATION_ERROR" : "INTERNAL_ERROR",
        message: validationError
          ? "Unable to save this note. Check the content and try again."
          : "Unable to save this note right now.",
      },
    };
  }
}

export async function createNoteAction(input: NoteMutationInput): Promise<CreateNoteResult> {
  const session = await requireSession();

  try {
    const noteId = createNote(session.user.id, input.title, input.contentJson);

    revalidatePath("/notes");

    return {
      ok: true,
      noteId,
    };
  } catch (error) {
    console.error("Create note failed", error);
    const validationError = error instanceof InvalidNoteContentError;

    return {
      ok: false,
      error: {
        code: validationError ? "VALIDATION_ERROR" : "INTERNAL_ERROR",
        message: validationError
          ? "Unable to create this note. Check the content and try again."
          : "Unable to create this note right now.",
      },
    };
  }
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

"use client";

import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { EditorToolbar } from "@/src/components/notes/editor-toolbar";
import { autosaveNoteAction, createNoteAction } from "@/src/lib/note-actions";
import { createSerializableTiptapContent, tiptapExtensions } from "@/src/lib/tiptap-config";

type SaveStatus = "dirty" | "error" | "saved" | "saving";

type CreateNoteEditorProps = {
  initialContent: JSONContent;
  mode: "create";
};

type EditNoteEditorProps = {
  id: string;
  initialContent: JSONContent;
  initialTitle: string;
  mode: "edit";
};

type NoteEditorFormProps = CreateNoteEditorProps | EditNoteEditorProps;

type NoteSnapshot = {
  contentJson: JSONContent;
  serialized: string;
  title: string;
};

const AUTOSAVE_DELAY_MS = 900;
const titleFieldClassName =
  "w-full rounded-2xl border border-border bg-[rgba(4,18,31,0.82)] px-4 py-3 text-base text-foreground outline-none transition placeholder:text-[rgba(191,211,223,0.78)] focus:border-accent-strong focus:bg-[rgba(7,24,41,0.98)] focus:ring-4 focus:ring-[rgba(122,211,196,0.16)]";

export function NoteEditorForm(props: NoteEditorFormProps) {
  const router = useRouter();
  const initialTitle = props.mode === "edit" ? props.initialTitle : "";
  const [title, setTitle] = useState(initialTitle);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const titleRef = useRef(initialTitle);
  const contentRef = useRef(props.initialContent);
  const initialSnapshot = createSnapshot(initialTitle, props.initialContent);
  const latestSnapshotRef = useRef(initialSnapshot);
  const lastSavedSerializedRef = useRef(initialSnapshot.serialized);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlightRef = useRef(false);
  const saveQueuedRef = useRef(false);
  const isMountedRef = useRef(true);
  const editor = useEditor({
    content: props.initialContent,
    editorProps: {
      attributes: {
        "aria-label": "Note content",
        class: "tiptap-editor",
      },
    },
    extensions: tiptapExtensions,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      contentRef.current = currentEditor.getJSON();
      handleDraftChange();
    },
  });

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      clearSaveTimeout();
    };
  }, []);

  function handleDraftChange() {
    const snapshot = createSnapshot(titleRef.current, contentRef.current);
    latestSnapshotRef.current = snapshot;
    setActionError(null);

    if (props.mode === "create") {
      return;
    }

    if (snapshot.serialized === lastSavedSerializedRef.current) {
      clearSaveTimeout();
      setSaveStatus("saved");
      return;
    }

    setSaveStatus("dirty");
    scheduleSave();
  }

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextTitle = event.target.value;

    titleRef.current = nextTitle;
    setTitle(nextTitle);
    handleDraftChange();
  }

  function handleClearContent() {
    editor?.chain().focus().clearContent().run();
  }

  function handleSaveNow() {
    if (props.mode !== "edit") {
      return;
    }

    clearSaveTimeout();
    void flushSave();
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (props.mode !== "create" || isCreating) {
      return;
    }

    setIsCreating(true);
    setActionError(null);

    const result = await createNoteSafely(titleRef.current, contentRef.current);

    if (!isMountedRef.current) {
      return;
    }

    if (!result.ok) {
      setActionError(result.error.message);
      setIsCreating(false);
      return;
    }

    router.replace(`/notes/${result.noteId}`);
    router.refresh();
  }

  function scheduleSave() {
    clearSaveTimeout();
    saveTimeoutRef.current = setTimeout(() => {
      void flushSave();
    }, AUTOSAVE_DELAY_MS);
  }

  async function flushSave() {
    if (props.mode !== "edit") {
      return;
    }

    clearSaveTimeout();

    if (latestSnapshotRef.current.serialized === lastSavedSerializedRef.current) {
      setSaveStatus("saved");
      return;
    }

    if (saveInFlightRef.current) {
      saveQueuedRef.current = true;
      return;
    }

    const snapshot = latestSnapshotRef.current;
    saveInFlightRef.current = true;
    saveQueuedRef.current = false;
    setSaveStatus("saving");
    setActionError(null);

    const result = await autosaveNoteSafely(props.id, snapshot);

    saveInFlightRef.current = false;

    if (!isMountedRef.current) {
      return;
    }

    if (!result.ok) {
      setActionError(result.error.message);
      setSaveStatus("error");

      if (saveQueuedRef.current && latestSnapshotRef.current.serialized !== snapshot.serialized) {
        void flushSave();
      }

      return;
    }

    lastSavedSerializedRef.current = snapshot.serialized;
    setSavedAt(result.updatedAt);

    if (
      saveQueuedRef.current ||
      latestSnapshotRef.current.serialized !== lastSavedSerializedRef.current
    ) {
      setSaveStatus("dirty");
      void flushSave();
      return;
    }

    setSaveStatus("saved");
  }

  function clearSaveTimeout() {
    if (saveTimeoutRef.current !== null) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleCreateSubmit}>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-foreground">Title</span>
        <input
          className={titleFieldClassName}
          maxLength={140}
          onChange={handleTitleChange}
          placeholder="Untitled note"
          type="text"
          value={title}
        />
      </label>

      <div className="grid gap-2">
        <span className="text-sm font-medium text-foreground">Content</span>
        <div className="overflow-hidden rounded-2xl border border-border bg-[rgba(4,18,31,0.82)] transition focus-within:border-accent-strong focus-within:ring-4 focus-within:ring-[rgba(122,211,196,0.16)]">
          <EditorToolbar editor={editor} />
          <EditorContent editor={editor} />
        </div>
      </div>

      {actionError === null ? null : (
        <p
          aria-live="polite"
          className="rounded-2xl border border-[rgba(255,180,168,0.34)] bg-[rgba(81,23,20,0.32)] px-4 py-3 text-sm leading-6 text-[#ffd6ce]"
          role="alert"
        >
          {actionError}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          className="inline-flex items-center justify-center rounded-full border border-border-strong bg-[rgba(7,24,41,0.84)] px-4 py-2 text-sm font-medium text-accent transition hover:border-accent-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onClick={handleClearContent}
          type="button"
        >
          Clear content
        </button>

        {props.mode === "create" ? (
          <button
            className="inline-flex items-center justify-center rounded-full bg-accent-strong px-5 py-3 text-sm font-semibold text-background shadow-[0_18px_34px_rgba(47,207,197,0.2)] transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isCreating || editor === null}
            type="submit"
          >
            {isCreating ? "Creating…" : "Create note"}
          </button>
        ) : (
          <div className="flex flex-wrap items-center justify-end gap-3">
            <p aria-live="polite" className="text-sm leading-6 text-foreground-muted">
              {getStatusLabel(saveStatus, savedAt)}
            </p>
            <button
              className="inline-flex items-center justify-center rounded-full bg-accent-strong px-5 py-3 text-sm font-semibold text-background shadow-[0_18px_34px_rgba(47,207,197,0.2)] transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-70"
              disabled={saveStatus === "saved" || saveStatus === "saving"}
              onClick={handleSaveNow}
              type="button"
            >
              Save now
            </button>
          </div>
        )}
      </div>
    </form>
  );
}

function createSnapshot(title: string, contentJson: JSONContent): NoteSnapshot {
  return {
    contentJson,
    serialized: JSON.stringify([title, contentJson]),
    title,
  };
}

async function createNoteSafely(title: string, contentJson: JSONContent) {
  try {
    return await createNoteAction({
      title,
      contentJson: createSerializableTiptapContent(contentJson),
    });
  } catch {
    return {
      ok: false as const,
      error: {
        code: "INTERNAL_ERROR" as const,
        message: "Unable to create this note right now.",
      },
    };
  }
}

async function autosaveNoteSafely(id: string, snapshot: NoteSnapshot) {
  try {
    return await autosaveNoteAction({
      id,
      title: snapshot.title,
      contentJson: createSerializableTiptapContent(snapshot.contentJson),
    });
  } catch {
    return {
      ok: false as const,
      error: {
        code: "INTERNAL_ERROR" as const,
        message: "Unable to save this note right now.",
      },
    };
  }
}

function getStatusLabel(status: SaveStatus, savedAt: string | null): string {
  if (status === "saving") {
    return "Saving…";
  }

  if (status === "dirty") {
    return "Unsaved changes";
  }

  if (status === "error") {
    return "Save failed. Try again.";
  }

  if (savedAt !== null) {
    return `Saved ${formatTime(savedAt)}`;
  }

  return "Saved";
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

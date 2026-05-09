"use client";

import type {
  ChangeEvent,
  Dispatch,
  MutableRefObject,
  SetStateAction,
  TransitionStartFunction,
} from "react";
import { useEffect, useRef, useState, useTransition } from "react";

import { autosaveNoteAction } from "@/src/lib/note-actions";

type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

type NoteEditorFormProps = {
  id: string;
  initialTitle: string;
  initialContent: string;
};

const fieldClassName =
  "w-full rounded-2xl border border-border bg-[rgba(4,18,31,0.82)] px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-[rgba(191,211,223,0.78)] focus:border-accent-strong focus:bg-[rgba(7,24,41,0.98)] focus:ring-4 focus:ring-[rgba(122,211,196,0.16)]";

export function NoteEditorForm({ id, initialTitle, initialContent }: NoteEditorFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const lastSavedValue = useRef(serializeEditorValue(initialTitle, initialContent));

  const currentValue = serializeEditorValue(title, content);
  const hasChanges = currentValue !== lastSavedValue.current;

  useEffect(() => {
    if (!hasChanges) {
      return;
    }

    setStatus("dirty");

    const timeoutId = window.setTimeout(() => {
      saveCurrentValue(id, title, content, lastSavedValue, setStatus, setSavedAt, startTransition);
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [content, hasChanges, id, title]);

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
  }

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value);
  }

  function handleSaveClick() {
    if (!hasChanges || isPending) {
      return;
    }

    saveCurrentValue(id, title, content, lastSavedValue, setStatus, setSavedAt, startTransition);
  }

  return (
    <div className="grid gap-5">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-foreground">Title</span>
        <input
          className={fieldClassName}
          maxLength={140}
          onChange={handleTitleChange}
          placeholder="Untitled note"
          type="text"
          value={title}
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-foreground">Content</span>
        <textarea
          className={`${fieldClassName} min-h-72 resize-y leading-7`}
          onChange={handleContentChange}
          placeholder="Write your note..."
          value={content}
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex items-center justify-center rounded-full bg-accent-strong px-5 py-3 text-sm font-semibold text-background shadow-[0_18px_34px_rgba(47,207,197,0.2)] transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
          disabled={!hasChanges || isPending}
          onClick={handleSaveClick}
          type="button"
        >
          Save note
        </button>
        <p aria-live="polite" className="text-sm leading-6 text-foreground-muted">
          {getStatusLabel(status, isPending, savedAt)}
        </p>
      </div>
    </div>
  );
}

function saveCurrentValue(
  id: string,
  title: string,
  content: string,
  lastSavedValue: MutableRefObject<string>,
  setStatus: Dispatch<SetStateAction<SaveStatus>>,
  setSavedAt: Dispatch<SetStateAction<string | null>>,
  startTransition: TransitionStartFunction,
) {
  const valueToSave = serializeEditorValue(title, content);

  setStatus("saving");
  startTransition(async () => {
    const result = await autosaveNoteAction({
      id,
      title,
      content,
    });

    if (result.ok) {
      lastSavedValue.current = valueToSave;
      setSavedAt(result.updatedAt);
      setStatus("saved");
      return;
    }

    setStatus("error");
  });
}

function serializeEditorValue(title: string, content: string): string {
  return JSON.stringify([title, content]);
}

function getStatusLabel(status: SaveStatus, isPending: boolean, savedAt: string | null): string {
  if (isPending || status === "saving") {
    return "Saving...";
  }

  if (status === "dirty") {
    return "Unsaved changes";
  }

  if (status === "error") {
    return "Unable to save. Try again.";
  }

  if (status === "saved" && savedAt !== null) {
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

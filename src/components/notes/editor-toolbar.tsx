"use client";

import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import type { ChangeEvent } from "react";
import { useState } from "react";

import { normalizeHttpUrl } from "@/src/lib/tiptap-config";

type ToolbarItem = {
  id: string;
  label: string;
  shortLabel: string;
  isToggle: boolean;
  isActive: (editor: Editor) => boolean;
  canRun: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
};

type EditorToolbarProps = {
  editor: Editor | null;
};

type ToolbarButtonProps = {
  active: boolean;
  enabled: boolean;
  editor: Editor;
  item: ToolbarItem;
};

const toolbarItems: ToolbarItem[] = [
  createToolbarItem("paragraph", "Paragraph", "P", true, {
    isActive: (editor) => editor.isActive("paragraph"),
    canRun: (editor) => editor.can().chain().focus().setParagraph().run(),
    run: (editor) => editor.chain().focus().setParagraph().run(),
  }),
  createToolbarItem("heading-1", "Heading 1", "H1", true, {
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
    canRun: (editor) => editor.can().chain().focus().toggleHeading({ level: 1 }).run(),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  }),
  createToolbarItem("heading-2", "Heading 2", "H2", true, {
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
    canRun: (editor) => editor.can().chain().focus().toggleHeading({ level: 2 }).run(),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  }),
  createToolbarItem("heading-3", "Heading 3", "H3", true, {
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
    canRun: (editor) => editor.can().chain().focus().toggleHeading({ level: 3 }).run(),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  }),
  createToolbarItem("bold", "Bold", "B", true, {
    isActive: (editor) => editor.isActive("bold"),
    canRun: (editor) => editor.can().chain().focus().toggleBold().run(),
    run: (editor) => editor.chain().focus().toggleBold().run(),
  }),
  createToolbarItem("italic", "Italic", "I", true, {
    isActive: (editor) => editor.isActive("italic"),
    canRun: (editor) => editor.can().chain().focus().toggleItalic().run(),
    run: (editor) => editor.chain().focus().toggleItalic().run(),
  }),
  createToolbarItem("underline", "Underline", "U", true, {
    isActive: (editor) => editor.isActive("underline"),
    canRun: (editor) => editor.can().chain().focus().toggleUnderline().run(),
    run: (editor) => editor.chain().focus().toggleUnderline().run(),
  }),
  createToolbarItem("strike", "Strikethrough", "S", true, {
    isActive: (editor) => editor.isActive("strike"),
    canRun: (editor) => editor.can().chain().focus().toggleStrike().run(),
    run: (editor) => editor.chain().focus().toggleStrike().run(),
  }),
  createToolbarItem("code", "Inline code", "Code", true, {
    isActive: (editor) => editor.isActive("code"),
    canRun: (editor) => editor.can().chain().focus().toggleCode().run(),
    run: (editor) => editor.chain().focus().toggleCode().run(),
  }),
  createToolbarItem("bullet-list", "Bullet list", "• List", true, {
    isActive: (editor) => editor.isActive("bulletList"),
    canRun: (editor) => editor.can().chain().focus().toggleBulletList().run(),
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  }),
  createToolbarItem("ordered-list", "Numbered list", "1. List", true, {
    isActive: (editor) => editor.isActive("orderedList"),
    canRun: (editor) => editor.can().chain().focus().toggleOrderedList().run(),
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  }),
  createToolbarItem("blockquote", "Blockquote", "Quote", true, {
    isActive: (editor) => editor.isActive("blockquote"),
    canRun: (editor) => editor.can().chain().focus().toggleBlockquote().run(),
    run: (editor) => editor.chain().focus().toggleBlockquote().run(),
  }),
  createToolbarItem("code-block", "Code block", "Block code", true, {
    isActive: (editor) => editor.isActive("codeBlock"),
    canRun: (editor) => editor.can().chain().focus().toggleCodeBlock().run(),
    run: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  }),
  createToolbarItem("horizontal-rule", "Horizontal rule", "Rule", false, {
    isActive: () => false,
    canRun: (editor) => editor.can().chain().focus().setHorizontalRule().run(),
    run: (editor) => editor.chain().focus().setHorizontalRule().run(),
  }),
  createToolbarItem("undo", "Undo", "Undo", false, {
    isActive: () => false,
    canRun: (editor) => editor.can().chain().focus().undo().run(),
    run: (editor) => editor.chain().focus().undo().run(),
  }),
  createToolbarItem("redo", "Redo", "Redo", false, {
    isActive: () => false,
    canRun: (editor) => editor.can().chain().focus().redo().run(),
    run: (editor) => editor.chain().focus().redo().run(),
  }),
];

const toolbarButtonClassName =
  "inline-flex min-h-9 items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40";

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const editorState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (currentEditor === null) {
        return {
          active: toolbarItems.map(() => false),
          enabled: toolbarItems.map(() => false),
          isLink: false,
          linkHref: null,
        };
      }

      return {
        active: toolbarItems.map((item) => item.isActive(currentEditor)),
        enabled: toolbarItems.map((item) => item.canRun(currentEditor)),
        isLink: currentEditor.isActive("link"),
        linkHref: getCurrentLinkHref(currentEditor),
      };
    },
  });

  if (editor === null || editorState === null) {
    return (
      <div
        aria-label="Text formatting"
        className="min-h-24 rounded-t-2xl border-b border-border bg-surface-strong p-3"
        role="toolbar"
      >
        <p className="text-sm text-foreground-muted">Loading formatting tools…</p>
      </div>
    );
  }

  function handleLinkChange(event: ChangeEvent<HTMLInputElement>) {
    setLinkUrl(event.target.value);
    setLinkError(null);
  }

  function handleApplyLink() {
    if (editor === null) {
      return;
    }

    const normalizedUrl = normalizeHttpUrl(linkUrl);

    if (normalizedUrl === null) {
      setLinkError("Enter a valid HTTP or HTTPS URL.");
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: normalizedUrl }).run();
    setLinkUrl("");
    setLinkError(null);
  }

  function handleRemoveLink() {
    if (editor === null) {
      return;
    }

    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkUrl("");
    setLinkError(null);
  }

  return (
    <div className="grid gap-3 border-b border-border bg-surface-strong p-3 sm:p-4">
      <div
        aria-label="Text formatting"
        className="flex flex-wrap items-center gap-2"
        role="toolbar"
      >
        {toolbarItems.map((item, index) => (
          <ToolbarButton
            active={editorState.active[index] ?? false}
            editor={editor}
            enabled={editorState.enabled[index] ?? false}
            item={item}
            key={item.id}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-2">
        <div className="grid min-w-52 flex-1 gap-1">
          <label className="sr-only" htmlFor="note-link-url">
            Link URL
          </label>
          <input
            aria-describedby={linkError === null ? undefined : "note-link-error"}
            aria-invalid={linkError === null ? undefined : true}
            className="min-h-9 rounded-lg border border-border bg-[rgba(4,18,31,0.82)] px-3 text-sm text-foreground outline-none transition placeholder:text-foreground-muted focus:border-accent-strong focus:ring-2 focus:ring-[rgba(122,211,196,0.16)]"
            id="note-link-url"
            onChange={handleLinkChange}
            placeholder={editorState.linkHref ?? "https://example.com"}
            type="url"
            value={linkUrl}
          />
          {linkError === null ? null : (
            <p className="text-xs text-[#ffb4a8]" id="note-link-error" role="alert">
              {linkError}
            </p>
          )}
        </div>
        <button
          className={`${toolbarButtonClassName} border-border-strong bg-surface-muted text-accent hover:border-accent-strong hover:text-foreground`}
          onClick={handleApplyLink}
          type="button"
        >
          Apply link
        </button>
        <button
          className={`${toolbarButtonClassName} border-border bg-transparent text-foreground-muted hover:border-border-strong hover:text-foreground`}
          disabled={!editorState.isLink}
          onClick={handleRemoveLink}
          type="button"
        >
          Remove link
        </button>
      </div>
    </div>
  );
}

function ToolbarButton({ active, enabled, editor, item }: ToolbarButtonProps) {
  function handleClick() {
    item.run(editor);
  }

  return (
    <button
      aria-label={item.label}
      aria-pressed={item.isToggle ? active : undefined}
      className={`${toolbarButtonClassName} ${
        active
          ? "border-accent-strong bg-[rgba(122,211,196,0.18)] text-foreground"
          : "border-border bg-[rgba(4,18,31,0.7)] text-foreground-muted hover:border-border-strong hover:text-foreground"
      }`}
      disabled={!enabled}
      onClick={handleClick}
      title={item.label}
      type="button"
    >
      {item.shortLabel}
    </button>
  );
}

function createToolbarItem(
  id: string,
  label: string,
  shortLabel: string,
  isToggle: boolean,
  commands: Pick<ToolbarItem, "canRun" | "isActive" | "run">,
): ToolbarItem {
  return {
    id,
    label,
    shortLabel,
    isToggle,
    ...commands,
  };
}

function getCurrentLinkHref(editor: Editor): string | null {
  const href: unknown = editor.getAttributes("link").href;

  return typeof href === "string" ? href : null;
}

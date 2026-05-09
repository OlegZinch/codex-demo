import "server-only";

import { db } from "@/src/lib/db";

export type NoteListItem = {
  id: string;
  title: string;
  shareEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NoteDetail = NoteListItem & {
  contentText: string;
};

export type SharedNote = {
  title: string;
  html: string;
  updatedAt: string;
};

type NoteListRow = {
  id: string;
  title: string;
  share_enabled: number;
  created_at: string;
  updated_at: string;
};

type NoteDetailRow = NoteListRow & {
  content_json: string;
};

type SharedNoteRow = {
  title: string;
  content_json: string;
  updated_at: string;
};

type TiptapTextNode = {
  type: "text";
  text?: string;
};

type TiptapNode = {
  type?: string;
  text?: string;
  content?: TiptapNode[];
  attrs?: Record<string, unknown>;
};

const MAX_CONTENT_JSON_BYTES = 256 * 1024;

export function listNotesForUser(userId: string): NoteListItem[] {
  const rows = db
    .query<NoteListRow, [string]>(
      `
        SELECT id, title, share_enabled, created_at, updated_at
        FROM note
        WHERE user_id = ?
        ORDER BY updated_at DESC;
      `,
    )
    .all(userId);

  return rows.map(mapNoteListRow);
}

export function getNoteForUser(id: string, userId: string): NoteDetail | null {
  const row = db
    .query<NoteDetailRow, [string, string]>(
      `
        SELECT id, title, share_enabled, created_at, updated_at, content_json
        FROM note
        WHERE id = ? AND user_id = ?
        LIMIT 1;
      `,
    )
    .get(id, userId);

  if (row === null) {
    return null;
  }

  return {
    ...mapNoteListRow(row),
    contentText: contentJsonToPlainText(row.content_json),
  };
}

export async function getSharedNoteByToken(token: string): Promise<SharedNote | null> {
  if (!isValidShareToken(token)) {
    return null;
  }

  const tokenHash = await sha256Hex(token);
  const row = db
    .query<SharedNoteRow, [string]>(
      `
        SELECT n.title, n.content_json, n.updated_at
        FROM note_share s
        JOIN note n ON n.id = s.note_id
        WHERE s.token_hash = ?
          AND s.enabled = 1
          AND n.share_enabled = 1
        LIMIT 1;
      `,
    )
    .get(tokenHash);

  if (row === null) {
    return null;
  }

  return {
    title: row.title,
    html: renderContentJsonToSafeHtml(row.content_json),
    updatedAt: row.updated_at,
  };
}

export function serializePlainTextToContentJson(value: string): string {
  const paragraphs = value
    .replaceAll("\r\n", "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  const content =
    paragraphs.length === 0
      ? [{ type: "paragraph" }]
      : paragraphs.map((paragraph) => ({
          type: "paragraph",
          content: paragraph
            .split("\n")
            .flatMap<TiptapTextNode | { type: "hardBreak" }>((line, index) =>
              index === 0
                ? [{ type: "text", text: line }]
                : [{ type: "hardBreak" }, { type: "text", text: line }],
            ),
        }));

  const json = JSON.stringify({
    type: "doc",
    content,
  });

  if (new TextEncoder().encode(json).byteLength > MAX_CONTENT_JSON_BYTES) {
    throw new Error("Content is too large.");
  }

  return json;
}

export function createNote(userId: string, title: string, contentText: string): string {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const contentJson = serializePlainTextToContentJson(contentText);

  db.query(
    `
      INSERT INTO note (id, user_id, title, content_json, share_enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, 0, ?, ?);
    `,
  ).run(id, userId, normalizeTitle(title), contentJson, now, now);

  return id;
}

export function updateNote(
  id: string,
  userId: string,
  title: string,
  contentText: string,
): boolean {
  const contentJson = serializePlainTextToContentJson(contentText);
  const result = db
    .query(
      `
        UPDATE note
        SET title = ?,
            content_json = ?,
            updated_at = ?
        WHERE id = ? AND user_id = ?;
      `,
    )
    .run(normalizeTitle(title), contentJson, new Date().toISOString(), id, userId);

  return result.changes > 0;
}

export function deleteNote(id: string, userId: string): boolean {
  const result = db
    .query(
      `
        DELETE FROM note
        WHERE id = ? AND user_id = ?;
      `,
    )
    .run(id, userId);

  return result.changes > 0;
}

export async function enableShare(id: string, userId: string): Promise<string | null> {
  if (!noteBelongsToUser(id, userId)) {
    return null;
  }

  const token = createShareToken();
  const tokenHash = await sha256Hex(token);
  const now = new Date().toISOString();

  const enableShareTransaction = db.transaction(() => {
    db.query(
      `
        UPDATE note_share
        SET enabled = 0,
            disabled_at = ?
        WHERE note_id = ?;
      `,
    ).run(now, id);

    db.query(
      `
        INSERT INTO note_share (id, note_id, token_hash, enabled, created_at, disabled_at)
        VALUES (?, ?, ?, 1, ?, NULL);
      `,
    ).run(crypto.randomUUID(), id, tokenHash, now);

    db.query(
      `
        UPDATE note
        SET share_enabled = 1,
            updated_at = ?
        WHERE id = ? AND user_id = ?;
      `,
    ).run(now, id, userId);
  });

  enableShareTransaction.immediate();

  return token;
}

export function disableShare(id: string, userId: string): boolean {
  if (!noteBelongsToUser(id, userId)) {
    return false;
  }

  const now = new Date().toISOString();
  const disableShareTransaction = db.transaction(() => {
    db.query(
      `
        UPDATE note_share
        SET enabled = 0,
            disabled_at = ?
        WHERE note_id = ?;
      `,
    ).run(now, id);

    db.query(
      `
        UPDATE note
        SET share_enabled = 0,
            updated_at = ?
        WHERE id = ? AND user_id = ?;
      `,
    ).run(now, id, userId);
  });

  disableShareTransaction.immediate();

  return true;
}

export function buildShareUrl(token: string): string {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  return new URL(`/s/${token}`, appUrl).toString();
}

function noteBelongsToUser(id: string, userId: string): boolean {
  const row = db
    .query<{ id: string }, [string, string]>(
      `
        SELECT id
        FROM note
        WHERE id = ? AND user_id = ?
        LIMIT 1;
      `,
    )
    .get(id, userId);

  return row !== null;
}

function normalizeTitle(value: string): string {
  return value.trim().slice(0, 140);
}

function mapNoteListRow(row: NoteListRow): NoteListItem {
  return {
    id: row.id,
    title: row.title,
    shareEnabled: row.share_enabled === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function contentJsonToPlainText(value: string): string {
  const parsed = parseContentJson(value);

  if (parsed === null) {
    return "";
  }

  return extractPlainText(parsed).trim();
}

function renderContentJsonToSafeHtml(value: string): string {
  const parsed = parseContentJson(value);

  if (parsed === null || parsed.type !== "doc") {
    return "";
  }

  return renderChildren(parsed.content);
}

function parseContentJson(value: string): TiptapNode | null {
  try {
    const parsed: unknown = JSON.parse(value);

    return isTiptapNode(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isTiptapNode(value: unknown): value is TiptapNode {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractPlainText(node: TiptapNode): string {
  if (node.type === "text") {
    return node.text ?? "";
  }

  if (node.type === "hardBreak") {
    return "\n";
  }

  const children = node.content?.map(extractPlainText).join("") ?? "";

  if (node.type === "paragraph") {
    return `${children}\n\n`;
  }

  return children;
}

function renderNode(node: TiptapNode): string {
  const children = renderChildren(node.content);

  switch (node.type) {
    case "doc":
      return children;
    case "paragraph":
      return `<p>${children}</p>`;
    case "text":
      return escapeHtml(node.text ?? "");
    case "hardBreak":
      return "<br>";
    case "heading": {
      const level = node.attrs?.level;
      const tag = level === 1 || level === 2 || level === 3 ? `h${level}` : "h2";

      return `<${tag}>${children}</${tag}>`;
    }
    case "bulletList":
      return `<ul>${children}</ul>`;
    case "orderedList":
      return `<ol>${children}</ol>`;
    case "listItem":
      return `<li>${children}</li>`;
    case "blockquote":
      return `<blockquote>${children}</blockquote>`;
    case "codeBlock":
      return `<pre><code>${escapeHtml(extractPlainText(node))}</code></pre>`;
    default:
      return children;
  }
}

function renderChildren(content: TiptapNode[] | undefined): string {
  return content?.map(renderNode).join("") ?? "";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createShareToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  return bytesToHex(bytes);
}

function isValidShareToken(token: string): boolean {
  return /^[a-f0-9]{64}$/i.test(token);
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));

  return bytesToHex(new Uint8Array(digest));
}

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

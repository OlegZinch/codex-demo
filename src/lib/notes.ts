import "server-only";

import type { JSONContent } from "@tiptap/core";

import { db } from "@/src/lib/db";
import {
  parseStoredTiptapContent,
  renderStoredTiptapContentToSafeHtml,
  validateAndSerializeTiptapContent,
} from "@/src/lib/tiptap-content";

export type NoteListItem = {
  id: string;
  title: string;
  shareEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NoteDetail = NoteListItem & {
  contentJson: JSONContent;
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
    contentJson: parseStoredTiptapContent(row.content_json),
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
    html: renderStoredTiptapContentToSafeHtml(row.content_json),
    updatedAt: row.updated_at,
  };
}

export function createNote(userId: string, title: string, contentJson: JSONContent): string {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const serializedContent = validateAndSerializeTiptapContent(contentJson);

  db.query(
    `
      INSERT INTO note (id, user_id, title, content_json, share_enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, 0, ?, ?);
    `,
  ).run(id, userId, normalizeTitle(title), serializedContent, now, now);

  return id;
}

export function updateNote(
  id: string,
  userId: string,
  title: string,
  contentJson: JSONContent,
): string | null {
  const serializedContent = validateAndSerializeTiptapContent(contentJson);
  const updatedAt = new Date().toISOString();
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
    .run(normalizeTitle(title), serializedContent, updatedAt, id, userId);

  return result.changes > 0 ? updatedAt : null;
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

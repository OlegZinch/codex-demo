import "server-only";

import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Database } from "bun:sqlite";

const DEFAULT_DB_PATH = "./data/tinynotes.db";

type GlobalWithDatabase = typeof globalThis & {
  tinyNotesDatabase?: Database;
};

const globalWithDatabase = globalThis as GlobalWithDatabase;

export const db = globalWithDatabase.tinyNotesDatabase ?? createDatabase();

if (process.env.NODE_ENV !== "production") {
  globalWithDatabase.tinyNotesDatabase = db;
}

function createDatabase() {
  const dbPath = process.env.DB_PATH ?? DEFAULT_DB_PATH;

  if (dbPath !== ":memory:" && !dbPath.startsWith("file:")) {
    mkdirSync(dirname(resolve(dbPath)), { recursive: true });
  }

  const database = new Database(dbPath, { create: true, strict: true });

  database.run("PRAGMA foreign_keys = ON;");

  if (dbPath !== ":memory:") {
    database.run("PRAGMA journal_mode = WAL;");
  }

  return database;
}

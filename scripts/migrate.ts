import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Database } from "bun:sqlite";

type Direction = "up" | "down";

type Migration = {
  version: string;
  upSql: string;
  downSql: string;
};

const MIGRATION_UP_MARKER = "-- migrate:up";
const MIGRATION_DOWN_MARKER = "-- migrate:down";
const MIGRATIONS_DIR = join(process.cwd(), "migrations");
const DEFAULT_DB_PATH = "./data/tinynotes.db";

const direction = parseDirection(process.argv[2]);
const dbPath = process.env.DB_PATH ?? DEFAULT_DB_PATH;

mkdirSync(dirname(dbPath), { recursive: true });

const db = new Database(dbPath, { create: true, strict: true });

try {
  db.run("PRAGMA foreign_keys = ON;");
  db.run("PRAGMA journal_mode = WAL;");
  ensureMigrationsTable(db);

  const migrations = readMigrations();

  if (direction === "up") {
    migrateUp(db, migrations);
  } else {
    migrateDown(db, migrations);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  db.close();
}

function parseDirection(value: string | undefined): Direction {
  if (value === undefined || value === "up") {
    return "up";
  }

  if (value === "down") {
    return "down";
  }

  throw new Error("Usage: bun run db:migrate [up|down]");
}

function ensureMigrationsTable(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);
}

function readMigrations(): Migration[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((filename) => filename.endsWith(".sql"))
    .sort()
    .map((filename) => parseMigration(filename));
}

function parseMigration(filename: string): Migration {
  const contents = readFileSync(join(MIGRATIONS_DIR, filename), "utf8");
  const upMarkerIndex = contents.indexOf(MIGRATION_UP_MARKER);
  const downMarkerIndex = contents.indexOf(MIGRATION_DOWN_MARKER);

  if (upMarkerIndex === -1 || downMarkerIndex === -1) {
    throw new Error(
      `Migration ${filename} must include ${MIGRATION_UP_MARKER} and ${MIGRATION_DOWN_MARKER}.`,
    );
  }

  if (downMarkerIndex <= upMarkerIndex) {
    throw new Error(
      `Migration ${filename} must place ${MIGRATION_DOWN_MARKER} after ${MIGRATION_UP_MARKER}.`,
    );
  }

  const upSql = contents.slice(upMarkerIndex + MIGRATION_UP_MARKER.length, downMarkerIndex).trim();
  const downSql = contents.slice(downMarkerIndex + MIGRATION_DOWN_MARKER.length).trim();

  if (upSql.length === 0 || downSql.length === 0) {
    throw new Error(`Migration ${filename} must include non-empty up and down SQL.`);
  }

  return {
    version: filename,
    upSql,
    downSql,
  };
}

function migrateUp(database: Database, migrations: Migration[]) {
  const appliedVersions = getAppliedVersions(database);
  const pendingMigrations = migrations.filter(
    (migration) => !appliedVersions.has(migration.version),
  );

  if (pendingMigrations.length === 0) {
    console.log("No pending migrations.");
    return;
  }

  const applyMigration = database.transaction((migration: Migration) => {
    database.run(migration.upSql);
    database
      .query("INSERT INTO schema_migrations (version, applied_at) VALUES ($version, $appliedAt);")
      .run({
        version: migration.version,
        appliedAt: new Date().toISOString(),
      });
  });

  for (const migration of pendingMigrations) {
    console.log(`Applying ${migration.version}`);
    applyMigration.immediate(migration);
  }
}

function migrateDown(database: Database, migrations: Migration[]) {
  const appliedVersions = getAppliedVersions(database);
  const latestAppliedVersion = [...appliedVersions].sort().at(-1);

  if (latestAppliedVersion === undefined) {
    console.log("No applied migrations to roll back.");
    return;
  }

  const migration = migrations.find((candidate) => candidate.version === latestAppliedVersion);

  if (migration === undefined) {
    throw new Error(`Applied migration ${latestAppliedVersion} is missing from disk.`);
  }

  const rollBackMigration = database.transaction(() => {
    database
      .query("DELETE FROM schema_migrations WHERE version = $version;")
      .run({ version: migration.version });
    database.run(migration.downSql);
  });

  console.log(`Rolling back ${migration.version}`);
  rollBackMigration.immediate();
}

function getAppliedVersions(database: Database): Set<string> {
  const rows = database
    .query<
      {
        version: string;
      },
      []
    >("SELECT version FROM schema_migrations ORDER BY version ASC;")
    .all();

  return new Set(rows.map((row) => row.version));
}

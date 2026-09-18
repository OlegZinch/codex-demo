import { rmSync } from "node:fs";
import { resolve } from "node:path";

const databasePath = resolve(process.cwd(), ".test-data/tinynotes-e2e.db");
const databaseFiles = [databasePath, `${databasePath}-shm`, `${databasePath}-wal`];

for (const path of databaseFiles) {
  rmSync(path, { force: true });
}

const migration = Bun.spawnSync({
  cmd: ["bun", "run", "db:migrate:up"],
  cwd: process.cwd(),
  env: {
    ...process.env,
    DB_PATH: databasePath,
  },
  stderr: "inherit",
  stdout: "inherit",
});

if (!migration.success) {
  process.exit(migration.exitCode);
}

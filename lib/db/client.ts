import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as schema from "@/db/schema";

export type WorkbenchDb = ReturnType<typeof drizzle<typeof schema>>;

let dbPath = process.env.DATABASE_PATH ?? process.env.WORKBENCH_DB_PATH ?? "./data/workbench.sqlite";
let sqlite: Database.Database | undefined;
let db: WorkbenchDb | undefined;

function openSqlite(path: string) {
  const resolvedPath = path === ":memory:" ? path : resolve(path);
  if (resolvedPath !== ":memory:") {
    mkdirSync(dirname(resolvedPath), { recursive: true });
  }

  const connection = new Database(resolvedPath);
  connection.pragma("foreign_keys = ON");
  connection.pragma("busy_timeout = 5000");
  if (process.env.NEXT_PHASE !== "phase-production-build") {
    connection.pragma("journal_mode = WAL");
  }
  return connection;
}

export function getSqlite() {
  if (!sqlite) {
    sqlite = openSqlite(dbPath);
  }
  return sqlite;
}

export function getDb() {
  if (!db) {
    db = drizzle(getSqlite(), { schema });
  }
  return db;
}

export function resetDbForTests(path = ":memory:") {
  sqlite?.close();
  dbPath = path;
  sqlite = undefined;
  db = undefined;
  return getDb();
}

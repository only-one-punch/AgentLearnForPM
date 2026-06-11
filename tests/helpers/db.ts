import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach } from "vitest";
import { resetDbForTests, getSqlite } from "@/lib/db/client";
import { user } from "@/db/schema";
import { getDb } from "@/lib/db/client";

export function applyMigrationsForTest() {
  const sqlite = getSqlite();
  const migration = readFileSync(resolve("db/migrations/0000_gifted_chameleon.sql"), "utf8")
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of migration) {
    sqlite.exec(statement);
  }
}

export function setupDbTest() {
  beforeEach(() => {
    resetDbForTests(":memory:");
    applyMigrationsForTest();
  });

  afterEach(() => {
    resetDbForTests(":memory:");
  });
}

export function seedTestUser(id: string, email = `${id}@example.com`) {
  const now = new Date();
  getDb()
    .insert(user)
    .values({
      id,
      name: id,
      email,
      emailVerified: true,
      createdAt: now,
      updatedAt: now
    })
    .run();
}

import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { getDb } from "@/lib/db/client";

export function runMigrations(migrationsFolder = "db/migrations") {
  migrate(getDb(), { migrationsFolder });
}

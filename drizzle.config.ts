import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_PATH ?? process.env.WORKBENCH_DB_PATH ?? "./data/workbench.sqlite"
  },
  strict: true,
  verbose: true
});

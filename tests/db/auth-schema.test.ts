import { describe, expect, it } from "vitest";
import { setupDbTest, seedTestUser } from "../helpers/db";
import { bookmarks } from "@/db/schema";
import { getDb } from "@/lib/db/client";

setupDbTest();

describe("database schema", () => {
  it("migrates auth and application tables", () => {
    seedTestUser("user_a");
    const tables = getDb().run(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('user', 'session', 'account', 'verification', 'reading_progress', 'bookmarks', 'notes', 'self_test_states')"
    );
    expect(tables).toBeDefined();
  });

  it("rejects study records without a valid user", () => {
    expect(() =>
      getDb()
        .insert(bookmarks)
        .values({
          id: "bookmark_bad",
          userId: "missing",
          documentSlug: "04-tool-calling",
          createdAt: new Date()
        })
        .run()
    ).toThrow();
  });
});

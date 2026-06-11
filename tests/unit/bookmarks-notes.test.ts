import { describe, expect, it } from "vitest";
import { setupDbTest, seedTestUser } from "../helpers/db";
import { createBookmark, listBookmarks } from "@/lib/study/bookmarks";
import { createNote, listNotes, updateNote } from "@/lib/study/notes";

setupDbTest();

describe("bookmarks and notes", () => {
  it("scopes bookmarks and notes to the logged-in user", async () => {
    seedTestUser("user_a");
    seedTestUser("user_b");

    await createBookmark("user_a", {
      documentSlug: "04-tool-calling",
      sectionId: "section-a",
      excerpt: "tool schema"
    });
    await createNote("user_b", {
      documentSlug: "04-tool-calling",
      sectionId: "section-a",
      body: "My private note"
    });

    expect(listBookmarks("user_a")).toHaveLength(1);
    expect(listBookmarks("user_b")).toHaveLength(0);
    expect(listNotes("user_a")).toHaveLength(0);
    expect(listNotes("user_b")).toHaveLength(1);
  });

  it("updates notes only for the owning user", async () => {
    seedTestUser("user_a");
    seedTestUser("user_b");
    const note = await createNote("user_a", {
      documentSlug: "11-security",
      body: "old"
    });

    expect(updateNote("user_b", note.id, "wrong user")).toBeUndefined();
    expect(updateNote("user_a", note.id, "updated")?.body).toBe("updated");
  });
});

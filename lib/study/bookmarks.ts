import { and, desc, eq } from "drizzle-orm";
import { bookmarks } from "@/db/schema";
import { getCurrentContentVersionId } from "@/lib/content/version";
import { getDb } from "@/lib/db/client";
import type { BookmarkInput } from "@/lib/study/contracts";
import { newId, recordStudyEvent } from "@/lib/study/events";

export async function createBookmark(userId: string, input: BookmarkInput) {
  const contentVersionId = await getCurrentContentVersionId();
  const row = {
    id: newId("bookmark"),
    userId,
    documentSlug: input.documentSlug,
    sectionId: input.sectionId ?? null,
    anchorId: input.anchorId ?? null,
    excerpt: input.excerpt ?? null,
    createdAt: new Date(),
    contentVersionId
  };
  getDb().insert(bookmarks).values(row).run();
  recordStudyEvent({
    userId,
    eventType: "bookmark",
    documentSlug: input.documentSlug,
    sectionId: input.sectionId
  });
  return row;
}

export function listBookmarks(userId: string, limit = 50) {
  return getDb()
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt))
    .limit(limit)
    .all();
}

export function deleteBookmark(userId: string, bookmarkId: string) {
  getDb()
    .delete(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.id, bookmarkId)))
    .run();
}

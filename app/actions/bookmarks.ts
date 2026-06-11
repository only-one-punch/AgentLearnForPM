"use server";

import { z } from "zod";
import { requireUserId } from "@/lib/auth/session";
import { createBookmark, deleteBookmark, listBookmarks } from "@/lib/study/bookmarks";

const bookmarkSchema = z.object({
  documentSlug: z.string().min(1),
  sectionId: z.string().min(1).nullable().optional(),
  anchorId: z.string().min(1).nullable().optional(),
  excerpt: z.string().max(1000).nullable().optional()
});

export async function createBookmarkAction(input: z.input<typeof bookmarkSchema>) {
  const userId = await requireUserId();
  return createBookmark(userId, bookmarkSchema.parse(input));
}

export async function listBookmarksAction() {
  const userId = await requireUserId();
  return listBookmarks(userId);
}

export async function deleteBookmarkAction(bookmarkId: string) {
  const userId = await requireUserId();
  return deleteBookmark(userId, bookmarkId);
}

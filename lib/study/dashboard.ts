import type { DashboardData } from "@/lib/study/contracts";
import { getCurrentContentVersionId } from "@/lib/content/version";
import { listBookmarks } from "@/lib/study/bookmarks";
import { listWeakSelfTests } from "@/lib/study/mastery";
import { listNotes } from "@/lib/study/notes";
import { getLatestProgress } from "@/lib/study/progress";

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const progress = getLatestProgress(userId);
  return {
    contentVersionId: await getCurrentContentVersionId(),
    continueReading: progress
      ? {
          documentSlug: progress.documentSlug,
          sectionId: progress.sectionId,
          scrollPercent: progress.scrollPercent,
          completedPercent: progress.completedPercent,
          lastReadAt: progress.lastReadAt
        }
      : null,
    weakSelfTests: listWeakSelfTests(userId, 8).map((item) => ({
      itemId: item.itemId,
      documentSlug: item.documentSlug,
      status: item.status,
      updatedAt: item.updatedAt
    })),
    recentBookmarks: listBookmarks(userId, 8).map((bookmark) => ({
      id: bookmark.id,
      documentSlug: bookmark.documentSlug,
      sectionId: bookmark.sectionId,
      excerpt: bookmark.excerpt,
      createdAt: bookmark.createdAt
    })),
    recentNotes: listNotes(userId, 8).map((note) => ({
      id: note.id,
      documentSlug: note.documentSlug,
      sectionId: note.sectionId,
      selectedText: note.selectedText,
      body: note.body,
      updatedAt: note.updatedAt
    }))
  };
}

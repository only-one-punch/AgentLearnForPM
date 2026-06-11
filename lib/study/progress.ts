import { desc, eq } from "drizzle-orm";
import { readingProgress } from "@/db/schema";
import { getCurrentContentVersionId } from "@/lib/content/version";
import { getDb } from "@/lib/db/client";
import type { ProgressInput } from "@/lib/study/contracts";
import { newId, recordStudyEvent } from "@/lib/study/events";

function clampPercent(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export async function saveReadingProgress(userId: string, input: ProgressInput) {
  const now = new Date();
  const contentVersionId = await getCurrentContentVersionId();
  const existing = getDb()
    .select()
    .from(readingProgress)
    .where(eq(readingProgress.userId, userId))
    .all()
    .find((row) => row.documentSlug === input.documentSlug);

  const values = {
    userId,
    documentSlug: input.documentSlug,
    sectionId: input.sectionId ?? null,
    scrollPercent: clampPercent(input.scrollPercent),
    completedPercent: clampPercent(input.completedPercent),
    lastReadAt: now,
    contentVersionId
  };

  if (existing) {
    getDb().update(readingProgress).set(values).where(eq(readingProgress.id, existing.id)).run();
  } else {
    getDb()
      .insert(readingProgress)
      .values({ id: newId("progress"), ...values })
      .run();
  }

  recordStudyEvent({
    userId,
    eventType: "read",
    documentSlug: input.documentSlug,
    sectionId: input.sectionId
  });

  return getLatestProgress(userId);
}

export function getLatestProgress(userId: string) {
  return (
    getDb()
      .select()
      .from(readingProgress)
      .where(eq(readingProgress.userId, userId))
      .orderBy(desc(readingProgress.lastReadAt))
      .limit(1)
      .get() ?? null
  );
}

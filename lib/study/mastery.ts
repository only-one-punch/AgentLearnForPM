import { and, desc, eq, inArray } from "drizzle-orm";
import { selfTestStates } from "@/db/schema";
import { getCurrentContentVersionId } from "@/lib/content/version";
import { getDb } from "@/lib/db/client";
import type { SelfTestStateInput } from "@/lib/study/contracts";
import { newId, recordStudyEvent } from "@/lib/study/events";

export async function setSelfTestState(userId: string, input: SelfTestStateInput) {
  const existing = getDb()
    .select()
    .from(selfTestStates)
    .where(and(eq(selfTestStates.userId, userId), eq(selfTestStates.itemId, input.itemId)))
    .get();
  const values = {
    userId,
    itemId: input.itemId,
    documentSlug: input.documentSlug,
    status: input.status,
    updatedAt: new Date(),
    contentVersionId: await getCurrentContentVersionId()
  };

  if (existing) {
    getDb().update(selfTestStates).set(values).where(eq(selfTestStates.id, existing.id)).run();
  } else {
    getDb()
      .insert(selfTestStates)
      .values({ id: newId("selftest"), ...values })
      .run();
  }

  recordStudyEvent({
    userId,
    eventType: "self_test",
    documentSlug: input.documentSlug,
    metadata: { itemId: input.itemId, status: input.status }
  });

  return getSelfTestState(userId, input.itemId);
}

export function getSelfTestState(userId: string, itemId: string) {
  return (
    getDb()
      .select()
      .from(selfTestStates)
      .where(and(eq(selfTestStates.userId, userId), eq(selfTestStates.itemId, itemId)))
      .get() ?? null
  );
}

export function listWeakSelfTests(userId: string, limit = 100) {
  return getDb()
    .select()
    .from(selfTestStates)
    .where(
      and(eq(selfTestStates.userId, userId), inArray(selfTestStates.status, ["uncertain", "not_yet"]))
    )
    .orderBy(desc(selfTestStates.updatedAt))
    .limit(limit)
    .all();
}

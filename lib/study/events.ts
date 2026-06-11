import { studyEvents } from "@/db/schema";
import { getDb } from "@/lib/db/client";
import type { StudyEventType } from "@/lib/study/contracts";

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function recordStudyEvent(input: {
  userId: string;
  eventType: StudyEventType;
  documentSlug?: string | null;
  sectionId?: string | null;
  metadata?: unknown;
}) {
  getDb()
    .insert(studyEvents)
    .values({
      id: newId("event"),
      userId: input.userId,
      eventType: input.eventType,
      documentSlug: input.documentSlug ?? null,
      sectionId: input.sectionId ?? null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      createdAt: new Date()
    })
    .run();
}

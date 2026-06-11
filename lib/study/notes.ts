import { and, desc, eq } from "drizzle-orm";
import { notes } from "@/db/schema";
import { getCurrentContentVersionId } from "@/lib/content/version";
import { getDb } from "@/lib/db/client";
import type { NoteInput } from "@/lib/study/contracts";
import { newId, recordStudyEvent } from "@/lib/study/events";

export async function createNote(userId: string, input: NoteInput) {
  const contentVersionId = await getCurrentContentVersionId();
  const now = new Date();
  const row = {
    id: newId("note"),
    userId,
    documentSlug: input.documentSlug,
    sectionId: input.sectionId ?? null,
    anchorId: input.anchorId ?? null,
    selectedText: input.selectedText ?? null,
    body: input.body,
    createdAt: now,
    updatedAt: now,
    contentVersionId
  };
  getDb().insert(notes).values(row).run();
  recordStudyEvent({
    userId,
    eventType: "note",
    documentSlug: input.documentSlug,
    sectionId: input.sectionId
  });
  return row;
}

export function updateNote(userId: string, noteId: string, body: string) {
  const updatedAt = new Date();
  getDb()
    .update(notes)
    .set({ body, updatedAt })
    .where(and(eq(notes.userId, userId), eq(notes.id, noteId)))
    .run();
  return getDb()
    .select()
    .from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.id, noteId)))
    .get();
}

export function listNotes(userId: string, limit = 50) {
  return getDb()
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.updatedAt))
    .limit(limit)
    .all();
}

export function deleteNote(userId: string, noteId: string) {
  getDb()
    .delete(notes)
    .where(and(eq(notes.userId, userId), eq(notes.id, noteId)))
    .run();
}

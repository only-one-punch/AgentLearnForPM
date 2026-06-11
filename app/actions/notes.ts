"use server";

import { z } from "zod";
import { requireUserId } from "@/lib/auth/session";
import { createNote, deleteNote, listNotes, updateNote } from "@/lib/study/notes";

const noteSchema = z.object({
  documentSlug: z.string().min(1),
  sectionId: z.string().min(1).nullable().optional(),
  anchorId: z.string().min(1).nullable().optional(),
  excerpt: z.string().max(1000).nullable().optional(),
  selectedText: z.string().max(2000).nullable().optional(),
  body: z.string().min(1).max(10000)
});

export async function createNoteAction(input: z.input<typeof noteSchema>) {
  const userId = await requireUserId();
  return createNote(userId, noteSchema.parse(input));
}

export async function updateNoteAction(noteId: string, body: string) {
  const userId = await requireUserId();
  return updateNote(userId, noteId, z.string().min(1).max(10000).parse(body));
}

export async function listNotesAction() {
  const userId = await requireUserId();
  return listNotes(userId);
}

export async function deleteNoteAction(noteId: string) {
  const userId = await requireUserId();
  return deleteNote(userId, noteId);
}

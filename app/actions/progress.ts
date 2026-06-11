"use server";

import { z } from "zod";
import { requireUserId } from "@/lib/auth/session";
import { saveReadingProgress } from "@/lib/study/progress";

const progressSchema = z.object({
  documentSlug: z.string().min(1),
  sectionId: z.string().min(1).nullable().optional(),
  scrollPercent: z.number(),
  completedPercent: z.number()
});

export async function saveProgressAction(input: z.input<typeof progressSchema>) {
  const userId = await requireUserId();
  return saveReadingProgress(userId, progressSchema.parse(input));
}

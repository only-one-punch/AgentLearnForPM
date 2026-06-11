"use server";

import { z } from "zod";
import { requireUserId } from "@/lib/auth/session";
import { setSelfTestState } from "@/lib/study/mastery";

const selfTestSchema = z.object({
  itemId: z.string().min(1),
  documentSlug: z.string().min(1),
  status: z.enum(["mastered", "uncertain", "not_yet"])
});

export async function setSelfTestStateAction(input: z.input<typeof selfTestSchema>) {
  const userId = await requireUserId();
  return setSelfTestState(userId, selfTestSchema.parse(input));
}

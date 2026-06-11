import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth/session";
import { AuthenticationError } from "@/lib/auth/session";
import { saveReadingProgress } from "@/lib/study/progress";

const schema = z.object({
  documentSlug: z.string().min(1),
  sectionId: z.string().min(1).nullable().optional(),
  scrollPercent: z.number(),
  completedPercent: z.number()
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = schema.parse(await request.json());
    return NextResponse.json(await saveReadingProgress(userId, body));
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Invalid progress payload" }, { status: 400 });
  }
}

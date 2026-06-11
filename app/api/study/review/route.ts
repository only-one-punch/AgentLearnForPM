import { NextResponse } from "next/server";
import { AuthenticationError, requireUserId } from "@/lib/auth/session";
import { listWeakSelfTests } from "@/lib/study/mastery";

export async function GET() {
  try {
    const userId = await requireUserId();
    return NextResponse.json({ items: listWeakSelfTests(userId) });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Unable to load review items" }, { status: 500 });
  }
}

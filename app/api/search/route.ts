import { NextResponse } from "next/server";
import { AuthenticationError, requireUserId } from "@/lib/auth/session";
import { searchKnowledge } from "@/lib/search/search";
import { recordStudyEvent } from "@/lib/study/events";

export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "";
    const limit = Number(url.searchParams.get("limit") ?? 12);
    const response = await searchKnowledge(query, limit);
    if (query.trim().length >= 2) {
      recordStudyEvent({
        userId,
        eventType: "search",
        metadata: { query, hitCount: response.hits.length }
      });
    }
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Unable to search" }, { status: 500 });
  }
}

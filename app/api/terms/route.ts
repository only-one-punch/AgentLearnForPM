import { NextResponse } from "next/server";
import { AuthenticationError, requireUserId } from "@/lib/auth/session";
import { lookupTerms } from "@/lib/search/search";

export async function GET(request: Request) {
  try {
    await requireUserId();
    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? undefined;
    const category = url.searchParams.get("category") ?? undefined;
    return NextResponse.json({ terms: await lookupTerms(query, category) });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Unable to load terms" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { AuthenticationError, requireUserId } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/study/dashboard";

export async function GET() {
  try {
    const userId = await requireUserId();
    return NextResponse.json(await getDashboardData(userId));
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Unable to load dashboard" }, { status: 500 });
  }
}

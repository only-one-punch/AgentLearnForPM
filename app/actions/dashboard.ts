"use server";

import { requireUserId } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/study/dashboard";

export async function getDashboardDataAction() {
  const userId = await requireUserId();
  return getDashboardData(userId);
}

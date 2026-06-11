import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

export class AuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers()
  });
}

export async function requireUserId() {
  const session = await getCurrentSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new AuthenticationError();
  }

  return userId;
}

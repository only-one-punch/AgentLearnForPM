import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/lib/db/client";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  appName: "Agent PM Knowledge Workbench",
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "dev-only-change-me-change-me-32-byte-minimum-secret",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: drizzleAdapter(getDb(), {
    provider: "sqlite",
    schema
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24
  }
});

export type AuthSession = typeof auth.$Infer.Session;

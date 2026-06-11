import { auth } from "@/lib/auth/auth";

const appBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function normalizeAuthRequest(request: Request) {
  if (!appBasePath) {
    return request;
  }

  const url = new URL(request.url);
  const authPrefix = `${appBasePath}/api/auth`;

  if (!url.pathname.startsWith(authPrefix)) {
    return request;
  }

  url.pathname = url.pathname.slice(appBasePath.length) || "/api/auth";
  return new Request(url, request);
}

function handleAuth(request: Request) {
  return auth.handler(normalizeAuthRequest(request));
}

export const GET = handleAuth;
export const POST = handleAuth;
export const PATCH = handleAuth;
export const PUT = handleAuth;
export const DELETE = handleAuth;

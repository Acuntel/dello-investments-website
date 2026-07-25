import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Origin gate for every mutating API call. Parses with new URL() and compares
// hostnames exactly — a startsWith check would let evil hosts like
// delloinvestments.com.evil.com through. Requests with neither Origin nor
// Referer are rejected too (browsers always send one; header-less traffic is
// scripted). This is a cheap first filter; the chat routes add signed session
// tokens + rate limits behind it.
const ALLOWED_HOSTS = [
  "delloinvestments.com",
  "www.delloinvestments.com",
  "localhost",
];

function allowedSource(value: string | null): boolean {
  if (!value) return false;
  try {
    const host = new URL(value).hostname;
    return ALLOWED_HOSTS.includes(host) || host.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  if (
    request.method === "POST" &&
    request.nextUrl.pathname.startsWith("/api/")
  ) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    if (!allowedSource(origin) && !allowedSource(referer)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};

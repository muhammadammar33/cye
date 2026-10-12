import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Invisible characters that sneak into links copied from social posts and chat apps
// (zero-width space/joiner, word joiner, BOM, soft hyphen, non-breaking space).
const INVISIBLE = /[ ­​-‏⁠-⁤﻿]/g;
// Punctuation that gets glued to the end of a link in a sentence: "/ambassadors." or "/visitors)".
const TRAILING = /[.,;:!?'")\]]+$/;

/** "/Ambassadors%E2%81%A0" -> "/ambassadors". Every public route is lowercase. */
function cleanPath(pathname: string) {
  let path: string;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const cleaned = path.replace(INVISIBLE, "").replace(TRAILING, "").toLowerCase() || "/";
  return cleaned === pathname ? null : cleaned;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    const cleaned = cleanPath(pathname);
    if (cleaned) {
      const url = req.nextUrl.clone();
      url.pathname = cleaned;
      return NextResponse.redirect(url, 308);
    }
    return NextResponse.next();
  }

  /** Optimistic guard for /admin: no valid session cookie, no dashboard. Pages re-check against the DB. */
  if (pathname === "/admin/login") return NextResponse.next();
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = new URL("/admin/login", req.url);
    if (pathname !== "/admin") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// Pages only: skip Next internals, the API and static files (anything with a file extension).
export const config = { matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"] };

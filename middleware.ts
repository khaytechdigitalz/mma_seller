import { NextResponse, type NextRequest } from "next/server";

// Routes that don't require an authenticated session.
const PUBLIC_PATHS = [
  "/signin",
  "/signup",
  "/forgot-password",
  "/verify-otp",
  "/set-new-password",
];

/**
 * Server-side route guard for the admin dashboard.
 *
 * Previously there was no middleware at all: `app/(dashboard)/layout.tsx`
 * only read a `userRole` cookie for display purposes and never checked
 * whether anyone was actually signed in, so any dashboard URL was reachable
 * without logging in (individual pages' own API calls would eventually 401,
 * but the shell, layout, and any static content rendered regardless).
 *
 * This runs on the server before a page is rendered, using the `auth_token`
 * cookie set at sign-in (see components/auth/sigin-form.tsx). Note this is
 * still a *presence* check, not a signature/validity check - it stops
 * unauthenticated browsing, but the backend must still reject expired/
 * invalid tokens on every API call (lib/axios.ts already clears the cookie
 * and bounces to /signin on a real 401 from the API).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // Signed-in users visiting an auth page (e.g. clicking a stale /signin
  // bookmark) get sent straight to the dashboard instead of seeing the form.
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!token && !isPublicPath) {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except static assets, images, and Next.js internals.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|icons).*)"],
};

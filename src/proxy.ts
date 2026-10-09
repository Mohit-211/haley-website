import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: bounce visitors without a session cookie before rendering.
// The real authorization happens in the Data Access Layer (src/lib/auth/dal.ts).
export function proxy(request: NextRequest) {
  if (!request.cookies.has("hb_session")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"],
};

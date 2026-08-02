import { NextResponse } from "next/server";
import { authEdge } from "@/lib/auth-edge";

export default authEdge((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAdminApiRoute = nextUrl.pathname.startsWith("/api/admin");
  const isAccountRoute = nextUrl.pathname.startsWith("/account");
  const isCheckoutRoute = nextUrl.pathname.startsWith("/checkout");

  if ((isAdminRoute || isAdminApiRoute) && (!isLoggedIn || role !== "admin")) {
    if (isAdminApiRoute) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((isAccountRoute || isCheckoutRoute) && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/api/admin/:path*",
  ],
};

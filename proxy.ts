// import { NextRequest, NextResponse } from "next/server"
// import { verifySession } from "@/app/lib/session"
// import { cookies } from "next/headers"

// // Define your access policy
// const protectedRoutes = ["/dashboard"]
// const publicRoutes = ["/login"]

// export default async function middleware(req: NextRequest) {
//   const path = req.nextUrl.pathname
//   const isProtectedRoute = protectedRoutes.includes(path)
//   const isPublicRoute = publicRoutes.includes(path)

//   const raw = (await cookies()).get("session")?.value
//   const session = await verifySession(raw)

//   // Block protected routes unless fully 2FA'd
//   if (isProtectedRoute && !(session?.userId && session?.twoFactorOk === true)) {
//     return NextResponse.redirect(new URL("/login", req.nextUrl))
//   }

//   // Keep authed users out of /login
//   if (isPublicRoute && session?.userId && session?.twoFactorOk === true) {
//     return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
// }

import { NextResponse, NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;
    console.log(token, 'token')

  // pages that don't need auth
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  // ---------- 1. Handle "/" ----------
  // If user opens the root "/", decide where to send immediately.
  if (pathname === "/") {
    if (token) {
      // already logged in → dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      // not logged in → login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ---------- 2. Block protected routes ----------
  // No token AND trying to access something that's not login/register/etc?
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ---------- 3. Prevent logged-in users from seeing /login etc ----------
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ---------- 4. Otherwise just continue normally ----------
  return NextResponse.next();
}

// Matcher to apply proxy only where it matters.
// We exclude Next.js internals, static assets, and API routes.
export const config = {
  matcher: [
    "/((?!_next|api|static|.*\\..*).*)",
  ],
};
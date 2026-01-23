import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const token = await getToken({ 
        req: request,
        secret: process.env.AUTH_SECRET,
    });
    const isLoggedIn = !!token;

    const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");
    const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

    // Redirect logged-in users away from auth pages
    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Redirect non-logged-in users to login when accessing dashboard
    if (!isLoggedIn && isDashboard) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register"],
};

import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const token = await getToken({ 
        req: request,
        secret: process.env.AUTH_SECRET,
        secureCookie: process.env.NODE_ENV === "production"
    });
    const isLoggedIn = !!token;

    const isAuthPage =
        request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/register");
    const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
    const isOnboarding = request.nextUrl.pathname.startsWith("/onboarding");

    // bruh why are you trying to login when youre already logged in. i-its not like i care or anything
    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // lowkey you cant just waltz into the dashboard without logging in first. ts pmo
    if (!isLoggedIn && (isDashboard || isOnboarding)) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register", "/onboarding"],
};

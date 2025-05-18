import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const AUTH_PAGES = ["/auth/sign-in", "/auth/sign-up"];

const REDIRECT_AUTHENTICATED_USER_TO = "/dashboard";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = getSessionCookie(request);

    if (sessionCookie && AUTH_PAGES.includes(pathname)) {
        return NextResponse.redirect(
            new URL(REDIRECT_AUTHENTICATED_USER_TO, request.url),
        );
    }

    const isAccessingProtectedContent = 
        pathname.startsWith("/dashboard") || 
        pathname.startsWith("/chat");
        
    if (!sessionCookie && isAccessingProtectedContent) {
        return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
    ],
};

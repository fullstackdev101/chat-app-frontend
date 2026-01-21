import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow login page without authentication
    if (pathname === '/login') {
        return NextResponse.next();
    }

    // Get token from cookies or check localStorage (via headers)
    const token = request.cookies.get('token')?.value;

    // If no token, redirect to login
    if (!token) {
        console.log(`🔒 [Middleware] No token found, redirecting ${pathname} → /login`);
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Validate token expiration (decode JWT)
    try {
        const payload = JSON.parse(
            Buffer.from(token.split('.')[1], 'base64').toString()
        );

        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp && payload.exp < currentTime) {
            console.log(`⏰ [Middleware] Token expired, redirecting ${pathname} → /login`);
            const loginUrl = new URL('/login', request.url);
            const response = NextResponse.redirect(loginUrl);
            // Clear the expired token
            response.cookies.delete('token');
            return response;
        }
    } catch (error) {
        console.error('❌ [Middleware] Invalid token format:', error);
        const loginUrl = new URL('/login', request.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('token');
        return response;
    }

    // Token is valid, allow access
    return NextResponse.next();
}

// Configure which routes to protect
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};

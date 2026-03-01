import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow login page without authentication
    if (pathname === '/login') {
        return NextResponse.next();
    }

    // Get token from HttpOnly cookie (set by backend on login)
    const token = request.cookies.get('token')?.value;

    // If no token, redirect to login
    if (!token) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // ✅ SECURITY: Cryptographically verify JWT signature using jose
    // This prevents forged JWTs from passing — unlike simple base64 decode
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);

        // Token is valid and signature verified — allow access
        return NextResponse.next();
    } catch (error) {
        // Signature invalid, token expired, or malformed
        const loginUrl = new URL('/login', request.url);
        const response = NextResponse.redirect(loginUrl);
        // Clear the invalid/expired cookie
        response.cookies.set('token', '', {
            httpOnly: true,
            expires: new Date(0),
            path: '/',
            sameSite: 'strict',
        });
        return response;
    }
}

// Configure which routes to protect
export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};

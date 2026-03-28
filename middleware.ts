import { NextRequest, NextResponse } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/singup'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the route is public
    if (PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.next();
    }

    // For protected routes, the client-side auth check will handle redirect
    // This middleware just allows the request to continue
    return NextResponse.next();
}

// Configure which routes to apply middleware to
export const config = {
    matcher: ['/((?!_next|static|favicon.ico).*)']
};

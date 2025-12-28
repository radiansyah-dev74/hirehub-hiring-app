import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Routes that require admin role
const adminRoutes = ['/admin', '/admin/jobs', '/admin/candidates'];

// Routes that require any authentication
const protectedRoutes = ['/profile', '/applications', '/jobs'];

// Public routes (no auth required)
const publicRoutes = ['/', '/login', '/register'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // DEV BYPASS: Allow all routes if DEV_BYPASS_AUTH is set (for local testing)
    // Add DEV_BYPASS_AUTH=true to .env.local to bypass auth
    if (process.env.DEV_BYPASS_AUTH === 'true') {
        console.log('[Middleware] DEV_BYPASS_AUTH enabled - skipping auth checks');
        return NextResponse.next();
    }

    // If Supabase is not configured, allow all routes (demo mode)
    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.next();
    }

    // Create Supabase client for middleware
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get session from cookie
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    const userRole = user?.user_metadata?.role || 'applicant';

    // Public routes - always accessible
    if (publicRoutes.some(route => pathname === route)) {
        // If user is logged in and trying to access login/register, redirect to appropriate dashboard
        if (user && (pathname === '/login' || pathname === '/register')) {
            const redirectUrl = userRole === 'admin' ? '/admin' : '/jobs';
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
        return NextResponse.next();
    }

    // Protected routes - require authentication
    if (protectedRoutes.some(route => pathname.startsWith(route)) ||
        adminRoutes.some(route => pathname.startsWith(route))) {

        if (!user) {
            // Redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Check admin routes
        if (adminRoutes.some(route => pathname.startsWith(route))) {
            if (userRole !== 'admin') {
                // Redirect non-admin users to jobs page
                return NextResponse.redirect(new URL('/jobs', request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes
         */
        '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
    ],
};

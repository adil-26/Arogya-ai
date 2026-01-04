import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    async function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // If no token (not logged in), let NextAuth handle redirect
        if (!token) {
            return NextResponse.next();
        }

        const role = token.role;

        // Admin trying to access patient pages
        if (role === 'admin') {
            const patientPaths = ['/dashboard', '/appointments', '/chat', '/history', '/records', '/profile', '/onboarding'];
            const isPatientPath = patientPaths.some(p => path.startsWith(p));

            if (isPatientPath) {
                return NextResponse.redirect(new URL('/admin', req.url));
            }

            // Admin trying to access doctor portal
            if (path.startsWith('/doctor') && path !== '/doctors') {
                return NextResponse.redirect(new URL('/admin', req.url));
            }
        }

        // Doctor trying to access patient pages
        if (role === 'doctor') {
            const patientPaths = ['/dashboard', '/appointments', '/chat', '/history', '/records', '/profile', '/onboarding'];
            const isPatientPath = patientPaths.some(p => path.startsWith(p));

            if (isPatientPath && path !== '/dashboard/health') {
                // Allow doctors to view /doctors listing
                if (path.startsWith('/doctors')) {
                    return NextResponse.next();
                }
                return NextResponse.redirect(new URL('/doctor', req.url));
            }
        }

        // Patient trying to access doctor portal
        if (role === 'patient') {
            if (path.startsWith('/doctor') && path !== '/doctors') {
                return NextResponse.redirect(new URL('/dashboard/health', req.url));
            }

            if (path.startsWith('/admin')) {
                return NextResponse.redirect(new URL('/dashboard/health', req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const path = req.nextUrl.pathname;

                // Public routes - no auth required
                const publicPaths = ['/login', '/signup', '/api', '/'];
                const isPublic = publicPaths.some(p => path.startsWith(p) || path === p);

                if (isPublic) return true;

                // All other routes require auth
                return !!token;
            }
        }
    }
);

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/appointments/:path*',
        '/chat/:path*',
        '/history/:path*',
        '/records/:path*',
        '/profile/:path*',
        '/doctor/:path*',
        '/admin/:path*',
        '/onboarding/:path*'
    ]
};

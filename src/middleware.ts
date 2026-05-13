import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (path.startsWith('/dashboard') && !token) {
      return NextResponse.redirect(new URL('/api/auth/signin', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/transactions/:path*',
    '/api-keys/:path*',
    '/withdraw/:path*',
    '/create-payment/:path*',
    '/webhook/:path*',
    '/admin/:path*',
    '/settings/:path*',
    '/profile/:path*',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = new Set([
    '/login',
    '/forgot-password',
    '/verify-email',
    '/verify-success',
    '/setup-success',
    '/employee-success',
    '/onboard',
    '/company-signup',
    '/reset-password'
]);

const PROTECTED_PREFIXES = ['/dashboard', '/onboarding'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('hrms.accessToken')?.value;
  const refreshToken = request.cookies.get('hrms.refreshToken')?.value;
  const isAuthenticated = !!(accessToken || refreshToken);

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isPublic = PUBLIC_PATHS.has(pathname);

  // Redirect authenticated users away from public routes (except success pages)
  if (isPublic && isAuthenticated && !['/verify-success', '/setup-success', '/employee-success'].includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect internal routes
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', pathname);

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('hrms.accessToken');
    response.cookies.delete('hrms.refreshToken');

    return response;
  }

  return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*', 
        '/onboarding/:path*', 
        '/login', 
        '/forgot-password', 
        '/verify-email', 
        '/verify-success', 
        '/setup-success', 
        '/employee-success', 
        '/onboard', 
        '/company-signup',
        '/reset-password'
    ],
};

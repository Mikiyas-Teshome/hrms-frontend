import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/onboarding'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('hrms.accessToken')?.value;
  const refreshToken = request.cookies.get('hrms.refreshToken')?.value;
  const isAuthenticated = !!(accessToken || refreshToken);

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

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
        '/',
        '/dashboard/:path*', 
        '/onboarding',
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

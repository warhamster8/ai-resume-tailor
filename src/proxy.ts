import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  // Check for Supabase session cookie (any sb- prefixed cookie indicates active session)
  const hasSession = request.cookies.getAll().some(
    (cookie) => cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
  );

  const isLoginPage = request.nextUrl.pathname.startsWith('/login');
  const isRootPage = request.nextUrl.pathname === '/';

  // Redirect to login if no session and not already on login/root page
  if (!hasSession && !isLoginPage && !isRootPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirect /zen to home page
  if (request.nextUrl.pathname === '/zen') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ['/zen'],
}; 
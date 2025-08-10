
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = req.nextUrl

  // if user is signed in and the current path is /login, redirect the user to /
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // if user is not signed in and the current path is not /login, redirect the user to /login
  if (!user && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - auth/callback (Supabase auth callback)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|auth/callback|favicon.ico).*)',
  ],
}

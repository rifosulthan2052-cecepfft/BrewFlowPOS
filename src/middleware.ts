import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
      cookieOptions: {
        sameSite: 'none',
        secure: true,
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = req.nextUrl

  const publicPaths = ['/login', '/auth/callback', '/update-password']

  /**
   * --- Step 1: Allow public pages ---
   * Special case: If we're on /update-password and user is not logged in yet,
   * allow client to process the #access_token and set session
   */
  if (!user && pathname === '/update-password') {
    return response
  }

  // Also skip for any other explicitly public paths
  if (!user && publicPaths.includes(pathname)) {
    return response
  }

  /**
   * --- Step 2: Protect private pages ---
   */
  if (!user && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  /**
   * --- Step 3: Logged-in redirects ---
   */
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  /**
   * --- Step 4: Force invited users without password to /update-password ---
   */
  if (user) {
    const passwordIsSet = user.user_metadata?.password_set

    if (user.app_metadata.provider === 'email' && !passwordIsSet) {
      if (pathname !== '/update-password') {
        return NextResponse.redirect(new URL('/update-password', req.url))
      }
    } else if (passwordIsSet && pathname === '/update-password') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons/*).*)',
  ],
}


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
  
  // This is a temporary fix to allow the client to handle auth redirects
  // without the middleware interfering. A more robust solution would be
  // to check for a specific query param or header.
  if (!user && req.headers.get('referer')?.includes('#access_token')) {
    return response;
  }
  
  // If the user is coming from an email link, the session is established on the client.
  // The client will then refresh the page, and the middleware will run again.
  // We need to allow the client to handle the initial redirect.
  // The 'type' query param is present on email magic links.
   if (req.nextUrl.searchParams.has('type')) {
    return response;
  }


  // If the user is not logged in and not on a public page, redirect them to login.
  const publicPaths = ['/login', '/auth/callback', '/welcome', '/update-password'];
  if (!user && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  // If the user is logged in and tries to access the login page, redirect them to the root.
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url))
  }
  
  if (user) {
    const passwordIsSet = user.user_metadata?.password_set;

    // This logic handles users who signed up via email invitation.
    if (user.app_metadata.provider === 'email' && !passwordIsSet) {
      if (pathname !== '/welcome') {
        // If they haven't set their password, they MUST be on the welcome page.
        return NextResponse.redirect(new URL('/welcome', req.url));
      }
    } else if (passwordIsSet && pathname === '/welcome') {
      // If they HAVE set their password, they should NOT be on the welcome page.
      return NextResponse.redirect(new URL('/', req.url));
    }
  }


  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons/*).*)',
  ],
}

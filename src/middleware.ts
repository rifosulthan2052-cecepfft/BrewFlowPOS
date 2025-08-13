
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

  const { pathname, searchParams } = req.nextUrl
  
  // If the user is coming from an auth link, the session is not yet established.
  // The access_token is in the URL hash, which is not available on the server.
  // The client-side Supabase script needs to run to establish the session.
  // We can check for the presence of the `type` search param which Supabase adds
  // for email link authentication.
  if (searchParams.has('type')) {
    return response;
  }

  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Allow access to auth callback without a user
  if (pathname === '/auth/callback') {
    return response;
  }
  
  if (!user && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (user) {
    const passwordIsSet = user.user_metadata?.password_set ?? false;

    // If user needs to set a password and is not on the correct page, redirect them.
    if (user.app_metadata.provider === 'email' && !passwordIsSet) {
      if (pathname !== '/update-password') {
        return NextResponse.redirect(new URL('/update-password', req.url));
      }
    } else if (passwordIsSet && pathname === '/update-password') {
      // If user has set a password but is still on the update page, redirect them away.
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

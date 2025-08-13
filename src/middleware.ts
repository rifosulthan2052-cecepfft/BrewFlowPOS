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
          req.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: req.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: req.headers } })
          response.cookies.set({ name, value: '', ...options })
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

  const { pathname, search, hash } = req.nextUrl

  // 🚀 Case 1: Just landed from Supabase email link with hash fragment (#access_token)
  if (hash.includes('access_token')) {
    // Let cookies be set and then send them to /update-password
    return NextResponse.redirect(new URL('/update-password', req.url))
  }

  // Public routes that don't require auth
  const publicPaths = ['/login', '/auth/callback', '/update-password']
  const isPublic = publicPaths.includes(pathname)

  // 🚀 Case 2: Not logged in and trying to access a private page
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 🚀 Case 3: Logged in but missing password
  if (user) {
    const passwordIsSet = user.user_metadata?.password_set

    if (user.app_metadata.provider === 'email' && !passwordIsSet && pathname !== '/update-password') {
      return NextResponse.redirect(new URL('/update-password', req.url))
    }

    if (passwordIsSet && pathname === '/update-password') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // If logged in and tries to visit /login, redirect home
    if (pathname === '/login') {
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

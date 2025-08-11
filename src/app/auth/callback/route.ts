
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            const newResponse = NextResponse.redirect(new URL(next, origin));
            newResponse.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            const newResponse = NextResponse.redirect(new URL(next, origin));
            newResponse.cookies.set({
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
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=Could not authenticate user', req.url));
}

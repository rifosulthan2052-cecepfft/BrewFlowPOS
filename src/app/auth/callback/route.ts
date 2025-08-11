
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';

  if (code) {
    let cookies: Partial<{ [key: string]: string }> = {};
    const allCookies = req.cookies.getAll()
    allCookies.forEach(cookie => {
        cookies[cookie.name] = cookie.value;
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies[name]
          },
          set(name: string, value: string, options: CookieOptions) {
            cookies[name] = value;
          },
          remove(name: string, options: CookieOptions) {
            delete cookies[name];
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
      const response = NextResponse.redirect(new URL(next, origin));
      // Manually set all cookies from the session on the response
      for (const name in cookies) {
        if(cookies[name]){
             response.cookies.set({
                name,
                value: cookies[name]!,
                path: '/',
            });
        }
      }
      return response;
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=Could not authenticate user', req.url));
}

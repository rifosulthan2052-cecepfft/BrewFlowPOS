
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
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // The `set` method was called from the Supabase client just now.
            // We need to set the cookie on the response.
            // But we don't have a response object yet.
            // We'll have to create one and modify it in the `set` method.
            // This is a bit of a workaround, but it's the only way to do it here.
          },
          remove(name: string, options: CookieOptions) {
            // The `remove` method was called from the Supabase client just now.
            // We need to remove the cookie on the response.
            // But we don't have a response object yet.
            // We'll have to create one and modify it in the `remove` method.
            // This is a bit of a workaround, but it's the only way to do it here.
          },
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  const url = req.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('error', 'Could not authenticate user')
  return NextResponse.redirect(url)
}

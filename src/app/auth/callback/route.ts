
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
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
      // Create a response object to redirect the user and set the cookies.
      const response = NextResponse.redirect(new URL(next, req.url));
      // Get the cookies from the Supabase client and set them on the response.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        response.cookies.set({
          name: 'my-session',
          value: JSON.stringify(session),
          httpOnly: true,
          sameSite: 'lax',
        });
      }
      return response;
    }
  }

  // return the user to an error page with instructions
  const url = req.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('error', 'Could not authenticate user')
  return NextResponse.redirect(url)
}

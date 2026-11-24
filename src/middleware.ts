import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Middleware:
 * 1. Refreshes the Supabase session cookies via @supabase/ssr.
 * 2. Redirects unauthenticated /admin/* requests to /admin/login.
 * 3. Redirects authenticated requests on /admin/login to /admin/dashboard.
 * 4. Adds Cache-Control: no-store on all admin routes.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const isSupabase = process.env.NEXT_PUBLIC_DATA_BACKEND === 'supabase';

  if (isSupabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      });

      // Refresh session and check authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Protect /admin routes (except /admin/login)
      if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        if (!user) {
          const url = request.nextUrl.clone();
          url.pathname = '/admin/login';
          return NextResponse.redirect(url);
        }
      }

      // If user is already authenticated and visits /admin/login, redirect to /admin/dashboard
      if (pathname === '/admin/login' && user) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  // Enforce Cache-Control: no-store and robots indexing prevention on all /admin routes
  if (pathname.startsWith('/admin')) {
    supabaseResponse.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    supabaseResponse.headers.set('Pragma', 'no-cache');
    supabaseResponse.headers.set('Expires', '0');
    supabaseResponse.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*'],
};

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { pathname } = request.nextUrl;

  // Route categories
  const isPublicRoute = pathname === '/login' || pathname === '/privacy' || pathname.startsWith('/auth/callback');
  const isApiRoute = pathname.startsWith('/api/');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isHttpUrl = Boolean(
    supabaseUrl && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))
  );
  const isSupabaseLive =
    Boolean(supabaseUrl && supabaseAnonKey && isHttpUrl) &&
    !supabaseUrl?.includes('your-project') &&
    !supabaseUrl?.includes('placeholder');

  // Check demo authentication cookie for rapid evaluation or offline mode
  const demoCookie = request.cookies.get('redlab_demo_auth')?.value;
  const hasDemoAuth = demoCookie === 'true' || demoCookie === 'authenticated';

  let user = null;

  if (isSupabaseLive) {
    const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, any> }[]) {
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

    // Check actual authenticated user via getUser() (secure server verification)
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    user = authUser;
  }

  const isAuthenticated = Boolean(user) || hasDemoAuth;

  // 1. If user is already authenticated and visits /login, redirect to /dashboard
  if (pathname === '/login' && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // 2. If user visits root /, redirect to /dashboard (if authenticated) or /login (if not)
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = isAuthenticated ? '/dashboard' : '/login';
    return NextResponse.redirect(url);
  }

  // 3. Strict barrier: If not authenticated and attempting to access any non-public route, redirect to /login
  if (!isAuthenticated && !isPublicRoute && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (e.g. .svg, .png, .jpg, .css)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

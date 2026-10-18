import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isHttpUrl = Boolean(
    supabaseUrl && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))
  );
  const isSupabaseLive =
    Boolean(supabaseUrl && supabaseAnonKey && isHttpUrl) &&
    !supabaseUrl?.includes('your-project') &&
    !supabaseUrl?.includes('placeholder');

  const { pathname } = request.nextUrl;

  // List of protected internal application paths
  const protectedPaths = [
    '/dashboard',
    '/kanban',
    '/scheduler',
    '/files',
    '/literature',
    '/milestones',
    '/logs',
  ];

  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  // Check demo authentication cookie for rapid evaluation or offline mode
  const demoCookie = request.cookies.get('redlab_demo_auth')?.value;
  const hasDemoAuth = demoCookie === 'true' || demoCookie === 'authenticated';

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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If accessing a protected route without a valid user or demo auth, redirect to /login
    if (isProtectedPath && !user && !hasDemoAuth) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(url);
    }

    // If logged in and visiting /login, redirect to /
    if (pathname === '/login' && user) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  } else {
    // Supabase credentials not set yet: allow demo access or redirect to /login if strict
    // If accessing protected path and not demo auth, allow redirect to /login with easy one-click demo
    if (isProtectedPath && !hasDemoAuth) {
      // In demo mode without login cookie, redirect to /login so the login flow can be experienced
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(url);
    }
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

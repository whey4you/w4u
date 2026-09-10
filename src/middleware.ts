import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/auth/admin-auth';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = await verifyAdminSessionToken(sessionToken);

  const isLoginPage = pathname === '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin');
  const isAdminPage = pathname.startsWith('/admin');

  // 1. Nếu đang truy cập trang đăng nhập (/admin/login)
  if (isLoginPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-is-admin-login', '1');
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // 2. Nếu đang gọi API quản trị (/api/admin/*)
  if (isAdminApi) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized: Yêu cầu phiên đăng nhập quản trị viên' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 3. Nếu đang truy cập các trang quản trị (/admin/*)
  if (isAdminPage) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      const targetPath = `${pathname}${search}`;
      if (targetPath !== '/admin') {
        loginUrl.searchParams.set('next', targetPath);
      }
      return NextResponse.redirect(loginUrl);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-is-admin-login', '0');
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

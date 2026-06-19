import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'mls_portal_session';
const JWT_SECRET = new TextEncoder().encode(
  process.env.PORTAL_JWT_SECRET || 'mls-transports-portal-secret-change-in-production'
);

async function getPortalSession(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as {
      portalUserId: string;
      role: 'customer' | 'driver' | 'supplier';
      entityId: string;
      username: string;
      name: string;
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith('/portal')) {
    return NextResponse.next();
  }

  const session = await getPortalSession(req);

  if (pathname === '/portal/login') {
    if (session) {
      return NextResponse.redirect(new URL(`/portal/${session.role}`, req.url));
    }
    return NextResponse.next();
  }

  if (pathname === '/portal' || pathname === '/portal/') {
    if (session) {
      return NextResponse.redirect(new URL(`/portal/${session.role}`, req.url));
    }
    return NextResponse.redirect(new URL('/portal/login', req.url));
  }

  if (!session) {
    const loginUrl = new URL('/portal/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const roleRoutes: Record<string, string> = {
    customer: '/portal/customer',
    driver: '/portal/driver',
    supplier: '/portal/supplier',
  };

  const allowedBase = roleRoutes[session.role];
  if (!pathname.startsWith(allowedBase)) {
    return NextResponse.redirect(new URL(allowedBase, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*'],
};
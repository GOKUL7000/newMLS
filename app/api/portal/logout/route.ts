import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'mls_portal_session';

export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return res;
}

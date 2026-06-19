import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'mls_portal_session';
const JWT_SECRET = new TextEncoder().encode(
  process.env.PORTAL_JWT_SECRET || 'mls-transports-portal-secret-change-in-production'
);

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json(null, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return NextResponse.json({
      portalUserId: payload.portalUserId,
      role: payload.role,
      entityId: payload.entityId,
      username: payload.username,
      name: payload.name,
    });
  } catch {
    return NextResponse.json(null, { status: 401 });
  }
}

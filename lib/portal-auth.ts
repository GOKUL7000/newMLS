import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'mls_portal_session';
const JWT_SECRET = new TextEncoder().encode(
  process.env.PORTAL_JWT_SECRET || 'mls-transports-portal-secret-change-in-production'
);

export interface PortalSessionPayload {
  portalUserId: string;
  role: string;
  entityId: string;
  username: string;
  name: string;
}

/**
 * Reads the portal JWT from either:
 *  - the httpOnly cookie (web app requests)
 *  - the Authorization: Bearer <token> header (mobile app requests)
 * and verifies it. Returns the decoded payload, or null if missing/invalid.
 */
export async function getPortalSession(req: NextRequest): Promise<PortalSessionPayload | null> {
  let token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice('Bearer '.length);
    }
  }

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      portalUserId: payload.portalUserId as string,
      role: payload.role as string,
      entityId: payload.entityId as string,
      username: payload.username as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export { JWT_SECRET, COOKIE_NAME };
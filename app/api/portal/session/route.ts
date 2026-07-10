import { NextRequest, NextResponse } from 'next/server';
import { getPortalSession } from '@/lib/portal-auth';

export async function GET(req: NextRequest) {
  const session = await getPortalSession(req);
  if (!session) return NextResponse.json(null, { status: 401 });
  return NextResponse.json(session);
}
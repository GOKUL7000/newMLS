import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const JWT_SECRET = new TextEncoder().encode(
  process.env.PORTAL_JWT_SECRET || 'mls-transports-portal-secret-change-in-production'
);

const TRIP_BUCKET = 'Trips';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('mls_portal_session')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'driver') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const path = new URL(req.url).searchParams.get('path');
    if (!path) return NextResponse.json({ error: 'path is required' }, { status: 400 });

    const { data, error } = await supabaseAdmin.storage.from(TRIP_BUCKET).createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: error?.message || 'Could not create signed URL' }, { status: 500 });
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

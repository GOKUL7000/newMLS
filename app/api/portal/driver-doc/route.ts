import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getPortalSession } from '@/lib/portal-auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const TRIP_BUCKET = 'Trips';

export async function GET(req: NextRequest) {
  const session = await getPortalSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'driver') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const path = new URL(req.url).searchParams.get('path');
  if (!path) return NextResponse.json({ error: 'path is required' }, { status: 400 });

  const { data, error } = await supabaseAdmin.storage.from(TRIP_BUCKET).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message || 'Could not create signed URL' }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
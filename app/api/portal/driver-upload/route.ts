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

export async function POST(req: NextRequest) {
  const token = req.cookies.get('mls_portal_session')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'driver') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const driverId = payload.entityId as string;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const tripId = formData.get('tripId') as string | null;
    const tripNo = formData.get('tripNo') as string | null;
    const fieldName = (formData.get('fieldName') as string | null) || 'doc';

    if (!file || !tripId || !tripNo) {
      return NextResponse.json({ error: 'file, tripId and tripNo are required' }, { status: 400 });
    }

    // Verify the trip belongs to this driver before allowing upload.
    const { data: trip } = await supabaseAdmin
      .from('trips')
      .select('id, driver_id')
      .eq('id', tripId)
      .single();

    if (!trip || trip.driver_id !== driverId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ext = file.name.split('.').pop();
    const path = `${tripNo}/${fieldName}_${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabaseAdmin.storage.from(TRIP_BUCKET).upload(path, buffer, {
      upsert: true,
      contentType: file.type,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ path });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

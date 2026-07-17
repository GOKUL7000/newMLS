import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getPortalSession } from '@/lib/portal-auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ALLOWED_BUCKETS = ['Trips', 'Diesel', 'Adblue'] as const;

export async function POST(req: NextRequest) {
  const session = await getPortalSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'driver') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const driverId = session.entityId;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const tripId = formData.get('tripId') as string | null;
  const tripNo = formData.get('tripNo') as string | null;
  const fieldName = (formData.get('fieldName') as string | null) || 'doc';
  const bucketParam = (formData.get('bucket') as string | null) || 'Trips';

  if (!ALLOWED_BUCKETS.includes(bucketParam as any)) {
    return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
  }
  const bucket = bucketParam as typeof ALLOWED_BUCKETS[number];

  if (!file || !tripId) {
    return NextResponse.json({ error: 'file and tripId are required' }, { status: 400 });
  }
  if (bucket === 'Trips' && !tripNo) {
    return NextResponse.json({ error: 'tripNo is required for Trips bucket uploads' }, { status: 400 });
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
  // Trips bucket is organized by trip_no (matches existing driver trip docs);
  // Diesel/Adblue buckets are organized by trip.id (matches the admin panel's
  // uploadExpenseFile pattern: `${trip.id}/${field}_${timestamp}.${ext}`).
  const folder = bucket === 'Trips' ? tripNo : tripId;
  const path = `${folder}/${fieldName}_${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
    upsert: true,
    contentType: file.type,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ path });
}
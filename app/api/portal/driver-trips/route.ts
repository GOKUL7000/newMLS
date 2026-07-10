import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getPortalSession } from '@/lib/portal-auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(req: NextRequest) {
  const session = await getPortalSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'driver') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Always scope to the authenticated driver — ignore/validate any client-supplied driverId.
  const requestedId = new URL(req.url).searchParams.get('driverId');
  const driverId = session.entityId;
  if (requestedId && requestedId !== driverId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: trips, error } = await supabaseAdmin
    .from('trips')
    .select(`
      id, trip_no, trip_date, origin, destination, status, lr_no,
      freight_amount, settled_amount,
      start_km, start_km_doc, start_date,
      loading_km, loading_km_doc, loading_date,
      unloading_km, unloading_photo, unloading_date,
      end_km, end_km_photo, end_date,
      total_km,
      customers(name)
    `)
    .eq('driver_id', driverId)
    .eq('deleted', false)
    .order('trip_date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ trips: trips || [] });
}
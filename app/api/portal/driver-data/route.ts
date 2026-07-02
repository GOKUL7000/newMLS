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

  const driverId = new URL(req.url).searchParams.get('driverId');
  if (!driverId || driverId !== session.entityId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: trips } = await supabaseAdmin
    .from('trips')
    .select('id, trip_no, trip_date, origin, destination, status, lr_no, start_km, end_km, total_km, freight_amount, customers(name)')
    .eq('driver_id', driverId)
    .eq('deleted', false)
    .order('trip_date', { ascending: false });

  return NextResponse.json({ trips: trips || [] });
}
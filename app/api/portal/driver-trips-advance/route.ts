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

// Only these forward transitions are allowed from the driver portal.
// Anything past TripCompleted (POD, invoicing, settlement) is admin-only.
const DRIVER_STEP_CONFIG: Record<
  string,
  { next: string; kmField: string; docField: string }
> = {
  Pending:   { next: 'Started',       kmField: 'start_km',     docField: 'start_km_doc' },
  Started:   { next: 'Loading',       kmField: 'loading_km',   docField: 'loading_km_doc' },
  Loading:   { next: 'Unloading',     kmField: 'unloading_km', docField: 'unloading_photo' },
  Unloading: { next: 'TripCompleted', kmField: 'end_km',       docField: 'end_km_photo' },
};

export async function POST(req: NextRequest) {
  const token = req.cookies.get('mls_portal_session')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'driver') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const driverId = payload.entityId as string;

    const body = await req.json();
    const { tripId, kmValue, docPath } = body;

    if (!tripId || kmValue === undefined || kmValue === null || kmValue === '') {
      return NextResponse.json({ error: 'tripId and kmValue are required' }, { status: 400 });
    }

    // Load trip and verify ownership + current status.
    const { data: trip, error: tripErr } = await supabaseAdmin
      .from('trips')
      .select('id, driver_id, status, start_km, deleted')
      .eq('id', tripId)
      .single();

    if (tripErr || !trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    if (trip.deleted) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    if (trip.driver_id !== driverId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const step = DRIVER_STEP_CONFIG[trip.status];
    if (!step) {
      return NextResponse.json({ error: `Trip cannot be advanced from status "${trip.status}"` }, { status: 400 });
    }

    const km = parseInt(String(kmValue), 10);
    if (Number.isNaN(km)) return NextResponse.json({ error: 'Invalid KM value' }, { status: 400 });

    const updates: Record<string, any> = {
      status: step.next,
      [step.kmField]: km,
    };
    if (docPath) updates[step.docField] = docPath;

    if (step.next === 'Started')       updates.start_date     = new Date().toISOString();
    if (step.next === 'Loading')       updates.loading_date   = new Date().toISOString();
    if (step.next === 'Unloading')     updates.unloading_date = new Date().toISOString();
    if (step.next === 'TripCompleted') {
      updates.end_date = new Date().toISOString();
      if (trip.start_km) updates.total_km = km - trip.start_km;
    }

    const { error: updateErr } = await supabaseAdmin.from('trips').update(updates).eq('id', tripId);
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    return NextResponse.json({ success: true, status: step.next });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

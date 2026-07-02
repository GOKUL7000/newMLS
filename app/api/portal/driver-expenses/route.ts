import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getPortalSession } from '@/lib/portal-auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Trip statuses at/after which a driver may no longer log new expenses —
// admin takes over from TripCompleted onward.
const LOCKED_STATUSES = ['TripCompleted', 'POPReceived', 'POPSubmitted', 'GenerateInvoice', 'Settled'];

async function getDriverId(req: NextRequest): Promise<string | null> {
  const session = await getPortalSession(req);
  if (!session || session.role !== 'driver') return null;
  return session.entityId;
}

export async function GET(req: NextRequest) {
  const driverId = await getDriverId(req);
  if (!driverId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tripId = new URL(req.url).searchParams.get('tripId');
  if (!tripId) return NextResponse.json({ error: 'tripId is required' }, { status: 400 });

  // Verify the trip belongs to this driver before returning expenses.
  const { data: trip } = await supabaseAdmin
    .from('trips')
    .select('id, driver_id')
    .eq('id', tripId)
    .single();

  if (!trip || trip.driver_id !== driverId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: expenses, error } = await supabaseAdmin
    .from('trip_expenses')
    .select('*')
    .eq('trip_id', tripId)
    .order('expense_date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ expenses: expenses || [] });
}

export async function POST(req: NextRequest) {
  const driverId = await getDriverId(req);
  if (!driverId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { tripId, expense_date, category, amount, advance_amount, paid_by, notes, receipt_doc } = body;

  if (!tripId) return NextResponse.json({ error: 'tripId is required' }, { status: 400 });
  if (!amount && !advance_amount) {
    return NextResponse.json({ error: 'Enter an expense amount and/or advance amount' }, { status: 400 });
  }

  const { data: trip } = await supabaseAdmin
    .from('trips')
    .select('id, driver_id, status, deleted')
    .eq('id', tripId)
    .single();

  if (!trip || trip.deleted) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  if (trip.driver_id !== driverId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (LOCKED_STATUSES.includes(trip.status)) {
    return NextResponse.json({ error: 'This trip is completed — expenses can no longer be added.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('trip_expenses').insert({
    trip_id: tripId,
    expense_date: expense_date || new Date().toISOString().slice(0, 10),
    category: category || 'Other',
    amount: amount ? parseFloat(amount) : 0,
    advance_amount: advance_amount ? parseFloat(advance_amount) : 0,
    paid_by: paid_by || 'Driver',
    notes: notes || null,
    receipt_doc: receipt_doc || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
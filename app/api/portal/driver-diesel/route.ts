import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getPortalSession } from '@/lib/portal-auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const LOCKED_STATUSES = ['TripCompleted', 'POPReceived', 'POPSubmitted', 'GenerateInvoice', 'Settled'];

export async function POST(req: NextRequest) {
  const session = await getPortalSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'driver') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const driverId = session.entityId;

  const body = await req.json();
  const {
    tripId, expense_date, bunk_name, litres, rate, km_reading,
    bill_photo, meter_photo, advance_amount, paid_by, notes,
  } = body;

  if (!tripId) return NextResponse.json({ error: 'tripId is required' }, { status: 400 });
  if (!litres || !rate) return NextResponse.json({ error: 'Litres and rate are required' }, { status: 400 });

  const { data: trip } = await supabaseAdmin
    .from('trips')
    .select('id, driver_id, status, deleted')
    .eq('id', tripId)
    .single();

  if (!trip || trip.deleted) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  if (trip.driver_id !== driverId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (LOCKED_STATUSES.includes(trip.status)) {
    return NextResponse.json({ error: 'This trip is completed — diesel can no longer be logged.' }, { status: 400 });
  }

  const litresNum = parseFloat(litres);
  const rateNum = parseFloat(rate);
  const amount = litresNum * rateNum;
  const dateStr = expense_date || new Date().toISOString().slice(0, 10);

  const { data: expenseRow, error: expenseErr } = await supabaseAdmin
    .from('trip_expenses')
    .insert({
      trip_id: tripId,
      expense_date: dateStr,
      category: 'Diesel',
      amount,
      advance_amount: advance_amount ? parseFloat(advance_amount) : 0,
      paid_by: paid_by || 'Driver',
      notes: notes || null,
    })
    .select()
    .single();

  if (expenseErr) return NextResponse.json({ error: expenseErr.message }, { status: 500 });

  const { error: dieselErr } = await supabaseAdmin.from('diesel_expenses').insert({
    trip_expense_id: expenseRow.id,
    trip_id: tripId,
    expense_date: dateStr,
    bunk_name: bunk_name || null,
    litres: litresNum,
    rate: rateNum,
    amount,
    km_reading: km_reading ? parseFloat(km_reading) : null,
    bill_photo: bill_photo || null,
    meter_photo: meter_photo || null,
  });

  if (dieselErr) return NextResponse.json({ error: dieselErr.message }, { status: 500 });

  return NextResponse.json({ success: true, amount });
}
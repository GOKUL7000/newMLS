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
  if (session.role !== 'customer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const customerId = new URL(req.url).searchParams.get('customerId');
  if (!customerId || customerId !== session.entityId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [tripsRes, invoicesRes] = await Promise.all([
    supabaseAdmin
      .from('trips')
      .select('id, trip_no, trip_date, origin, destination, freight_amount, status, lr_no')
      .eq('customer_id', customerId)
      .eq('deleted', false)
      .order('trip_date', { ascending: false }),
    supabaseAdmin
      .from('invoices')
      .select('id, invoice_no, date, amount, paid, outstanding, due_date, status')
      .eq('party_id', customerId)
      .eq('type', 'Customer')
      .order('date', { ascending: false }),
  ]);

  return NextResponse.json({ trips: tripsRes.data || [], invoices: invoicesRes.data || [] });
}
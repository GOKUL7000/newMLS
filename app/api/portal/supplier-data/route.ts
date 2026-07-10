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
  if (session.role !== 'supplier') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supplierId = new URL(req.url).searchParams.get('supplierId');
  if (!supplierId || supplierId !== session.entityId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [tripsRes, invoicesRes] = await Promise.all([
    supabaseAdmin
      .from('trips')
      .select('id, trip_no, trip_date, origin, destination, supplier_amount, status, lr_no, vehicles(registration_no)')
      .eq('supplier_id', supplierId)
      .eq('deleted', false)
      .order('trip_date', { ascending: false }),
    supabaseAdmin
      .from('invoices')
      .select('id, invoice_no, date, amount, paid, outstanding, due_date, status')
      .eq('party_id', supplierId)
      .eq('type', 'Supplier')
      .order('date', { ascending: false }),
  ]);

  return NextResponse.json({ trips: tripsRes.data || [], invoices: invoicesRes.data || [] });
}
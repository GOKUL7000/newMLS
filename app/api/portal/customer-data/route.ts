// ============================================================
// app/api/portal/customer-data/route.ts
// ============================================================
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
 
async function verifySession(req: NextRequest, expectedRole: string) {
  const token = req.cookies.get('mls_portal_session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== expectedRole) return null;
    return payload as { entityId: string; role: string };
  } catch {
    return null;
  }
}
 
// ── Customer Data ────────────────────────────────────────────────────────────
export async function GET_CUSTOMER(req: NextRequest) {
  const session = await verifySession(req, 'customer');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 
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
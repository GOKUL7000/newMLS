'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, Loader2, FileText, Truck, ChevronDown, ChevronUp,
  CheckCircle2, Clock, IndianRupee, AlertCircle,
} from 'lucide-react';

interface Session { portalUserId: string; role: string; entityId: string; username: string; name: string; }

interface Trip {
  id: string; trip_no: string; trip_date: string;
  origin: string | null; destination: string | null;
  freight_amount: number | null; status: string; lr_no: string | null;
}

interface Invoice {
  id: string; invoice_no: string; date: string;
  amount: number; paid: number; outstanding: number;
  due_date: string | null; status: string;
}

const statusColor: Record<string, string> = {
  Pending: 'bg-gray-100 text-gray-500', Started: 'bg-blue-100 text-blue-700',
  Loading: 'bg-indigo-100 text-indigo-700', Unloading: 'bg-purple-100 text-purple-700',
  TripCompleted: 'bg-cyan-100 text-cyan-700', POPReceived: 'bg-yellow-100 text-yellow-700',
  POPSubmitted: 'bg-orange-100 text-orange-700', Settled: 'bg-green-100 text-green-700',
};

const inr = (n: number) => '₹ ' + Math.round(n).toLocaleString('en-IN');
const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function CustomerPortalPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [tab, setTab] = useState<'trips' | 'invoices'>('trips');
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const sessionRes = await fetch('/api/portal/session');
    if (!sessionRes.ok) { router.push('/portal/login'); return; }
    const s: Session = await sessionRes.json();
    if (s.role !== 'customer') { router.push('/portal/login'); return; }
    setSession(s);

    const res = await fetch(`/api/portal/customer-data?customerId=${s.entityId}`);
    const data = await res.json();
    setTrips(data.trips || []);
    setInvoices(data.invoices || []);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  };

  const totalFreight = trips.reduce((s, t) => s + (t.freight_amount || 0), 0);
  const totalOutstanding = invoices.reduce((s, i) => s + (i.outstanding || 0), 0);
  const totalPaid = invoices.reduce((s, i) => s + (i.paid || 0), 0);
  const activeTrips = trips.filter(t => !['Settled', 'Pending'].includes(t.status)).length;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center gap-2 text-gray-400">
      <Loader2 size={16} className="animate-spin" /> Loading…
    </div>
  );
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-[14px]">
            {session.name.charAt(0)}
          </div>
          <div>
            <p className="text-[14px] font-bold text-gray-800">{session.name}</p>
            <p className="text-[11px] text-gray-400">Customer Portal</p>
          </div>
        </div>
        <button onClick={handleLogout} disabled={loggingOut}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-[11px] text-gray-500 hover:bg-gray-50 disabled:opacity-60">
          {loggingOut ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={12} />} Logout
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400">Total Trips</p>
            <p className="text-[20px] font-bold text-blue-600 mt-0.5">{trips.length}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400">Active Trips</p>
            <p className="text-[20px] font-bold text-orange-500 mt-0.5">{activeTrips}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400">Outstanding</p>
            <p className="text-[20px] font-bold text-red-500 mt-0.5">{inr(totalOutstanding)}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400">Total Paid</p>
            <p className="text-[20px] font-bold text-green-600 mt-0.5">{inr(totalPaid)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
          <button onClick={() => setTab('trips')}
            className={`flex-1 py-2 text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5 ${tab === 'trips' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
            <Truck size={12} /> Trips ({trips.length})
          </button>
          <button onClick={() => setTab('invoices')}
            className={`flex-1 py-2 text-[12px] font-medium transition-colors border-l border-gray-200 flex items-center justify-center gap-1.5 ${tab === 'invoices' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
            <FileText size={12} /> Invoices ({invoices.length})
          </button>
        </div>

        {/* Trips */}
        {tab === 'trips' && (
          <div className="space-y-2">
            {trips.length === 0 ? (
              <p className="text-[12px] text-gray-400 text-center py-10">No trips found.</p>
            ) : trips.map(t => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <button onClick={() => setExpandedTrip(expandedTrip === t.id ? null : t.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-blue-600">{t.trip_no}</p>
                      <p className="text-[11px] text-gray-500 truncate">{t.origin || '—'} → {t.destination || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor[t.status] || 'bg-gray-100 text-gray-500'}`}>{t.status}</span>
                    {expandedTrip === t.id ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
                  </div>
                </button>
                {expandedTrip === t.id && (
                  <div className="px-4 pb-3 pt-1 border-t border-gray-100 bg-gray-50 grid grid-cols-2 gap-2 text-[11px]">
                    <p className="text-gray-400">Date: <span className="text-gray-700 font-medium">{fmtDate(t.trip_date)}</span></p>
                    <p className="text-gray-400">LR No: <span className="text-gray-700 font-medium">{t.lr_no || '—'}</span></p>
                    <p className="text-gray-400">Freight: <span className="text-gray-700 font-medium">{inr(t.freight_amount || 0)}</span></p>
                    <p className="text-gray-400">Status: <span className="text-gray-700 font-medium">{t.status}</span></p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Invoices */}
        {tab === 'invoices' && (
          <div className="space-y-2">
            {invoices.length === 0 ? (
              <p className="text-[12px] text-gray-400 text-center py-10">No invoices found.</p>
            ) : invoices.map(inv => (
              <div key={inv.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[12px] font-semibold text-blue-600">{inv.invoice_no}</p>
                    <p className="text-[11px] text-gray-400">{fmtDate(inv.date)} · Due: {fmtDate(inv.due_date)}</p>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    inv.status === 'Paid' ? 'bg-green-100 text-green-700'
                    : inv.status === 'Partial' ? 'bg-yellow-100 text-yellow-700'
                    : inv.outstanding > 0 ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-500'
                  }`}>{inv.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400 text-[10px]">Amount</p>
                    <p className="font-semibold text-gray-700">{inr(inv.amount)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-gray-400 text-[10px]">Paid</p>
                    <p className="font-semibold text-green-600">{inr(inv.paid)}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2">
                    <p className="text-gray-400 text-[10px]">Outstanding</p>
                    <p className="font-semibold text-red-500">{inr(inv.outstanding)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

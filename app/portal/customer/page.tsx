'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, FileText, LogOut, MapPin, Calendar, ChevronDown, ChevronUp, AlertCircle, Package, IndianRupee } from 'lucide-react';
import { getPortalSession, portalLogout, type PortalSession } from '@/lib/portalSession';

type Trip = {
  id: string; trip_no: string; trip_date: string;
  origin: string; destination: string;
  freight_amount: number; status: string; lr_no: string | null;
};
type Invoice = {
  id: string; invoice_no: string; date: string;
  amount: number; paid: number; outstanding: number;
  due_date: string | null; status: string;
};

const TRIP_COLORS: Record<string, string> = {
  Pending: 'bg-gray-100 text-gray-600', Started: 'bg-blue-100 text-blue-700',
  Loading: 'bg-amber-100 text-amber-700', Unloading: 'bg-purple-100 text-purple-700',
  TripCompleted: 'bg-teal-100 text-teal-700', POPReceived: 'bg-cyan-100 text-cyan-700',
  POPSubmitted: 'bg-indigo-100 text-indigo-700', GenerateInvoice: 'bg-orange-100 text-orange-700',
  Settled: 'bg-emerald-100 text-emerald-700',
};
const INV_COLORS: Record<string, string> = {
  Paid: 'bg-emerald-100 text-emerald-700',
  Partial: 'bg-amber-100 text-amber-700',
  Unpaid: 'bg-red-100 text-red-700',
};

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function CustomerPortalPage() {
  const router = useRouter();
  const [session, setSession] = useState<PortalSession | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trips' | 'invoices'>('trips');
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [tripFilter, setTripFilter] = useState('All');
  const [invFilter, setInvFilter] = useState('All');

  useEffect(() => { init(); }, []);

  async function init() {
    const s = await getPortalSession();
    if (!s || s.role !== 'customer') { router.push('/portal/login'); return; }
    setSession(s);
    await fetchData(s.entityId);
    setLoading(false);
  }

  async function fetchData(customerId: string) {
    const res = await fetch(`/api/portal/customer-data?customerId=${customerId}`);
    if (!res.ok) return;
    const { trips, invoices } = await res.json();
    setTrips(trips || []);
    setInvoices(invoices || []);
  }

  const filteredTrips = trips.filter(t => tripFilter === 'All' || t.status === tripFilter);
  const filteredInvoices = invoices.filter(i => invFilter === 'All' || i.status === invFilter);
  const totalOutstanding = invoices.reduce((s, i) => s + (i.outstanding || 0), 0);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">MLS Transports</p>
              <p className="text-xs text-gray-400">Customer Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{session?.name}</p>
              <p className="text-xs text-gray-400">@{session?.username}</p>
            </div>
            <button onClick={portalLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hello, {session?.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your trips and invoices overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Trips', value: String(trips.length), color: 'text-blue-600', bg: 'bg-blue-50', Icon: Truck },
            { label: 'Active Trips', value: String(trips.filter(t => !['Settled','Pending'].includes(t.status)).length), color: 'text-amber-600', bg: 'bg-amber-50', Icon: Package },
            { label: 'Total Invoiced', value: fmt(invoices.reduce((s,i)=>s+i.amount,0)), color: 'text-purple-600', bg: 'bg-purple-50', Icon: FileText },
            { label: 'Outstanding', value: fmt(totalOutstanding), color: totalOutstanding > 0 ? 'text-red-600' : 'text-emerald-600', bg: totalOutstanding > 0 ? 'bg-red-50' : 'bg-emerald-50', Icon: AlertCircle },
          ].map(({ label, value, color, bg, Icon }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {([['trips', `Trips (${trips.length})`], ['invoices', `Invoices (${invoices.length})`]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Trips */}
        {activeTab === 'trips' && (
          <div className="space-y-3">
            <select value={tripFilter} onChange={e => setTripFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="All">All Status</option>
              {['Pending','Started','Loading','Unloading','TripCompleted','POPReceived','POPSubmitted','GenerateInvoice','Settled'].map(s => <option key={s}>{s}</option>)}
            </select>
            {filteredTrips.length === 0
              ? <div className="bg-white rounded-xl border border-gray-200 py-14 text-center"><Truck className="w-10 h-10 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-400">No trips found</p></div>
              : filteredTrips.map(trip => (
                <div key={trip.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button onClick={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="text-left">
                      <p className="text-sm font-bold text-blue-600">{trip.trip_no}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">{trip.origin || '—'} → {trip.destination || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TRIP_COLORS[trip.status] || 'bg-gray-100 text-gray-600'}`}>{trip.status}</span>
                      {expandedTrip === trip.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>
                  {expandedTrip === trip.id && (
                    <div className="px-5 pb-4 border-t border-gray-100 bg-gray-50">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3">
                        <div><p className="text-xs text-gray-400">Trip Date</p><p className="text-sm font-medium text-gray-800 mt-0.5">{fmtDate(trip.trip_date)}</p></div>
                        <div><p className="text-xs text-gray-400">LR Number</p><p className="text-sm font-medium text-gray-800 mt-0.5">{trip.lr_no || '—'}</p></div>
                        <div><p className="text-xs text-gray-400">Freight Amount</p><p className="text-sm font-bold text-gray-900 mt-0.5">{fmt(trip.freight_amount || 0)}</p></div>
                        <div><p className="text-xs text-gray-400">Status</p><span className={`inline-flex mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${TRIP_COLORS[trip.status] || ''}`}>{trip.status}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Invoices */}
        {activeTab === 'invoices' && (
          <div className="space-y-3">
            <select value={invFilter} onChange={e => setInvFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="All">All Status</option>
              {['Unpaid','Partial','Paid'].map(s => <option key={s}>{s}</option>)}
            </select>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {filteredInvoices.length === 0
                ? <div className="py-14 text-center"><FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-400">No invoices found</p></div>
                : <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="bg-gray-50 border-b border-gray-100">
                        {['Invoice No','Date','Amount','Paid','Outstanding','Due Date','Status'].map(h => (
                          <th key={h} className={`text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 ${['Amount','Paid','Outstanding'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredInvoices.map(inv => (
                          <tr key={inv.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-semibold text-blue-600">{inv.invoice_no}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{fmtDate(inv.date)}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{fmt(inv.amount)}</td>
                            <td className="px-4 py-3 text-sm text-emerald-600 text-right">{fmt(inv.paid || 0)}</td>
                            <td className="px-4 py-3 text-right"><span className={inv.outstanding > 0 ? 'text-sm font-bold text-red-600' : 'text-sm text-gray-400'}>{fmt(inv.outstanding || 0)}</span></td>
                            <td className="px-4 py-3 text-sm text-gray-500">{fmtDate(inv.due_date)}</td>
                            <td className="px-4 py-3"><span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${INV_COLORS[inv.status] || 'bg-gray-100 text-gray-600'}`}>{inv.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

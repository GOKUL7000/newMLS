'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Topbar from '@/components/layout/Topbar';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Search, Download, Loader2 } from 'lucide-react';

const supabase = createClientComponentClient();

// ─── Types ────────────────────────────────────────────────────────────────────
interface Payment {
  id: string;
  payment_no: string;
  date: string;
  supplier_name: string;
  supplier_no: string;
  amount: number;
  mode: string;
  reference_no: string | null;
  notes: string | null;
  status: 'Cleared' | 'Pending';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const fmtInr = (n: number) =>
  '₹ ' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

const MODE_STYLE: Record<string, string> = {
  NEFT:   'bg-blue-100 text-blue-700',
  Cheque: 'bg-purple-100 text-purple-700',
  UPI:    'bg-teal-100 text-teal-700',
  FASTag: 'bg-green-100 text-green-700',
  Cash:   'bg-gray-100 text-gray-700',
  RTGS:   'bg-orange-100 text-orange-700',
};

// ─────────────────────────────────────────────────────────────────────────────
export default function SupplierPaymentsPage() {
  const [payments, setPayments]   = useState<Payment[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [modeFilter, setModeFilter] = useState('All');

  // Date filter — default: last 30 days
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

  // ── Fetch payments ─────────────────────────────────────────────────────────
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id, payment_no, date, amount, mode, reference_no, notes, created_at,
          suppliers!inner(name, supplier_no)
        `)
        .eq('party_type', 'Supplier')
        .gte('created_at', `${fromDate}T00:00:00`)
        .lte('created_at', `${toDate}T23:59:59`)
        .order('created_at', { ascending: false });

      if (error) { console.error('Payments fetch error:', error); setLoading(false); return; }

      setPayments((data || []).map((p: any) => ({
        id:            p.id,
        payment_no:    p.payment_no,
        date:          p.created_at,
        supplier_name: p.suppliers?.name       || '—',
        supplier_no:   p.suppliers?.supplier_no || '—',
        amount:        parseFloat(p.amount)     || 0,
        mode:          p.mode                  || 'Cash',
        reference_no:  p.reference_no          || null,
        notes:         p.notes                 || null,
        // payments table has no status column — treat all as Cleared
        status:        'Cleared' as const,
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = payments.filter(p =>
    (modeFilter === 'All' || p.mode === modeFilter) &&
    (
      p.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
      p.payment_no.toLowerCase().includes(search.toLowerCase())
    )
  );

  // ── KPI aggregates ─────────────────────────────────────────────────────────
  const totalPaid    = filtered.reduce((s, p) => s + p.amount, 0);
  const avgPayment   = filtered.length > 0 ? totalPaid / filtered.length : 0;
  const maxPayment   = filtered.length > 0 ? Math.max(...filtered.map(p => p.amount)) : 0;
  const uniqueModes  = [...new Set(filtered.map(p => p.mode))].length;

  // ── Trend chart — group by date ────────────────────────────────────────────
  const trendMap: Record<string, number> = {};
  filtered.forEach(p => {
    const d = new Date(p.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
    trendMap[d] = (trendMap[d] || 0) + p.amount;
  });
  const trendData = Object.entries(trendMap)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-14) // last 14 days max
    .map(([date, amount]) => ({ date, amount }));

  // ── By mode chart ──────────────────────────────────────────────────────────
  const modeMap: Record<string, number> = {};
  filtered.forEach(p => { modeMap[p.mode] = (modeMap[p.mode] || 0) + p.amount; });
  const byMode = Object.entries(modeMap).map(([mode, amount]) => ({ mode, amount }));

  // ── Top suppliers ──────────────────────────────────────────────────────────
  const supMap: Record<string, number> = {};
  filtered.forEach(p => { supMap[p.supplier_name] = (supMap[p.supplier_name] || 0) + p.amount; });
  const topSuppliers = Object.entries(supMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, amount]) => ({ name: name.split(' ')[0], full: name, amount }));
  const maxSupAmt = topSuppliers[0]?.amount || 1;

  // ── Unique modes for filter dropdown ──────────────────────────────────────
  const allModes = ['All', ...new Set(payments.map(p => p.mode))];

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = ['Payment No','Date','Supplier','Amount','Mode','Reference','Notes'];
    const rows = filtered.map(p => [
      p.payment_no, fmtDate(p.date), p.supplier_name,
      p.amount, p.mode, p.reference_no||'', p.notes||'',
    ].join(','));
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `supplier_payments_${fromDate}_to_${toDate}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Payment History" breadcrumbs={[{ label:'Suppliers' }, { label:'Payment History' }]}/>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-gray-800">Payment History</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">All supplier payments with trend analysis</p>
          </div>
          <button onClick={handleExport} disabled={loading || filtered.length===0}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-blue-700 disabled:opacity-40">
            <Download size={13}/> Export CSV
          </button>
        </div>

        {/* Date filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-end gap-3">
            <div>
              <label className="text-[11px] text-gray-500 block mb-1">From Date</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-200"/>
            </div>
            <div>
              <label className="text-[11px] text-gray-500 block mb-1">To Date</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-200"/>
            </div>
            <button onClick={fetchPayments} disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-[12px] font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5">
              {loading ? <><Loader2 size={13} className="animate-spin"/> Loading…</> : 'Apply Filter'}
            </button>
            <p className="text-[11px] text-gray-400 pb-1">
              {payments.length} payments found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 gap-2 text-gray-400">
            <Loader2 size={18} className="animate-spin"/> Loading payments…
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label:'Total Paid',        value:fmtInr(totalPaid),               sub:`${filtered.length} payments`,      color:'text-green-600' },
                { label:'Average Payment',   value:fmtInr(avgPayment),              sub:'Per transaction',                   color:'text-blue-600'  },
                { label:'Largest Payment',   value:fmtInr(maxPayment),              sub:'Single transaction',                color:'text-orange-500'},
                { label:'Payment Modes',     value:String(uniqueModes),             sub:'Used in this period',               color:'text-gray-700'  },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-[11px] text-gray-400 mb-1">{c.label}</p>
                  <p className={`text-[18px] font-bold ${c.color}`}>{c.value}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-3 gap-4">
              {/* Trend */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-[13px] font-semibold text-gray-800 mb-3">Payment Trend</h3>
                {trendData.length === 0 ? (
                  <p className="text-center text-gray-300 text-[12px] py-10">No data</p>
                ) : (
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={trendData}>
                      <XAxis dataKey="date" tick={{ fontSize:9 }} tickLine={false}/>
                      <YAxis tick={{ fontSize:9 }} tickLine={false}
                        tickFormatter={v => `₹${(v/100000).toFixed(0)}L`}/>
                      <Tooltip formatter={(v: any) => fmtInr(Number(v))}/>
                      <Line dataKey="amount" stroke="#f59e0b" strokeWidth={2} dot={{ r:2 }}/>
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* By mode */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-[13px] font-semibold text-gray-800 mb-3">Payment by Mode</h3>
                {byMode.length === 0 ? (
                  <p className="text-center text-gray-300 text-[12px] py-10">No data</p>
                ) : (
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={byMode}>
                      <XAxis dataKey="mode" tick={{ fontSize:9 }} tickLine={false}/>
                      <YAxis tick={{ fontSize:9 }} tickLine={false}
                        tickFormatter={v => `₹${(v/100000).toFixed(0)}L`}/>
                      <Tooltip formatter={(v: any) => fmtInr(Number(v))}/>
                      <Bar dataKey="amount" fill="#f59e0b" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Top suppliers */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-[13px] font-semibold text-gray-800 mb-3">Top Paid Suppliers</h3>
                {topSuppliers.length === 0 ? (
                  <p className="text-center text-gray-300 text-[12px] py-10">No data</p>
                ) : (
                  <div className="space-y-3">
                    {topSuppliers.map((s, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-gray-600 truncate max-w-[140px]" title={s.full}>{s.full}</span>
                          <span className="font-medium text-gray-700">{fmtInr(s.amount)}</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-1.5">
                          <div className="bg-orange-400 h-1.5 rounded-full transition-all"
                            style={{ width:`${(s.amount/maxSupAmt)*100}%` }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-semibold text-gray-800">Payment Transactions</h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search supplier, payment no…"
                      className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] w-52 focus:outline-none focus:border-blue-400"/>
                  </div>
                  <select value={modeFilter} onChange={e => setModeFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] text-gray-600 focus:outline-none">
                    {allModes.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {filtered.length === 0 ? (
                <p className="text-center text-gray-300 text-[12px] py-12">No payments found</p>
              ) : (
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-2.5 px-2 font-medium">Payment No.</th>
                      <th className="text-left py-2.5 px-2 font-medium">Date</th>
                      <th className="text-left py-2.5 px-2 font-medium">Supplier</th>
                      <th className="text-right py-2.5 px-2 font-medium">Amount (₹)</th>
                      <th className="text-left py-2.5 px-2 font-medium">Mode</th>
                      <th className="text-left py-2.5 px-2 font-medium">Reference No.</th>
                      <th className="text-left py-2.5 px-2 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 px-2 text-blue-600 font-medium">{p.payment_no}</td>
                        <td className="py-2.5 px-2 text-gray-500 whitespace-nowrap">{fmtDate(p.date)}</td>
                        <td className="py-2.5 px-2">
                          <p className="font-medium text-gray-800">{p.supplier_name}</p>
                          <p className="text-[10px] text-gray-400">{p.supplier_no}</p>
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-gray-800">
                          {p.amount.toLocaleString('en-IN', { maximumFractionDigits:2 })}
                        </td>
                        <td className="py-2.5 px-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${MODE_STYLE[p.mode] || 'bg-gray-100 text-gray-700'}`}>
                            {p.mode}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-gray-500">{p.reference_no || '—'}</td>
                        <td className="py-2.5 px-2 text-gray-400 max-w-[150px] truncate">{p.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold">
                      <td colSpan={3} className="py-2.5 px-2 text-[12px] text-gray-700">
                        Total ({filtered.length} payments)
                      </td>
                      <td className="py-2.5 px-2 text-right text-[12px] text-gray-800">
                        {filtered.reduce((s,p) => s+p.amount, 0).toLocaleString('en-IN', { maximumFractionDigits:2 })}
                      </td>
                      <td colSpan={3}/>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
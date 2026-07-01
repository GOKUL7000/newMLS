'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Topbar from '@/components/layout/Topbar';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Download, FileText, Loader2, Search } from 'lucide-react';

const supabase = createClientComponentClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtInr = (n: number) =>
  '₹ ' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

const fmtL = (n: number) => `₹${(n / 100000).toFixed(2)}L`;

// Current financial year start (Apr 1)
function getFYStart(): string {
  const now   = new Date();
  const year  = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-04-01`;
}
function getFYEnd(): string {
  const now   = new Date();
  const year  = now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear();
  return `${year}-03-31`;
}

const MONTH_NAMES = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
const CATEGORY_COLORS = ['#3b82f6','#f59e0b','#10b981','#8b5cf6','#ef4444','#9ca3af','#f97316','#06b6d4'];

// ─── Types ────────────────────────────────────────────────────────────────────
interface SupplierSummary {
  id: string;
  supplier_no: string;
  name: string;
  category: string;
  trips: number;
  purchases: number;   // sum supplier_amount
  payments: number;    // sum payments
  outstanding: number;
  avgTxn: number;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SupplierReportsPage() {
  const [fromDate, setFromDate] = useState(getFYStart);
  const [toDate,   setToDate]   = useState(getFYEnd);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  // Data states
  const [kpis,         setKpis]         = useState({ totalSuppliers:0, activeSuppliers:0, totalPurchases:0, totalPayments:0, totalPayables:0, totalTrips:0 });
  const [bySupplier,   setBySupplier]   = useState<{ name: string; purchases: number }[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<{ month: string; purchases: number; payments: number }[]>([]);
  const [byCategory,   setByCategory]  = useState<{ name: string; value: number; pct: string; color: string }[]>([]);
  const [suppliers,    setSuppliers]   = useState<SupplierSummary[]>([]);
  const [quickStats,   setQuickStats]  = useState({ highestPurchase:0, avgPurchase:0, topSupplier:'' });

  // ── Fetch all data ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Suppliers
      const { data: supData } = await supabase
        .from('suppliers')
        .select('id, supplier_no, name, category, status')
        .eq('deleted', false);
      const allSuppliers = supData || [];

      // 2. Trips in date range with supplier
      const { data: tripData } = await supabase
        .from('trips')
        .select('id, supplier_id, trip_date, supplier_amount, charges_value, freight_amount')
        .not('supplier_id', 'is', null)
        .eq('deleted', false)
        .gte('trip_date', fromDate)
        .lte('trip_date', toDate);
      const trips = tripData || [];

      // 3. All trips for FY trend (full FY regardless of filter for trend)
      const { data: fyTrips } = await supabase
        .from('trips')
        .select('supplier_id, trip_date, supplier_amount, charges_value')
        .not('supplier_id', 'is', null)
        .eq('deleted', false)
        .gte('trip_date', getFYStart())
        .lte('trip_date', getFYEnd());

      // 4. Payments in date range
      const { data: payData } = await supabase
        .from('payments')
        .select('party_id, amount, created_at')
        .eq('party_type', 'Supplier')
        .gte('created_at', `${fromDate}T00:00:00`)
        .lte('created_at', `${toDate}T23:59:59`);
      const payments = payData || [];

      // 5. All FY payments for trend
      const { data: fyPay } = await supabase
        .from('payments')
        .select('party_id, amount, created_at')
        .eq('party_type', 'Supplier')
        .gte('created_at', `${getFYStart()}T00:00:00`)
        .lte('created_at', `${getFYEnd()}T23:59:59`);

      // ── KPIs ────────────────────────────────────────────────────────────
      const totalPurchases = trips.reduce((s, t) =>
        s + Math.max((t.supplier_amount||0) - (t.charges_value||0), 0), 0);
      const totalPayments  = payments.reduce((s, p) => s + (p.amount||0), 0);

      setKpis({
        totalSuppliers:  allSuppliers.length,
        activeSuppliers: allSuppliers.filter(s => s.status === 'Active').length,
        totalPurchases,
        totalPayments,
        totalPayables:  Math.max(totalPurchases - totalPayments, 0),
        totalTrips:     trips.length,
      });

      // ── Purchases by supplier ────────────────────────────────────────────
      const supMap: Record<string, { name: string; purchases: number }> = {};
      trips.forEach(t => {
        const sup  = allSuppliers.find(s => s.id === t.supplier_id);
        if (!sup) return;
        const net  = Math.max((t.supplier_amount||0) - (t.charges_value||0), 0);
        if (!supMap[t.supplier_id]) supMap[t.supplier_id] = { name: sup.name.split(' ')[0], purchases: 0 };
        supMap[t.supplier_id].purchases += net;
      });
      setBySupplier(
        Object.values(supMap).sort((a,b) => b.purchases - a.purchases).slice(0, 8)
      );

      // ── Monthly trend (FY) ───────────────────────────────────────────────
      // FY months: Apr=3, May=4, ... Mar=2
      const fyMonths: Record<string, { purchases: number; payments: number }> = {};
      MONTH_NAMES.forEach(m => { fyMonths[m] = { purchases: 0, payments: 0 }; });

      (fyTrips || []).forEach(t => {
        const d   = new Date(t.trip_date);
        const mon = d.toLocaleString('en-US', { month: 'short' });
        if (fyMonths[mon]) {
          fyMonths[mon].purchases += Math.max((t.supplier_amount||0) - (t.charges_value||0), 0);
        }
      });
      (fyPay || []).forEach(p => {
        const d   = new Date(p.created_at);
        const mon = d.toLocaleString('en-US', { month: 'short' });
        if (fyMonths[mon]) {
          fyMonths[mon].payments += p.amount || 0;
        }
      });
      setMonthlyTrend(MONTH_NAMES.map(m => ({ month: m, ...fyMonths[m] })));

      // ── By category ──────────────────────────────────────────────────────
      const catMap: Record<string, number> = {};
      trips.forEach(t => {
        const sup = allSuppliers.find(s => s.id === t.supplier_id);
        if (!sup) return;
        const net = Math.max((t.supplier_amount||0) - (t.charges_value||0), 0);
        catMap[sup.category] = (catMap[sup.category] || 0) + net;
      });
      const catTotal = Object.values(catMap).reduce((s, v) => s + v, 0);
      setByCategory(
        Object.entries(catMap)
          .sort((a, b) => b[1] - a[1])
          .map(([name, value], i) => ({
            name,
            value,
            pct: catTotal > 0 ? `${(value/catTotal*100).toFixed(1)}%` : '0%',
            color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
          }))
      );

      // ── Supplier performance summary ─────────────────────────────────────
      const perfMap: Record<string, SupplierSummary> = {};
      allSuppliers.forEach(s => {
        perfMap[s.id] = {
          id: s.id, supplier_no: s.supplier_no,
          name: s.name, category: s.category,
          trips: 0, purchases: 0, payments: 0, outstanding: 0, avgTxn: 0,
        };
      });
      trips.forEach(t => {
        if (!perfMap[t.supplier_id]) return;
        const net = Math.max((t.supplier_amount||0) - (t.charges_value||0), 0);
        perfMap[t.supplier_id].trips++;
        perfMap[t.supplier_id].purchases += net;
      });
      payments.forEach(p => {
        if (!perfMap[p.party_id]) return;
        perfMap[p.party_id].payments += p.amount || 0;
      });
      const perfList = Object.values(perfMap)
        .map(s => ({
          ...s,
          outstanding: Math.max(s.purchases - s.payments, 0),
          avgTxn: s.trips > 0 ? s.purchases / s.trips : 0,
        }))
        .filter(s => s.purchases > 0 || s.payments > 0)
        .sort((a, b) => b.purchases - a.purchases);
      setSuppliers(perfList);

      // ── Quick stats ──────────────────────────────────────────────────────
      const allNetAmts = trips.map(t => Math.max((t.supplier_amount||0) - (t.charges_value||0), 0));
      setQuickStats({
        highestPurchase: allNetAmts.length > 0 ? Math.max(...allNetAmts) : 0,
        avgPurchase:     allNetAmts.length > 0 ? allNetAmts.reduce((s,v)=>s+v,0)/allNetAmts.length : 0,
        topSupplier:     perfList[0]?.name || '—',
      });

    } catch (e) {
      console.error('SupplierReports error:', e);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Filter supplier table ─────────────────────────────────────────────────
  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = ['Rank','Supplier','Category','Trips','Purchases','Payments','Outstanding','Avg Txn'];
    const rows    = filteredSuppliers.map((s, i) => [
      i+1, s.name, s.category, s.trips,
      s.purchases.toFixed(2), s.payments.toFixed(2),
      s.outstanding.toFixed(2), s.avgTxn.toFixed(2),
    ].join(','));
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `supplier_report_${fromDate}_to_${toDate}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Supplier Reports" breadcrumbs={[{ label:'Suppliers' }, { label:'Reports' }]}/>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-gray-800">Supplier Reports</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">Comprehensive supplier analytics and performance</p>
          </div>
          <button onClick={handleExport} disabled={loading || suppliers.length===0}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-blue-700 disabled:opacity-40">
            <Download size={13}/> Export Report
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
            {/* Quick presets */}
            <div className="flex gap-1.5">
              {[
                { label:'This Month', from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] },
                { label:'Last Month', from: new Date(new Date().getFullYear(), new Date().getMonth()-1, 1).toISOString().split('T')[0], to: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0] },
                { label:'This FY',    from: getFYStart(), to: getFYEnd() },
              ].map(p => (
                <button key={p.label}
                  onClick={() => { setFromDate(p.from); setToDate(p.to); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-[11px] text-gray-600 hover:bg-gray-50 hover:border-blue-300">
                  {p.label}
                </button>
              ))}
            </div>
            <button onClick={fetchAll} disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-[12px] font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5">
              {loading ? <><Loader2 size={13} className="animate-spin"/> Loading…</> : 'Apply'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 gap-2 text-gray-400">
            <Loader2 size={18} className="animate-spin"/> Loading report…
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-5 gap-3">
              {[
                { label:'Total Suppliers',  value:String(kpis.totalSuppliers),             sub:`Active: ${kpis.activeSuppliers}`,                                              color:'text-blue-600'   },
                { label:'Total Purchases',  value:fmtL(kpis.totalPurchases),               sub:`${kpis.totalTrips} trips`,                                                    color:'text-gray-800'   },
                { label:'Total Payments',   value:fmtL(kpis.totalPayments),               sub:'Paid to suppliers',                                                            color:'text-green-600'  },
                { label:'Total Payables',   value:fmtL(kpis.totalPayables),               sub:`${kpis.totalPurchases > 0 ? (kpis.totalPayables/kpis.totalPurchases*100).toFixed(1) : 0}% of Purchases`, color:'text-orange-500' },
                { label:'Avg Txn Value',    value:fmtInr(kpis.totalTrips > 0 ? kpis.totalPurchases/kpis.totalTrips : 0), sub:'Per trip',                                     color:'text-purple-600' },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-[11px] text-gray-400 mb-1">{c.label}</p>
                  <p className={`text-[17px] font-bold ${c.color}`}>{c.value}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-3 gap-4">
              {/* Purchases by supplier */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-[13px] font-semibold text-gray-800 mb-3">Purchases by Supplier</h3>
                {bySupplier.length === 0 ? (
                  <p className="text-center text-gray-300 text-[12px] py-12">No data</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={bySupplier} layout="vertical">
                      <XAxis type="number" tick={{ fontSize:9 }} tickLine={false}
                        tickFormatter={v => `₹${(v/100000).toFixed(0)}L`}/>
                      <YAxis type="category" dataKey="name" tick={{ fontSize:9 }} tickLine={false} width={70}/>
                      <Tooltip formatter={(v: any) => fmtInr(Number(v))}/>
                      <Bar dataKey="purchases" fill="#f59e0b" radius={[0,4,4,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Monthly trend — FY */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-[13px] font-semibold text-gray-800 mb-3">
                  Purchases vs Payments
                  <span className="text-[11px] font-normal text-gray-400 ml-1">(FY Apr–Mar)</span>
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyTrend}>
                    <XAxis dataKey="month" tick={{ fontSize:9 }} tickLine={false}/>
                    <YAxis tick={{ fontSize:9 }} tickLine={false}
                      tickFormatter={v => `₹${(v/100000).toFixed(0)}L`}/>
                    <Tooltip formatter={(v: any) => fmtInr(Number(v))}/>
                    <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize:10 }}/>
                    <Line dataKey="purchases" name="Purchases" stroke="#f59e0b" strokeWidth={2} dot={{ r:2 }}/>
                    <Line dataKey="payments"  name="Payments"  stroke="#10b981" strokeWidth={2} dot={{ r:2 }}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Right column: Category donut + Quick stats */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-[13px] font-semibold text-gray-800 mb-3">By Category</h3>
                  {byCategory.length === 0 ? (
                    <p className="text-center text-gray-300 text-[12px] py-6">No data</p>
                  ) : (
                    <div className="flex items-center gap-3">
                      <ResponsiveContainer width={90} height={90}>
                        <PieChart>
                          <Pie data={byCategory} cx="50%" cy="50%" innerRadius={26} outerRadius={42} dataKey="value">
                            {byCategory.map((e, i) => <Cell key={i} fill={e.color}/>)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-1">
                        {byCategory.map((c, i) => (
                          <div key={i} className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor:c.color }}/>
                              <span className="text-gray-600 truncate max-w-[80px]">{c.name}</span>
                            </div>
                            <span className="font-medium text-gray-700">{c.pct}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-[13px] font-semibold text-gray-800 mb-3">Quick Stats</h3>
                  <div className="space-y-2 text-[11px]">
                    {[
                      { label:'Highest Trip Value', value: fmtInr(quickStats.highestPurchase) },
                      { label:'Avg Trip Value',     value: fmtInr(quickStats.avgPurchase)     },
                      { label:'Top Supplier',       value: quickStats.topSupplier             },
                      { label:'Total Trips',        value: String(kpis.totalTrips)            },
                    ].map((s, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-gray-400">{s.label}</span>
                        <span className="font-semibold text-gray-700">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Supplier Performance Table */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-semibold text-gray-800">Supplier Performance Summary</h3>
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search supplier…"
                    className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] w-44 focus:outline-none focus:border-blue-400"/>
                </div>
              </div>

              {filteredSuppliers.length === 0 ? (
                <p className="text-center text-gray-300 text-[12px] py-12">No data for this period</p>
              ) : (
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                      <th className="text-center py-2.5 px-2 font-medium w-8">Rank</th>
                      <th className="text-left   py-2.5 px-2 font-medium">Supplier</th>
                      <th className="text-left   py-2.5 px-2 font-medium">Category</th>
                      <th className="text-center py-2.5 px-2 font-medium">Trips</th>
                      <th className="text-right  py-2.5 px-2 font-medium">Purchases (₹)</th>
                      <th className="text-right  py-2.5 px-2 font-medium">Payments (₹)</th>
                      <th className="text-right  py-2.5 px-2 font-medium">Outstanding (₹)</th>
                      <th className="text-right  py-2.5 px-2 font-medium">Avg Trip (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map((s, i) => (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 px-2 text-center">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mx-auto
                            ${i===0 ? 'bg-yellow-100 text-yellow-700'
                            : i===1 ? 'bg-gray-100 text-gray-600'
                            : i===2 ? 'bg-orange-100 text-orange-600'
                            : 'bg-gray-50 text-gray-400'}`}>
                            {i+1}
                          </span>
                        </td>
                        <td className="py-2.5 px-2">
                          <p className="font-medium text-gray-800">{s.name}</p>
                          <p className="text-[10px] text-gray-400">{s.supplier_no}</p>
                        </td>
                        <td className="py-2.5 px-2 text-gray-500">{s.category}</td>
                        <td className="py-2.5 px-2 text-center text-gray-700">{s.trips}</td>
                        <td className="py-2.5 px-2 text-right font-semibold text-gray-800">
                          {s.purchases.toLocaleString('en-IN', { maximumFractionDigits:2 })}
                        </td>
                        <td className="py-2.5 px-2 text-right text-green-600">
                          {s.payments > 0 ? s.payments.toLocaleString('en-IN', { maximumFractionDigits:2 }) : '—'}
                        </td>
                        <td className="py-2.5 px-2 text-right text-orange-500">
                          {s.outstanding > 0 ? s.outstanding.toLocaleString('en-IN', { maximumFractionDigits:2 }) : '—'}
                        </td>
                        <td className="py-2.5 px-2 text-right text-gray-600">
                          {s.avgTxn > 0 ? s.avgTxn.toLocaleString('en-IN', { maximumFractionDigits:0 }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold">
                      <td colSpan={3} className="py-2.5 px-2 text-[12px] text-gray-700">
                        Total ({filteredSuppliers.length})
                      </td>
                      <td className="py-2.5 px-2 text-center text-[12px] text-gray-800">
                        {filteredSuppliers.reduce((s,x) => s+x.trips, 0)}
                      </td>
                      <td className="py-2.5 px-2 text-right text-[12px] text-gray-800">
                        {filteredSuppliers.reduce((s,x) => s+x.purchases, 0).toLocaleString('en-IN', { maximumFractionDigits:2 })}
                      </td>
                      <td className="py-2.5 px-2 text-right text-[12px] text-green-600">
                        {filteredSuppliers.reduce((s,x) => s+x.payments, 0).toLocaleString('en-IN', { maximumFractionDigits:2 })}
                      </td>
                      <td className="py-2.5 px-2 text-right text-[12px] text-orange-500">
                        {filteredSuppliers.reduce((s,x) => s+x.outstanding, 0).toLocaleString('en-IN', { maximumFractionDigits:2 })}
                      </td>
                      <td/>
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
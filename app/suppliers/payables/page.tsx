'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Topbar from '@/components/layout/Topbar';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Download, Search, Loader2 } from 'lucide-react';

const supabase = createClientComponentClient();

// ─── Types ────────────────────────────────────────────────────────────────────
interface SupplierPayable {
  id: string;
  supplier_no: string;
  name: string;
  category: string;
  city: string | null;
  credit_limit: number | null;
  outstanding: number;   // net payable = total owed - total paid
  d015: number;          // 0-15 days
  d1630: number;         // 16-30 days
  d3145: number;         // 31-45 days
  above45: number;       // above 45 days
  overdueDays: number;   // days since oldest unpaid trip
  status: 'Current' | 'Moderate' | 'Overdue' | 'Critical';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtInr = (n: number) =>
  n > 0 ? '₹ ' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '—';

const daysDiff = (dateStr: string): number => {
  const d    = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

const getStatus = (overdueDays: number): 'Current' | 'Moderate' | 'Overdue' | 'Critical' => {
  if (overdueDays <= 15) return 'Current';
  if (overdueDays <= 30) return 'Moderate';
  if (overdueDays <= 45) return 'Overdue';
  return 'Critical';
};

const STATUS_STYLE: Record<string, string> = {
  Current:  'bg-green-100 text-green-700',
  Moderate: 'bg-blue-100 text-blue-700',
  Overdue:  'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
};

const AGING_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

// ─────────────────────────────────────────────────────────────────────────────
export default function SupplierPayablesPage() {
  const [payables, setPayables]   = useState<SupplierPayable[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  // ── Fetch and compute payables ─────────────────────────────────────────────
  const fetchPayables = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch all active suppliers
      const { data: suppliers } = await supabase
        .from('suppliers')
        .select('id, supplier_no, name, category, city, credit_limit')
        .eq('deleted', false)
        .eq('status', 'Active');

      if (!suppliers || suppliers.length === 0) { setPayables([]); setLoading(false); return; }

      // 2. Fetch all unpaid trips linked to suppliers
      //    net owed per trip = supplier_amount - charges_value
      const { data: trips } = await supabase
        .from('trips')
        .select('id, supplier_id, trip_date, supplier_amount, charges_value, status')
        .not('supplier_id', 'is', null)
        .eq('deleted', false);

      // 3. Fetch all payments made to suppliers
      const { data: payments } = await supabase
        .from('payments')
        .select('party_id, amount')
        .eq('party_type', 'Supplier');

      const tripsList    = trips    || [];
      const paymentsList = payments || [];

      // Build payables per supplier
      const result: SupplierPayable[] = [];

      for (const sup of suppliers) {
        // Trips for this supplier
        const supTrips = tripsList.filter(t => t.supplier_id === sup.id);

        // Total owed = sum of (supplier_amount - charges_value) per trip
        const totalOwed = supTrips.reduce((s, t) => {
          const owed = Math.max((t.supplier_amount || 0) - (t.charges_value || 0), 0);
          return s + owed;
        }, 0);

        // Total paid
        const totalPaid = paymentsList
          .filter(p => p.party_id === sup.id)
          .reduce((s, p) => s + (p.amount || 0), 0);

        const outstanding = Math.max(totalOwed - totalPaid, 0);

        // Skip suppliers with no outstanding
        if (outstanding === 0 && supTrips.length === 0) continue;

        // Aging buckets based on trip_date
        let d015 = 0, d1630 = 0, d3145 = 0, above45 = 0;
        let maxDays = 0;

        supTrips.forEach(t => {
          const days = daysDiff(t.trip_date);
          const owed = Math.max((t.supplier_amount || 0) - (t.charges_value || 0), 0);
          if (days <= 15)        d015    += owed;
          else if (days <= 30)   d1630   += owed;
          else if (days <= 45)   d3145   += owed;
          else                   above45 += owed;
          if (days > maxDays) maxDays = days;
        });

        result.push({
          id:           sup.id,
          supplier_no:  sup.supplier_no,
          name:         sup.name,
          category:     sup.category,
          city:         sup.city,
          credit_limit: sup.credit_limit,
          outstanding:  parseFloat(outstanding.toFixed(2)),
          d015:         parseFloat(d015.toFixed(2)),
          d1630:        parseFloat(d1630.toFixed(2)),
          d3145:        parseFloat(d3145.toFixed(2)),
          above45:      parseFloat(above45.toFixed(2)),
          overdueDays:  maxDays,
          status:       getStatus(maxDays),
        });
      }

      // Sort by outstanding descending
      result.sort((a, b) => b.outstanding - a.outstanding);
      setPayables(result);

    } catch (e) {
      console.error('fetchPayables error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayables(); }, [fetchPayables]);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = payables.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  // ── Aggregates ────────────────────────────────────────────────────────────
  const totalPayable = filtered.reduce((s, p) => s + p.outstanding, 0);
  const totalD015    = filtered.reduce((s, p) => s + p.d015,    0);
  const totalD1630   = filtered.reduce((s, p) => s + p.d1630,   0);
  const totalD3145   = filtered.reduce((s, p) => s + p.d3145,   0);
  const totalAbove45 = filtered.reduce((s, p) => s + p.above45, 0);

  const currentAmt  = totalD015 + totalD1630;
  const overdueAmt  = totalD3145;
  const criticalAmt = totalAbove45;

  // ── Aging chart data ──────────────────────────────────────────────────────
  const aging = [
    { range: '0-15 Days',     amount: totalD015,    pct: totalPayable > 0 ? (totalD015/totalPayable*100).toFixed(1)    : '0', color: AGING_COLORS[0] },
    { range: '16-30 Days',    amount: totalD1630,   pct: totalPayable > 0 ? (totalD1630/totalPayable*100).toFixed(1)   : '0', color: AGING_COLORS[1] },
    { range: '31-45 Days',    amount: totalD3145,   pct: totalPayable > 0 ? (totalD3145/totalPayable*100).toFixed(1)   : '0', color: AGING_COLORS[2] },
    { range: 'Above 45 Days', amount: totalAbove45, pct: totalPayable > 0 ? (totalAbove45/totalPayable*100).toFixed(1) : '0', color: AGING_COLORS[3] },
  ].filter(a => a.amount > 0);

  const barData = filtered
    .filter(s => s.outstanding > 0)
    .slice(0, 8)
    .map(s => ({ name: s.name.split(' ')[0], payable: s.outstanding }));

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = ['Supplier','Category','City','Total Payable','0-15 Days','16-30 Days','31-45 Days','Above 45 Days','Overdue Days','Status'];
    const rows = filtered.map(s => [
      s.name, s.category, s.city||'',
      s.outstanding, s.d015, s.d1630, s.d3145, s.above45,
      s.overdueDays, s.status,
    ].join(','));
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `supplier_payables_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Payables" breadcrumbs={[{ label:'Suppliers' }, { label:'Payables / Outstanding' }]}/>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-gray-800">Payables / Outstanding</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">Supplier-wise outstanding with aging analysis</p>
          </div>
          <button onClick={handleExport} disabled={loading || filtered.length === 0}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-blue-700 disabled:opacity-40">
            <Download size={13}/> Export CSV
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 gap-2 text-gray-400">
            <Loader2 size={18} className="animate-spin"/> Loading payables…
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label:'Total Payables',        value:`₹ ${(totalPayable/100000).toFixed(2)}L`,  sub:`${filtered.length} Suppliers`,                          color:'text-gray-800',   icon:'💸' },
                { label:'Current (0-30 Days)',   value:`₹ ${(currentAmt/100000).toFixed(2)}L`,   sub:`${totalPayable > 0 ? (currentAmt/totalPayable*100).toFixed(1) : 0}% of Total`,  color:'text-green-600',  icon:'✅' },
                { label:'Overdue (31-45 Days)',  value:`₹ ${(overdueAmt/100000).toFixed(2)}L`,   sub:`${totalPayable > 0 ? (overdueAmt/totalPayable*100).toFixed(1) : 0}% of Total`,  color:'text-orange-500', icon:'⏰' },
                { label:'Critical (45+ Days)',   value:`₹ ${(criticalAmt/100000).toFixed(2)}L`,  sub:`${totalPayable > 0 ? (criticalAmt/totalPayable*100).toFixed(1) : 0}% of Total`, color:'text-red-500',    icon:'⚠️' },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[11px] text-gray-400">{c.label}</p>
                    <span className="text-[16px]">{c.icon}</span>
                  </div>
                  <p className={`text-[18px] font-bold ${c.color}`}>{c.value}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-4">
              {/* Aging donut */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-[13px] font-semibold text-gray-800 mb-3">Payables by Aging Bucket</h3>
                {aging.length === 0 ? (
                  <p className="text-center text-gray-300 text-[12px] py-12">No data</p>
                ) : (
                  <div className="flex items-center gap-6">
                    <div className="relative flex-shrink-0">
                      <ResponsiveContainer width={150} height={150}>
                        <PieChart>
                          <Pie data={aging} cx="50%" cy="50%" innerRadius={48} outerRadius={70} dataKey="amount">
                            {aging.map((e, i) => <Cell key={i} fill={e.color}/>)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-[12px] font-bold text-gray-800">₹ {(totalPayable/100000).toFixed(1)}L</span>
                        <span className="text-[10px] text-gray-400">Total</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2.5">
                      {aging.map((a, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }}/>
                              <span className="text-gray-600">{a.range}</span>
                            </div>
                            <span className="font-semibold text-gray-700">
                              ₹ {(a.amount/100000).toFixed(2)}L ({a.pct}%)
                            </span>
                          </div>
                          <div className="bg-gray-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full transition-all" style={{ width:`${a.pct}%`, backgroundColor:a.color }}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bar chart */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-[13px] font-semibold text-gray-800 mb-3">Payables by Supplier</h3>
                {barData.length === 0 ? (
                  <p className="text-center text-gray-300 text-[12px] py-12">No data</p>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={barData} layout="vertical">
                      <XAxis type="number" tick={{ fontSize:10 }} tickLine={false}
                        tickFormatter={v => `₹${(v/100000).toFixed(0)}L`}/>
                      <YAxis type="category" dataKey="name" tick={{ fontSize:10 }} tickLine={false} width={75}/>
                      <Tooltip formatter={(v: any) => `₹ ${Number(v).toLocaleString('en-IN')}`}/>
                      <Bar dataKey="payable" fill="#f59e0b" radius={[0,4,4,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Payables Table */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-semibold text-gray-800">Supplier-wise Payables Details</h3>
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search supplier…"
                    className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] w-48 focus:outline-none focus:border-blue-400"/>
                </div>
              </div>

              {filtered.length === 0 ? (
                <p className="text-center text-gray-300 text-[12px] py-12">No payables found</p>
              ) : (
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-2.5 px-2 font-medium">Supplier</th>
                      <th className="text-left py-2.5 px-2 font-medium">Type</th>
                      <th className="text-right py-2.5 px-2 font-medium">Total Payable</th>
                      <th className="text-right py-2.5 px-2 font-medium">0-15 Days</th>
                      <th className="text-right py-2.5 px-2 font-medium">16-30 Days</th>
                      <th className="text-right py-2.5 px-2 font-medium">31-45 Days</th>
                      <th className="text-right py-2.5 px-2 font-medium">Above 45</th>
                      <th className="text-right py-2.5 px-2 font-medium">Oldest Trip</th>
                      <th className="text-left py-2.5 px-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <tr key={s.id}
                        className={`border-b border-gray-50 hover:bg-gray-50 transition-colors
                          ${s.status==='Critical' ? 'bg-red-50/20'
                          : s.status==='Overdue'  ? 'bg-orange-50/20' : ''}`}>
                        <td className="py-2.5 px-2">
                          <p className="font-medium text-gray-800">{s.name}</p>
                          <p className="text-[10px] text-gray-400">{s.supplier_no} · {s.city||'—'}</p>
                        </td>
                        <td className="py-2.5 px-2 text-gray-500">{s.category}</td>
                        <td className="py-2.5 px-2 text-right font-bold text-gray-800">
                          {fmtInr(s.outstanding)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-green-600">{s.d015 > 0 ? fmtInr(s.d015) : '—'}</td>
                        <td className="py-2.5 px-2 text-right text-blue-600">{s.d1630 > 0 ? fmtInr(s.d1630) : '—'}</td>
                        <td className="py-2.5 px-2 text-right text-orange-500">{s.d3145 > 0 ? fmtInr(s.d3145) : '—'}</td>
                        <td className="py-2.5 px-2 text-right text-red-500">{s.above45 > 0 ? fmtInr(s.above45) : '—'}</td>
                        <td className="py-2.5 px-2 text-right text-gray-500">{s.overdueDays} days ago</td>
                        <td className="py-2.5 px-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_STYLE[s.status]}`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold">
                      <td colSpan={2} className="py-2.5 px-2 text-[12px] text-gray-700">
                        Total ({filtered.length} suppliers)
                      </td>
                      <td className="py-2.5 px-2 text-right text-[12px] text-gray-800">{fmtInr(totalPayable)}</td>
                      <td className="py-2.5 px-2 text-right text-[12px] text-green-600">{fmtInr(totalD015)}</td>
                      <td className="py-2.5 px-2 text-right text-[12px] text-blue-600">{fmtInr(totalD1630)}</td>
                      <td className="py-2.5 px-2 text-right text-[12px] text-orange-500">{fmtInr(totalD3145)}</td>
                      <td className="py-2.5 px-2 text-right text-[12px] text-red-500">{fmtInr(totalAbove45)}</td>
                      <td colSpan={2}/>
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
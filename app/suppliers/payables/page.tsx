'use client';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Search, Loader2 } from 'lucide-react';

const supabase = createClientComponentClient();

const AGING_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const statusStyle: Record<string, string> = {
  Current:  'bg-green-100 text-green-700',
  Moderate: 'bg-blue-100 text-blue-700',
  Overdue:  'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
};

function getStatus(overdueDays: number, creditDays: number): string {
  const exceeded = overdueDays - creditDays;
  if (exceeded <= 0)  return 'Current';
  if (exceeded <= 15) return 'Moderate';
  if (exceeded <= 30) return 'Overdue';
  return 'Critical';
}

function fmtL(v: number) {
  return v >= 100000
    ? `₹ ${(v / 100000).toFixed(2)}L`
    : `₹ ${v.toLocaleString('en-IN')}`;
}

interface SupplierRow {
  id: string;
  supplier_no: string;
  name: string;
  category: string;
  city: string | null;
  credit_limit: number;
  credit_days: number; // derived from credit_limit logic — we'll use outstanding days
  outstanding: number;
  d015: number;
  d1630: number;
  d3145: number;
  above45: number;
  overdueDays: number;
  status: string;
  tripCount: number;
}

export default function SupplierPayablesPage() {
  const [rows, setRows]       = useState<SupplierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const today = new Date();

      // 1. All active suppliers
      const { data: suppliers } = await supabase
        .from('suppliers')
        .select('id, supplier_no, name, category, city, credit_limit, outstanding')
        .eq('deleted', false)
        .eq('status', 'Active')
        .order('name');

      if (!suppliers?.length) { setLoading(false); return; }

      // 2. All Marker Truck trips with supplier_id set
      const { data: trips } = await supabase
        .from('trips')
        .select('id, supplier_id, trip_date, supplier_amount, charges_value')
        .eq('ownership', 'Marker Truck')
        .eq('deleted', false)
        .not('supplier_id', 'is', null);

      if (!trips?.length) { setRows([]); setLoading(false); return; }

      // 3. All advances for those trips
      const tripIds = trips.map(t => t.id);
      const { data: expenses } = await supabase
        .from('trip_expenses')
        .select('trip_id, advance_amount')
        .in('trip_id', tripIds);

      // Group advances by trip
      const advByTrip: Record<string, number> = {};
      for (const e of expenses || []) {
        advByTrip[e.trip_id] = (advByTrip[e.trip_id] || 0) + Number(e.advance_amount || 0);
      }

      // 4. Build per-supplier payables
      const supplierMap: Record<string, SupplierRow> = {};

      for (const s of suppliers) {
        supplierMap[s.id] = {
          id: s.id,
          supplier_no: s.supplier_no,
          name: s.name,
          category: s.category,
          city: s.city,
          credit_limit: s.credit_limit,
          credit_days: 30, // default; adjust if you add credit_days to suppliers table
          outstanding: 0,
          d015: 0, d1630: 0, d3145: 0, above45: 0,
          overdueDays: 0,
          status: 'Current',
          tripCount: 0,
        };
      }

      for (const t of trips) {
        if (!t.supplier_id || !supplierMap[t.supplier_id]) continue;

        const cost    = Number(t.supplier_amount || 0) - Number(t.charges_value || 0);
        const advance = advByTrip[t.id] || 0;
        const net     = cost - advance;

        if (net <= 0) continue; // fully covered by advance

        const tripDate  = new Date(t.trip_date);
        const ageDays   = Math.floor((today.getTime() - tripDate.getTime()) / 86400000);
        const row       = supplierMap[t.supplier_id];

        row.outstanding += net;
        row.tripCount   += 1;
        row.overdueDays  = Math.max(row.overdueDays, ageDays);

        if      (ageDays <= 15) row.d015   += net;
        else if (ageDays <= 30) row.d1630  += net;
        else if (ageDays <= 45) row.d3145  += net;
        else                    row.above45 += net;
      }

      // Compute status, filter out zero-outstanding suppliers
      const result = Object.values(supplierMap)
        .filter(r => r.outstanding > 0)
        .map(r => ({ ...r, status: getStatus(r.overdueDays, r.credit_days) }))
        .sort((a, b) => b.outstanding - a.outstanding);

      setRows(result);
      setLoading(false);
    }

    load();
  }, []);

  const filtered     = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  const totalOut     = filtered.reduce((s, r) => s + r.outstanding, 0);
  const total015     = filtered.reduce((s, r) => s + r.d015, 0);
  const total1630    = filtered.reduce((s, r) => s + r.d1630, 0);
  const total3145    = filtered.reduce((s, r) => s + r.d3145, 0);
  const totalAbove45 = filtered.reduce((s, r) => s + r.above45, 0);

  const aging = [
    { range: '0-15 Days',    amount: total015,     pct: totalOut ? +(total015     / totalOut * 100).toFixed(1) : 0, color: AGING_COLORS[0] },
    { range: '16-30 Days',   amount: total1630,    pct: totalOut ? +(total1630    / totalOut * 100).toFixed(1) : 0, color: AGING_COLORS[1] },
    { range: '31-45 Days',   amount: total3145,    pct: totalOut ? +(total3145    / totalOut * 100).toFixed(1) : 0, color: AGING_COLORS[2] },
    { range: 'Above 45 Days',amount: totalAbove45, pct: totalOut ? +(totalAbove45 / totalOut * 100).toFixed(1) : 0, color: AGING_COLORS[3] },
  ].filter(a => a.amount > 0);

  const barData = filtered.map(r => ({
    name: r.name.split(' ')[0],
    payable: r.outstanding,
  }));

  const kpiCards = [
    { label: 'Total Payables',        value: fmtL(totalOut),                       sub: `${filtered.length} Suppliers`,                                               color: 'text-gray-800',   icon: '💸' },
    { label: 'Current (0-30 Days)',   value: fmtL(total015 + total1630),            sub: totalOut ? `${+((total015 + total1630) / totalOut * 100).toFixed(1)}% of Total` : '—', color: 'text-green-600',  icon: '✅' },
    { label: 'Overdue (31-45 Days)',  value: fmtL(total3145),                       sub: totalOut ? `${+(total3145    / totalOut * 100).toFixed(1)}% of Total` : '—',  color: 'text-orange-500', icon: '⏰' },
    { label: 'Critical (45+ Days)',   value: fmtL(totalAbove45),                    sub: totalOut ? `${+(totalAbove45 / totalOut * 100).toFixed(1)}% of Total` : '—',  color: 'text-red-500',    icon: '⚠️' },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payables / Outstanding</h1>
          <p className="text-sm text-gray-500">Dashboard / Suppliers / Payables / Outstanding</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Download size={15} /> Export
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((c, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-gray-500">{c.label}</p>
              <span className="text-lg">{c.icon}</span>
            </div>
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {!loading && aging.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Payables by Aging Bucket</h3>
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={aging} cx="50%" cy="50%" innerRadius={52} outerRadius={75} dataKey="amount">
                      {aging.map((_, i) => <Cell key={i} fill={aging[i].color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <span className="text-sm font-bold text-gray-800">{fmtL(totalOut)}</span>
                  <span className="text-xs text-gray-400">Total</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {aging.map((a, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                        <span className="text-gray-600">{a.range}</span>
                      </div>
                      <span className="font-semibold text-gray-700">{fmtL(a.amount)} ({a.pct}%)</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${a.pct}%`, backgroundColor: a.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Payables by Supplier</h3>
            <ResponsiveContainer width="100%" height={185}>
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false}
                  tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} width={80} />
                <Tooltip formatter={(v: number) => `₹ ${v.toLocaleString('en-IN')}`} />
                <Bar dataKey="payable" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Supplier-wise Payables Details</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search supplier..."
              className="pl-9 pr-4 py-2 border rounded-lg text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
            <Loader2 size={20} className="animate-spin" /> Loading payables...
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-16 text-gray-400 text-sm">No outstanding payables found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b">
                <th className="text-left py-3 pr-3">Supplier</th>
                <th className="text-left py-3 pr-3">Type</th>
                <th className="text-right py-3 pr-3">Trips</th>
                <th className="text-right py-3 pr-3">Total Payable (₹)</th>
                <th className="text-right py-3 pr-3">0-15 Days</th>
                <th className="text-right py-3 pr-3">16-30 Days</th>
                <th className="text-right py-3 pr-3">31-45 Days</th>
                <th className="text-right py-3 pr-3">Above 45 Days</th>
                <th className="text-right py-3 pr-3">Oldest (Days)</th>
                <th className="text-left py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 pr-3">
                    <p className="text-sm font-medium text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.supplier_no} · {s.city}</p>
                  </td>
                  <td className="py-3 pr-3 text-xs text-gray-600">{s.category}</td>
                  <td className="py-3 pr-3 text-right text-xs text-gray-600">{s.tripCount}</td>
                  <td className="py-3 pr-3 text-right text-xs font-bold text-gray-800">{s.outstanding.toLocaleString('en-IN')}</td>
                  <td className="py-3 pr-3 text-right text-xs text-green-600">{s.d015   > 0 ? s.d015.toLocaleString('en-IN')   : '-'}</td>
                  <td className="py-3 pr-3 text-right text-xs text-blue-600">{s.d1630  > 0 ? s.d1630.toLocaleString('en-IN')  : '-'}</td>
                  <td className="py-3 pr-3 text-right text-xs text-orange-500">{s.d3145 > 0 ? s.d3145.toLocaleString('en-IN') : '-'}</td>
                  <td className="py-3 pr-3 text-right text-xs text-red-500">{s.above45 > 0 ? s.above45.toLocaleString('en-IN') : '-'}</td>
                  <td className="py-3 pr-3 text-right text-xs text-gray-600">{s.overdueDays} days</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[s.status]}`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold text-sm">
                <td colSpan={3} className="py-3 pr-3 text-gray-700">Total</td>
                <td className="py-3 pr-3 text-right text-gray-800">{totalOut.toLocaleString('en-IN')}</td>
                <td className="py-3 pr-3 text-right text-green-600">{total015.toLocaleString('en-IN')}</td>
                <td className="py-3 pr-3 text-right text-blue-600">{total1630.toLocaleString('en-IN')}</td>
                <td className="py-3 pr-3 text-right text-orange-500">{total3145.toLocaleString('en-IN')}</td>
                <td className="py-3 pr-3 text-right text-red-500">{totalAbove45.toLocaleString('en-IN')}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
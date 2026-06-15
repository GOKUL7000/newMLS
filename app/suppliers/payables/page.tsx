'use client';
import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Search } from 'lucide-react';

const aging = [
  { range: '0-15 Days', amount: 485000, pct: 31.2, color: '#10b981', suppliers: 3 },
  { range: '16-30 Days', amount: 612000, pct: 39.4, color: '#3b82f6', suppliers: 4 },
  { range: '31-45 Days', amount: 298000, pct: 19.2, color: '#f59e0b', suppliers: 2 },
  { range: 'Above 45 Days', amount: 159000, pct: 10.2, color: '#ef4444', suppliers: 2 },
];

const payables = [
  { id: 'SUP001', name: 'Indian Oil - Peelamedu', type: 'Fuel', city: 'Coimbatore', creditDays: 15, outstanding: 255960, d015: 125000, d1630: 130960, d3145: 0, above45: 0, overdueDays: 12, status: 'Current' },
  { id: 'SUP002', name: 'Bharat Petroleum - RS Puram', type: 'Fuel', city: 'Coimbatore', creditDays: 15, outstanding: 198450, d015: 98450, d1630: 100000, d3145: 0, above45: 0, overdueDays: 14, status: 'Current' },
  { id: 'SUP003', name: 'Sri Balaji Tyres', type: 'Tyres', city: 'Coimbatore', creditDays: 30, outstanding: 186500, d015: 86500, d1630: 100000, d3145: 0, above45: 0, overdueDays: 18, status: 'Current' },
  { id: 'SUP005', name: 'Kumaran Auto Spare Parts', type: 'Spare Parts', city: 'Coimbatore', creditDays: 30, outstanding: 145800, d015: 45800, d1630: 100000, d3145: 0, above45: 0, overdueDays: 22, status: 'Moderate' },
  { id: 'SUP006', name: 'Sri Murugan Workshop', type: 'Maintenance', city: 'Coimbatore', creditDays: 30, outstanding: 298000, d015: 130000, d1630: 168000, d3145: 0, above45: 0, overdueDays: 16, status: 'Current' },
  { id: 'SUP004', name: 'National Highway Tolls', type: 'Toll', city: 'Coimbatore', creditDays: 0, outstanding: 345000, d015: 0, d1630: 113040, d3145: 232000, above45: 0, overdueDays: 35, status: 'Overdue' },
  { id: 'SUP007', name: 'Office Needs', type: 'Office', city: 'Coimbatore', creditDays: 15, outstanding: 124290, d015: 0, d1630: 0, d3145: 65290, above45: 59000, overdueDays: 52, status: 'Critical' },
];

const barData = payables.map(s => ({ name: s.name.split(' ')[0], payable: s.outstanding }));

const statusStyle: Record<string, string> = {
  Current: 'bg-green-100 text-green-700',
  Moderate: 'bg-blue-100 text-blue-700',
  Overdue: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
};

export default function SupplierPayablesPage() {
  const [search, setSearch] = useState('');
  const filtered = payables.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const total = filtered.reduce((s, p) => s + p.outstanding, 0);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
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
        {[
          { label: 'Total Payables', value: '₹ 15,54,000', sub: '7 Suppliers', color: 'text-gray-800', icon: '💸' },
          { label: 'Current (0-30 Days)', value: '₹ 10,97,000', sub: '70.6% of Total', color: 'text-green-600', icon: '✅' },
          { label: 'Overdue (31-45 Days)', value: '₹ 2,98,000', sub: '19.2% of Total', color: 'text-orange-500', icon: '⏰' },
          { label: 'Critical (45+ Days)', value: '₹ 1,59,000', sub: '10.2% of Total', color: 'text-red-500', icon: '⚠️' },
        ].map((c, i) => (
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
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Payables by Aging Bucket</h3>
          <div className="flex items-center gap-6">
            <div className="relative">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={aging} cx="50%" cy="50%" innerRadius={52} outerRadius={75} dataKey="amount">
                    {aging.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-sm font-bold text-gray-800">₹ 15.54L</span>
                <span className="text-xs text-gray-400">Total</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {aging.map((a, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }}></div>
                      <span className="text-gray-600">{a.range}</span>
                    </div>
                    <span className="font-semibold text-gray-700">₹ {(a.amount / 100000).toFixed(2)}L ({a.pct}%)</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${a.pct}%`, backgroundColor: a.color }}></div>
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
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} width={80} />
              <Tooltip formatter={(v: any) => `₹ ${v.toLocaleString('en-IN')}`} />
              <Bar dataKey="payable" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payables Table */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Supplier-wise Payables Details</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search supplier..."
              className="pl-9 pr-4 py-2 border rounded-lg text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b">
              <th className="text-left py-3 pr-3">Supplier</th>
              <th className="text-left py-3 pr-3">Type</th>
              <th className="text-right py-3 pr-3">Credit Days</th>
              <th className="text-right py-3 pr-3">Total Payable (₹)</th>
              <th className="text-right py-3 pr-3">0-15 Days (₹)</th>
              <th className="text-right py-3 pr-3">16-30 Days (₹)</th>
              <th className="text-right py-3 pr-3">31-45 Days (₹)</th>
              <th className="text-right py-3 pr-3">Above 45 Days (₹)</th>
              <th className="text-right py-3 pr-3">Overdue Days</th>
              <th className="text-left py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 pr-3">
                  <p className="text-sm font-medium text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.id}</p>
                </td>
                <td className="py-3 pr-3 text-xs text-gray-600">{s.type}</td>
                <td className="py-3 pr-3 text-right text-xs text-gray-600">{s.creditDays} days</td>
                <td className="py-3 pr-3 text-right text-xs font-bold text-gray-800">{s.outstanding.toLocaleString('en-IN')}</td>
                <td className="py-3 pr-3 text-right text-xs text-green-600">{s.d015 > 0 ? s.d015.toLocaleString('en-IN') : '-'}</td>
                <td className="py-3 pr-3 text-right text-xs text-blue-600">{s.d1630 > 0 ? s.d1630.toLocaleString('en-IN') : '-'}</td>
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
              <td className="py-3 pr-3 text-right text-gray-800">{filtered.reduce((s,p)=>s+p.outstanding,0).toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-right text-green-600">{filtered.reduce((s,p)=>s+p.d015,0).toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-right text-blue-600">{filtered.reduce((s,p)=>s+p.d1630,0).toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-right text-orange-500">{filtered.reduce((s,p)=>s+p.d3145,0).toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-right text-red-500">{filtered.reduce((s,p)=>s+p.above45,0).toLocaleString('en-IN')}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Search, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const aging = [
  { range: '0-30 Days', amount: 625000, pct: 33.8, color: '#10b981', customers: 4, status: 'Current' },
  { range: '31-60 Days', amount: 480000, pct: 25.9, color: '#3b82f6', customers: 3, status: 'Moderate' },
  { range: '61-90 Days', amount: 320000, pct: 17.3, color: '#f59e0b', customers: 2, status: 'Overdue' },
  { range: 'Above 90 Days', amount: 425000, pct: 23.0, color: '#ef4444', customers: 2, status: 'Critical' },
];

const customerOutstanding = [
  { id: 'CUS001', name: 'ABC Steels Pvt Ltd', city: 'Coimbatore', creditLimit: 1000000, outstanding: 391000, days030: 125000, days3160: 180000, days6190: 86000, above90: 0, overdueDays: 45, status: 'Overdue' },
  { id: 'CUS003', name: 'Kaveri Industries', city: 'Bangalore', creditLimit: 800000, outstanding: 320000, days030: 0, days3160: 0, days6190: 120000, above90: 200000, overdueDays: 95, status: 'Critical' },
  { id: 'CUS005', name: 'Global Enterprises', city: 'Hyderabad', creditLimit: 750000, outstanding: 295000, days030: 295000, days3160: 0, days6190: 0, above90: 0, overdueDays: 15, status: 'Current' },
  { id: 'CUS002', name: 'Sri Venkateshwara Traders', city: 'Chennai', creditLimit: 500000, outstanding: 180000, days030: 80000, days3160: 100000, days6190: 0, above90: 0, overdueDays: 38, status: 'Moderate' },
  { id: 'CUS008', name: 'MJM Infra', city: 'Trichy', creditLimit: 400000, outstanding: 125000, days030: 125000, days3160: 0, days6190: 0, above90: 0, overdueDays: 10, status: 'Current' },
  { id: 'CUS004', name: 'Sakthi Traders', city: 'Madurai', creditLimit: 300000, outstanding: 75000, days030: 0, days3160: 75000, days6190: 0, above90: 0, overdueDays: 42, status: 'Moderate' },
  { id: 'CUS006', name: 'Vijay Exports', city: 'Coimbatore', creditLimit: 600000, outstanding: 110000, days030: 0, days3160: 125000, days6190: 114000, above90: 225000, overdueDays: 110, status: 'Critical' },
];

const barData = customerOutstanding.map(c => ({ name: c.name.split(' ')[0], outstanding: c.outstanding }));

const statusStyle: Record<string, string> = {
  Current: 'bg-green-100 text-green-700',
  Moderate: 'bg-blue-100 text-blue-700',
  Overdue: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
};

const totalOutstanding = customerOutstanding.reduce((s, c) => s + c.outstanding, 0);

export default function CustomerOutstandingPage() {
  const [search, setSearch] = useState('');
  const filtered = customerOutstanding.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Outstanding</h1>
          <p className="text-sm text-gray-500">Dashboard / Customers / Customer Outstanding</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Outstanding', value: '₹ 15,96,000', sub: '11 Customers', color: 'text-gray-800', icon: '💰' },
          { label: 'Current (0-30 Days)', value: '₹ 6,25,000', sub: '33.8% of Total', color: 'text-green-600', icon: '✅' },
          { label: 'Overdue (31-90 Days)', value: '₹ 8,00,000', sub: '43.2% of Total', color: 'text-orange-500', icon: '⏰' },
          { label: 'Critical (90+ Days)', value: '₹ 4,25,000', sub: '23.0% of Total', color: 'text-red-500', icon: '⚠️' },
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
        {/* Aging Donut */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Outstanding by Aging Bucket</h3>
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
                <span className="text-sm font-bold text-gray-800">₹ 15.96L</span>
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

        {/* Bar Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Outstanding by Customer</h3>
          <ResponsiveContainer width="100%" height={185}>
            <BarChart data={barData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} width={80} />
              <Tooltip formatter={(v: any) => `₹ ${v.toLocaleString('en-IN')}`} />
              <Bar dataKey="outstanding" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Outstanding Table */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Customer-wise Outstanding Details</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer..."
              className="pl-9 pr-4 py-2 border rounded-lg text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b">
              <th className="text-left py-3 pr-3">Customer</th>
              <th className="text-left py-3 pr-3">City</th>
              <th className="text-right py-3 pr-3">Credit Limit (₹)</th>
              <th className="text-right py-3 pr-3">Total Outstanding (₹)</th>
              <th className="text-right py-3 pr-3">0-30 Days (₹)</th>
              <th className="text-right py-3 pr-3">31-60 Days (₹)</th>
              <th className="text-right py-3 pr-3">61-90 Days (₹)</th>
              <th className="text-right py-3 pr-3">Above 90 Days (₹)</th>
              <th className="text-right py-3 pr-3">Overdue Days</th>
              <th className="text-left py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 pr-3">
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.id}</p>
                </td>
                <td className="py-3 pr-3 text-xs text-gray-600">{c.city}</td>
                <td className="py-3 pr-3 text-right text-xs text-gray-700">{c.creditLimit.toLocaleString('en-IN')}</td>
                <td className="py-3 pr-3 text-right text-xs font-bold text-gray-800">{c.outstanding.toLocaleString('en-IN')}</td>
                <td className="py-3 pr-3 text-right text-xs text-green-600">{c.days030 > 0 ? c.days030.toLocaleString('en-IN') : '-'}</td>
                <td className="py-3 pr-3 text-right text-xs text-blue-600">{c.days3160 > 0 ? c.days3160.toLocaleString('en-IN') : '-'}</td>
                <td className="py-3 pr-3 text-right text-xs text-orange-500">{c.days6190 > 0 ? c.days6190.toLocaleString('en-IN') : '-'}</td>
                <td className="py-3 pr-3 text-right text-xs text-red-500">{c.above90 > 0 ? c.above90.toLocaleString('en-IN') : '-'}</td>
                <td className="py-3 pr-3 text-right text-xs text-gray-600">{c.overdueDays} days</td>
                <td className="py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[c.status]}`}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold text-sm">
              <td colSpan={3} className="py-3 pr-3 text-gray-700">Total</td>
              <td className="py-3 pr-3 text-right text-gray-800">{filtered.reduce((s,c)=>s+c.outstanding,0).toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-right text-green-600">{filtered.reduce((s,c)=>s+c.days030,0).toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-right text-blue-600">{filtered.reduce((s,c)=>s+c.days3160,0).toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-right text-orange-500">{filtered.reduce((s,c)=>s+c.days6190,0).toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-right text-red-500">{filtered.reduce((s,c)=>s+c.above90,0).toLocaleString('en-IN')}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

'use client';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, FileText } from 'lucide-react';

const revenueByCustomer = [
  { name: 'ABC Steels', revenue: 1250000, trips: 18 },
  { name: 'Kaveri Ind.', revenue: 980000, trips: 14 },
  { name: 'Sri Venkat.', revenue: 875000, trips: 12 },
  { name: 'Global Ent.', revenue: 742000, trips: 10 },
  { name: 'Vijay Exp.', revenue: 620000, trips: 9 },
  { name: 'MJM Infra', revenue: 480000, trips: 7 },
  { name: 'Sakthi Tr.', revenue: 395000, trips: 6 },
];

const monthlyTrend = [
  { month: 'Jan', revenue: 3850000, payments: 3200000 },
  { month: 'Feb', revenue: 4120000, payments: 3800000 },
  { month: 'Mar', revenue: 5200000, payments: 4900000 },
  { month: 'Apr', revenue: 4800000, payments: 4500000 },
  { month: 'May', revenue: 5900000, payments: 5600000 },
  { month: 'Jun', revenue: 6342000, payments: 5895000 },
];

const statusPie = [
  { name: 'Active', value: 8, color: '#10b981' },
  { name: 'Inactive', value: 2, color: '#9ca3af' },
  { name: 'Blocked', value: 1, color: '#ef4444' },
];

const topCustomers = [
  { rank: 1, id: 'CUS001', name: 'ABC Steels Pvt Ltd', city: 'Coimbatore', trips: 18, revenue: 1250000, payments: 1000000, outstanding: 391000, avgTrip: 69444 },
  { rank: 2, id: 'CUS003', name: 'Kaveri Industries', city: 'Bangalore', trips: 14, revenue: 980000, payments: 660000, outstanding: 320000, avgTrip: 70000 },
  { rank: 3, id: 'CUS002', name: 'Sri Venkateshwara Traders', city: 'Chennai', trips: 12, revenue: 875000, payments: 695000, outstanding: 180000, avgTrip: 72917 },
  { rank: 4, id: 'CUS005', name: 'Global Enterprises', city: 'Hyderabad', trips: 10, revenue: 742000, payments: 630000, outstanding: 295000, avgTrip: 74200 },
  { rank: 5, id: 'CUS006', name: 'Vijay Exports', city: 'Coimbatore', trips: 9, revenue: 620000, payments: 510000, outstanding: 110000, avgTrip: 68889 },
  { rank: 6, id: 'CUS008', name: 'MJM Infra', city: 'Trichy', trips: 7, revenue: 480000, payments: 390000, outstanding: 125000, avgTrip: 68571 },
  { rank: 7, id: 'CUS004', name: 'Sakthi Traders', city: 'Madurai', trips: 6, revenue: 395000, payments: 320000, outstanding: 75000, avgTrip: 65833 },
];

const cityRevenue = [
  { city: 'Coimbatore', revenue: 1870000, pct: 29.5, color: '#3b82f6' },
  { city: 'Bangalore', revenue: 980000, pct: 15.5, color: '#10b981' },
  { city: 'Chennai', revenue: 875000, pct: 13.8, color: '#f59e0b' },
  { city: 'Hyderabad', revenue: 742000, pct: 11.7, color: '#8b5cf6' },
  { city: 'Others', revenue: 1875000, pct: 29.5, color: '#9ca3af' },
];

const recentReports = [
  { name: 'Customer Revenue Report - May 2026', date: '01 Jun 2026', type: 'Monthly' },
  { name: 'Outstanding Aging Report - Jun 2026', date: '07 Jun 2026', type: 'Aging' },
  { name: 'Top Customers Report - Q1 2026', date: '01 Apr 2026', type: 'Quarterly' },
  { name: 'Payment Collection Report - May 2026', date: '01 Jun 2026', type: 'Monthly' },
];

export default function CustomerReportsPage() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Reports</h1>
          <p className="text-sm text-gray-500">Dashboard / Customers / Customer Reports</p>
        </div>
        <div className="flex gap-2">
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
            <option>This Month</option><option>Last Month</option><option>This Quarter</option><option>This Year</option>
          </select>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Download size={15} /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Total Customers', value: '11', sub: 'Active: 8 · Inactive: 2 · Blocked: 1', color: 'text-blue-600' },
          { label: 'Total Revenue (MTD)', value: '₹ 63,42,000', sub: '▲ 18.6% vs Last Month', color: 'text-green-600' },
          { label: 'Total Collections (MTD)', value: '₹ 58,95,000', sub: '▲ 14.2% vs Last Month', color: 'text-teal-600' },
          { label: 'Total Outstanding', value: '₹ 15,96,000', sub: '25.2% of Total Revenue', color: 'text-orange-500' },
          { label: 'Total Trips (MTD)', value: '86', sub: 'Avg ₹ 73,744 / Trip', color: 'text-purple-600' },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Revenue by Customer */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Revenue by Customer (This Month)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByCustomer} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} width={75} />
              <Tooltip formatter={(v: any) => `₹ ${v.toLocaleString('en-IN')}`} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Revenue vs Collections (6 Months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyTrend}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip formatter={(v: any) => `₹ ${v.toLocaleString('en-IN')}`} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              <Line dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line dataKey="payments" name="Collections" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* City & Status */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Revenue by City</h3>
            <div className="space-y-2">
              {cityRevenue.map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{c.city}</span>
                    <span className="font-medium text-gray-700">₹ {(c.revenue/100000).toFixed(2)}L ({c.pct}%)</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Customer Status</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={80} height={80}>
                <PieChart>
                  <Pie data={statusPie} cx="50%" cy="50%" innerRadius={25} outerRadius={38} dataKey="value">
                    {statusPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {statusPie.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                    <span className="text-gray-600">{s.name}</span>
                    <span className="font-bold text-gray-800 ml-auto">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Top Customers Performance (This Month)</h3>
          <button className="text-blue-600 text-sm hover:underline">View Full Report →</button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b">
              <th className="text-center py-3 pr-3">Rank</th>
              <th className="text-left py-3 pr-3">Customer</th>
              <th className="text-left py-3 pr-3">City</th>
              <th className="text-center py-3 pr-3">Total Trips</th>
              <th className="text-right py-3 pr-3">Total Revenue (₹)</th>
              <th className="text-right py-3 pr-3">Total Payments (₹)</th>
              <th className="text-right py-3 pr-3">Outstanding (₹)</th>
              <th className="text-right py-3">Avg. Revenue / Trip (₹)</th>
            </tr>
          </thead>
          <tbody>
            {topCustomers.map((c, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 pr-3 text-center">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto
                    ${c.rank === 1 ? 'bg-yellow-100 text-yellow-700' : c.rank === 2 ? 'bg-gray-100 text-gray-600' : c.rank === 3 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500'}`}>
                    {c.rank}
                  </span>
                </td>
                <td className="py-3 pr-3">
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.id}</p>
                </td>
                <td className="py-3 pr-3 text-xs text-gray-600">{c.city}</td>
                <td className="py-3 pr-3 text-center text-xs text-gray-700">{c.trips}</td>
                <td className="py-3 pr-3 text-right text-xs font-semibold text-gray-800">{c.revenue.toLocaleString('en-IN')}</td>
                <td className="py-3 pr-3 text-right text-xs text-green-600">{c.payments.toLocaleString('en-IN')}</td>
                <td className="py-3 pr-3 text-right text-xs text-orange-500">{c.outstanding.toLocaleString('en-IN')}</td>
                <td className="py-3 text-right text-xs text-gray-700">{c.avgTrip.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold text-sm">
              <td colSpan={3} className="py-3 pr-3 text-gray-700">Total</td>
              <td className="py-3 pr-3 text-center text-gray-800">{topCustomers.reduce((s,c)=>s+c.trips,0)}</td>
              <td className="py-3 pr-3 text-right text-gray-800">{topCustomers.reduce((s,c)=>s+c.revenue,0).toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-right text-green-600">{topCustomers.reduce((s,c)=>s+c.payments,0).toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-right text-orange-500">{topCustomers.reduce((s,c)=>s+c.outstanding,0).toLocaleString('en-IN')}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Generated Reports</h3>
        <div className="grid grid-cols-4 gap-4">
          {recentReports.map((r, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer group">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                <FileText size={18} className="text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-800 mb-1">{r.name}</p>
              <p className="text-xs text-gray-400">{r.type} · {r.date}</p>
              <button className="flex items-center gap-1 text-xs text-blue-600 mt-3 hover:underline">
                <Download size={12} /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

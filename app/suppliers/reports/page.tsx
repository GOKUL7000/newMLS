'use client';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, FileText } from 'lucide-react';

const purchaseBySupplier = [
  { name: 'Indian Oil', purchases: 1850000 },{ name: 'Bharat Petro.', purchases: 1240000 },
  { name: 'Sri Balaji Tyres', purchases: 685000 },{ name: 'NH Tolls', purchases: 520000 },
  { name: 'Kumaran Auto', purchases: 385000 },{ name: 'Sri Murugan', purchases: 298000 },
  { name: 'Office Needs', purchases: 124000 },
];

const monthlyTrend = [
  { month: 'Jan', purchases: 3200000, payments: 2950000 },{ month: 'Feb', purchases: 3850000, payments: 3600000 },
  { month: 'Mar', purchases: 4200000, payments: 3900000 },{ month: 'Apr', purchases: 3980000, payments: 3750000 },
  { month: 'May', purchases: 4650000, payments: 4400000 },{ month: 'Jun', purchases: 5102000, payments: 4650000 },
];

const byCategory = [
  { name: 'Fuel (Diesel)', value: 3090000, pct: '60.6%', color: '#3b82f6' },
  { name: 'Tyres', value: 685000, pct: '13.4%', color: '#f59e0b' },
  { name: 'Toll Charges', value: 520000, pct: '10.2%', color: '#10b981' },
  { name: 'Spare Parts', value: 385000, pct: '7.5%', color: '#8b5cf6' },
  { name: 'Maintenance', value: 298000, pct: '5.8%', color: '#ef4444' },
  { name: 'Office', value: 124000, pct: '2.4%', color: '#9ca3af' },
];

const topSuppliers = [
  { rank: 1, id: 'SUP001', name: 'Indian Oil - Peelamedu', type: 'Fuel', transactions: 32, purchases: 1850000, payments: 1594040, outstanding: 255960, avgTxn: 57813 },
  { rank: 2, id: 'SUP002', name: 'Bharat Petroleum - RS Puram', type: 'Fuel', transactions: 24, purchases: 1240000, payments: 1041550, outstanding: 198450, avgTxn: 51667 },
  { rank: 3, id: 'SUP003', name: 'Sri Balaji Tyres', type: 'Tyres', transactions: 12, purchases: 685000, payments: 498500, outstanding: 186500, avgTxn: 57083 },
  { rank: 4, id: 'SUP004', name: 'National Highway Tolls', type: 'Toll', transactions: 186, purchases: 520000, payments: 175000, outstanding: 345000, avgTxn: 2796 },
  { rank: 5, id: 'SUP005', name: 'Kumaran Auto Spare Parts', type: 'Spare Parts', transactions: 18, purchases: 385000, payments: 239200, outstanding: 145800, avgTxn: 21389 },
  { rank: 6, id: 'SUP006', name: 'Sri Murugan Workshop', type: 'Maintenance', transactions: 14, purchases: 298000, payments: 0, outstanding: 298000, avgTxn: 21286 },
  { rank: 7, id: 'SUP007', name: 'Office Needs', type: 'Office', transactions: 8, purchases: 124000, payments: 0, outstanding: 124290, avgTxn: 15500 },
];

const recentReports = [
  { name: 'Supplier Purchase Report - May 2026', date: '01 Jun 2026', type: 'Monthly' },
  { name: 'Payables Aging Report - Jun 2026', date: '07 Jun 2026', type: 'Aging' },
  { name: 'Diesel Supplier Analysis - Q1 2026', date: '01 Apr 2026', type: 'Quarterly' },
  { name: 'Vendor Payment Summary - May 2026', date: '01 Jun 2026', type: 'Monthly' },
];

export default function SupplierReportsPage() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Supplier Reports</h1>
          <p className="text-sm text-gray-500">Dashboard / Suppliers / Supplier Reports</p>
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
          { label: 'Total Suppliers', value: '12', sub: 'Active: 10 · Inactive: 2', color: 'text-blue-600' },
          { label: 'Total Purchases (MTD)', value: '₹ 51,02,000', sub: '▲ 9.7% vs Last Month', color: 'text-gray-800' },
          { label: 'Total Payments (MTD)', value: '₹ 46,50,000', sub: '▲ 5.7% vs Last Month', color: 'text-green-600' },
          { label: 'Total Payables', value: '₹ 15,54,000', sub: '30.5% of Total Purchases', color: 'text-orange-500' },
          { label: 'Total Transactions', value: '294', sub: 'This Month', color: 'text-purple-600' },
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
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Purchases by Supplier (This Month)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={purchaseBySupplier} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} width={80} />
              <Tooltip formatter={(v: any) => `₹ ${v.toLocaleString('en-IN')}`} />
              <Bar dataKey="purchases" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Purchases vs Payments (6 Months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyTrend}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip formatter={(v: any) => `₹ ${v.toLocaleString('en-IN')}`} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              <Line dataKey="purchases" name="Purchases" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line dataKey="payments" name="Payments" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Purchases by Category</h3>
            <div className="flex items-center gap-3">
              <ResponsiveContainer width={90} height={90}>
                <PieChart>
                  <Pie data={byCategory} cx="50%" cy="50%" innerRadius={28} outerRadius={43} dataKey="value">
                    {byCategory.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1">
                {byCategory.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></div><span className="text-gray-600 truncate max-w-[80px]">{c.name}</span></div>
                    <span className="font-medium text-gray-700">{c.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Quick Stats</h3>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Highest Single Purchase', value: '₹ 1,44,600' },
                { label: 'Avg. Purchase Value', value: '₹ 17,360' },
                { label: 'On-time Payment Rate', value: '84.2%' },
                { label: 'Top Supplier', value: 'Indian Oil' },
              ].map((s, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-500">{s.label}</span>
                  <span className="font-semibold text-gray-700">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Suppliers Table */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Supplier Performance Summary (This Month)</h3>
          <button className="text-blue-600 text-sm hover:underline">View Full Report →</button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b">
              <th className="text-center py-3 pr-3">Rank</th>
              <th className="text-left py-3 pr-3">Supplier</th>
              <th className="text-left py-3 pr-3">Type</th>
              <th className="text-center py-3 pr-3">Transactions</th>
              <th className="text-right py-3 pr-3">Total Purchases (₹)</th>
              <th className="text-right py-3 pr-3">Total Payments (₹)</th>
              <th className="text-right py-3 pr-3">Outstanding (₹)</th>
              <th className="text-right py-3">Avg. Txn Value (₹)</th>
            </tr>
          </thead>
          <tbody>
            {topSuppliers.map((s, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 pr-3 text-center">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto
                    ${s.rank === 1 ? 'bg-yellow-100 text-yellow-700' : s.rank === 2 ? 'bg-gray-100 text-gray-600' : s.rank === 3 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500'}`}>
                    {s.rank}
                  </span>
                </td>
                <td className="py-3 pr-3">
                  <p className="text-sm font-medium text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.id}</p>
                </td>
                <td className="py-3 pr-3 text-xs text-gray-600">{s.type}</td>
                <td className="py-3 pr-3 text-center text-xs text-gray-700">{s.transactions}</td>
                <td className="py-3 pr-3 text-right text-xs font-semibold text-gray-800">{s.purchases.toLocaleString('en-IN')}</td>
                <td className="py-3 pr-3 text-right text-xs text-green-600">{s.payments > 0 ? s.payments.toLocaleString('en-IN') : '-'}</td>
                <td className="py-3 pr-3 text-right text-xs text-orange-500">{s.outstanding.toLocaleString('en-IN')}</td>
                <td className="py-3 text-right text-xs text-gray-700">{s.avgTxn.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold text-sm">
              <td colSpan={3} className="py-3 pr-3 text-gray-700">Total</td>
              <td className="py-3 pr-3 text-center text-gray-800">{topSuppliers.reduce((s,x)=>s+x.transactions,0)}</td>
              <td className="py-3 pr-3 text-right text-gray-800">{topSuppliers.reduce((s,x)=>s+x.purchases,0).toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-right text-green-600">{topSuppliers.reduce((s,x)=>s+x.payments,0).toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-right text-orange-500">{topSuppliers.reduce((s,x)=>s+x.outstanding,0).toLocaleString('en-IN')}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Generated Reports */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Generated Reports</h3>
        <div className="grid grid-cols-4 gap-4">
          {recentReports.map((r, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:bg-orange-50 transition-colors cursor-pointer group">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                <FileText size={18} className="text-orange-600" />
              </div>
              <p className="text-sm font-medium text-gray-800 mb-1">{r.name}</p>
              <p className="text-xs text-gray-400">{r.type} · {r.date}</p>
              <button className="flex items-center gap-1 text-xs text-orange-600 mt-3 hover:underline">
                <Download size={12} /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

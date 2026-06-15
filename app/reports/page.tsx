'use client';
import { useState } from 'react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, FileText, TrendingUp, TrendingDown } from 'lucide-react';

const revExpData = [
  { date: '01 Jun', revenue: 145600, expenses: 98000 },
  { date: '02 Jun', revenue: 126400, expenses: 87500 },
  { date: '03 Jun', revenue: 178900, expenses: 105000 },
  { date: '04 Jun', revenue: 115600, expenses: 82300 },
  { date: '05 Jun', revenue: 137800, expenses: 94000 },
  { date: '06 Jun', revenue: 149300, expenses: 96000 },
  { date: '07 Jun', revenue: 162400, expenses: 101000 },
];
const profitTrend = [
  { date: '01 Jun', profit: 47600 },{ date: '02 Jun', profit: 38900 },{ date: '03 Jun', profit: 73900 },
  { date: '04 Jun', profit: 33300 },{ date: '05 Jun', profit: 43800 },{ date: '06 Jun', profit: 53300 },{ date: '07 Jun', profit: 61400 },
];
const expCat = [
  { name: 'Diesel', value: 220000, pct: '35.8%', color: '#3b82f6' },
  { name: 'Driver Expenses', value: 135000, pct: '22.0%', color: '#10b981' },
  { name: 'Maintenance & Repair', value: 105000, pct: '17.1%', color: '#f59e0b' },
  { name: 'Toll Charges', value: 75000, pct: '12.2%', color: '#ef4444' },
  { name: 'Office Expenses', value: 50000, pct: '8.1%', color: '#8b5cf6' },
  { name: 'Other Expenses', value: 30000, pct: '4.8%', color: '#6b7280' },
];
const tripsSummary = [
  { date: '01 Jun 2026', total: 18, completed: 16, inProgress: 2, cancelled: 0, km: 6320, revenue: 145600, avgRev: 8089 },
  { date: '02 Jun 2026', total: 17, completed: 15, inProgress: 1, cancelled: 1, km: 5480, revenue: 126400, avgRev: 7553 },
  { date: '03 Jun 2026', total: 21, completed: 18, inProgress: 2, cancelled: 1, km: 7210, revenue: 178900, avgRev: 8519 },
  { date: '04 Jun 2026', total: 16, completed: 14, inProgress: 1, cancelled: 1, km: 5120, revenue: 115600, avgRev: 7225 },
  { date: '05 Jun 2026', total: 18, completed: 16, inProgress: 2, cancelled: 0, km: 6140, revenue: 137800, avgRev: 7656 },
  { date: '06 Jun 2026', total: 19, completed: 17, inProgress: 1, cancelled: 0, km: 6430, revenue: 149300, avgRev: 7858 },
  { date: '07 Jun 2026', total: 19, completed: 17, inProgress: 2, cancelled: 0, km: 6980, revenue: 162400, avgRev: 8547 },
];
const topVehicles = [
  { no: 'TN 01 AB 1234', trips: 17, km: 4850, revenue: 125600, exp: 82450, profit: 9.89 },
  { no: 'TN 03 EF 9012', trips: 11, km: 4120, revenue: 112300, exp: 72450, profit: 9.58 },
  { no: 'TN 05 IJ 7890', trips: 10, km: 3980, revenue: 105600, exp: 71230, profit: 8.63 },
  { no: 'TN 02 CD 5678', trips: 9, km: 3750, revenue: 98450, exp: 64220, profit: 9.13 },
  { no: 'TN 04 GH 3456', trips: 9, km: 3680, revenue: 95800, exp: 32680, profit: 8.87 },
];
const byDriver = [
  { name: 'Arun Kumar', trips: 17, km: 6420, revenue: 162300, profit: 54650 },
  { name: 'Kumaravel', trips: 16, km: 6010, revenue: 148600, profit: 49210 },
  { name: 'Ramesh Babu', trips: 15, km: 5650, revenue: 138900, profit: 46120 },
  { name: 'Suresh', trips: 14, km: 5120, revenue: 125400, profit: 42230 },
  { name: 'Vijayakumar', trips: 13, km: 4780, revenue: 118800, profit: 39450 },
];
const monthly = [
  { metric: 'Total Revenue', thisMonth: 958000, lastMonth: 808650, change: '+18.6%', up: true },
  { metric: 'Total Expenses', thisMonth: 615000, lastMonth: 547500, change: '+12.3%', up: false },
  { metric: 'Net Profit', thisMonth: 343000, lastMonth: 261150, change: '+31.4%', up: true },
  { metric: 'Total Trips', thisMonth: 128, lastMonth: 111, change: '+15.3%', up: true },
  { metric: 'Total KM', thisMonth: 42680, lastMonth: 36720, change: '+16.2%', up: true },
  { metric: 'Avg. Diesel Efficiency', thisMonth: 3.62, lastMonth: 3.41, change: '+6.1%', up: true },
];
const recentReports = [
  { name: 'Profit & Loss Statement', type: 'Financial Report', date: '07 Jun 2026, 10:30 AM', color: 'bg-blue-100 text-blue-600' },
  { name: 'Trip Summary Report', type: 'Operational Report', date: '07 Jun 2026, 09:45 AM', color: 'bg-green-100 text-green-600' },
  { name: 'Diesel Consumption Report', type: 'Vehicle Report', date: '07 Jun 2026, 09:15 AM', color: 'bg-purple-100 text-purple-600' },
  { name: 'Driver Performance Report', type: 'Driver Report', date: '06 Jun 2026, 08:50 PM', color: 'bg-orange-100 text-orange-600' },
  { name: 'Maintenance Summary Report', type: 'Maintenance Report', date: '06 Jun 2026, 07:30 PM', color: 'bg-red-100 text-red-600' },
];
const quickActions = [
  { label: 'Profit & Loss Report', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Trip Summary Report', icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Diesel Report', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Vehicle Utilization Report', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
  { label: 'Driver Performance Report', icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50' },
  { label: 'Maintenance Summary Report', icon: FileText, color: 'text-red-600', bg: 'bg-red-50' },
  { label: 'Custom Report Builder', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Export Data', icon: Download, color: 'text-gray-600', bg: 'bg-gray-50' },
];

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-sm text-gray-500">Dashboard / Reports / Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 bg-white border px-3 py-2 rounded-lg">01 Jun 2026 - 07 Jun 2026</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Date Range</p>
            <select className="border rounded-lg px-3 py-1.5 text-sm text-gray-700"><option>01 Jun 2026 - 07 Jun 2026</option></select>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Group By</p>
            <select className="border rounded-lg px-3 py-1.5 text-sm text-gray-700"><option>Day</option></select>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Compare With</p>
            <select className="border rounded-lg px-3 py-1.5 text-sm text-gray-700"><option>Previous Period</option></select>
          </div>
          <div className="mt-4">
            <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-4">
        {[
          { label: 'Total Revenue', value: '₹ 9,58,000', sub: '▲ 18.6% vs Last Period', color: 'text-green-600' },
          { label: 'Total Expenses', value: '₹ 6,15,000', sub: '▲ 12.3% vs Last Period', color: 'text-red-500' },
          { label: 'Net Profit', value: '₹ 3,43,000', sub: '▲ 28.4% vs Last Period', color: 'text-green-600' },
          { label: 'Total Trips', value: '128', sub: '▲ 14.8% vs Last Period', color: 'text-blue-600' },
          { label: 'Total KM', value: '42,680 Km', sub: '▲ 16.2% vs Last Period', color: 'text-purple-600' },
          { label: 'Avg. Diesel Efficiency', value: '3.62 km/L', sub: '▲ 6.1% vs Last Period', color: 'text-teal-600' },
        ].map((c,i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-gray-800">{c.value}</p>
            <p className={`text-xs mt-1 ${c.color}`}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Revenue vs Expenses */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Revenue vs Expenses</h3>
            <select className="text-xs border rounded px-2 py-1 text-gray-600"><option>This Week</option></select>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={revExpData}>
              <XAxis dataKey="date" tick={{fontSize:10}} tickLine={false} />
              <YAxis tick={{fontSize:10}} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip formatter={(v:any) => `₹${(v/100000).toFixed(2)}L`} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:10}} />
              <Area dataKey="revenue" name="Revenue (₹)" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} dot={{r:3}} />
              <Area dataKey="expenses" name="Expenses (₹)" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} dot={{r:3}} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Profit Trend */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Profit Trend</h3>
            <select className="text-xs border rounded px-2 py-1 text-gray-600"><option>This Week</option></select>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={profitTrend}>
              <XAxis dataKey="date" tick={{fontSize:10}} tickLine={false} />
              <YAxis tick={{fontSize:10}} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v:any) => `₹${(v/1000).toFixed(1)}K`} />
              <Area dataKey="profit" name="Profit (₹)" stroke="#10b981" fill="#d1fae5" strokeWidth={2} dot={{r:3}} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses by Category */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">Expenses by Category</h3>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={expCat} cx="50%" cy="50%" innerRadius={38} outerRadius={55} dataKey="value">
                  {expCat.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {expCat.map((c,i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor:c.color}}></div>
                    <span className="text-gray-600 truncate max-w-[90px]">{c.name}</span>
                  </div>
                  <span className="font-medium text-gray-700">{c.pct}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-sm font-bold text-gray-700 mt-1">₹ 6,15,000 Total Expenses</p>
        </div>
      </div>

      {/* Trips Summary + Top Expense Categories + Recent Reports */}
      <div className="grid grid-cols-3 gap-6">
        {/* Trips Summary */}
        <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Trips Summary (This Week)</h3>
            <button className="text-blue-600 text-sm hover:underline">View Full Report →</button>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500 border-b">
              <th className="text-left py-2">Date</th><th className="text-center py-2">Total Trips</th>
              <th className="text-center py-2">Completed</th><th className="text-center py-2">In Progress</th>
              <th className="text-center py-2">Cancelled</th><th className="text-right py-2">Total KM</th>
              <th className="text-right py-2">Revenue (₹)</th><th className="text-right py-2">Avg. Revenue / Trip</th>
            </tr></thead>
            <tbody>
              {tripsSummary.map((r,i) => (
                <tr key={i} className={`border-b border-gray-50 ${i === tripsSummary.length-1 ? 'font-semibold bg-gray-50' : 'hover:bg-gray-50'}`}>
                  <td className="py-2.5 text-gray-700">{r.date}</td>
                  <td className="py-2.5 text-center text-gray-700">{r.total}</td>
                  <td className="py-2.5 text-center text-green-600">{r.completed}</td>
                  <td className="py-2.5 text-center text-blue-600">{r.inProgress}</td>
                  <td className="py-2.5 text-center text-red-500">{r.cancelled}</td>
                  <td className="py-2.5 text-right text-gray-700">{r.km.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 text-right text-gray-700">{r.revenue.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 text-right text-gray-700">{r.avgRev.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold border-t-2 border-gray-300">
                <td className="py-2.5 text-gray-800">Total</td>
                <td className="py-2.5 text-center text-gray-800">128</td>
                <td className="py-2.5 text-center text-green-600">113</td>
                <td className="py-2.5 text-center text-blue-600">11</td>
                <td className="py-2.5 text-center text-red-500">4</td>
                <td className="py-2.5 text-right text-gray-800">43,680</td>
                <td className="py-2.5 text-right text-gray-800">9,58,000</td>
                <td className="py-2.5 text-right text-gray-800">7,484</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right: Top Categories + Recent Reports */}
        <div className="space-y-4">
          {/* Top Expense Categories */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm">Top Expense Categories (This Week)</h3>
              <button className="text-blue-600 text-xs hover:underline">View Full Report →</button>
            </div>
            <table className="w-full text-xs">
              <thead><tr className="text-gray-500 border-b"><th className="text-left py-1.5">Category</th><th className="text-right py-1.5">Amount (₹)</th><th className="text-right py-1.5">% of Total</th></tr></thead>
              <tbody>
                {expCat.map((c,i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{backgroundColor:c.color}}></div>{c.name}</td>
                    <td className="py-2 text-right text-gray-700">{c.value.toLocaleString('en-IN')}</td>
                    <td className="py-2 text-right text-gray-600">{c.pct}</td>
                  </tr>
                ))}
                <tr className="font-semibold border-t">
                  <td className="py-2 text-gray-800">Total</td>
                  <td className="py-2 text-right text-gray-800">6,15,000</td>
                  <td className="py-2 text-right text-gray-600">100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm">Recent Reports</h3>
              <button className="text-blue-600 text-xs hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {recentReports.map((r,i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.color}`}>
                      <FileText size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.type} · {r.date}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600"><Download size={14} /></button>
                </div>
              ))}
            </div>
            <button className="text-blue-600 text-xs mt-3 hover:underline">View All Reports →</button>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Top Vehicles */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 text-sm">Top Performing Vehicles (This Week)</h3>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500 border-b"><th className="text-left py-1.5">Vehicle No.</th><th className="text-center py-1.5">Total Trips</th><th className="text-right py-1.5">Total KM</th><th className="text-right py-1.5">Revenue (₹)</th><th className="text-right py-1.5">Expense (₹)</th><th className="text-right py-1.5">Profit / KM (₹)</th></tr></thead>
            <tbody>
              {topVehicles.map((r,i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 text-gray-700 font-medium">{r.no}</td>
                  <td className="py-2 text-center text-gray-600">{r.trips}</td>
                  <td className="py-2 text-right text-gray-600">{r.km.toLocaleString('en-IN')}</td>
                  <td className="py-2 text-right text-gray-700">{r.revenue.toLocaleString('en-IN')}</td>
                  <td className="py-2 text-right text-gray-600">{r.exp.toLocaleString('en-IN')}</td>
                  <td className="py-2 text-right text-green-600 font-medium">{r.profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="text-blue-600 text-xs mt-2 hover:underline">View Full Vehicle Report →</button>
        </div>

        {/* Summary by Driver */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 text-sm">Summary by Driver (This Week)</h3>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500 border-b"><th className="text-left py-1.5">Driver Name</th><th className="text-center py-1.5">Total Trips</th><th className="text-right py-1.5">Total KM</th><th className="text-right py-1.5">Revenue (₹)</th><th className="text-right py-1.5">Profit (₹)</th></tr></thead>
            <tbody>
              {byDriver.map((r,i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 text-gray-700 font-medium">{r.name}</td>
                  <td className="py-2 text-center text-gray-600">{r.trips}</td>
                  <td className="py-2 text-right text-gray-600">{r.km.toLocaleString('en-IN')}</td>
                  <td className="py-2 text-right text-gray-700">{r.revenue.toLocaleString('en-IN')}</td>
                  <td className="py-2 text-right text-green-600 font-medium">{r.profit.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="text-blue-600 text-xs mt-2 hover:underline">View Full Driver Report →</button>
        </div>

        {/* Monthly Comparison + Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm">Monthly Comparison</h3>
              <select className="text-xs border rounded px-2 py-1 text-gray-600"><option>This Month</option></select>
            </div>
            <table className="w-full text-xs">
              <thead><tr className="text-gray-500 border-b"><th className="text-left py-1.5">Metric</th><th className="text-right py-1.5">This Month (₹)</th><th className="text-right py-1.5">Last Month (₹)</th><th className="text-right py-1.5">Change</th></tr></thead>
              <tbody>
                {monthly.map((r,i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 text-gray-600">{r.metric}</td>
                    <td className="py-2 text-right text-gray-700">{typeof r.thisMonth === 'number' && r.thisMonth > 100 ? r.thisMonth.toLocaleString('en-IN') : r.thisMonth}</td>
                    <td className="py-2 text-right text-gray-500">{typeof r.lastMonth === 'number' && r.lastMonth > 100 ? r.lastMonth.toLocaleString('en-IN') : r.lastMonth}</td>
                    <td className={`py-2 text-right font-medium ${r.up ? 'text-green-600' : 'text-red-500'}`}>{r.up ? '▲' : '▼'} {r.change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="text-blue-600 text-xs mt-2 hover:underline">View Full Comparison Report →</button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((a,i) => (
                <button key={i} className={`flex items-center gap-2 ${a.bg} p-2 rounded-lg text-xs font-medium ${a.color} hover:opacity-80`}>
                  <a.icon size={12} /> <span className="truncate">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

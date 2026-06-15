'use client';
import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Truck, Users, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

const revenueData = [
  { month: 'Jan', revenue: 4200000 }, { month: 'Feb', revenue: 5100000 }, { month: 'Mar', revenue: 6300000 },
  { month: 'Apr', revenue: 5800000 }, { month: 'May', revenue: 7200000 }, { month: 'Jun', revenue: 8500000 },
  { month: 'Jul', revenue: 9800000 }, { month: 'Aug', revenue: 7600000 }, { month: 'Sep', revenue: 6900000 },
  { month: 'Oct', revenue: 8100000 }, { month: 'Nov', revenue: 7400000 }, { month: 'Dec', revenue: 8500000 },
];
const expenseData = [
  { name: 'Diesel', value: 28000000, color: '#3b82f6' },
  { name: 'Driver Expense', value: 6000000, color: '#f59e0b' },
  { name: 'Toll Charges', value: 8000000, color: '#10b981' },
  { name: 'Maintenance', value: 4000000, color: '#ef4444' },
  { name: 'Other Expenses', value: 2200000, color: '#8b5cf6' },
];
const tripStatusData = [
  { name: 'Loading', value: 8, color: '#f59e0b' },
  { name: 'Running', value: 20, color: '#3b82f6' },
  { name: 'Unloading', value: 7, color: '#8b5cf6' },
  { name: 'Completed', value: 90, color: '#10b981' },
];
const vehicleStatus = [
  { name: 'Running', value: 28, color: '#10b981' },
  { name: 'Available', value: 10, color: '#3b82f6' },
  { name: 'Workshop', value: 3, color: '#f59e0b' },
  { name: 'Breakdown', value: 2, color: '#ef4444' },
];
const topVehicles = [
  { vehicle: 'TN 01 AB 1234', revenue: 850000 },
  { vehicle: 'TN 02 CD 5678', revenue: 720000 },
  { vehicle: 'TN 03 EF 9012', revenue: 675000 },
  { vehicle: 'TN 04 GH 3456', revenue: 590000 },
  { vehicle: 'TN 05 IJ 7890', revenue: 520000 },
];
const recentTrips = [
  { id: 'TRP1256', route: 'Coimbatore → Chennai', vehicle: 'TN 01 AB 1234', status: 'In Transit', driver: 'Arun' },
  { id: 'TRP1255', route: 'Bangalore → Coimbatore', vehicle: 'TN 02 CD 5678', status: 'Loading', driver: 'Kumar' },
  { id: 'TRP1254', route: 'Hyderabad → Chennai', vehicle: 'TN 03 EF 9012', status: 'Unloading', driver: 'Ramesh' },
  { id: 'TRP1253', route: 'Mumbai → Coimbatore', vehicle: 'TN 04 GH 3456', status: 'Completed', driver: 'Suresh' },
  { id: 'TRP1252', route: 'Coimbatore → Madurai', vehicle: 'TN 05 IJ 7890', status: 'In Transit', driver: 'Vijay' },
];

const fmt = (v: number) => '₹ ' + (v >= 10000000 ? (v / 10000000).toFixed(2) + ' Cr' : v >= 100000 ? (v / 100000).toFixed(2) + ' L' : v.toLocaleString('en-IN'));

const statusColor: Record<string, string> = {
  'In Transit': 'bg-blue-100 text-blue-700',
  'Loading': 'bg-yellow-100 text-yellow-700',
  'Unloading': 'bg-purple-100 text-purple-700',
  'Completed': 'bg-green-100 text-green-700',
  'Delayed': 'bg-red-100 text-red-700',
};

export default function DashboardPage() {
  const [revenueFilter, setRevenueFilter] = useState('This Year');
  const [expenseFilter, setExpenseFilter] = useState('This Month');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Dashboard" breadcrumbs={[]} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Subtitle */}
        <p className="text-xs text-gray-500">Overview of your transport business</p>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Total Revenue', value: '₹ 85,00,000', sub: '↑ 12.5% vs Last Month', color: 'text-blue-600', icon: '₹', bg: 'bg-blue-50' },
            { label: 'Total Expenses', value: '₹ 46,20,000', sub: '↑ 8.3% vs Last Month', color: 'text-red-500', icon: '↓', bg: 'bg-red-50' },
            { label: 'Net Profit', value: '₹ 38,80,000', sub: '↑ 15.7% vs Last Month', color: 'text-green-600', icon: '📊', bg: 'bg-green-50' },
            { label: 'Active Trips', value: '35', sub: '↑ 5 vs Yesterday', color: 'text-blue-600', icon: '🚛', bg: 'bg-blue-50' },
            { label: 'Running Trucks', value: '28', sub: '↑ 3 vs Yesterday', color: 'text-blue-600', icon: '🚚', bg: 'bg-cyan-50' },
            { label: 'Drivers On Duty', value: '40', sub: '↑ 4 vs Yesterday', color: 'text-orange-500', icon: '👷', bg: 'bg-orange-50' },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] text-gray-400 mb-1">{c.label}</p>
                  <p className={`text-[18px] font-bold ${c.color}`}>{c.value}</p>
                  <p className="text-[10px] text-green-500 mt-1">{c.sub}</p>
                </div>
                <div className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center text-lg`}>{c.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Trip Status Row */}
        <div className="grid grid-cols-7 gap-2">
          {[
            { label: 'Total Trips', value: '125', sub: 'This Month' },
            { label: 'Completed Trips', value: '90', sub: 'This Month', color: 'text-green-600' },
            { label: 'Loading Trips', value: '8', sub: 'Today', color: 'text-yellow-600' },
            { label: 'In Transit', value: '20', sub: 'Today', color: 'text-blue-600' },
            { label: 'Unloading', value: '7', sub: 'Today', color: 'text-purple-600' },
            { label: 'Delayed Trips', value: '5', sub: 'Today', color: 'text-red-600' },
            { label: 'Pending POD', value: '12', sub: 'Today', color: 'text-gray-600' },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] text-gray-400 mb-1">{c.label}</p>
              <p className={`text-[20px] font-bold ${c.color || 'text-gray-800'}`}>{c.value}</p>
              <p className="text-[9px] text-gray-400">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Trip Status Donut */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Trip Status</h3>
            <div className="flex items-center gap-3">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={tripStatusData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value">
                    {tripStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-[12px] font-bold" fill="#374151">125</text>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {tripStatusData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[11px] text-gray-500">{d.name}</span>
                    <span className="text-[11px] font-semibold ml-auto">{d.value} ({Math.round(d.value / 125 * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-700">Monthly Revenue Trend</h3>
              <select value={revenueFilter} onChange={e => setRevenueFilter(e.target.value)} className="text-[10px] border border-gray-200 rounded px-1.5 py-0.5 text-gray-500">
                <option>This Year</option><option>Last Year</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={revenueData}>
                <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="month" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v: number) => ['₹ ' + (v/100000).toFixed(1) + 'L']} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#rev)" strokeWidth={2} dot={{ r: 2, fill: '#3b82f6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-700">Expense Breakdown</h3>
              <select value={expenseFilter} onChange={e => setExpenseFilter(e.target.value)} className="text-[10px] border border-gray-200 rounded px-1.5 py-0.5 text-gray-500">
                <option>This Month</option><option>Last Month</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <ResponsiveContainer width={100} height={100}>
                <PieChart>
                  <Pie data={expenseData} cx="50%" cy="50%" innerRadius={28} outerRadius={45} dataKey="value">
                    {expenseData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1">
                {expenseData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] text-gray-500">{d.name}</span>
                    <span className="text-[10px] font-semibold ml-auto">₹ {(d.value/100000).toFixed(0)}L</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Vehicle Status */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Vehicle Status</h3>
            <div className="flex items-center gap-3">
              <ResponsiveContainer width={100} height={100}>
                <PieChart>
                  <Pie data={vehicleStatus} cx="50%" cy="50%" innerRadius={28} outerRadius={45} dataKey="value">
                    {vehicleStatus.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {vehicleStatus.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[11px] text-gray-500">{d.name}</span>
                    <span className="text-[11px] font-bold ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2">50 Total Trucks</p>
          </div>

          {/* Top 5 Vehicles */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Top 5 Vehicles by Revenue</h3>
            <div className="space-y-2">
              {topVehicles.map((v) => (
                <div key={v.vehicle} className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500 w-24 truncate">{v.vehicle}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(v.revenue / 850000) * 100}%` }} />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-700 w-20 text-right">₹ {(v.revenue/100000).toFixed(2)}L</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-700">Important Alerts</h3>
              <a href="#" className="text-[10px] text-blue-600">View All</a>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Permit Expiring', value: '3 Vehicles', color: 'text-red-500' },
                { label: 'Insurance Due', value: '2 Vehicles', color: 'text-orange-500' },
                { label: 'FC Due', value: '1 Vehicle', color: 'text-yellow-600' },
                { label: 'Driver Advance Pending', value: '₹ 1,25,000', color: 'text-red-500' },
                { label: 'Customer Outstanding', value: '₹ 18,50,000', color: 'text-orange-500' },
                { label: 'Supplier Payment Due', value: '₹ 7,80,000', color: 'text-yellow-600' },
              ].map(a => (
                <div key={a.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={11} className={a.color} />
                    <span className="text-[11px] text-gray-500">{a.label}</span>
                  </div>
                  <span className={`text-[11px] font-semibold ${a.color}`}>{a.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Trips + Today Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-700">Recent Trips</h3>
              <a href="/trips" className="text-[10px] text-blue-600">View All</a>
            </div>
            <table className="w-full text-[11px]">
              <thead><tr className="text-gray-400 border-b border-gray-100">
                <th className="text-left pb-2">Trip ID</th><th className="text-left pb-2">Route</th><th className="text-left pb-2">Vehicle</th><th className="text-left pb-2">Status</th><th className="text-left pb-2">Driver</th>
              </tr></thead>
              <tbody>{recentTrips.map(t => (
                <tr key={t.id} className="border-b border-gray-50">
                  <td className="py-1.5 text-blue-600">{t.id}</td>
                  <td className="py-1.5 text-gray-600">{t.route}</td>
                  <td className="py-1.5 text-gray-600">{t.vehicle}</td>
                  <td className="py-1.5"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor[t.status]}`}>{t.status}</span></td>
                  <td className="py-1.5 text-gray-600">{t.driver}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Today's Summary (07 Jun 2026)</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Trips Started", value: "15", icon: "🚛" },
                { label: "Trips Completed", value: "8", icon: "✅" },
                { label: "Total KM Run", value: "2,850", icon: "🛣️" },
                { label: "Diesel Consumed", value: "1,250 Ltr", icon: "⛽" },
                { label: "Freight Earned", value: "₹ 5,20,000", icon: "💰" },
                { label: "Total Expenses", value: "₹ 2,85,000", icon: "📊" },
                { label: "Profit Earned", value: "₹ 2,35,000", icon: "📈" },
                { label: "Avg. Mileage", value: "3.65 kmpl", icon: "🔋" },
              ].map(s => (
                <div key={s.label} className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-lg mb-1">{s.icon}</div>
                  <div className="text-[11px] font-bold text-gray-700">{s.value}</div>
                  <div className="text-[9px] text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

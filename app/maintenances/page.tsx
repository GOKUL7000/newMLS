'use client';
import { useState } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Eye, ChevronLeft, ChevronRight, Wrench, Calendar, FileText, Package } from 'lucide-react';

const overviewData = [
  { date: '01 Jun', completed: 3, inProgress: 1, planned: 2, overdue: 0 },
  { date: '08 Jun', completed: 5, inProgress: 1, planned: 2, overdue: 1 },
  { date: '15 Jun', completed: 4, inProgress: 2, planned: 1, overdue: 0 },
  { date: '22 Jun', completed: 3, inProgress: 0, planned: 1, overdue: 1 },
  { date: '30 Jun', completed: 3, inProgress: 0, planned: 0, overdue: 0 },
];
const costByCategory = [
  { name: 'Engine & Transmission', value: 145200, pct: '37.7%', color: '#3b82f6' },
  { name: 'Tyres', value: 85450, pct: '22.2%', color: '#f59e0b' },
  { name: 'Brakes', value: 52380, pct: '13.6%', color: '#10b981' },
  { name: 'Electrical', value: 38600, pct: '10.0%', color: '#8b5cf6' },
  { name: 'Body & Cabin', value: 28750, pct: '7.5%', color: '#ef4444' },
  { name: 'Others', value: 35240, pct: '9.0%', color: '#6b7280' },
];
const dueSoon = [
  { vehicle: 'TN 01 AB 1234', type: 'Truck', due: '10 Jun 2026', service: 'Preventive Service', kmDue: 12500, status: 'Due in 3 days', statusColor: 'text-red-600' },
  { vehicle: 'TN 02 CD 5678', type: 'Truck', due: '11 Jun 2026', service: 'Oil Change', kmDue: 8000, status: 'Due in 4 days', statusColor: 'text-red-600' },
  { vehicle: 'TN 05 IJ 7890', type: 'Truck', due: '12 Jun 2026', service: 'Tyre Rotation', kmDue: 15000, status: 'Due in 5 days', statusColor: 'text-orange-600' },
  { vehicle: 'TN 07 KL 1122', type: 'Truck', due: '13 Jun 2026', service: 'Brake Inspection', kmDue: 10000, status: 'Due in 6 days', statusColor: 'text-orange-600' },
  { vehicle: 'TN 03 EF 9012', type: 'Truck', due: '14 Jun 2026', service: 'Preventive Service', kmDue: 20000, status: 'Due in 7 days', statusColor: 'text-gray-600' },
];
const activities = [
  { wo: 'WO/2026/2178', vehicle: 'TN 01 AB 1234', type: 'Preventive Service', desc: 'General Service - 10,000 KM', date: '07 Jun 2026', cost: 8450, status: 'Completed', tech: 'Manikandan' },
  { wo: 'WO/2026/2177', vehicle: 'TN 02 CD 5678', type: 'Oil Change', desc: 'Engine Oil Change', date: '07 Jun 2026', cost: 2850, status: 'Completed', tech: 'Suresh' },
  { wo: 'WO/2026/2176', vehicle: 'TN 03 EF 9012', type: 'Brake Repair', desc: 'Front Brake Pads Replacement', date: '07 Jun 2026', cost: 6720, status: 'In Progress', tech: 'Karthik' },
  { wo: 'WO/2026/2175', vehicle: 'TN 04 GH 3456', type: 'Tyre Replacement', desc: 'Replace 2 Front Tyres', date: '07 Jun 2026', cost: 11600, status: 'Completed', tech: 'Vijay' },
  { wo: 'WO/2026/2174', vehicle: 'TN 05 IJ 7890', type: 'Engine Repair', desc: 'Turbocharger Service', date: '06 Jun 2026', cost: 18950, status: 'Completed', tech: 'Ramesh' },
  { wo: 'WO/2026/2173', vehicle: 'TN 06 KL 1122', type: 'Electrical', desc: 'Battery Replacement', date: '06 Jun 2026', cost: 4200, status: 'Completed', tech: 'Selvam' },
  { wo: 'WO/2026/2172', vehicle: 'TN 07 MN 2233', type: 'Preventive Service', desc: 'General Service - 20,000 KM', date: '05 Jun 2026', cost: 9250, status: 'Completed', tech: 'Manikandan' },
  { wo: 'WO/2026/2171', vehicle: 'TN 08 OP 3344', type: 'AC Service', desc: 'AC Gas Refilling', date: '05 Jun 2026', cost: 3650, status: 'In Progress', tech: 'Suresh' },
];
const costTrend = [
  { month: 'Jan', cost: 125000 },{ month: 'Feb', cost: 198000 },{ month: 'Mar', cost: 245000 },
  { month: 'Apr', cost: 312000 },{ month: 'May', cost: 385000 },{ month: 'Jun', cost: 425000 },
];
const topVehicles = [
  { no: 'TN 01 AB 1234', cost: 185450, activities: 12 },
  { no: 'TN 05 IJ 7890', cost: 165230, activities: 11 },
  { no: 'TN 03 EF 9012', cost: 152800, activities: 10 },
  { no: 'TN 07 MN 2233', cost: 131450, activities: 9 },
  { no: 'TN 02 CD 5678', cost: 126600, activities: 8 },
];
const upcoming = [
  { vehicle: 'TN 04 GH 3456', service: 'Preventive Service', due: '09 Jun 2026', km: 18000 },
  { vehicle: 'TN 06 KL 1122', service: 'Oil Change', due: '11 Jun 2026', km: 9000 },
  { vehicle: 'TN 05 IJ 7890', service: 'Tyre Rotation', due: '12 Jun 2026', km: 16000 },
  { vehicle: 'TN 09 QR 4455', service: 'Brake Inspection', due: '13 Jun 2026', km: 14000 },
  { vehicle: 'TN 10 ST 5566', service: 'AC Service', due: '14 Jun 2026', km: 0 },
];

// Mini calendar
const calDates = Array.from({length: 30}, (_, i) => i + 1);
const scheduled = [5, 12, 18, 22, 25];
const dueD = [10, 11, 13];
const overdue = [7];

export default function MaintenancesPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ vehicle: '', type: 'Preventive Service', date: '', desc: '', cost: '', tech: '' });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Maintenance Dashboard</h1>
          <p className="text-sm text-gray-500">Dashboard / Maintenances / Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 bg-white border px-3 py-2 rounded-lg">07 Jun 2026 - 07 Jun 2026</span>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={16} /> Create Work Order
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-4">
        {[
          { label: 'Total Vehicles', value: '28', sub: 'Active Vehicles', color: 'text-blue-600' },
          { label: 'Vehicles in Service', value: '24', sub: '85.7% of Total', color: 'text-green-600' },
          { label: 'Under Maintenance', value: '3', sub: '10.7% of Total', color: 'text-orange-500' },
          { label: 'Maintenance Due Soon', value: '5', sub: 'Within 7 Days', color: 'text-red-500' },
          { label: 'Maintenance Cost (MTD)', value: '₹ 3,85,620', sub: 'This Month', color: 'text-purple-600' },
          { label: 'Maintenance Cost (YTD)', value: '₹ 28,47,360', sub: 'This Year', color: 'text-indigo-600' },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-xl font-bold text-gray-800">{c.value}</p>
            <p className={`text-xs mt-1 ${c.color}`}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Maintenance Overview */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Maintenance Overview</h3>
              <div className="flex gap-3 mt-1">
                {[{l:'Completed',v:18,c:'#10b981'},{l:'In Progress',v:4,c:'#3b82f6'},{l:'Planned',v:6,c:'#f59e0b'},{l:'Overdue',v:2,c:'#ef4444'}].map((s,i)=>(
                  <span key={i} className="text-xs flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{backgroundColor:s.c}}></span>{s.l} {s.v}</span>
                ))}
              </div>
            </div>
            <select className="text-xs border rounded px-2 py-1 text-gray-600"><option>This Month</option></select>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={overviewData}>
              <XAxis dataKey="date" tick={{fontSize:10}} tickLine={false} />
              <YAxis tick={{fontSize:10}} tickLine={false} />
              <Tooltip />
              <Line dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{r:3}} />
              <Line dataKey="inProgress" stroke="#3b82f6" strokeWidth={2} dot={{r:3}} />
              <Line dataKey="planned" stroke="#f59e0b" strokeWidth={2} dot={{r:3}} />
              <Line dataKey="overdue" stroke="#ef4444" strokeWidth={2} dot={{r:3}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cost by Category */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">Maintenance Cost by Category (This Month)</h3>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={costByCategory} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                  {costByCategory.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {costByCategory.map((c,i) => (
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
          <p className="text-center text-sm font-bold text-gray-700 mt-1">₹ 3,85,620 Total Cost</p>
        </div>

        {/* Due Soon */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Maintenance Due Soon</h3>
            <button className="text-blue-600 text-xs hover:underline">View All</button>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500 border-b">
              <th className="text-left py-1.5">Vehicle No.</th><th className="text-left py-1.5">Type</th>
              <th className="text-left py-1.5">Due Date</th><th className="text-left py-1.5">Service Type</th>
              <th className="text-right py-1.5">KM Due</th><th className="text-left py-1.5">Status</th>
            </tr></thead>
            <tbody>
              {dueSoon.map((r,i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 font-medium text-gray-800">{r.vehicle}</td>
                  <td className="py-2 text-gray-500">{r.type}</td>
                  <td className="py-2 text-gray-600">{r.due}</td>
                  <td className="py-2 text-gray-600">{r.service}</td>
                  <td className="py-2 text-right text-gray-700">{r.kmDue.toLocaleString('en-IN')}</td>
                  <td className={`py-2 font-medium ${r.statusColor}`}>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="text-blue-600 text-xs mt-2 hover:underline">View All Due Maintenance →</button>
        </div>
      </div>

      {/* Recent Activities + Status + Calendar */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Maintenance Activities</h3>
            <button className="text-blue-600 text-sm hover:underline">View All</button>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500 border-b">
              <th className="text-left py-2">Work Order No.</th><th className="text-left py-2">Vehicle No.</th>
              <th className="text-left py-2">Type</th><th className="text-left py-2">Description</th>
              <th className="text-left py-2">Date</th><th className="text-right py-2">Cost (₹)</th>
              <th className="text-left py-2">Status</th><th className="text-left py-2">Technician</th>
            </tr></thead>
            <tbody>
              {activities.map((r,i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5"><span className="text-blue-600 font-medium">{r.wo}</span></td>
                  <td className="py-2.5 text-gray-700">{r.vehicle}</td>
                  <td className="py-2.5 text-gray-600">{r.type}</td>
                  <td className="py-2.5 text-gray-600">{r.desc}</td>
                  <td className="py-2.5 text-gray-500">{r.date}</td>
                  <td className="py-2.5 text-right text-gray-700">{r.cost.toLocaleString('en-IN')}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${r.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{r.status}</span>
                  </td>
                  <td className="py-2.5 text-gray-600">{r.tech}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500">Showing 1 to 8 of 32 entries</span>
            <div className="flex gap-1">
              {[1,2,3,4].map(p => <button key={p} className={`w-7 h-7 text-xs rounded border ${p===1?'bg-blue-600 text-white border-blue-600':'text-gray-600 hover:bg-gray-50'}`}>{p}</button>)}
              <button className="w-7 h-7 text-xs border rounded text-gray-600">›</button>
            </div>
          </div>
        </div>

        {/* Status + Calendar */}
        <div className="space-y-4">
          {/* Maintenance Status */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Maintenance Status</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <ResponsiveContainer width={96} height={96}>
                  <PieChart>
                    <Pie data={[{v:24,c:'#10b981'},{v:3,c:'#f59e0b'},{v:1,c:'#ef4444'}]} cx="50%" cy="50%" innerRadius={32} outerRadius={45} dataKey="v">
                      {[{c:'#10b981'},{c:'#f59e0b'},{c:'#ef4444'}].map((e,i) => <Cell key={i} fill={e.c} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-lg font-bold text-gray-800">28</span>
                  <span className="text-xs text-gray-500">Total</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-gray-600">In Service</span><span className="font-bold text-gray-800 ml-auto">24 (85.7%)</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-400"></div><span className="text-gray-600">Under Maintenance</span><span className="font-bold text-gray-800 ml-auto">3 (10.7%)</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-gray-600">Out of Service</span><span className="font-bold text-gray-800 ml-auto">1 (3.6%)</span></div>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={14} /></button>
              <h3 className="font-semibold text-gray-800 text-sm">June 2026</h3>
              <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={14} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-center text-gray-500 font-medium py-1">{d}</div>)}
              {[null,null,null,null,null,null].slice(0,2).map((_,i) => <div key={`e${i}`}></div>)}
              {calDates.map(d => {
                const isSched = scheduled.includes(d);
                const isDue = dueD.includes(d);
                const isOver = overdue.includes(d);
                const isToday = d === 7;
                return (
                  <div key={d} className={`text-center py-1 rounded text-xs cursor-pointer
                    ${isToday ? 'bg-blue-600 text-white font-bold' :
                      isOver ? 'bg-red-500 text-white' :
                      isDue ? 'bg-orange-400 text-white' :
                      isSched ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                    {d}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 mt-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-300 inline-block"></span>Scheduled (5)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>Due Soon (3)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>Overdue (1)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-4 gap-6">
        {/* Cost Trend */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm">Maintenance Cost Trend</h3>
            <select className="text-xs border rounded px-2 py-1 text-gray-600"><option>This Year</option></select>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={costTrend}>
              <XAxis dataKey="month" tick={{fontSize:10}} tickLine={false} />
              <YAxis tick={{fontSize:10}} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip formatter={(v:any) => `₹${(v/100000).toFixed(2)}L`} />
              <Line dataKey="cost" stroke="#3b82f6" strokeWidth={2} dot={{r:3}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Vehicles */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 text-sm">Top Vehicles by Maintenance Cost (This Year)</h3>
            <button className="text-blue-600 text-xs hover:underline">View Report</button>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500 border-b"><th className="text-left py-1.5">Vehicle No.</th><th className="text-right py-1.5">Total Cost (₹)</th><th className="text-right py-1.5">Total Activities</th></tr></thead>
            <tbody>
              {topVehicles.map((r,i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 text-gray-700">{r.no}</td>
                  <td className="py-2 text-right text-gray-700">{r.cost.toLocaleString('en-IN')}</td>
                  <td className="py-2 text-right text-gray-700">{r.activities}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upcoming */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 text-sm">Upcoming Maintenance</h3>
            <button className="text-blue-600 text-xs hover:underline">View All</button>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500 border-b"><th className="text-left py-1.5">Vehicle No.</th><th className="text-left py-1.5">Service Type</th><th className="text-left py-1.5">Due Date</th><th className="text-right py-1.5">KM Due</th></tr></thead>
            <tbody>
              {upcoming.map((r,i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 text-gray-700">{r.vehicle}</td>
                  <td className="py-2 text-gray-600">{r.service}</td>
                  <td className="py-2 text-gray-600">{r.due}</td>
                  <td className="py-2 text-right text-gray-700">{r.km > 0 ? r.km.toLocaleString('en-IN') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Create Work Order', icon: Plus, color: 'text-green-600', bg: 'bg-green-50', action: () => setShowModal(true) },
              { label: 'Schedule Maintenance', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Maintenance Calendar', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Service History', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Maintenance Report', icon: FileText, color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'Parts & Inventory', icon: Package, color: 'text-teal-600', bg: 'bg-teal-50' },
            ].map((a,i) => (
              <button key={i} onClick={a.action} className={`flex items-center gap-2 ${a.bg} p-2.5 rounded-lg text-xs font-medium ${a.color} hover:opacity-80`}>
                <a.icon size={14} /> {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Create Work Order</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500 block mb-1">Vehicle No.</label>
                <select value={form.vehicle} onChange={e => setForm({...form, vehicle: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Select Vehicle</option>
                  {['TN 01 AB 1234','TN 02 CD 5678','TN 03 EF 9012','TN 04 GH 3456','TN 05 IJ 7890'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-gray-500 block mb-1">Service Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                  {['Preventive Service','Oil Change','Brake Repair','Tyre Replacement','Engine Repair','Electrical','AC Service'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-gray-500 block mb-1">Due Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Estimated Cost (₹)</label><input type="number" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} placeholder="0.00" className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="col-span-2"><label className="text-xs text-gray-500 block mb-1">Description</label><textarea value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} rows={2} placeholder="Describe the work to be done" className="w-full border rounded-lg px-3 py-2 text-sm resize-none" /></div>
              <div className="col-span-2"><label className="text-xs text-gray-500 block mb-1">Technician</label><input type="text" value={form.tech} onChange={e => setForm({...form, tech: e.target.value})} placeholder="Technician name" className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Create Work Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

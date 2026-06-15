'use client';
import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ComposedChart } from 'recharts';
import { Plus, Eye, Download, FileText, CreditCard, RotateCcw, Filter } from 'lucide-react';

const trendData = [
  { date: '01 Jun', thisMonth: 120000, lastMonth: 95000 },
  { date: '02 Jun', thisMonth: 145000, lastMonth: 110000 },
  { date: '03 Jun', thisMonth: 210000, lastMonth: 130000 },
  { date: '04 Jun', thisMonth: 85000, lastMonth: 140000 },
  { date: '05 Jun', thisMonth: 180000, lastMonth: 120000 },
  { date: '06 Jun', thisMonth: 160000, lastMonth: 95000 },
  { date: '07 Jun', thisMonth: 195000, lastMonth: 115000 },
];
const categoryData = [
  { name: 'Diesel', value: 1240000, pct: '43.1%', color: '#3b82f6' },
  { name: 'Driver Expenses', value: 680000, pct: '23.7%', color: '#10b981' },
  { name: 'Maintenance & Repair', value: 425000, pct: '14.8%', color: '#f59e0b' },
  { name: 'Toll Charges', value: 275000, pct: '9.6%', color: '#ef4444' },
  { name: 'Office Expenses', value: 185000, pct: '6.4%', color: '#8b5cf6' },
  { name: 'Other Expenses', value: 65420, pct: '2.3%', color: '#6b7280' },
];
const topCategories = [
  { name: 'Diesel', amount: 1240000 },
  { name: 'Driver Expenses', amount: 680000 },
  { name: 'Maintenance & Repair', amount: 425000 },
  { name: 'Toll Charges', amount: 275000 },
  { name: 'Office Expenses', amount: 185000 },
  { name: 'Other Expenses', amount: 65420 },
];
const expenses = [
  { id: 'EXP2026/2158', date: '07 Jun 2026', category: 'Diesel', desc: 'Diesel - TN 01 AB 1234', vendor: 'Indian Oil - Peelamedu', vehicle: 'TN 01 AB 1234', amount: 15780, mode: 'Card', status: 'Approved' },
  { id: 'EXP2026/2157', date: '07 Jun 2026', category: 'Toll Charges', desc: 'Toll - Salem to Chennai', vendor: 'FASTag', vehicle: 'TN 02 CD 5678', amount: 850, mode: 'FASTag', status: 'Approved' },
  { id: 'EXP2026/2156', date: '07 Jun 2026', category: 'Driver Expenses', desc: 'Driver Food Allowance', vendor: 'Ramesh Babu', vehicle: 'TN 03 EF 9012', amount: 1200, mode: 'Cash', status: 'Approved' },
  { id: 'EXP2026/2155', date: '06 Jun 2026', category: 'Maintenance', desc: 'Tyre Repair - Front Left', vendor: 'Sri Balaji Tyres', vehicle: 'TN 04 GH 3456', amount: 2400, mode: 'UPI', status: 'Pending' },
  { id: 'EXP2026/2154', date: '06 Jun 2026', category: 'Diesel', desc: 'Diesel - TN 05 IJ 7890', vendor: 'Bharat Petroleum', vehicle: 'TN 05 IJ 7890', amount: 16950, mode: 'Card', status: 'Approved' },
  { id: 'EXP2026/2153', date: '06 Jun 2026', category: 'Office Expenses', desc: 'Stationery Purchase', vendor: 'Office Needs', vehicle: '-', amount: 1350, mode: 'UPI', status: 'Approved' },
  { id: 'EXP2026/2152', date: '05 Jun 2026', category: 'Driver Expenses', desc: 'Night Allowance', vendor: 'Vijayakumar', vehicle: 'TN 05 IJ 7890', amount: 800, mode: 'Cash', status: 'Approved' },
  { id: 'EXP2026/2151', date: '05 Jun 2026', category: 'Toll Charges', desc: 'Toll - Coimbatore Bypass', vendor: 'FASTag', vehicle: 'TN 06 KL 1122', amount: 600, mode: 'FASTag', status: 'Approved' },
];
const byVehicle = [
  { no: 'TN 01 AB 1234', amount: 582450 },
  { no: 'TN 02 CD 5678', amount: 491200 },
  { no: 'TN 03 EF 9012', amount: 436780 },
  { no: 'TN 04 GH 3456', amount: 382600 },
  { no: 'TN 05 IJ 7890', amount: 345300 },
];
const byDriver = [
  { name: 'Arun Kumar', amount: 486500 },
  { name: 'Kumaravel', amount: 412300 },
  { name: 'Ramesh Babu', amount: 395700 },
  { name: 'Suresh', amount: 345200 },
  { name: 'Vijayakumar', amount: 321850 },
];
const recurring = [
  { expense: 'Insurance Premium', freq: 'Monthly', due: '15 Jun 2026', amount: 25000, status: 'Upcoming' },
  { expense: 'Rent - Office', freq: 'Monthly', due: '10 Jun 2026', amount: 18000, status: 'Upcoming' },
  { expense: 'GPS Subscription', freq: 'Monthly', due: '12 Jun 2026', amount: 2500, status: 'Upcoming' },
  { expense: 'Software Subscription', freq: 'Quarterly', due: '28 Jun 2026', amount: 7500, status: 'Upcoming' },
  { expense: 'PUC & Fitness', freq: 'Yearly', due: '05 Aug 2026', amount: 3000, status: 'Upcoming' },
];

const fmt = (v: number) => '₹ ' + v.toLocaleString('en-IN');
const fmtL = (v: number) => v >= 100000 ? '₹ ' + (v/100000).toFixed(2) + 'L' : fmt(v);

export default function ExpensesPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ date: '', category: '', description: '', vendor: '', vehicle: '', amount: '', mode: 'Cash', notes: '' });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
          <p className="text-sm text-gray-500">Dashboard / Expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 bg-white border px-3 py-2 rounded-lg">07 Jun 2026 - 07 Jun 2026</span>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-4">
        {[
          { label: 'Total Expenses (This Period)', value: '₹ 6,15,000', sub: '▲ 12.3% vs Last Period', color: 'text-red-500' },
          { label: 'Total Expenses (This Month)', value: '₹ 28,75,420', sub: '▲ 15.7% vs Last Month', color: 'text-red-500' },
          { label: 'Average Daily Expense', value: '₹ 95,847', sub: 'This Month', color: 'text-gray-500' },
          { label: 'Total Vendors', value: '32', sub: 'Active Vendors', color: 'text-gray-500' },
          { label: 'Pending Approvals', value: '8', sub: '₹ 1,25,600', color: 'text-orange-500' },
          { label: 'Budget (This Month)', value: '₹ 35,00,000', sub: 'Used 82.1%', color: 'text-blue-500', progress: 82.1 },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-xl font-bold text-gray-800">{c.value}</p>
            <p className={`text-xs mt-1 ${c.color}`}>{c.sub}</p>
            {c.progress && <div className="mt-2 bg-gray-200 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{width:`${c.progress}%`}}></div></div>}
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-3 gap-6">
        {/* Expense Trend */}
        <div className="col-span-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Expenses Trend</h3>
            <select className="text-xs border rounded px-2 py-1 text-gray-600"><option>This Week</option></select>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={trendData}>
              <XAxis dataKey="date" tick={{fontSize:10}} tickLine={false} />
              <YAxis tick={{fontSize:10}} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip formatter={(v:any) => fmtL(v)} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:10}} />
              <Bar dataKey="thisMonth" name="This Month (₹)" fill="#3b82f6" radius={[3,3,0,0]} />
              <Bar dataKey="lastMonth" name="Last Month (₹)" fill="#d1d5db" radius={[3,3,0,0]} />
              <Line dataKey="thisMonth" stroke="#1d4ed8" dot={{r:3}} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Expense by Category */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Expense by Category (This Month)</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">
                  {categoryData.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {categoryData.map((c,i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor:c.color}}></div>
                    <span className="text-gray-600">{c.name}</span>
                  </div>
                  <span className="font-medium text-gray-700">{c.pct}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-sm font-bold text-gray-700 mt-1">₹ 28,75,420 Total</p>
        </div>

        {/* Top Expense Categories */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Top Expense Categories (This Month)</h3>
          </div>
          <div className="space-y-3">
            {topCategories.map((c,i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">{c.name}</span>
                  <span className="font-medium text-gray-700">{fmtL(c.amount)}</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width:`${(c.amount/1240000)*100}%`}}></div>
                </div>
              </div>
            ))}
          </div>
          <button className="text-blue-600 text-xs mt-3 hover:underline">View Full Report →</button>
        </div>
      </div>

      {/* Recent Expenses Table + Summary */}
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Expenses</h3>
            <div className="flex gap-2">
              <button className="text-blue-600 text-sm hover:underline">View All Expenses →</button>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium">
                <Plus size={12} /> Add Expense
              </button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b">
                {['Date','Expense No.','Category','Description','Vendor','Vehicle / Driver','Amount (₹)','Payment Mode','Status',''].map((h,i) => (
                  <th key={i} className="text-left py-2 pr-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((e,i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 pr-3 text-xs text-gray-500">{e.date}</td>
                  <td className="py-2.5 pr-3"><span className="text-blue-600 text-xs font-medium">{e.id}</span></td>
                  <td className="py-2.5 pr-3 text-xs text-gray-700">{e.category}</td>
                  <td className="py-2.5 pr-3 text-xs text-gray-700">{e.desc}</td>
                  <td className="py-2.5 pr-3 text-xs text-gray-600">{e.vendor}</td>
                  <td className="py-2.5 pr-3 text-xs text-gray-600">{e.vehicle}</td>
                  <td className="py-2.5 pr-3 text-xs font-medium text-gray-800">{e.amount.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 pr-3 text-xs text-gray-600">{e.mode}</td>
                  <td className="py-2.5 pr-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${e.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{e.status}</span>
                  </td>
                  <td className="py-2.5"><Eye size={14} className="text-gray-400 cursor-pointer" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-500">Showing 1 to 8 of 68 entries</span>
            <div className="flex gap-1">
              {[1,2,3,4,5,'...',9].map((p,i) => (
                <button key={i} className={`w-7 h-7 text-xs rounded ${p===1?'bg-blue-600 text-white':'border text-gray-600 hover:bg-gray-50'}`}>{p}</button>
              ))}
              <button className="w-7 h-7 text-xs border rounded text-gray-600">›</button>
            </div>
          </div>
        </div>

        {/* Expense Summary */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Expense Summary (This Month)</h3>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Total Expenses', value: '₹ 28,75,420', color: 'text-gray-800' },
              { label: 'Approved', value: '₹ 24,12,350', color: 'text-green-600' },
              { label: 'Pending Approval', value: '₹ 1,25,600', color: 'text-orange-500' },
              { label: 'Rejected', value: '₹ 37,470', color: 'text-red-500' },
              { label: 'This Month Budget', value: '₹ 35,00,000', color: 'text-gray-700' },
            ].map((r,i) => (
              <div key={i} className="flex justify-between">
                <span className="text-gray-500 text-xs">{r.label}</span>
                <span className={`font-semibold text-xs ${r.color}`}>{r.value}</span>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex justify-between mb-1">
                <span className="text-gray-500 text-xs">Budget Utilization</span>
                <span className="font-semibold text-xs text-gray-800">82.1%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width:'82.1%'}}></div></div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Add Expense', icon: Plus, color: 'text-green-600', bg: 'bg-green-50', action: () => setShowModal(true) },
                { label: 'Expense Report', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Vendor Payment', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Expense Categories', icon: Filter, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Recurring Expenses', icon: RotateCcw, color: 'text-teal-600', bg: 'bg-teal-50' },
                { label: 'Export Report', icon: Download, color: 'text-red-600', bg: 'bg-red-50' },
              ].map((a,i) => (
                <button key={i} onClick={a.action} className={`flex items-center gap-2 ${a.bg} p-2.5 rounded-lg text-xs font-medium ${a.color} hover:opacity-80 transition-opacity`}>
                  <a.icon size={14} /> {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tables */}
      <div className="grid grid-cols-3 gap-6">
        {/* By Vehicle */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm">Expenses by Vehicle (This Month)</h3>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500 border-b"><th className="text-left py-2">Vehicle No.</th><th className="text-right py-2">Total Expenses (₹)</th></tr></thead>
            <tbody>
              {byVehicle.map((r,i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2.5 text-gray-700 font-medium">{r.no}</td>
                  <td className="py-2.5 text-right text-gray-700">{r.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="text-blue-600 text-xs mt-3 hover:underline">View Full Report →</button>
        </div>

        {/* By Driver */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm">Expenses by Driver (This Month)</h3>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500 border-b"><th className="text-left py-2">Driver Name</th><th className="text-right py-2">Total Expenses (₹)</th></tr></thead>
            <tbody>
              {byDriver.map((r,i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2.5 text-gray-700 font-medium">{r.name}</td>
                  <td className="py-2.5 text-right text-gray-700">{r.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="text-blue-600 text-xs mt-3 hover:underline">View Full Report →</button>
        </div>

        {/* Recurring */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm">Recurring Expenses</h3>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500 border-b"><th className="text-left py-2">Expense</th><th className="text-left py-2">Frequency</th><th className="text-left py-2">Next Due Date</th><th className="text-right py-2">Amount (₹)</th><th className="text-left py-2">Status</th></tr></thead>
            <tbody>
              {recurring.map((r,i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2.5 text-gray-700">{r.expense}</td>
                  <td className="py-2.5 text-gray-500">{r.freq}</td>
                  <td className="py-2.5 text-gray-600">{r.due}</td>
                  <td className="py-2.5 text-right text-gray-700">{r.amount.toLocaleString('en-IN')}</td>
                  <td className="py-2.5"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="text-blue-600 text-xs mt-3 hover:underline">View All Recurring Expenses →</button>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Add Expense</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500 block mb-1">Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Select Category</option>
                  {['Diesel','Driver Expenses','Maintenance & Repair','Toll Charges','Office Expenses','Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2"><label className="text-xs text-gray-500 block mb-1">Description</label><input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Expense description" className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Vendor</label><input type="text" value={form.vendor} onChange={e => setForm({...form, vendor: e.target.value})} placeholder="Vendor name" className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Vehicle No.</label><input type="text" value={form.vehicle} onChange={e => setForm({...form, vehicle: e.target.value})} placeholder="TN 01 AB 1234" className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Amount (₹)</label><input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00" className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Payment Mode</label>
                <select value={form.mode} onChange={e => setForm({...form, mode: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                  {['Cash','Card','UPI','NEFT','FASTag'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="col-span-2"><label className="text-xs text-gray-500 block mb-1">Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} placeholder="Additional notes" className="w-full border rounded-lg px-3 py-2 text-sm resize-none" /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Save Expense</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

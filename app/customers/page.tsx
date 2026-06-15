'use client';
import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Pencil, MoreHorizontal, Plus, Search, X } from 'lucide-react';

const CUSTOMERS = [
  { id: 'CUS001', name: 'ABC Steels Pvt Ltd', mobile: '98450 12345', city: 'Coimbatore', creditLimit: 1000000, outstanding: 245000, status: 'Active' },
  { id: 'CUS002', name: 'Sri Venkateshwara Traders', mobile: '97501 23456', city: 'Chennai', creditLimit: 500000, outstanding: 180000, status: 'Active' },
  { id: 'CUS003', name: 'Kaveri Industries', mobile: '99402 34567', city: 'Bangalore', creditLimit: 800000, outstanding: 320000, status: 'Active' },
  { id: 'CUS004', name: 'Sakthi Traders', mobile: '98433 45678', city: 'Madurai', creditLimit: 300000, outstanding: 75000, status: 'Active' },
  { id: 'CUS005', name: 'Global Enterprises', mobile: '97502 56789', city: 'Hyderabad', creditLimit: 750000, outstanding: 295000, status: 'Active' },
  { id: 'CUS006', name: 'Vijay Exports', mobile: '98460 67890', city: 'Coimbatore', creditLimit: 600000, outstanding: 110000, status: 'Active' },
  { id: 'CUS007', name: 'SSK Logistics', mobile: '96555 78901', city: 'Coimbatore', creditLimit: 500000, outstanding: 0, status: 'Inactive' },
  { id: 'CUS008', name: 'MJM Infra', mobile: '97919 11122', city: 'Trichy', creditLimit: 400000, outstanding: 125000, status: 'Active' },
];
const outstandingData = [
  { name: '0-30 Days', value: 625000, pct: '33.8%', color: '#10b981' },
  { name: '31-60 Days', value: 480000, pct: '25.9%', color: '#3b82f6' },
  { name: '61-90 Days', value: 320000, pct: '17.3%', color: '#f59e0b' },
  { name: 'Above 90 Days', value: 425000, pct: '23.0%', color: '#ef4444' },
];
const paymentsTrend = Array.from({length: 30}, (_, i) => ({
  day: i + 1,
  amount: 200000 + Math.random() * 600000,
}));
const topCustomers = [
  { name: 'ABC Steels Pvt Ltd', amount: 1250000 },
  { name: 'Kaveri Industries', amount: 980000 },
  { name: 'Sri Venkateshwara Traders', amount: 875000 },
  { name: 'Global Enterprises', amount: 720000 },
  { name: 'Sakthi Traders', amount: 610000 },
];
const recentPayments = [
  { date: '07 Jun 2026', customer: 'ABC Steels Pvt Ltd', amount: 125000, mode: 'NEFT', invoice: 'INV/2026/068' },
  { date: '06 Jun 2026', customer: 'Kaveri Industries', amount: 95000, mode: 'NEFT', invoice: 'INV/2026/067' },
  { date: '06 Jun 2026', customer: 'Sri Venkateshwara Traders', amount: 80000, mode: 'RTGS', invoice: 'INV/2026/066' },
  { date: '05 Jun 2026', customer: 'Global Enterprises', amount: 110000, mode: 'NEFT', invoice: 'INV/2026/065' },
  { date: '04 Jun 2026', customer: 'Sakthi Traders', amount: 70000, mode: 'Cash', invoice: 'INV/2026/064' },
];
const ledger = [
  { name: 'ABC Steels Pvt Ltd', invoices: 2550000, received: 2305000, outstanding: 245000, creditLimit: 1000000, lastTxn: '07 Jun 2026', status: 'Active' },
  { name: 'Kaveri Industries', invoices: 1820000, received: 1500000, outstanding: 320000, creditLimit: 800000, lastTxn: '06 Jun 2026', status: 'Active' },
  { name: 'Sri Venkateshwara Traders', invoices: 1675000, received: 1495000, outstanding: 180000, creditLimit: 500000, lastTxn: '06 Jun 2026', status: 'Active' },
  { name: 'Global Enterprises', invoices: 1240000, received: 945000, outstanding: 295000, creditLimit: 750000, lastTxn: '05 Jun 2026', status: 'Active' },
  { name: 'Sakthi Traders', invoices: 875000, received: 800000, outstanding: 75000, creditLimit: 300000, lastTxn: '04 Jun 2026', status: 'Active' },
];

const fmtINR = (v: number) => '₹ ' + v.toLocaleString('en-IN');

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', city: '', creditLimit: '', email: '', address: '' });

  const filtered = CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Customers" breadcrumbs={[{ label: 'Customers' }]} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Total Customers', value: '156', sub: 'All Customers', color: 'text-blue-600' },
            { label: 'Active Customers', value: '132', sub: '84.6% of Total', color: 'text-green-600' },
            { label: 'Outstanding Amount', value: '₹ 18,50,000', sub: 'From 38 Customers', color: 'text-orange-500' },
            { label: 'Received This Month', value: '₹ 28,75,000', sub: 'From 45 Customers', color: 'text-green-600' },
            { label: 'Invoices This Month', value: '68', sub: 'Total Invoices', color: 'text-blue-600' },
            { label: 'Revenue This Month', value: '₹ 85,00,000', sub: 'Total Revenue', color: 'text-green-600' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400">{c.label}</p>
              <p className={`text-[17px] font-bold ${c.color} mt-1`}>{c.value}</p>
              <p className="text-[10px] text-gray-400">{c.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {/* Table */}
          <div className="col-span-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-700">All Customers</h3>
              <div className="flex items-center gap-2">
                <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Customer Name, Mobile, City..." className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] w-60 focus:outline-none"/></div>
                <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11px]"><option>All Status</option><option>Active</option><option>Inactive</option></select>
                <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11px]"><option>All Cities</option><option>Coimbatore</option><option>Chennai</option><option>Bangalore</option></select>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-[#1a56db] text-white px-3 py-1.5 rounded-lg text-[11px] font-medium hover:bg-blue-700"><Plus size={12}/> Add Customer</button>
              </div>
            </div>
            <table className="w-full text-[11px]">
              <thead><tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="text-left px-2 py-2">Customer ID</th><th className="text-left px-2 py-2">Customer Name</th>
                <th className="text-left px-2 py-2">Mobile</th><th className="text-left px-2 py-2">City</th>
                <th className="text-right px-2 py-2">Credit Limit (₹)</th><th className="text-right px-2 py-2">Outstanding (₹)</th>
                <th className="text-left px-2 py-2">Status</th><th className="text-left px-2 py-2">Actions</th>
              </tr></thead>
              <tbody>{filtered.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-2 py-2 text-blue-600 font-medium">{c.id}</td>
                  <td className="px-2 py-2 font-medium text-gray-700">{c.name}</td>
                  <td className="px-2 py-2 text-gray-500">{c.mobile}</td>
                  <td className="px-2 py-2 text-gray-500">{c.city}</td>
                  <td className="px-2 py-2 text-right text-gray-600">{c.creditLimit.toLocaleString('en-IN')}</td>
                  <td className="px-2 py-2 text-right font-medium text-orange-600">{c.outstanding.toLocaleString('en-IN')}</td>
                  <td className="px-2 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{c.status}</span></td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1">
                      <button className="text-gray-400 hover:text-blue-600"><Eye size={12}/></button>
                      <button className="text-gray-400 hover:text-green-600"><Pencil size={12}/></button>
                      <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={12}/></button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
            <div className="flex items-center justify-between mt-3">
              <p className="text-[11px] text-gray-400">Showing 1 to 8 of 156 entries</p>
              <div className="flex gap-1">{[1,2,3,4,5,'...',20].map((p,i)=><button key={i} className={`w-6 h-6 text-[10px] rounded ${p===1?'bg-blue-600 text-white':'text-gray-500 hover:bg-gray-100'}`}>{p}</button>)}</div>
            </div>
          </div>

          {/* Outstanding Donut */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-2">Outstanding Summary</h3>
            <div className="relative"><ResponsiveContainer width="100%" height={130}><PieChart><Pie data={outstandingData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value">{outstandingData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart></ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col"><p className="text-[15px] font-bold text-gray-800">₹ 18,50,000</p><p className="text-[9px] text-gray-400">Total Outstanding</p></div></div>
            <div className="space-y-1.5 mt-1">
              {outstandingData.map(d => (<div key={d.name} className="flex items-center gap-1.5 text-[10px]"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:d.color}}/><span className="flex-1 text-gray-500">{d.name}</span><span className="font-semibold">₹ {(d.value/100000).toFixed(2)}L ({d.pct})</span></div>))}
            </div>
            <a href="#" className="text-[10px] text-blue-600 block mt-2">View Outstanding Report →</a>
          </div>
        </div>

        {/* Charts + Recent Payments */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Top Customers by Revenue (This Month)</h3>
            <div className="space-y-2">
              {topCustomers.map(c => (
                <div key={c.name} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 w-28 truncate">{c.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width:`${c.amount/1250000*100}%`}}/></div>
                  <span className="text-[10px] font-semibold text-gray-700 w-20 text-right">₹ {(c.amount/100000).toFixed(2)}L</span>
                </div>
              ))}
            </div>
            <a href="#" className="text-[10px] text-blue-600 block mt-3">View Full Report →</a>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3"><h3 className="text-[13px] font-semibold text-gray-700">Payments Received (This Month)</h3><a href="#" className="text-[10px] text-blue-600">View Report →</a></div>
            <ResponsiveContainer width="100%" height={130}>
              <LineChart data={paymentsTrend.filter((_,i)=>i%5===0)}>
                <XAxis dataKey="day" tick={{fontSize:9}} axisLine={false} tickLine={false}/>
                <YAxis hide/><Tooltip formatter={(v:number) => ['₹ ' + (v/100000).toFixed(1) + 'L']}/>
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={{r:2}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3"><h3 className="text-[13px] font-semibold text-gray-700">Recent Payments</h3><a href="#" className="text-[10px] text-blue-600">View All Payments →</a></div>
            <table className="w-full text-[11px]">
              <thead><tr className="text-gray-400 border-b border-gray-100"><th className="text-left pb-2">Date</th><th className="text-left pb-2">Customer</th><th className="text-right pb-2">Amount (₹)</th><th className="text-left pb-2">Mode</th><th className="text-left pb-2">Invoice No.</th></tr></thead>
              <tbody>{recentPayments.map((p,i) => (<tr key={i} className="border-b border-gray-50"><td className="py-1.5 text-gray-500">{p.date}</td><td className="py-1.5 text-gray-600 text-[10px]">{p.customer}</td><td className="py-1.5 text-right font-medium">₹ {p.amount.toLocaleString('en-IN')}</td><td className="py-1.5 text-gray-500">{p.mode}</td><td className="py-1.5 text-blue-600">{p.invoice}</td></tr>))}</tbody>
            </table>
          </div>
        </div>

        {/* Ledger Summary */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3"><h3 className="text-[13px] font-semibold text-gray-700">Customer Ledger Summary</h3><a href="#" className="text-[10px] text-blue-600">View Full Ledger Report →</a></div>
          <table className="w-full text-[11px]">
            <thead><tr className="text-gray-400 border-b border-gray-100"><th className="text-left py-2">Customer Name</th><th className="text-right py-2">Total Invoices (₹)</th><th className="text-right py-2">Total Received (₹)</th><th className="text-right py-2">Outstanding (₹)</th><th className="text-right py-2">Credit Limit (₹)</th><th className="text-left py-2">Last Transaction</th><th className="text-left py-2">Status</th></tr></thead>
            <tbody>{ledger.map(r => (<tr key={r.name} className="border-b border-gray-50"><td className="py-2 text-gray-700">{r.name}</td><td className="py-2 text-right text-gray-600">{r.invoices.toLocaleString('en-IN')}</td><td className="py-2 text-right text-gray-600">{r.received.toLocaleString('en-IN')}</td><td className="py-2 text-right text-orange-500 font-medium">{r.outstanding.toLocaleString('en-IN')}</td><td className="py-2 text-right text-gray-600">{r.creditLimit.toLocaleString('en-IN')}</td><td className="py-2 text-gray-500">{r.lastTxn}</td><td className="py-2"><span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">{r.status}</span></td></tr>))}</tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-6 gap-3">
            {[{label:'Add New Customer',icon:'➕',color:'text-green-600'},{label:'Create Invoice',icon:'📄',color:'text-blue-600'},{label:'Receive Payment',icon:'💰',color:'text-green-600'},{label:'Customer Ledger',icon:'📋',color:'text-purple-600'},{label:'Outstanding Report',icon:'📊',color:'text-orange-600'},{label:'Customer Statement',icon:'📑',color:'text-red-600'}].map(a=>(
              <button key={a.label} className={`flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-[11px] ${a.color}`}>{a.icon} {a.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[460px] p-5">
            <div className="flex items-center justify-between mb-4"><h3 className="text-[14px] font-bold text-gray-800">Add New Customer</h3><button onClick={()=>setShowModal(false)}><X size={16} className="text-gray-400"/></button></div>
            <div className="grid grid-cols-2 gap-3">
              {[['Customer Name','name','text'],['Mobile','mobile','text'],['City','city','text'],['Credit Limit','creditLimit','text'],['Email','email','email'],['Address','address','text']].map(([l,k,t])=>(
                <div key={k as string} className={k==='address'?'col-span-2':''}><label className="text-[11px] text-gray-500 block mb-1">{l}</label><input type={t} value={(form as any)[k as string]} onChange={e=>setForm({...form,[k as string]:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400"/></div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>setShowModal(false)} className="flex-1 bg-[#1a56db] text-white py-2 rounded-lg text-[12px] font-medium">Add Customer</button>
              <button onClick={()=>setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-[12px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

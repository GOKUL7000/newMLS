'use client';
import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Pencil, MoreHorizontal, Plus, Search, X } from 'lucide-react';

const SUPPLIERS = [
  { id: 'SUP001', name: 'Indian Oil - Peelamedu', mobile: '98450 11111', city: 'Coimbatore', type: 'Fuel', creditLimit: 500000, outstanding: 185000, status: 'Active' },
  { id: 'SUP002', name: 'Bharat Petroleum - Avinashi Rd', mobile: '97501 22222', city: 'Coimbatore', type: 'Fuel', creditLimit: 400000, outstanding: 120000, status: 'Active' },
  { id: 'SUP003', name: 'Shell - Coimbatore', mobile: '99402 33333', city: 'Coimbatore', type: 'Fuel', creditLimit: 300000, outstanding: 90000, status: 'Active' },
  { id: 'SUP004', name: 'Sri Balaji Tyres', mobile: '98433 44444', city: 'Coimbatore', type: 'Tyres', creditLimit: 200000, outstanding: 45000, status: 'Active' },
  { id: 'SUP005', name: 'Ashok Leyland Service', mobile: '97502 55555', city: 'Chennai', type: 'Maintenance', creditLimit: 250000, outstanding: 75000, status: 'Active' },
  { id: 'SUP006', name: 'Tata Motors Workshop', mobile: '98460 66666', city: 'Coimbatore', type: 'Maintenance', creditLimit: 200000, outstanding: 30000, status: 'Active' },
  { id: 'SUP007', name: 'National Insurance Co', mobile: '96555 77777', city: 'Coimbatore', type: 'Insurance', creditLimit: 100000, outstanding: 0, status: 'Active' },
  { id: 'SUP008', name: 'Sundaram Finance', mobile: '97919 88888', city: 'Coimbatore', type: 'Finance', creditLimit: 500000, outstanding: 220000, status: 'Active' },
];
const payablesData = [
  { name: '0-30 Days', value: 275000, pct: '36.9%', color: '#10b981' },
  { name: '31-60 Days', value: 190000, pct: '25.5%', color: '#3b82f6' },
  { name: '61-90 Days', value: 150000, pct: '20.1%', color: '#f59e0b' },
  { name: 'Above 90 Days', value: 130000, pct: '17.5%', color: '#ef4444' },
];
const paymentsTrend = Array.from({length: 30}, (_, i) => ({day: i+1, amount: 50000 + Math.random() * 200000}));
const topSuppliers = [
  { name: 'Indian Oil - Peelamedu', amount: 392500 },
  { name: 'Bharat Petroleum', amount: 314000 },
  { name: 'Shell - Coimbatore', amount: 230000 },
  { name: 'Sri Balaji Tyres', amount: 85000 },
  { name: 'Ashok Leyland Service', amount: 65000 },
];
const upcomingPayments = [
  { supplier: 'Indian Oil - Peelamedu', amount: 45000, due: '10 Jun 2026', type: 'Diesel', status: 'Due Soon' },
  { supplier: 'Bharat Petroleum', amount: 32000, due: '12 Jun 2026', type: 'Diesel', status: 'Due Soon' },
  { supplier: 'Sri Balaji Tyres', amount: 18000, due: '15 Jun 2026', type: 'Tyres', status: 'Upcoming' },
  { supplier: 'Ashok Leyland Service', amount: 25000, due: '18 Jun 2026', type: 'Maintenance', status: 'Upcoming' },
];

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', city: '', type: 'Fuel', creditLimit: '', email: '' });

  const filtered = SUPPLIERS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Suppliers" breadcrumbs={[{ label: 'Suppliers' }]} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Total Suppliers', value: '48', sub: 'All Suppliers', color: 'text-blue-600' },
            { label: 'Active Suppliers', value: '42', sub: '87.5% of Total', color: 'text-green-600' },
            { label: 'Total Payable', value: '₹ 8,80,000', sub: 'From 18 Suppliers', color: 'text-red-500' },
            { label: 'Paid This Month', value: '₹ 12,45,000', sub: 'To 22 Suppliers', color: 'text-green-600' },
            { label: 'Invoices This Month', value: '45', sub: 'Total Bills', color: 'text-blue-600' },
            { label: 'Spend This Month', value: '₹ 28,75,000', sub: 'Total Spend', color: 'text-orange-500' },
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
              <h3 className="text-[13px] font-semibold text-gray-700">All Suppliers</h3>
              <div className="flex items-center gap-2">
                <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Supplier Name, ID, City..." className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] w-60 focus:outline-none"/></div>
                <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11px]"><option>All Types</option><option>Fuel</option><option>Tyres</option><option>Maintenance</option><option>Insurance</option></select>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-[#1a56db] text-white px-3 py-1.5 rounded-lg text-[11px] font-medium hover:bg-blue-700"><Plus size={12}/> Add Supplier</button>
              </div>
            </div>
            <table className="w-full text-[11px]">
              <thead><tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="text-left px-2 py-2">Supplier ID</th><th className="text-left px-2 py-2">Supplier Name</th>
                <th className="text-left px-2 py-2">Mobile</th><th className="text-left px-2 py-2">City</th><th className="text-left px-2 py-2">Type</th>
                <th className="text-right px-2 py-2">Credit Limit (₹)</th><th className="text-right px-2 py-2">Outstanding (₹)</th>
                <th className="text-left px-2 py-2">Status</th><th className="text-left px-2 py-2">Actions</th>
              </tr></thead>
              <tbody>{filtered.map(s => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-2 py-2 text-blue-600 font-medium">{s.id}</td>
                  <td className="px-2 py-2 font-medium text-gray-700">{s.name}</td>
                  <td className="px-2 py-2 text-gray-500">{s.mobile}</td>
                  <td className="px-2 py-2 text-gray-500">{s.city}</td>
                  <td className="px-2 py-2"><span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px]">{s.type}</span></td>
                  <td className="px-2 py-2 text-right text-gray-600">{s.creditLimit.toLocaleString('en-IN')}</td>
                  <td className="px-2 py-2 text-right font-medium text-red-500">{s.outstanding.toLocaleString('en-IN')}</td>
                  <td className="px-2 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${s.status==='Active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{s.status}</span></td>
                  <td className="px-2 py-2"><div className="flex gap-1"><button className="text-gray-400 hover:text-blue-600"><Eye size={12}/></button><button className="text-gray-400 hover:text-green-600"><Pencil size={12}/></button><button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={12}/></button></div></td>
                </tr>
              ))}</tbody>
            </table>
            <div className="flex items-center justify-between mt-3">
              <p className="text-[11px] text-gray-400">Showing 1 to 8 of 48 entries</p>
              <div className="flex gap-1">{[1,2,3,4,5,6].map(p=><button key={p} className={`w-6 h-6 text-[10px] rounded ${p===1?'bg-blue-600 text-white':'text-gray-500 hover:bg-gray-100'}`}>{p}</button>)}</div>
            </div>
          </div>

          {/* Payables Donut */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-2">Payables Summary</h3>
            <div className="relative"><ResponsiveContainer width="100%" height={120}><PieChart><Pie data={payablesData} cx="50%" cy="50%" innerRadius={32} outerRadius={52} dataKey="value">{payablesData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart></ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col"><p className="text-[13px] font-bold text-gray-800">₹ 8,80,000</p><p className="text-[9px] text-gray-400">Total Payable</p></div></div>
            <div className="space-y-1.5 mt-1">
              {payablesData.map(d=>(<div key={d.name} className="flex items-center gap-1.5 text-[10px]"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:d.color}}/><span className="flex-1 text-gray-500">{d.name}</span><span className="font-semibold">₹ {(d.value/100000).toFixed(2)}L ({d.pct})</span></div>))}
            </div>
            <a href="#" className="text-[10px] text-blue-600 block mt-2">View Payables Report →</a>
          </div>
        </div>

        {/* Charts + Upcoming Payments */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Top Suppliers by Spend (This Month)</h3>
            {topSuppliers.map(s => (<div key={s.name} className="flex items-center gap-2 mb-2"><span className="text-[10px] text-gray-500 w-28 truncate">{s.name}</span><div className="flex-1 bg-gray-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width:`${s.amount/392500*100}%`}}/></div><span className="text-[10px] font-semibold text-gray-700 w-20 text-right">₹ {(s.amount/100000).toFixed(2)}L</span></div>))}
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3"><h3 className="text-[13px] font-semibold text-gray-700">Payments Made (This Month)</h3></div>
            <ResponsiveContainer width="100%" height={120}><LineChart data={paymentsTrend.filter((_,i)=>i%5===0)}><XAxis dataKey="day" tick={{fontSize:9}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip/><Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} dot={{r:2}}/></LineChart></ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3"><h3 className="text-[13px] font-semibold text-gray-700">Upcoming Payments</h3><a href="#" className="text-[10px] text-blue-600">View All →</a></div>
            {upcomingPayments.map(p=>(<div key={p.supplier} className="flex justify-between items-center border-b border-gray-50 py-1.5 last:border-0">
              <div><p className="text-[11px] text-gray-700">{p.supplier}</p><p className="text-[10px] text-gray-400">{p.type} · Due {p.due}</p></div>
              <div className="text-right"><p className="text-[11px] font-semibold text-red-500">₹ {p.amount.toLocaleString('en-IN')}</p><span className={`text-[9px] px-1.5 py-0.5 rounded ${p.status==='Due Soon'?'bg-red-100 text-red-600':'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></div>
            </div>))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-6 gap-3">
            {[{label:'Add Supplier',icon:'➕'},{label:'Make Payment',icon:'💰'},{label:'Supplier Ledger',icon:'📋'},{label:'Payables Report',icon:'📊'},{label:'Record Bill',icon:'📄'},{label:'Supplier Statement',icon:'📑'}].map(a=>(
              <button key={a.label} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-[11px] text-blue-600">{a.icon} {a.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[460px] p-5">
            <div className="flex items-center justify-between mb-4"><h3 className="text-[14px] font-bold text-gray-800">Add New Supplier</h3><button onClick={()=>setShowModal(false)}><X size={16} className="text-gray-400"/></button></div>
            <div className="grid grid-cols-2 gap-3">
              {[['Supplier Name','name'],['Mobile','mobile'],['City','city'],['Credit Limit','creditLimit'],['Email','email']].map(([l,k])=>(
                <div key={k}><label className="text-[11px] text-gray-500 block mb-1">{l}</label><input value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400"/></div>
              ))}
              <div><label className="text-[11px] text-gray-500 block mb-1">Type</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px]"><option>Fuel</option><option>Tyres</option><option>Maintenance</option><option>Insurance</option><option>Finance</option></select></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>setShowModal(false)} className="flex-1 bg-[#1a56db] text-white py-2 rounded-lg text-[12px] font-medium">Add Supplier</button>
              <button onClick={()=>setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-[12px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

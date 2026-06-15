'use client';
import { useState } from 'react';
import { Search, Plus, Download, Eye, Edit } from 'lucide-react';
export default function Page() {
  const [search, setSearch] = useState('');
  const titles: Record<string,string> = { all:'All Expenses', categories:'Expense Categories', 'vendor-payments':'Vendor Payments', recurring:'Recurring Expenses', reports:'Expense Reports' };
  const title = titles['all'] || 'all';
  const rows = [
    { a: 'EXP2026/2158', b: '07 Jun 2026', c: 'Diesel', d: 'TN 01 AB 1234', e: '₹ 15,780', f: 'Approved' },
    { a: 'EXP2026/2157', b: '07 Jun 2026', c: 'Toll Charges', d: 'TN 02 CD 5678', e: '₹ 850', f: 'Approved' },
    { a: 'EXP2026/2156', b: '07 Jun 2026', c: 'Driver Expenses', d: 'TN 03 EF 9012', e: '₹ 1,200', f: 'Approved' },
    { a: 'EXP2026/2155', b: '06 Jun 2026', c: 'Maintenance', d: 'TN 04 GH 3456', e: '₹ 2,400', f: 'Pending' },
    { a: 'EXP2026/2154', b: '06 Jun 2026', c: 'Diesel', d: 'TN 05 IJ 7890', e: '₹ 16,950', f: 'Approved' },
    { a: 'EXP2026/2153', b: '05 Jun 2026', c: 'Office Expenses', d: '-', e: '₹ 1,350', f: 'Approved' },
  ];
  const filtered = rows.filter(r => r.a.includes(search) || r.c.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-800">{title}</h1><p className="text-sm text-gray-500">Dashboard / Expenses / {title}</p></div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus size={15}/> Add</button>
          <button className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-white"><Download size={15}/> Export</button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Total Records',v:'68',c:'text-blue-600'},{l:'Total Amount',v:'₹ 28,75,420',c:'text-orange-500'},{l:'Approved',v:'60',c:'text-green-600'},{l:'Pending',v:'8',c:'text-red-500'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-xl font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-52 focus:outline-none"/></div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-500 border-b">{['Expense No.','Date','Category','Vehicle / Driver','Amount','Status',''].map((h,i)=><th key={i} className="text-left py-3 pr-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>{filtered.map((r,i)=>(
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3 pr-3 text-xs text-blue-600 font-medium">{r.a}</td>
              <td className="py-3 pr-3 text-xs text-gray-500">{r.b}</td>
              <td className="py-3 pr-3 text-xs text-gray-700">{r.c}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{r.d}</td>
              <td className="py-3 pr-3 text-xs font-bold text-gray-800">{r.e}</td>
              <td className="py-3 pr-3"><span className={`text-xs px-2 py-0.5 rounded-full ${r.f==='Approved'?'bg-green-100 text-green-700':'bg-orange-100 text-orange-700'}`}>{r.f}</span></td>
              <td className="py-3"><div className="flex gap-1"><button className="p-1 hover:bg-gray-100 rounded text-gray-400"><Eye size={13}/></button><button className="p-1 hover:bg-gray-100 rounded text-gray-400"><Edit size={13}/></button></div></td>
            </tr>
          ))}</tbody>
        </table>
        <p className="text-xs text-gray-400 mt-3">Showing {filtered.length} of {rows.length} entries</p>
      </div>
    </div>
  );
}

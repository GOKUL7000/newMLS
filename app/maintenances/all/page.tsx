'use client';
import { useState } from 'react';
import { Search, Plus, Download, Eye, Edit } from 'lucide-react';
export default function Page() {
  const [search, setSearch] = useState('');
  const titles: Record<string,string> = { all:'All Maintenances', preventive:'Preventive Maintenance', 'work-orders':'Work Orders', 'service-history':'Service History', calendar:'Maintenance Calendar', reports:'Maintenance Reports' };
  const title = titles['all'] || 'all';
  const rows = [
    { a: 'WO/2026/2178', b: 'TN 01 AB 1234', c: 'Preventive Service', d: '07 Jun 2026', e: '₹ 8,450', f: 'Completed', g: 'Manikandan' },
    { a: 'WO/2026/2177', b: 'TN 02 CD 5678', c: 'Oil Change', d: '07 Jun 2026', e: '₹ 2,850', f: 'Completed', g: 'Suresh' },
    { a: 'WO/2026/2176', b: 'TN 03 EF 9012', c: 'Brake Repair', d: '07 Jun 2026', e: '₹ 6,720', f: 'In Progress', g: 'Karthik' },
    { a: 'WO/2026/2175', b: 'TN 04 GH 3456', c: 'Tyre Replacement', d: '07 Jun 2026', e: '₹ 11,600', f: 'Completed', g: 'Vijay' },
    { a: 'WO/2026/2174', b: 'TN 05 IJ 7890', c: 'Engine Repair', d: '06 Jun 2026', e: '₹ 18,950', f: 'Completed', g: 'Ramesh' },
    { a: 'WO/2026/2173', b: 'TN 06 KL 1122', c: 'Electrical', d: '06 Jun 2026', e: '₹ 4,200', f: 'Completed', g: 'Selvam' },
    { a: 'WO/2026/2172', b: 'TN 07 MN 2233', c: 'Preventive Service', d: '05 Jun 2026', e: '₹ 9,250', f: 'Completed', g: 'Manikandan' },
  ];
  const filtered = rows.filter(r => r.a.includes(search) || r.b.includes(search) || r.c.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-800">{title}</h1><p className="text-sm text-gray-500">Dashboard / Maintenances / {title}</p></div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus size={15}/> Create Work Order</button>
          <button className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-white"><Download size={15}/> Export</button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Total Records',v:'32',c:'text-blue-600'},{l:'Total Cost (MTD)',v:'₹ 3,85,620',c:'text-orange-500'},{l:'Completed',v:'28',c:'text-green-600'},{l:'In Progress',v:'4',c:'text-blue-500'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-xl font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-52 focus:outline-none"/></div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-500 border-b">{['Work Order No.','Vehicle No.','Type','Date','Cost','Status','Technician',''].map((h,i)=><th key={i} className="text-left py-3 pr-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>{filtered.map((r,i)=>(
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3 pr-3 text-xs text-blue-600 font-medium">{r.a}</td>
              <td className="py-3 pr-3 text-xs font-medium text-gray-800">{r.b}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{r.c}</td>
              <td className="py-3 pr-3 text-xs text-gray-500">{r.d}</td>
              <td className="py-3 pr-3 text-xs font-bold text-gray-800">{r.e}</td>
              <td className="py-3 pr-3"><span className={`text-xs px-2 py-0.5 rounded-full ${r.f==='Completed'?'bg-green-100 text-green-700':'bg-blue-100 text-blue-700'}`}>{r.f}</span></td>
              <td className="py-3 pr-3 text-xs text-gray-600">{r.g}</td>
              <td className="py-3"><div className="flex gap-1"><button className="p-1 hover:bg-gray-100 rounded text-gray-400"><Eye size={13}/></button><button className="p-1 hover:bg-gray-100 rounded text-gray-400"><Edit size={13}/></button></div></td>
            </tr>
          ))}</tbody>
        </table>
        <p className="text-xs text-gray-400 mt-3">Showing {filtered.length} of {rows.length} entries</p>
      </div>
    </div>
  );
}

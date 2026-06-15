'use client';
import { useState } from 'react';
import { Search, AlertTriangle, Eye } from 'lucide-react';
const vehicles = [
  { no: 'TN 01 AB 1234', brand: 'Tata Motors', driver: 'Arun Kumar', dueDate: '10 Jun 2026', daysLeft: 3, amount: 8500, status: 'Critical' },
  { no: 'TN 05 IJ 7890', brand: 'Tata Motors', driver: 'Vijayakumar', dueDate: '12 Jun 2026', daysLeft: 5, amount: 12000, status: 'Critical' },
  { no: 'TN 02 CD 5678', brand: 'Ashok Leyland', driver: 'Kumaravel', dueDate: '14 Jun 2026', daysLeft: 7, amount: 9500, status: 'Due Soon' },
  { no: 'TN 07 MN 2233', brand: 'BharatBenz', driver: 'Selvam', dueDate: '20 Jun 2026', daysLeft: 13, amount: 11000, status: 'Due Soon' },
  { no: 'TN 04 GH 3456', brand: 'BharatBenz', driver: 'Suresh', dueDate: '28 Jun 2026', daysLeft: 21, amount: 9800, status: 'Upcoming' },
  { no: 'TN 09 QR 4455', brand: 'Tata Motors', driver: 'Murugan', dueDate: '05 Jul 2026', daysLeft: 28, amount: 8200, status: 'Upcoming' },
];
export default function Page() {
  const [search, setSearch] = useState('');
  const filtered = vehicles.filter(v => v.no.toLowerCase().includes(search.toLowerCase()) || v.driver.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div><h1 className="text-2xl font-bold text-gray-800">FC (Fitness) Due</h1><p className="text-sm text-gray-500">Dashboard / Fleet / FC (Fitness) Due</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Critical (≤7 Days)',v:'2',c:'text-red-500'},{l:'Due Soon (8-30 Days)',v:'4',c:'text-orange-500'},{l:'Upcoming (>30 Days)',v:'22',c:'text-green-600'},{l:'Total Vehicles',v:'28',c:'text-blue-600'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{c.l}</p>
            <p className={`text-2xl font-bold ${c.c}`}>{c.v}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">FC (Fitness) Due — All Vehicles</h3>
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-52 focus:outline-none"/></div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-500 border-b">{['Vehicle No.','Brand','Driver','FC Due Date','Days Left','Est. Cost (₹)','Status',''].map((h,i)=><th key={i} className="text-left py-3 pr-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>{filtered.map((v,i)=>(
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3 pr-3 text-xs font-bold text-gray-800">{v.no}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{v.brand}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{v.driver}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{v.dueDate}</td>
              <td className="py-3 pr-3">
                <div className="flex items-center gap-1">
                  {v.daysLeft <= 7 && <AlertTriangle size={12} className="text-red-500"/>}
                  <span className={`text-xs font-medium ${v.daysLeft<=7?'text-red-600':v.daysLeft<=14?'text-orange-500':'text-gray-600'}`}>{v.daysLeft} days</span>
                </div>
              </td>
              <td className="py-3 pr-3 text-xs text-gray-700">{v.amount.toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3"><span className={`text-xs px-2 py-0.5 rounded-full ${v.status==='Critical'?'bg-red-100 text-red-700':v.status==='Due Soon'?'bg-orange-100 text-orange-700':'bg-green-100 text-green-700'}`}>{v.status}</span></td>
              <td className="py-3"><button className="p-1 hover:bg-gray-100 rounded text-gray-400"><Eye size={13}/></button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

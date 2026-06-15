'use client';
import { useState } from 'react';
import { Search, Download, Eye, Filter } from 'lucide-react';
const trips = [
  { id: 'TRP1230', from: 'Coimbatore', to: 'Chennai', vehicle: 'TN 01 AB 1234', driver: 'Arun Kumar', date: '01 Jun 2026', freight: 125000, expense: 82000, profit: 43000, km: 510, status: 'Completed' },
  { id: 'TRP1231', from: 'Bangalore', to: 'Coimbatore', vehicle: 'TN 02 CD 5678', driver: 'Kumaravel', date: '02 Jun 2026', freight: 98000, expense: 65000, profit: 33000, km: 360, status: 'Completed' },
  { id: 'TRP1232', from: 'Chennai', to: 'Hyderabad', vehicle: 'TN 03 EF 9012', driver: 'Ramesh Babu', date: '02 Jun 2026', freight: 145000, expense: 96000, profit: 49000, km: 630, status: 'Completed' },
  { id: 'TRP1233', from: 'Coimbatore', to: 'Mumbai', vehicle: 'TN 04 GH 3456', driver: 'Suresh', date: '03 Jun 2026', freight: 210000, expense: 138000, profit: 72000, km: 1150, status: 'Completed' },
  { id: 'TRP1234', from: 'Madurai', to: 'Bangalore', vehicle: 'TN 05 IJ 7890', driver: 'Vijayakumar', date: '03 Jun 2026', freight: 88000, expense: 58000, profit: 30000, km: 440, status: 'Completed' },
  { id: 'TRP1235', from: 'Coimbatore', to: 'Trichy', vehicle: 'TN 06 KL 1122', driver: 'Prakash', date: '04 Jun 2026', freight: 65000, expense: 42000, profit: 23000, km: 210, status: 'Cancelled' },
  { id: 'TRP1236', from: 'Chennai', to: 'Coimbatore', vehicle: 'TN 07 MN 2233', driver: 'Selvam', date: '05 Jun 2026', freight: 112000, expense: 74000, profit: 38000, km: 510, status: 'Completed' },
  { id: 'TRP1237', from: 'Hyderabad', to: 'Chennai', vehicle: 'TN 08 OP 3344', driver: 'Dinesh', date: '05 Jun 2026', freight: 168000, expense: 110000, profit: 58000, km: 630, status: 'Completed' },
];
export default function Page() {
  const [search, setSearch] = useState('');
  const filtered = trips.filter(t => t.id.includes(search) || t.driver.toLowerCase().includes(search.toLowerCase()) || t.vehicle.toLowerCase().includes(search.toLowerCase()));
  const totalFreight = filtered.reduce((s,t)=>s+t.freight,0);
  const totalProfit = filtered.reduce((s,t)=>s+t.profit,0);
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-800">Trip History</h1><p className="text-sm text-gray-500">Dashboard / Trips / Trip History</p></div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Download size={15}/> Export</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Total Trips (MTD)',v:'128',c:'text-blue-600'},{l:'Completed',v:'113',c:'text-green-600'},{l:'Cancelled',v:'4',c:'text-red-500'},{l:'Total Revenue (MTD)',v:'₹ 63,42,000',c:'text-purple-600'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-xl font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Trip History</h3>
          <div className="flex gap-2">
            <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-48 focus:outline-none"/></div>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-500 border-b">{['Trip ID','Route','Vehicle','Driver','Date','Freight (₹)','Expense (₹)','Profit (₹)','KM','Status',''].map((h,i)=><th key={i} className="text-left py-3 pr-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>{filtered.map((t,i)=>(
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3 pr-3 text-xs text-blue-600 font-medium">{t.id}</td>
              <td className="py-3 pr-3 text-xs text-gray-700">{t.from} → {t.to}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{t.vehicle}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{t.driver}</td>
              <td className="py-3 pr-3 text-xs text-gray-500">{t.date}</td>
              <td className="py-3 pr-3 text-xs font-medium text-gray-800">{t.freight.toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-xs text-red-500">{t.expense.toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-xs font-medium text-green-600">{t.profit.toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{t.km}</td>
              <td className="py-3 pr-3"><span className={`text-xs px-2 py-0.5 rounded-full ${t.status==='Completed'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{t.status}</span></td>
              <td className="py-3"><button className="p-1 hover:bg-gray-100 rounded text-gray-400"><Eye size={13}/></button></td>
            </tr>
          ))}</tbody>
          <tfoot><tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold">
            <td colSpan={5} className="py-3 pr-3 text-sm text-gray-700">Total ({filtered.length} trips)</td>
            <td className="py-3 pr-3 text-xs text-gray-800">{totalFreight.toLocaleString('en-IN')}</td>
            <td className="py-3 pr-3 text-xs text-red-500">{filtered.reduce((s,t)=>s+t.expense,0).toLocaleString('en-IN')}</td>
            <td className="py-3 pr-3 text-xs text-green-600">{totalProfit.toLocaleString('en-IN')}</td>
            <td colSpan={3}></td>
          </tr></tfoot>
        </table>
      </div>
    </div>
  );
}

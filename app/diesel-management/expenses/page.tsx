'use client';
import { useState } from 'react';
import { Search, Download } from 'lucide-react';
const records = [
  { id: 'DIS/2026/0445', date: '07 Jun 2026', vehicle: 'TN 01 AB 1234', qty: 180, rate: 96.40, amount: 17352, pump: 'Company Pump', km: 510, mileage: 2.83, trip: 'TRP1256' },
  { id: 'DIS/2026/0444', date: '07 Jun 2026', vehicle: 'TN 02 CD 5678', qty: 150, rate: 96.40, amount: 14460, pump: 'Indian Oil', km: 360, mileage: 2.40, trip: 'TRP1255' },
  { id: 'DIS/2026/0443', date: '07 Jun 2026', vehicle: 'TN 03 EF 9012', qty: 200, rate: 96.40, amount: 19280, pump: 'Company Pump', km: 630, mileage: 3.15, trip: 'TRP1254' },
  { id: 'DIS/2026/0442', date: '06 Jun 2026', vehicle: 'TN 04 GH 3456', qty: 160, rate: 96.40, amount: 15424, pump: 'Bharat Petroleum', km: 440, mileage: 2.75, trip: 'TRP1253' },
  { id: 'DIS/2026/0441', date: '06 Jun 2026', vehicle: 'TN 05 IJ 7890', qty: 190, rate: 96.40, amount: 18316, pump: 'Company Pump', km: 580, mileage: 3.05, trip: 'TRP1252' },
];
export default function Page() {
  const [search, setSearch] = useState('');
  const filtered = records.filter(r => r.vehicle.includes(search));
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-800">Diesel Expenses</h1><p className="text-sm text-gray-500">Dashboard / Diesel Management / Diesel Expenses</p></div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Download size={15}/> Export</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Total Diesel Expense (MTD)',v:'₹ 24,87,000',c:'text-orange-500'},{l:'Total Qty (MTD)',v:'25,800 Ltrs',c:'text-blue-600'},{l:'Avg Rate (₹/Ltr)',v:'₹ 96.40',c:'text-gray-700'},{l:'Diesel % of Total Expenses',v:'43.1%',c:'text-red-500'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-xl font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Diesel Expense Records</h3>
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vehicle..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-48 focus:outline-none"/></div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-500 border-b"><th className="text-left py-3 pr-3">Ref No.</th><th className="text-left py-3 pr-3">Date</th><th className="text-left py-3 pr-3">Vehicle</th><th className="text-right py-3 pr-3">Qty (Ltrs)</th><th className="text-right py-3 pr-3">Rate (₹)</th><th className="text-right py-3 pr-3">Amount (₹)</th><th className="text-left py-3 pr-3">Pump</th><th className="text-right py-3 pr-3">KM</th><th className="text-right py-3 pr-3">Mileage (km/L)</th><th className="text-left py-3">Trip</th></tr></thead>
          <tbody>{filtered.map((r,i)=>(
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3 pr-3 text-xs text-blue-600 font-medium">{r.id}</td>
              <td className="py-3 pr-3 text-xs text-gray-500">{r.date}</td>
              <td className="py-3 pr-3 text-xs font-medium text-gray-800">{r.vehicle}</td>
              <td className="py-3 pr-3 text-right text-xs text-gray-700">{r.qty}</td>
              <td className="py-3 pr-3 text-right text-xs text-gray-600">{r.rate}</td>
              <td className="py-3 pr-3 text-right text-xs font-bold text-gray-800">{r.amount.toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{r.pump}</td>
              <td className="py-3 pr-3 text-right text-xs text-gray-600">{r.km}</td>
              <td className="py-3 pr-3 text-right text-xs font-medium text-green-600">{r.mileage}</td>
              <td className="py-3 text-xs text-blue-500">{r.trip}</td>
            </tr>
          ))}</tbody>
          <tfoot><tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold text-sm">
            <td colSpan={3} className="py-3 pr-3 text-gray-700">Total</td>
            <td className="py-3 pr-3 text-right text-xs text-gray-800">{filtered.reduce((s,r)=>s+r.qty,0)}</td>
            <td className="py-3 pr-3"></td>
            <td className="py-3 pr-3 text-right text-xs text-gray-800">{filtered.reduce((s,r)=>s+r.amount,0).toLocaleString('en-IN')}</td>
            <td colSpan={4}></td>
          </tr></tfoot>
        </table>
      </div>
    </div>
  );
}

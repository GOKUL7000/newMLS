'use client';
import { useState } from 'react';
import { Search, Plus, Download, Eye } from 'lucide-react';
const records = [
  { id: 'DIS/2026/0445', date: '07 Jun 2026', vehicle: 'TN 01 AB 1234', driver: 'Arun Kumar', qty: 180, rate: 96.40, amount: 17352, pump: 'Company Pump', trip: 'TRP1256', odometer: 128450 },
  { id: 'DIS/2026/0444', date: '07 Jun 2026', vehicle: 'TN 02 CD 5678', driver: 'Kumaravel', qty: 150, rate: 96.40, amount: 14460, pump: 'Indian Oil', trip: 'TRP1255', odometer: 145200 },
  { id: 'DIS/2026/0443', date: '07 Jun 2026', vehicle: 'TN 03 EF 9012', driver: 'Ramesh Babu', qty: 200, rate: 96.40, amount: 19280, pump: 'Company Pump', trip: 'TRP1254', odometer: 98600 },
  { id: 'DIS/2026/0442', date: '06 Jun 2026', vehicle: 'TN 04 GH 3456', driver: 'Suresh', qty: 160, rate: 96.40, amount: 15424, pump: 'Bharat Petroleum', trip: 'TRP1253', odometer: 112300 },
  { id: 'DIS/2026/0441', date: '06 Jun 2026', vehicle: 'TN 05 IJ 7890', driver: 'Vijayakumar', qty: 190, rate: 96.40, amount: 18316, pump: 'Company Pump', trip: 'TRP1252', odometer: 198500 },
  { id: 'DIS/2026/0440', date: '05 Jun 2026', vehicle: 'TN 06 KL 1122', driver: 'Prakash', qty: 140, rate: 96.40, amount: 13496, pump: 'Indian Oil', trip: 'TRP1251', odometer: 76400 },
];
export default function Page() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const filtered = records.filter(r => r.vehicle.includes(search) || r.driver.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-800">Diesel Issuance</h1><p className="text-sm text-gray-500">Dashboard / Diesel Management / Diesel Issuance</p></div>
        <div className="flex gap-2">
          <button onClick={()=>setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus size={15}/> Issue Diesel</button>
          <button className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-white"><Download size={15}/> Export</button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Total Issuances (Today)',v:'18',c:'text-blue-600'},{l:'Total Qty (Today)',v:'2,840 Ltrs',c:'text-gray-700'},{l:'Total Amount (Today)',v:'₹ 2,73,776',c:'text-orange-500'},{l:'Avg per Vehicle',v:'157 Ltrs',c:'text-green-600'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-xl font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Diesel Issuance Records</h3>
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-52 focus:outline-none"/></div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-500 border-b"><th className="text-left py-3 pr-3">Issuance No.</th><th className="text-left py-3 pr-3">Date</th><th className="text-left py-3 pr-3">Vehicle</th><th className="text-left py-3 pr-3">Driver</th><th className="text-right py-3 pr-3">Qty (Ltrs)</th><th className="text-right py-3 pr-3">Rate (₹)</th><th className="text-right py-3 pr-3">Amount (₹)</th><th className="text-left py-3 pr-3">Pump</th><th className="text-left py-3 pr-3">Trip</th><th className="text-right py-3">Odometer</th></tr></thead>
          <tbody>{filtered.map((r,i)=>(
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3 pr-3 text-xs text-blue-600 font-medium">{r.id}</td>
              <td className="py-3 pr-3 text-xs text-gray-500">{r.date}</td>
              <td className="py-3 pr-3 text-xs font-medium text-gray-800">{r.vehicle}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{r.driver}</td>
              <td className="py-3 pr-3 text-right text-xs font-bold text-gray-800">{r.qty}</td>
              <td className="py-3 pr-3 text-right text-xs text-gray-600">{r.rate}</td>
              <td className="py-3 pr-3 text-right text-xs font-medium text-gray-800">{r.amount.toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{r.pump}</td>
              <td className="py-3 pr-3 text-xs text-blue-500">{r.trip}</td>
              <td className="py-3 text-right text-xs text-gray-600">{r.odometer.toLocaleString('en-IN')}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Issue Diesel</h2>
            <div className="grid grid-cols-2 gap-4">
              {[['Date','date'],['Vehicle No.','text'],['Driver','text'],['Pump/Source','text'],['Quantity (Ltrs)','number'],['Rate (₹/Ltr)','number'],['Trip ID','text'],['Odometer Reading','number']].map(([l,t],i)=>(
                <div key={i}><label className="text-xs text-gray-500 block mb-1">{l}</label><input type={t} placeholder={l} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"/></div>
              ))}
            </div>
            <div className="flex gap-3 mt-5"><button onClick={()=>setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm">Cancel</button><button onClick={()=>setShowModal(false)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useState } from 'react';
import { Search, Plus, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
const records = [
  { id: 'REC/2026/0088', date: '07 Jun 2026', qty: 5000, type: 'Receipt', supplier: 'Indian Oil - Peelamedu', rate: 91.20, amount: 456000, balance: 12850 },
  { id: 'ISS/2026/0120', date: '07 Jun 2026', qty: -1820, type: 'Issuance', supplier: 'Vehicle Fleet', rate: 96.40, amount: 175448, balance: 11030 },
  { id: 'REC/2026/0087', date: '06 Jun 2026', qty: 3000, type: 'Receipt', supplier: 'Bharat Petroleum', rate: 91.20, amount: 273600, balance: 12850 },
  { id: 'ISS/2026/0119', date: '06 Jun 2026', qty: -1650, type: 'Issuance', supplier: 'Vehicle Fleet', rate: 96.40, amount: 159060, balance: 9850 },
  { id: 'REC/2026/0086', date: '05 Jun 2026', qty: 4000, type: 'Receipt', supplier: 'Indian Oil - Peelamedu', rate: 91.20, amount: 364800, balance: 11500 },
  { id: 'ISS/2026/0118', date: '05 Jun 2026', qty: -1980, type: 'Issuance', supplier: 'Vehicle Fleet', rate: 96.40, amount: 190872, balance: 7500 },
];
const trendData = [
  {date:'01 Jun',stock:9500},{date:'02 Jun',stock:7200},{date:'03 Jun',stock:11000},{date:'04 Jun',stock:8650},
  {date:'05 Jun',stock:11500},{date:'06 Jun',stock:12850},{date:'07 Jun',stock:11030},
];
export default function Page() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const filtered = records.filter(r => r.id.includes(search) || r.supplier.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-800">Diesel Stock</h1><p className="text-sm text-gray-500">Dashboard / Diesel Management / Diesel Stock</p></div>
        <button onClick={()=>setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus size={15}/> Receive Stock</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Current Stock',v:'11,030 Ltrs',c:'text-blue-600'},{l:'Tank Capacity',v:'20,000 Ltrs',c:'text-gray-700'},{l:'Days Remaining',v:'3.1 Days',c:'text-orange-500'},{l:'Last Received',v:'07 Jun 2026',c:'text-green-600'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-xl font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-800">Stock Ledger</h3><div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-48 focus:outline-none"/></div></div>
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-500 border-b"><th className="text-left py-3 pr-3">Ref No.</th><th className="text-left py-3 pr-3">Date</th><th className="text-left py-3 pr-3">Type</th><th className="text-left py-3 pr-3">Supplier/Purpose</th><th className="text-right py-3 pr-3">Qty (Ltrs)</th><th className="text-right py-3 pr-3">Amount (₹)</th><th className="text-right py-3">Balance (Ltrs)</th></tr></thead>
            <tbody>{filtered.map((r,i)=>(
              <tr key={i} className={`border-b border-gray-50 hover:bg-gray-50 ${r.type==='Receipt'?'bg-green-50/30':''}`}>
                <td className="py-3 pr-3 text-xs text-blue-600 font-medium">{r.id}</td>
                <td className="py-3 pr-3 text-xs text-gray-500">{r.date}</td>
                <td className="py-3 pr-3"><span className={`text-xs px-2 py-0.5 rounded-full ${r.type==='Receipt'?'bg-green-100 text-green-700':'bg-orange-100 text-orange-700'}`}>{r.type}</span></td>
                <td className="py-3 pr-3 text-xs text-gray-600">{r.supplier}</td>
                <td className={`py-3 pr-3 text-right text-xs font-bold ${r.qty>0?'text-green-600':'text-orange-500'}`}>{r.qty>0?'+':''}{r.qty}</td>
                <td className="py-3 pr-3 text-right text-xs text-gray-700">{r.amount.toLocaleString('en-IN')}</td>
                <td className="py-3 text-right text-xs font-bold text-gray-800">{r.balance.toLocaleString('en-IN')}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Stock Level Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <XAxis dataKey="date" tick={{fontSize:10}} tickLine={false}/>
              <YAxis tick={{fontSize:10}} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
              <Tooltip formatter={(v:any)=>`${v.toLocaleString('en-IN')} Ltrs`}/>
              <Line dataKey="stock" stroke="#3b82f6" strokeWidth={2} dot={{r:3}}/>
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Tank Capacity</span><span className="font-medium">20,000 Ltrs</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Current Stock</span><span className="font-medium text-blue-600">11,030 Ltrs</span></div>
            <div className="bg-gray-100 rounded-full h-2 mt-2"><div className="bg-blue-500 h-2 rounded-full" style={{width:'55.2%'}}></div></div>
            <p className="text-gray-400 text-right">55.2% of capacity</p>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Receive Diesel Stock</h2>
            <div className="space-y-3">
              {[['Date','date'],['Supplier','text'],['Quantity (Ltrs)','number'],['Rate (₹/Ltr)','number'],['Invoice No.','text'],['Vehicle (Tanker)','text']].map(([l,t],i)=>(
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

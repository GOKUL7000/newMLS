'use client';
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
const entries = [
  { id: 'CTR/2026/020', date: '07 Jun 2026', from: 'Cash in Hand', to: 'HDFC Bank - Current', amount: 75000, desc: 'Cash deposited to bank', by: 'Admin' },
  { id: 'CTR/2026/019', date: '06 Jun 2026', from: 'HDFC Bank - Current', to: 'Cash in Hand', amount: 30000, desc: 'Cash withdrawn for petty expenses', by: 'Admin' },
  { id: 'CTR/2026/018', date: '05 Jun 2026', from: 'SBI - Current', to: 'HDFC Bank - Current', amount: 200000, desc: 'Fund transfer between accounts', by: 'Admin' },
  { id: 'CTR/2026/017', date: '04 Jun 2026', from: 'Cash in Hand', to: 'HDFC Bank - Current', amount: 50000, desc: 'Cash deposited to bank', by: 'Admin' },
  { id: 'CTR/2026/016', date: '03 Jun 2026', from: 'HDFC Bank - Current', to: 'Petty Cash', amount: 15000, desc: 'Petty cash replenishment', by: 'Admin' },
];
export default function ContraEntriesPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const filtered = entries.filter(e => e.id.includes(search) || e.desc.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-800">Contra Entries</h1><p className="text-sm text-gray-500">Dashboard / Accounts / Contra Entries</p></div>
        <button onClick={()=>setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus size={15}/> New Contra Entry</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Total Contra (MTD)',v:'20',c:'text-blue-600'},{l:'Total Amount (MTD)',v:'₹ 8,45,000',c:'text-gray-800'},{l:'Cash → Bank (MTD)',v:'₹ 4,25,000',c:'text-green-600'},{l:'Bank → Cash (MTD)',v:'₹ 2,20,000',c:'text-orange-500'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-xl font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Contra Entries</h3>
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-52 focus:outline-none"/></div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-500 border-b"><th className="text-left py-3 pr-3">Contra No.</th><th className="text-left py-3 pr-3">Date</th><th className="text-left py-3 pr-3">From Account</th><th className="text-left py-3 pr-3">To Account</th><th className="text-right py-3 pr-3">Amount (₹)</th><th className="text-left py-3 pr-3">Description</th><th className="text-left py-3">Created By</th></tr></thead>
          <tbody>{filtered.map((e,i)=>(
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3 pr-3 text-xs text-blue-600 font-medium">{e.id}</td>
              <td className="py-3 pr-3 text-xs text-gray-500">{e.date}</td>
              <td className="py-3 pr-3 text-xs text-red-500">{e.from}</td>
              <td className="py-3 pr-3 text-xs text-green-600">{e.to}</td>
              <td className="py-3 pr-3 text-right text-xs font-bold text-gray-800">{e.amount.toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{e.desc}</td>
              <td className="py-3 text-xs text-gray-500">{e.by}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">New Contra Entry</h2>
            <div className="space-y-3">
              {[['Date','date'],['From Account','select'],['To Account','select'],['Amount (₹)','number'],['Description','text']].map(([l,t],i)=>(
                <div key={i}><label className="text-xs text-gray-500 block mb-1">{l}</label>
                  {t==='select'?<select className="w-full border rounded-lg px-3 py-2 text-sm"><option>HDFC Bank - Current</option><option>SBI - Current</option><option>Cash in Hand</option><option>Petty Cash</option></select>
                  :<input type={t} placeholder={l} className="w-full border rounded-lg px-3 py-2 text-sm"/>}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={()=>setShowModal(false)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

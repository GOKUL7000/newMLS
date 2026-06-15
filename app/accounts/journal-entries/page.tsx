'use client';
import { useState } from 'react';
import { Plus, Search, Eye } from 'lucide-react';
const entries = [
  { id: 'JNL/2026/0245', date: '07 Jun 2026', desc: 'Payment received from ABC Steels Pvt Ltd', debitAcc: 'HDFC Bank A/c', creditAcc: 'ABC Steels Pvt Ltd (Debtor)', amount: 125000, ref: 'RCT/2026/125', type: 'Receipt' },
  { id: 'JNL/2026/0244', date: '07 Jun 2026', desc: 'Diesel purchase from Indian Oil', debitAcc: 'Diesel Expense A/c', creditAcc: 'Indian Oil - Peelamedu (Creditor)', amount: 125320, ref: 'PUR/2026/158', type: 'Purchase' },
  { id: 'JNL/2026/0243', date: '06 Jun 2026', desc: 'Payment received from Kaveri Industries', debitAcc: 'SBI A/c', creditAcc: 'Kaveri Industries (Debtor)', amount: 200000, ref: 'RCT/2026/124', type: 'Receipt' },
  { id: 'JNL/2026/0242', date: '06 Jun 2026', desc: 'Tyre purchase - Sri Balaji Tyres', debitAcc: 'Tyre Expense A/c', creditAcc: 'Sri Balaji Tyres (Creditor)', amount: 120000, ref: 'PUR/2026/150', type: 'Purchase' },
  { id: 'JNL/2026/0241', date: '05 Jun 2026', desc: 'Driver salaries - June 2026', debitAcc: 'Driver Salary Expense A/c', creditAcc: 'Cash in Hand', amount: 285000, ref: 'SAL/2026/006', type: 'Payment' },
  { id: 'JNL/2026/0240', date: '05 Jun 2026', desc: 'Freight income - TRP1250', debitAcc: 'ABC Steels Pvt Ltd (Debtor)', creditAcc: 'Freight Income A/c', amount: 210000, ref: 'INV/2026/079', type: 'Invoice' },
];
const typeColor: Record<string,string> = { Receipt:'bg-green-100 text-green-700', Purchase:'bg-red-100 text-red-700', Payment:'bg-orange-100 text-orange-700', Invoice:'bg-blue-100 text-blue-700' };
export default function JournalEntriesPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const filtered = entries.filter(e => e.id.includes(search) || e.desc.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-800">Journal Entries</h1><p className="text-sm text-gray-500">Dashboard / Accounts / Journal Entries</p></div>
        <button onClick={()=>setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus size={15}/> New Journal Entry</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Total Entries (MTD)',v:'245',c:'text-blue-600'},{l:'Total Debit',v:'₹ 48,52,000',c:'text-red-500'},{l:'Total Credit',v:'₹ 48,52,000',c:'text-green-600'},{l:'Manual Entries',v:'28',c:'text-purple-600'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-xl font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Journal Entries</h3>
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search entries..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-52 focus:outline-none"/></div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-500 border-b"><th className="text-left py-3 pr-3">Journal No.</th><th className="text-left py-3 pr-3">Date</th><th className="text-left py-3 pr-3">Description</th><th className="text-left py-3 pr-3">Debit Account</th><th className="text-left py-3 pr-3">Credit Account</th><th className="text-right py-3 pr-3">Amount (₹)</th><th className="text-left py-3 pr-3">Type</th><th className="text-left py-3">Ref.</th></tr></thead>
          <tbody>{filtered.map((e,i)=>(
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3 pr-3 text-xs text-blue-600 font-medium">{e.id}</td>
              <td className="py-3 pr-3 text-xs text-gray-500">{e.date}</td>
              <td className="py-3 pr-3 text-xs text-gray-700 max-w-[160px] truncate">{e.desc}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{e.debitAcc}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{e.creditAcc}</td>
              <td className="py-3 pr-3 text-right text-xs font-bold text-gray-800">{e.amount.toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3"><span className={`text-xs px-2 py-0.5 rounded-full ${typeColor[e.type]}`}>{e.type}</span></td>
              <td className="py-3 text-xs text-blue-500">{e.ref}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">New Journal Entry</h2>
            <div className="grid grid-cols-2 gap-4">
              {[['Date','date'],['Reference No.','text'],['Debit Account','text'],['Credit Account','text'],['Amount (₹)','number'],['Description','text']].map(([l,t],i)=>(
                <div key={i} className={t==='text'&&l==='Description'?'col-span-2':''}>
                  <label className="text-xs text-gray-500 block mb-1">{l}</label>
                  <input type={t} placeholder={l} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"/>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={()=>setShowModal(false)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">Save Entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

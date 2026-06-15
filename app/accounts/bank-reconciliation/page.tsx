'use client';
import { useState } from 'react';
import { CheckCircle, XCircle, Search } from 'lucide-react';
const transactions = [
  { date: '07 Jun 2026', desc: 'NEFT - ABC Steels Pvt Ltd', ref: 'NEFT2026060712345', bookAmount: 125000, bankAmount: 125000, matched: true },
  { date: '07 Jun 2026', desc: 'Diesel Payment - Indian Oil', ref: 'NEFT2026060798765', bookAmount: 150000, bankAmount: 150000, matched: true },
  { date: '06 Jun 2026', desc: 'NEFT - Kaveri Industries', ref: 'NEFT2026060654321', bookAmount: 200000, bankAmount: 200000, matched: true },
  { date: '05 Jun 2026', desc: 'Cheque - Sri Balaji Tyres', ref: 'CHQ-001245', bookAmount: 120000, bankAmount: 0, matched: false },
  { date: '05 Jun 2026', desc: 'NEFT - Global Enterprises', ref: 'NEFT2026060543210', bookAmount: 150000, bankAmount: 150000, matched: true },
  { date: '04 Jun 2026', desc: 'Salary Transfer', ref: 'NEFT2026060498765', bookAmount: 285000, bankAmount: 285000, matched: true },
  { date: '04 Jun 2026', desc: 'Bank Charges', ref: 'BNK2026060401', bookAmount: 0, bankAmount: 590, matched: false },
  { date: '03 Jun 2026', desc: 'RTGS - Kaveri Industries', ref: 'RTGS2026060398765', bookAmount: 250000, bankAmount: 250000, matched: true },
];
export default function BankReconciliationPage() {
  const [search, setSearch] = useState('');
  const filtered = transactions.filter(t => t.desc.toLowerCase().includes(search.toLowerCase()) || t.ref.includes(search));
  const matched = filtered.filter(t=>t.matched).length;
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div><h1 className="text-2xl font-bold text-gray-800">Bank Reconciliation</h1><p className="text-sm text-gray-500">Dashboard / Accounts / Bank Reconciliation</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Book Balance (HDFC)',v:'₹ 12,45,680',c:'text-blue-600'},{l:'Bank Statement Balance',v:'₹ 12,25,090',c:'text-gray-800'},{l:'Unreconciled Items',v:'2',c:'text-orange-500'},{l:'Difference',v:'₹ 20,590',c:'text-red-500'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-xl font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800">Reconciliation - HDFC Bank - Current</h3>
            <p className="text-xs text-gray-400 mt-0.5">{matched} of {filtered.length} transactions matched</p>
          </div>
          <div className="flex gap-2">
            <select className="border rounded-lg px-3 py-2 text-sm text-gray-600"><option>HDFC Bank - Current</option><option>SBI - Current</option></select>
            <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-48 focus:outline-none"/></div>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-500 border-b"><th className="text-left py-3 pr-3">Date</th><th className="text-left py-3 pr-3">Description</th><th className="text-left py-3 pr-3">Reference</th><th className="text-right py-3 pr-3">Book Amount (₹)</th><th className="text-right py-3 pr-3">Bank Amount (₹)</th><th className="text-center py-3">Matched</th></tr></thead>
          <tbody>{filtered.map((t,i)=>(
            <tr key={i} className={`border-b border-gray-50 hover:bg-gray-50 ${!t.matched?'bg-orange-50/40':''}`}>
              <td className="py-3 pr-3 text-xs text-gray-500">{t.date}</td>
              <td className="py-3 pr-3 text-xs text-gray-700">{t.desc}</td>
              <td className="py-3 pr-3 text-xs text-blue-600">{t.ref}</td>
              <td className="py-3 pr-3 text-right text-xs text-gray-800">{t.bookAmount>0?t.bookAmount.toLocaleString('en-IN'):'-'}</td>
              <td className="py-3 pr-3 text-right text-xs text-gray-800">{t.bankAmount>0?t.bankAmount.toLocaleString('en-IN'):'-'}</td>
              <td className="py-3 text-center">{t.matched?<CheckCircle size={15} className="text-green-500 mx-auto"/>:<XCircle size={15} className="text-orange-500 mx-auto"/>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { Plus, Search, ChevronRight } from 'lucide-react';
const accounts = [
  { code: '1000', name: 'Assets', type: 'Group', balance: 8542000, children: [
    { code: '1100', name: 'Current Assets', type: 'Group', balance: 5028800, children: [
      { code: '1110', name: 'HDFC Bank - Current', type: 'Bank', balance: 1245680 },
      { code: '1111', name: 'SBI - Current', type: 'Bank', balance: 845200 },
      { code: '1112', name: 'ICICI Bank - Savings', type: 'Bank', balance: 325000 },
      { code: '1120', name: 'Cash in Hand', type: 'Cash', balance: 85420 },
      { code: '1121', name: 'Petty Cash', type: 'Cash', balance: 12500 },
      { code: '1130', name: 'Accounts Receivable', type: 'Receivable', balance: 1596000 },
    ]},
    { code: '1200', name: 'Fixed Assets', type: 'Group', balance: 3513200 },
  ]},
  { code: '2000', name: 'Liabilities', type: 'Group', balance: 2108000, children: [
    { code: '2100', name: 'Current Liabilities', type: 'Group', balance: 1554000, children: [
      { code: '2110', name: 'Accounts Payable', type: 'Payable', balance: 1554000 },
    ]},
  ]},
  { code: '3000', name: 'Equity', type: 'Group', balance: 6434000 },
  { code: '4000', name: 'Income', type: 'Group', balance: 6342000, children: [
    { code: '4100', name: 'Freight Income', type: 'Income', balance: 6342000 },
  ]},
  { code: '5000', name: 'Expenses', type: 'Group', balance: 5102000, children: [
    { code: '5100', name: 'Diesel Expense', type: 'Expense', balance: 2487000 },
    { code: '5200', name: 'Driver Expenses', type: 'Expense', balance: 985000 },
    { code: '5300', name: 'Maintenance Expense', type: 'Expense', balance: 385620 },
    { code: '5400', name: 'Toll Charges', type: 'Expense', balance: 520000 },
    { code: '5500', name: 'Office Expenses', type: 'Expense', balance: 124000 },
    { code: '5600', name: 'Other Expenses', type: 'Expense', balance: 600380 },
  ]},
];
const typeColor: Record<string,string> = { Group:'bg-gray-100 text-gray-600', Bank:'bg-blue-100 text-blue-700', Cash:'bg-green-100 text-green-700', Receivable:'bg-teal-100 text-teal-700', Payable:'bg-red-100 text-red-700', Income:'bg-purple-100 text-purple-700', Expense:'bg-orange-100 text-orange-700' };
const flatList = (accs: any[], depth=0): any[] => accs.flatMap(a => [{ ...a, depth }, ...(a.children ? flatList(a.children, depth+1) : [])]);
export default function ChartOfAccountsPage() {
  const [search, setSearch] = useState('');
  const flat = flatList(accounts);
  const filtered = flat.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search));
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-800">Chart of Accounts</h1><p className="text-sm text-gray-500">Dashboard / Accounts / Chart of Accounts</p></div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus size={15}/> Add Account</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Total Accounts',v:'28',c:'text-blue-600'},{l:'Total Assets',v:'₹ 85,42,000',c:'text-green-600'},{l:'Total Liabilities',v:'₹ 21,08,000',c:'text-red-500'},{l:'Net Worth',v:'₹ 64,34,000',c:'text-purple-600'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-xl font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Chart of Accounts</h3>
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search accounts..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-52 focus:outline-none"/></div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-500 border-b"><th className="text-left py-3 pr-3">Account Code</th><th className="text-left py-3 pr-3">Account Name</th><th className="text-left py-3 pr-3">Type</th><th className="text-right py-3">Balance (₹)</th></tr></thead>
          <tbody>{filtered.map((a,i)=>(
            <tr key={i} className={`border-b border-gray-50 hover:bg-gray-50 ${a.type==='Group'?'bg-gray-50/60':''}`}>
              <td className="py-2.5 pr-3 text-xs font-mono text-gray-600" style={{paddingLeft:`${a.depth*16+12}px`}}>{a.code}</td>
              <td className="py-2.5 pr-3" style={{paddingLeft:`${a.depth*16+12}px`}}>
                <div className="flex items-center gap-1">
                  {a.type==='Group'&&<ChevronRight size={12} className="text-gray-400"/>}
                  <span className={`text-xs ${a.type==='Group'?'font-semibold text-gray-800':'text-gray-700'}`}>{a.name}</span>
                </div>
              </td>
              <td className="py-2.5 pr-3"><span className={`text-xs px-2 py-0.5 rounded-full ${typeColor[a.type]||'bg-gray-100 text-gray-600'}`}>{a.type}</span></td>
              <td className={`py-2.5 text-right text-xs ${a.type==='Group'?'font-bold text-gray-800':'text-gray-700'}`}>{a.balance.toLocaleString('en-IN')}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Eye, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const accounts = [
  { name: 'HDFC Bank - Current', no: 'XXXX 4521', balance: 1245680, type: 'Bank', lastTxn: '07 Jun 2026' },
  { name: 'SBI - Current', no: 'XXXX 8832', balance: 845200, type: 'Bank', lastTxn: '07 Jun 2026' },
  { name: 'ICICI Bank - Savings', no: 'XXXX 2210', balance: 325000, type: 'Bank', lastTxn: '06 Jun 2026' },
  { name: 'Cash in Hand', no: '-', balance: 85420, type: 'Cash', lastTxn: '07 Jun 2026' },
  { name: 'Petty Cash', no: '-', balance: 12500, type: 'Cash', lastTxn: '06 Jun 2026' },
];

const transactions = [
  { date: '07 Jun 2026', desc: 'Payment received - ABC Steels Pvt Ltd', ref: 'RCT/2026/125', type: 'Credit', amount: 125000, account: 'HDFC Bank', balance: 1245680 },
  { date: '07 Jun 2026', desc: 'Diesel payment - Indian Oil', ref: 'PAY/2026/096', type: 'Debit', amount: 150000, account: 'HDFC Bank', balance: 1120680 },
  { date: '06 Jun 2026', desc: 'Payment received - Kaveri Industries', ref: 'RCT/2026/124', type: 'Credit', amount: 200000, account: 'SBI', balance: 845200 },
  { date: '06 Jun 2026', desc: 'Tyre purchase - Sri Balaji Tyres', ref: 'PAY/2026/094', type: 'Debit', amount: 120000, account: 'SBI', balance: 645200 },
  { date: '05 Jun 2026', desc: 'Payment received - Global Enterprises', ref: 'RCT/2026/123', type: 'Credit', amount: 150000, account: 'HDFC Bank', balance: 1270680 },
  { date: '05 Jun 2026', desc: 'Driver salary - June 2026', ref: 'PAY/2026/092', type: 'Debit', amount: 285000, account: 'HDFC Bank', balance: 1120680 },
  { date: '04 Jun 2026', desc: 'Contra - Cash to HDFC Bank', ref: 'CTR/2026/018', type: 'Credit', amount: 50000, account: 'HDFC Bank', balance: 1405680 },
];

const trendData = [
  { date: '01 Jun', balance: 2100000 },{ date: '02 Jun', balance: 2350000 },{ date: '03 Jun', balance: 2180000 },
  { date: '04 Jun', balance: 2420000 },{ date: '05 Jun', balance: 2280000 },{ date: '06 Jun', balance: 2490000 },{ date: '07 Jun', balance: 2513800 },
];

const totalBalance = accounts.reduce((s,a)=>s+a.balance,0);

export default function CashBankPage() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-800">Cash & Bank</h1><p className="text-sm text-gray-500">Dashboard / Accounts / Cash & Bank</p></div>
        <button onClick={()=>setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus size={15}/> Add Transaction</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[{l:'Total Balance',v:'₹ 25,13,800',c:'text-gray-800'},{l:'Bank Balance',v:'₹ 24,15,880',c:'text-blue-600'},{l:'Cash in Hand',v:'₹ 97,920',c:'text-green-600'},{l:'Today\'s Net Flow',v:'▲ ₹ 23,800',c:'text-teal-600'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-xl font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Cash & Bank Accounts</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-500 border-b"><th className="text-left py-2 pr-4">Account Name</th><th className="text-left py-2 pr-4">Account No.</th><th className="text-left py-2 pr-4">Type</th><th className="text-right py-2 pr-4">Balance (₹)</th><th className="text-left py-2">Last Txn</th></tr></thead>
            <tbody>{accounts.map((a,i)=>(
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 pr-4 text-sm font-medium text-gray-800">{a.name}</td>
                <td className="py-3 pr-4 text-xs text-gray-500">{a.no}</td>
                <td className="py-3 pr-4"><span className={`text-xs px-2 py-0.5 rounded-full ${a.type==='Bank'?'bg-blue-100 text-blue-700':'bg-green-100 text-green-700'}`}>{a.type}</span></td>
                <td className="py-3 pr-4 text-right text-sm font-bold text-gray-800">{a.balance.toLocaleString('en-IN')}</td>
                <td className="py-3 text-xs text-gray-500">{a.lastTxn}</td>
              </tr>
            ))}</tbody>
            <tfoot><tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold">
              <td colSpan={3} className="py-3 pr-4 text-sm text-gray-700">Total</td>
              <td className="py-3 pr-4 text-right text-sm text-gray-800">₹ {totalBalance.toLocaleString('en-IN')}</td>
              <td></td>
            </tr></tfoot>
          </table>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">Balance Trend (This Week)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData}>
              <XAxis dataKey="date" tick={{fontSize:10}} tickLine={false}/>
              <YAxis tick={{fontSize:10}} tickLine={false} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`}/>
              <Tooltip formatter={(v:any)=>`₹ ${v.toLocaleString('en-IN')}`}/>
              <Line dataKey="balance" stroke="#3b82f6" strokeWidth={2} dot={{r:3}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Transactions</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-500 border-b"><th className="text-left py-3 pr-3">Date</th><th className="text-left py-3 pr-3">Description</th><th className="text-left py-3 pr-3">Reference</th><th className="text-left py-3 pr-3">Account</th><th className="text-left py-3 pr-3">Type</th><th className="text-right py-3 pr-3">Amount (₹)</th><th className="text-right py-3">Balance (₹)</th></tr></thead>
          <tbody>{transactions.map((t,i)=>(
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3 pr-3 text-xs text-gray-500">{t.date}</td>
              <td className="py-3 pr-3 text-xs text-gray-700">{t.desc}</td>
              <td className="py-3 pr-3 text-xs text-blue-600">{t.ref}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{t.account}</td>
              <td className="py-3 pr-3">
                <div className={`flex items-center gap-1 text-xs font-medium ${t.type==='Credit'?'text-green-600':'text-red-500'}`}>
                  {t.type==='Credit'?<ArrowDownLeft size={12}/>:<ArrowUpRight size={12}/>}{t.type}
                </div>
              </td>
              <td className={`py-3 pr-3 text-right text-xs font-bold ${t.type==='Credit'?'text-green-600':'text-red-500'}`}>{t.amount.toLocaleString('en-IN')}</td>
              <td className="py-3 text-right text-xs text-gray-700">{t.balance.toLocaleString('en-IN')}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Add Transaction</h2>
            <div className="space-y-3">
              {[['Date','date'],['Account','select'],['Type','select'],['Amount (₹)','number'],['Description','text'],['Reference No.','text']].map(([l,t],i)=>(
                <div key={i}><label className="text-xs text-gray-500 block mb-1">{l}</label>
                  {t==='select'?<select className="w-full border rounded-lg px-3 py-2 text-sm"><option>{l==='Account'?'HDFC Bank - Current':'Credit'}</option></select>:<input type={t} placeholder={l} className="w-full border rounded-lg px-3 py-2 text-sm"/>}
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

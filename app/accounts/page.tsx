'use client';
import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Eye } from 'lucide-react';

const incomeExpense = [
  { date: '01 Jun', income: 1456000, expenses: 856000 },
  { date: '02 Jun', income: 1260000, expenses: 980000 },
  { date: '03 Jun', income: 1890000, expenses: 1200000 },
  { date: '04 Jun', income: 1156000, expenses: 756000 },
  { date: '05 Jun', income: 1540000, expenses: 890000 },
  { date: '06 Jun', income: 1640000, expenses: 956000 },
  { date: '07 Jun', income: 1616000, expenses: 522000 },
];
const expenseBreakdown = [
  { name: 'Diesel', value: 2200000, pct: '35.8%', color: '#3b82f6' },
  { name: 'Driver Expenses', value: 1350000, pct: '22.0%', color: '#10b981' },
  { name: 'Toll Charges', value: 750000, pct: '12.2%', color: '#f59e0b' },
  { name: 'Maintenance', value: 650000, pct: '10.6%', color: '#ef4444' },
  { name: 'Loading / Unloading', value: 450000, pct: '7.3%', color: '#8b5cf6' },
  { name: 'Other Expenses', value: 750000, pct: '12.2%', color: '#6b7280' },
];
const cashBankData = [
  { date: '01 Jun', cash: 95000, bank: 1875000 },
  { date: '02 Jun', cash: 110000, bank: 1890000 },
  { date: '03 Jun', cash: 85000, bank: 1950000 },
  { date: '04 Jun', cash: 120000, bank: 1820000 },
  { date: '05 Jun', cash: 105000, bank: 1900000 },
  { date: '06 Jun', cash: 130000, bank: 1860000 },
  { date: '07 Jun', cash: 125000, bank: 1875000 },
];
const bankAccounts = [
  { name: 'HDFC Bank', account: '5020001234 5678', type: 'Current', balance: 675000 },
  { name: 'ICICI Bank', account: '1234050009 87', type: 'Current', balance: 750000 },
  { name: 'State Bank of India', account: '3567896543 2', type: 'Current', balance: 450000 },
];
const transactions = [
  { date: '07 Jun 2026', voucher: 'RCPT/0626/125', type: 'Receipt', particulars: 'Freight Received - ABC Steels', debit: 125000, credit: null, account: 'SBI Bank' },
  { date: '07 Jun 2026', voucher: 'PAY/0626/214', type: 'Payment', particulars: 'Diesel Bill - Indian Oil', debit: null, credit: 85000, account: 'HDFC Bank' },
  { date: '07 Jun 2026', voucher: 'JV/0626/089', type: 'Journal', particulars: 'Toll Charges', debit: 15600, credit: null, account: 'Cash in Hand' },
  { date: '06 Jun 2026', voucher: 'PAY/0626/213', type: 'Payment', particulars: 'Driver Salary - May', debit: null, credit: 45000, account: 'ICICI Bank' },
  { date: '06 Jun 2026', voucher: 'RCPT/0626/124', type: 'Receipt', particulars: 'Freight Received - Kaveri Ind.', debit: 95000, credit: null, account: 'SBI Bank' },
];
const topExpenses = [
  { head: 'Diesel', amount: 2200000 },
  { head: 'Driver Expenses', amount: 1350000 },
  { head: 'Toll Charges', amount: 750000 },
  { head: 'Maintenance', amount: 650000 },
  { head: 'Loading / Unloading', amount: 450000 },
];
const typeColor: Record<string, string> = {
  Receipt: 'bg-green-100 text-green-700',
  Payment: 'bg-red-100 text-red-700',
  Journal: 'bg-blue-100 text-blue-700',
};

export default function AccountsPage() {
  const [incomeFilter, setIncomeFilter] = useState('Daily');
  const [cashFilter, setCashFilter] = useState('This Week');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Accounts Overview" breadcrumbs={[{ label: 'Accounts' }, { label: 'Overview' }]} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Total Income', value: '₹ 9,58,000', sub: '↑ 18.6% This Period', color: 'text-blue-600' },
            { label: 'Total Expenses', value: '₹ 6,15,000', sub: '↑ 12.3% This Period', color: 'text-red-500' },
            { label: 'Net Profit', value: '₹ 3,43,000', sub: '↑ 28.4% This Period', color: 'text-green-600' },
            { label: 'Cash in Hand', value: '₹ 1,25,000', sub: 'As on 07 Jun 2026', color: 'text-orange-500' },
            { label: 'Bank Balance', value: '₹ 18,75,000', sub: 'As on 07 Jun 2026', color: 'text-blue-600' },
            { label: 'Outstanding (All)', value: '₹ 27,30,000', sub: 'Total Receivables & Payables', color: 'text-purple-600' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400">{c.label}</p>
              <p className={`text-[16px] font-bold ${c.color} mt-1`}>{c.value}</p>
              <p className="text-[10px] text-green-500">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-700">Income vs Expenses (This Period)</h3>
              <select value={incomeFilter} onChange={e=>setIncomeFilter(e.target.value)} className="text-[10px] border border-gray-200 rounded px-1.5 py-0.5"><option>Daily</option><option>Weekly</option><option>Monthly</option></select>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={incomeExpense}>
                <XAxis dataKey="date" tick={{fontSize:9}} axisLine={false} tickLine={false}/>
                <YAxis hide/><Tooltip/>
                <Bar dataKey="income" fill="#10b981" radius={[2,2,0,0]} name="Income"/>
                <Bar dataKey="expenses" fill="#ef4444" radius={[2,2,0,0]} name="Expenses"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Expense Breakdown (This Period)</h3>
            <div className="flex gap-3">
              <div className="relative"><ResponsiveContainer width={110} height={110}><PieChart><Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={28} outerRadius={48} dataKey="value">{expenseBreakdown.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart></ResponsiveContainer>
              <div className="absolute" style={{top:'50%',left:'55px',transform:'translate(-50%,-50%)'}}><p className="text-[12px] font-bold text-gray-800">₹ 6,15,000</p><p className="text-[8px] text-gray-400">Total Expenses</p></div></div>
              <div className="space-y-1 flex-1">
                {expenseBreakdown.map(d=>(<div key={d.name} className="flex items-center gap-1.5 text-[10px]"><div className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor:d.color}}/><span className="flex-1 text-gray-500 truncate">{d.name}</span><span className="font-semibold">₹ {(d.value/100000).toFixed(2)}L ({d.pct})</span></div>))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-700">Cash & Bank Balance</h3>
              <select value={cashFilter} onChange={e=>setCashFilter(e.target.value)} className="text-[10px] border border-gray-200 rounded px-1.5 py-0.5"><option>This Week</option><option>This Month</option></select>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={cashBankData}>
                <XAxis dataKey="date" tick={{fontSize:9}} axisLine={false} tickLine={false}/>
                <YAxis hide/><Tooltip/>
                <Line type="monotone" dataKey="cash" stroke="#10b981" strokeWidth={2} dot={{r:2}} name="Cash in Hand"/>
                <Line type="monotone" dataKey="bank" stroke="#3b82f6" strokeWidth={2} dot={{r:2}} name="Bank Balance"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receivables + Payables + Bank */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-2">Receivables (Customers)</h3>
            <p className="text-[22px] font-bold text-blue-600 mb-3">₹ 18,50,000</p>
            {[{label:'Current (0-30 Days)',v:'₹ 6,25,000',c:'text-green-600'},{label:'31-60 Days',v:'₹ 4,80,000',c:'text-blue-600'},{label:'61-90 Days',v:'₹ 3,20,000',c:'text-yellow-600'},{label:'Above 90 Days',v:'₹ 4,25,000',c:'text-red-500'}].map(r=>(<div key={r.label} className="flex justify-between mb-1.5 text-[11px]"><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-current opacity-60"/><span className="text-gray-500">{r.label}</span></div><span className={`font-semibold ${r.c}`}>{r.v}</span></div>))}
            <a href="#" className="text-[10px] text-blue-600 block mt-2">View Details →</a>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-2">Payables (Suppliers)</h3>
            <p className="text-[22px] font-bold text-red-500 mb-3">₹ 8,80,000</p>
            {[{label:'Current (0-30 Days)',v:'₹ 2,75,000',c:'text-green-600'},{label:'31-60 Days',v:'₹ 2,30,000',c:'text-blue-600'},{label:'61-90 Days',v:'₹ 1,90,000',c:'text-yellow-600'},{label:'Above 90 Days',v:'₹ 1,85,000',c:'text-red-500'}].map(r=>(<div key={r.label} className="flex justify-between mb-1.5 text-[11px]"><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-current opacity-60"/><span className="text-gray-500">{r.label}</span></div><span className={`font-semibold ${r.c}`}>{r.v}</span></div>))}
            <a href="#" className="text-[10px] text-blue-600 block mt-2">View Details →</a>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Bank Accounts</h3>
            <table className="w-full text-[11px]">
              <thead><tr className="text-gray-400 border-b border-gray-100"><th className="text-left pb-2">Bank Name</th><th className="text-left pb-2">Account No.</th><th className="text-left pb-2">Type</th><th className="text-right pb-2">Balance (₹)</th></tr></thead>
              <tbody>{bankAccounts.map(b=>(<tr key={b.name} className="border-b border-gray-50"><td className="py-1.5 text-gray-700 font-medium">{b.name}</td><td className="py-1.5 text-gray-500">{b.account}</td><td className="py-1.5 text-gray-500">{b.type}</td><td className="py-1.5 text-right font-semibold">₹ {b.balance.toLocaleString('en-IN')}</td></tr>))}</tbody>
            </table>
            <div className="border-t border-gray-100 pt-2 mt-1 flex justify-between text-[11px] font-bold"><span>Total Balance</span><span>₹ 18,75,000</span></div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Account Summary</h3>
            {[{label:'Total Income',v:'₹ 9,58,000',c:'text-gray-700'},{label:'Total Expenses',v:'₹ 6,15,000',c:'text-gray-700'},{label:'Net Profit',v:'₹ 3,43,000',c:'text-green-600'},{label:'Total Receivables',v:'₹ 18,50,000',c:'text-blue-600'},{label:'Total Payables',v:'₹ 8,80,000',c:'text-red-500'},{label:'Net Position',v:'₹ 9,70,000',c:'text-green-600'}].map(r=>(<div key={r.label} className="flex justify-between mb-2 text-[11px]"><span className="text-gray-500">{r.label}</span><span className={`font-semibold ${r.c}`}>{r.v}</span></div>))}
          </div>
        </div>

        {/* Transactions + Top Expenses + Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3"><h3 className="text-[13px] font-semibold text-gray-700">Recent Transactions</h3><a href="#" className="text-[10px] text-blue-600">View All Transactions →</a></div>
            <table className="w-full text-[11px]">
              <thead><tr className="text-gray-400 border-b border-gray-100"><th className="text-left py-2">Date</th><th className="text-left py-2">Voucher No.</th><th className="text-left py-2">Voucher Type</th><th className="text-left py-2">Particulars</th><th className="text-right py-2">Debit (₹)</th><th className="text-right py-2">Credit (₹)</th><th className="text-left py-2">Account</th><th className="text-left py-2">Action</th></tr></thead>
              <tbody>{transactions.map(t=>(<tr key={t.voucher} className="border-b border-gray-50"><td className="py-1.5 text-gray-500">{t.date}</td><td className="py-1.5 text-blue-600">{t.voucher}</td><td className="py-1.5"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${typeColor[t.type]}`}>{t.type}</span></td><td className="py-1.5 text-gray-600">{t.particulars}</td><td className="py-1.5 text-right text-green-600">{t.debit ? '₹ ' + t.debit.toLocaleString('en-IN') : '-'}</td><td className="py-1.5 text-right text-red-500">{t.credit ? '₹ ' + t.credit.toLocaleString('en-IN') : '-'}</td><td className="py-1.5 text-gray-500">{t.account}</td><td className="py-1.5"><Eye size={12} className="text-gray-400"/></td></tr>))}</tbody>
            </table>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3"><h3 className="text-[13px] font-semibold text-gray-700">Top Expenses (This Period)</h3></div>
              {topExpenses.map(e=>(<div key={e.head} className="flex justify-between mb-2 text-[11px]"><span className="text-gray-500">{e.head}</span><span className="font-semibold text-red-500">₹ {(e.amount/100000).toFixed(2)}L</span></div>))}
              <a href="#" className="text-[10px] text-blue-600 block mt-2">View Expense Report →</a>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-2">
                {[{label:'Add Income',icon:'➕'},{label:'Add Expense',icon:'💸'},{label:'Receipt Entry',icon:'📥'},{label:'Payment Entry',icon:'📤'},{label:'Journal Entry',icon:'📓'},{label:'Contra Entry',icon:'🔄'},{label:'Bank Reconciliation',icon:'🏦'},{label:'Account Ledger',icon:'📋'},{label:'Trial Balance',icon:'⚖️'}].map(a=>(
                  <button key={a.label} className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-[9px] text-blue-600"><span className="text-sm">{a.icon}</span>{a.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

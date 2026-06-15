'use client';
import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Download, Eye, Filter } from 'lucide-react';

const payments = [
  { id: 'RCT/2026/125', date: '07 Jun 2026', customer: 'ABC Steels Pvt Ltd', cusId: 'CUS001', amount: 125000, mode: 'NEFT', ref: 'NEFT2026060712345', invoice: 'INV/2026/068', status: 'Cleared' },
  { id: 'RCT/2026/124', date: '07 Jun 2026', customer: 'Kaveri Industries', cusId: 'CUS003', amount: 200000, mode: 'RTGS', ref: 'RTGS2026060798765', invoice: 'INV/2026/061', status: 'Cleared' },
  { id: 'RCT/2026/123', date: '06 Jun 2026', customer: 'Global Enterprises', cusId: 'CUS005', amount: 150000, mode: 'Cheque', ref: 'CHQ-004521', invoice: 'INV/2026/055', status: 'Cleared' },
  { id: 'RCT/2026/122', date: '06 Jun 2026', customer: 'Sri Venkateshwara Traders', cusId: 'CUS002', amount: 75000, mode: 'UPI', ref: 'UPI/2026/334455', invoice: 'INV/2026/049', status: 'Cleared' },
  { id: 'RCT/2026/121', date: '05 Jun 2026', customer: 'Sakthi Traders', cusId: 'CUS004', amount: 50000, mode: 'Cash', ref: '-', invoice: 'INV/2026/045', status: 'Cleared' },
  { id: 'RCT/2026/120', date: '05 Jun 2026', customer: 'MJM Infra', cusId: 'CUS008', amount: 90000, mode: 'NEFT', ref: 'NEFT2026060556789', invoice: 'INV/2026/042', status: 'Cleared' },
  { id: 'RCT/2026/119', date: '04 Jun 2026', customer: 'ABC Steels Pvt Ltd', cusId: 'CUS001', amount: 125000, mode: 'Cheque', ref: 'CHQ-004508', invoice: 'INV/2026/038', status: 'Cleared' },
  { id: 'RCT/2026/118', date: '04 Jun 2026', customer: 'Vijay Exports', cusId: 'CUS006', amount: 80000, mode: 'NEFT', ref: 'NEFT2026060443210', invoice: 'INV/2026/035', status: 'Pending' },
  { id: 'RCT/2026/117', date: '03 Jun 2026', customer: 'Global Enterprises', cusId: 'CUS005', amount: 180000, mode: 'RTGS', ref: 'RTGS2026060321098', invoice: 'INV/2026/031', status: 'Cleared' },
  { id: 'RCT/2026/116', date: '03 Jun 2026', customer: 'Kaveri Industries', cusId: 'CUS003', amount: 250000, mode: 'NEFT', ref: 'NEFT2026060312345', invoice: 'INV/2026/028', status: 'Cleared' },
];

const trendData = [
  { date: '01 Jun', amount: 320000 },
  { date: '02 Jun', amount: 185000 },
  { date: '03 Jun', amount: 430000 },
  { date: '04 Jun', amount: 205000 },
  { date: '05 Jun', amount: 140000 },
  { date: '06 Jun', amount: 425000 },
  { date: '07 Jun', amount: 325000 },
];

const byMode = [
  { mode: 'NEFT', amount: 515000 },
  { mode: 'RTGS', amount: 450000 },
  { mode: 'Cheque', amount: 205000 },
  { mode: 'UPI', amount: 75000 },
  { mode: 'Cash', amount: 50000 },
];

const byCustomer = [
  { name: 'ABC Steels Pvt Ltd', amount: 250000 },
  { name: 'Kaveri Industries', amount: 450000 },
  { name: 'Global Enterprises', amount: 330000 },
  { name: 'Sri Venkateshwara Traders', amount: 75000 },
  { name: 'MJM Infra', amount: 90000 },
];

export default function PaymentHistoryPage() {
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('All');
  const filtered = payments.filter(p =>
    (modeFilter === 'All' || p.mode === modeFilter) &&
    (p.customer.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
  );
  const total = filtered.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment History</h1>
          <p className="text-sm text-gray-500">Dashboard / Customers / Payment History</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Download size={15} /> Export
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Received (This Month)', value: '₹ 28,95,000', sub: '▲ 18.4% vs Last Month', color: 'text-green-600' },
          { label: 'Total Received (This Week)', value: '₹ 20,30,000', sub: '68 Payments', color: 'text-blue-600' },
          { label: 'Pending Clearance', value: '₹ 80,000', sub: '1 Payment', color: 'text-orange-500' },
          { label: 'Avg. Payment Size', value: '₹ 42,500', sub: 'This Month', color: 'text-gray-700' },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Payment Trend (This Week)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={trendData}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip formatter={(v: any) => `₹ ${v.toLocaleString('en-IN')}`} />
              <Line dataKey="amount" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Payment by Mode</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={byMode}>
              <XAxis dataKey="mode" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip formatter={(v: any) => `₹ ${v.toLocaleString('en-IN')}`} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Top Paying Customers (This Week)</h3>
          <div className="space-y-3">
            {byCustomer.map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 truncate max-w-[150px]">{c.name}</span>
                  <span className="font-medium text-gray-700">₹ {(c.amount/100000).toFixed(2)}L</span>
                </div>
                <div className="bg-gray-100 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(c.amount/450000)*100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Table */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Payment Transactions</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="pl-9 pr-4 py-2 border rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <select value={modeFilter} onChange={e => setModeFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none">
              {['All', 'NEFT', 'RTGS', 'Cheque', 'UPI', 'Cash'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b">
              <th className="text-left py-3 pr-3">Receipt No.</th>
              <th className="text-left py-3 pr-3">Date</th>
              <th className="text-left py-3 pr-3">Customer</th>
              <th className="text-left py-3 pr-3">Invoice No.</th>
              <th className="text-right py-3 pr-3">Amount (₹)</th>
              <th className="text-left py-3 pr-3">Payment Mode</th>
              <th className="text-left py-3 pr-3">Reference No.</th>
              <th className="text-left py-3 pr-3">Status</th>
              <th className="text-left py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 pr-3 text-xs text-blue-600 font-medium">{p.id}</td>
                <td className="py-3 pr-3 text-xs text-gray-500">{p.date}</td>
                <td className="py-3 pr-3">
                  <p className="text-xs font-medium text-gray-800">{p.customer}</p>
                  <p className="text-xs text-gray-400">{p.cusId}</p>
                </td>
                <td className="py-3 pr-3 text-xs text-blue-500">{p.invoice}</td>
                <td className="py-3 pr-3 text-right text-xs font-bold text-gray-800">{p.amount.toLocaleString('en-IN')}</td>
                <td className="py-3 pr-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    p.mode === 'NEFT' || p.mode === 'RTGS' ? 'bg-blue-100 text-blue-700' :
                    p.mode === 'Cheque' ? 'bg-purple-100 text-purple-700' :
                    p.mode === 'UPI' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-700'}`}>{p.mode}</span>
                </td>
                <td className="py-3 pr-3 text-xs text-gray-500">{p.ref}</td>
                <td className="py-3 pr-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'Cleared' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{p.status}</span>
                </td>
                <td className="py-3"><button className="text-gray-400 hover:text-gray-600"><Eye size={14} /></button></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold">
              <td colSpan={4} className="py-3 pr-3 text-sm text-gray-700">Total ({filtered.length} payments)</td>
              <td className="py-3 pr-3 text-right text-sm text-gray-800">₹ {total.toLocaleString('en-IN')}</td>
              <td colSpan={4}></td>
            </tr>
          </tfoot>
        </table>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-500">Showing {filtered.length} of {payments.length} entries</span>
          <div className="flex gap-1">
            {[1, 2, 3].map(p => <button key={p} className={`w-7 h-7 text-xs rounded border ${p === 1 ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>{p}</button>)}
            <button className="w-7 h-7 text-xs border rounded text-gray-600">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

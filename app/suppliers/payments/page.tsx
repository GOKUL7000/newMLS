'use client';
import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Download, Eye } from 'lucide-react';

const payments = [
  { id: 'PAY/2026/096', date: '07 Jun 2026', supplier: 'Indian Oil - Peelamedu', supId: 'SUP001', amount: 150000, mode: 'NEFT', ref: 'NEFT2026060712345', invoice: 'PUR/2026/158', status: 'Cleared' },
  { id: 'PAY/2026/095', date: '07 Jun 2026', supplier: 'Sri Murugan Workshop', supId: 'SUP006', amount: 85000, mode: 'NEFT', ref: 'NEFT2026060709876', invoice: 'PUR/2026/155', status: 'Cleared' },
  { id: 'PAY/2026/094', date: '06 Jun 2026', supplier: 'Sri Balaji Tyres', supId: 'SUP003', amount: 120000, mode: 'Cheque', ref: 'CHQ-001245', invoice: 'PUR/2026/150', status: 'Cleared' },
  { id: 'PAY/2026/093', date: '06 Jun 2026', supplier: 'Bharat Petroleum - RS Puram', supId: 'SUP002', amount: 100000, mode: 'NEFT', ref: 'NEFT2026060643210', invoice: 'PUR/2026/149', status: 'Cleared' },
  { id: 'PAY/2026/092', date: '05 Jun 2026', supplier: 'Indian Oil - Peelamedu', supId: 'SUP001', amount: 150000, mode: 'NEFT', ref: 'NEFT2026060556789', invoice: 'PUR/2026/145', status: 'Cleared' },
  { id: 'PAY/2026/091', date: '05 Jun 2026', supplier: 'Kumaran Auto Spare Parts', supId: 'SUP005', amount: 65000, mode: 'UPI', ref: 'UPI/2026/223344', invoice: 'PUR/2026/143', status: 'Cleared' },
  { id: 'PAY/2026/090', date: '04 Jun 2026', supplier: 'National Highway Tolls', supId: 'SUP004', amount: 45000, mode: 'FASTag', ref: 'FT2026060412345', invoice: 'PUR/2026/140', status: 'Cleared' },
  { id: 'PAY/2026/089', date: '04 Jun 2026', supplier: 'Office Needs', supId: 'SUP007', amount: 18500, mode: 'UPI', ref: 'UPI/2026/221122', invoice: 'PUR/2026/138', status: 'Pending' },
  { id: 'PAY/2026/088', date: '03 Jun 2026', supplier: 'Indian Oil - Peelamedu', supId: 'SUP001', amount: 100000, mode: 'NEFT', ref: 'NEFT2026060312345', invoice: 'PUR/2026/132', status: 'Cleared' },
  { id: 'PAY/2026/087', date: '03 Jun 2026', supplier: 'Sri Balaji Tyres', supId: 'SUP003', amount: 75000, mode: 'Cheque', ref: 'CHQ-001238', invoice: 'PUR/2026/130', status: 'Cleared' },
];

const trendData = [
  { date: '01 Jun', amount: 280000 },{ date: '02 Jun', amount: 195000 },{ date: '03 Jun', amount: 385000 },
  { date: '04 Jun', amount: 215000 },{ date: '05 Jun', amount: 245000 },{ date: '06 Jun', amount: 385000 },{ date: '07 Jun', amount: 355000 },
];

const byMode = [
  { mode: 'NEFT', amount: 500000 },{ mode: 'Cheque', amount: 195000 },
  { mode: 'UPI', amount: 83500 },{ mode: 'FASTag', amount: 45000 },
];

const bySupplier = [
  { name: 'Indian Oil', amount: 400000 },{ name: 'Sri Murugan', amount: 85000 },
  { name: 'Sri Balaji Tyres', amount: 195000 },{ name: 'Bharat Petro.', amount: 100000 },
  { name: 'Kumaran Auto', amount: 65000 },
];

export default function SupplierPaymentsPage() {
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('All');
  const filtered = payments.filter(p =>
    (modeFilter === 'All' || p.mode === modeFilter) &&
    (p.supplier.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment History</h1>
          <p className="text-sm text-gray-500">Dashboard / Suppliers / Payment History</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Download size={15} /> Export
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Paid (This Month)', value: '₹ 24,65,000', sub: '▲ 11.2% vs Last Month', color: 'text-green-600' },
          { label: 'Total Paid (This Week)', value: '₹ 9,08,500', sub: '10 Payments', color: 'text-blue-600' },
          { label: 'Pending Clearance', value: '₹ 18,500', sub: '1 Payment', color: 'text-orange-500' },
          { label: 'Avg. Payment Size', value: '₹ 39,500', sub: 'This Month', color: 'text-gray-700' },
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
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Payment Trend (This Week)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={trendData}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip formatter={(v: any) => `₹ ${v.toLocaleString('en-IN')}`} />
              <Line dataKey="amount" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
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
              <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Top Paid Suppliers (This Week)</h3>
          <div className="space-y-3">
            {bySupplier.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 truncate max-w-[150px]">{s.name}</span>
                  <span className="font-medium text-gray-700">₹ {(s.amount/100000).toFixed(2)}L</span>
                </div>
                <div className="bg-gray-100 rounded-full h-1.5">
                  <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${(s.amount/400000)*100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payments Table */}
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
              {['All', 'NEFT', 'Cheque', 'UPI', 'FASTag'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b">
              <th className="text-left py-3 pr-3">Payment No.</th>
              <th className="text-left py-3 pr-3">Date</th>
              <th className="text-left py-3 pr-3">Supplier</th>
              <th className="text-left py-3 pr-3">Purchase Ref.</th>
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
                  <p className="text-xs font-medium text-gray-800">{p.supplier}</p>
                  <p className="text-xs text-gray-400">{p.supId}</p>
                </td>
                <td className="py-3 pr-3 text-xs text-blue-500">{p.invoice}</td>
                <td className="py-3 pr-3 text-right text-xs font-bold text-gray-800">{p.amount.toLocaleString('en-IN')}</td>
                <td className="py-3 pr-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    p.mode === 'NEFT' ? 'bg-blue-100 text-blue-700' :
                    p.mode === 'Cheque' ? 'bg-purple-100 text-purple-700' :
                    p.mode === 'UPI' ? 'bg-teal-100 text-teal-700' :
                    p.mode === 'FASTag' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{p.mode}</span>
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
              <td className="py-3 pr-3 text-right text-sm text-gray-800">₹ {filtered.reduce((s,p)=>s+p.amount,0).toLocaleString('en-IN')}</td>
              <td colSpan={4}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

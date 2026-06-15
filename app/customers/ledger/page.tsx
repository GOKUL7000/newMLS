'use client';
import { useState } from 'react';
import { Search, Download, Printer, ChevronDown, FileText, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const CUSTOMERS = [
  { id: 'CUS001', name: 'ABC Steels Pvt Ltd' },
  { id: 'CUS002', name: 'Sri Venkateshwara Traders' },
  { id: 'CUS003', name: 'Kaveri Industries' },
  { id: 'CUS004', name: 'Sakthi Traders' },
  { id: 'CUS005', name: 'Global Enterprises' },
  { id: 'CUS006', name: 'Vijay Exports' },
  { id: 'CUS008', name: 'MJM Infra' },
];

const ledgerEntries = [
  { date: '01 Jun 2026', type: 'Invoice', ref: 'INV/2026/068', desc: 'Trip TRP1240 - Coimbatore to Chennai', debit: 125000, credit: 0, balance: 245000 },
  { date: '02 Jun 2026', type: 'Payment', ref: 'RCT/2026/112', desc: 'Payment received - NEFT', debit: 0, credit: 75000, balance: 170000 },
  { date: '03 Jun 2026', type: 'Invoice', ref: 'INV/2026/072', desc: 'Trip TRP1245 - Chennai to Bangalore', debit: 98000, credit: 0, balance: 268000 },
  { date: '04 Jun 2026', type: 'Payment', ref: 'RCT/2026/118', desc: 'Payment received - Cheque', debit: 0, credit: 125000, balance: 143000 },
  { date: '05 Jun 2026', type: 'Invoice', ref: 'INV/2026/079', desc: 'Trip TRP1250 - Coimbatore to Mumbai', debit: 210000, credit: 0, balance: 353000 },
  { date: '06 Jun 2026', type: 'Credit Note', ref: 'CN/2026/009', desc: 'Freight deduction - delay penalty', debit: 0, credit: 12000, balance: 341000 },
  { date: '07 Jun 2026', type: 'Invoice', ref: 'INV/2026/085', desc: 'Trip TRP1256 - Coimbatore to Hyderabad', debit: 175000, credit: 0, balance: 516000 },
  { date: '07 Jun 2026', type: 'Payment', ref: 'RCT/2026/125', desc: 'Payment received - NEFT', debit: 0, credit: 125000, balance: 391000 },
];

const fmt = (v: number) => v > 0 ? '₹ ' + v.toLocaleString('en-IN') : '-';

export default function CustomerLedgerPage() {
  const [selectedCustomer, setSelectedCustomer] = useState('CUS001');
  const [fromDate, setFromDate] = useState('2026-06-01');
  const [toDate, setToDate] = useState('2026-06-07');

  const customer = CUSTOMERS.find(c => c.id === selectedCustomer);
  const totalDebit = ledgerEntries.reduce((s, e) => s + e.debit, 0);
  const totalCredit = ledgerEntries.reduce((s, e) => s + e.credit, 0);
  const closingBalance = ledgerEntries[ledgerEntries.length - 1]?.balance || 0;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Ledger</h1>
          <p className="text-sm text-gray-500">Dashboard / Customers / Customer Ledger</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-white">
            <Printer size={15} /> Print
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Select Customer</label>
            <div className="relative">
              <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200">
                {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Show Ledger
          </button>
        </div>
      </div>

      {/* Customer Info + Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {customer?.name[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{customer?.name}</p>
              <p className="text-xs text-gray-400">{selectedCustomer}</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Credit Limit</span><span className="font-medium text-gray-700">₹ 10,00,000</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Credit Days</span><span className="font-medium text-gray-700">30 Days</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Contact</span><span className="font-medium text-gray-700">98450 12345</span></div>
            <div className="flex justify-between"><span className="text-gray-500">City</span><span className="font-medium text-gray-700">Coimbatore</span></div>
            <div className="flex justify-between"><span className="text-gray-500">GSTIN</span><span className="font-medium text-gray-700">33AABC1234D1Z5</span></div>
          </div>
        </div>

        {[
          { label: 'Opening Balance', value: '₹ 1,95,000', sub: 'As on 01 Jun 2026', color: 'text-gray-700', icon: FileText },
          { label: 'Total Invoiced', value: '₹ 6,08,000', sub: 'This Period', color: 'text-red-500', icon: ArrowUpRight },
          { label: 'Total Received', value: '₹ 3,37,000', sub: 'This Period', color: 'text-green-600', icon: ArrowDownLeft },
          { label: 'Closing Balance', value: '₹ 3,91,000', sub: 'Outstanding (Dr)', color: 'text-orange-500', icon: FileText },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-gray-500">{c.label}</p>
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <c.icon size={15} className="text-gray-400" />
              </div>
            </div>
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">
            Ledger — {customer?.name} &nbsp;
            <span className="text-sm font-normal text-gray-400">(01 Jun 2026 to 07 Jun 2026)</span>
          </h3>
        </div>

        {/* Opening Balance Row */}
        <div className="bg-blue-50 rounded-lg px-4 py-2.5 mb-2 flex items-center justify-between text-sm">
          <span className="text-blue-700 font-medium">Opening Balance as on 01 Jun 2026</span>
          <span className="text-blue-700 font-bold">₹ 1,95,000 Dr</span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-gray-200">
              <th className="text-left py-3 pr-4">Date</th>
              <th className="text-left py-3 pr-4">Type</th>
              <th className="text-left py-3 pr-4">Reference No.</th>
              <th className="text-left py-3 pr-4">Description</th>
              <th className="text-right py-3 pr-4">Debit (₹)</th>
              <th className="text-right py-3 pr-4">Credit (₹)</th>
              <th className="text-right py-3">Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            {ledgerEntries.map((e, i) => (
              <tr key={i} className={`border-b border-gray-50 hover:bg-gray-50 ${e.type === 'Payment' ? 'bg-green-50/40' : e.type === 'Credit Note' ? 'bg-yellow-50/40' : ''}`}>
                <td className="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">{e.date}</td>
                <td className="py-3 pr-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    e.type === 'Invoice' ? 'bg-blue-100 text-blue-700' :
                    e.type === 'Payment' ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'}`}>{e.type}</span>
                </td>
                <td className="py-3 pr-4 text-xs text-blue-600 font-medium">{e.ref}</td>
                <td className="py-3 pr-4 text-xs text-gray-600">{e.desc}</td>
                <td className="py-3 pr-4 text-right text-xs font-medium text-red-500">{fmt(e.debit)}</td>
                <td className="py-3 pr-4 text-right text-xs font-medium text-green-600">{fmt(e.credit)}</td>
                <td className="py-3 text-right text-xs font-bold text-gray-800">₹ {e.balance.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold">
              <td colSpan={4} className="py-3 pr-4 text-sm text-gray-700">Total</td>
              <td className="py-3 pr-4 text-right text-sm text-red-500">₹ {totalDebit.toLocaleString('en-IN')}</td>
              <td className="py-3 pr-4 text-right text-sm text-green-600">₹ {totalCredit.toLocaleString('en-IN')}</td>
              <td className="py-3 text-right text-sm text-gray-800">₹ {closingBalance.toLocaleString('en-IN')} Dr</td>
            </tr>
          </tfoot>
        </table>

        {/* Closing Balance */}
        <div className="bg-orange-50 rounded-lg px-4 py-2.5 mt-2 flex items-center justify-between text-sm">
          <span className="text-orange-700 font-medium">Closing Balance as on 07 Jun 2026</span>
          <span className="text-orange-700 font-bold">₹ 3,91,000 Dr</span>
        </div>
      </div>
    </div>
  );
}

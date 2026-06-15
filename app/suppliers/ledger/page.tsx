'use client';
import { useState } from 'react';
import { Download, Printer, ChevronDown, FileText, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const SUPPLIERS = [
  { id: 'SUP001', name: 'Indian Oil - Peelamedu', type: 'Fuel', city: 'Coimbatore', contact: '98451 11111', gstin: '33AAIO1234D1Z5', creditLimit: 500000, creditDays: 15 },
  { id: 'SUP002', name: 'Bharat Petroleum - RS Puram', type: 'Fuel', city: 'Coimbatore', contact: '97502 22222', gstin: '33AABP5678E1Z3', creditLimit: 400000, creditDays: 15 },
  { id: 'SUP003', name: 'Sri Balaji Tyres', type: 'Tyres', city: 'Coimbatore', contact: '99403 33333', gstin: '33AASB9012F1Z1', creditLimit: 300000, creditDays: 30 },
  { id: 'SUP004', name: 'National Highway Tolls', type: 'Toll', city: 'Coimbatore', contact: '-', gstin: 'FASTag', creditLimit: 100000, creditDays: 0 },
  { id: 'SUP005', name: 'Kumaran Auto Spare Parts', type: 'Spare Parts', city: 'Coimbatore', contact: '98434 44444', gstin: '33AAKA3456G1Z9', creditLimit: 250000, creditDays: 30 },
  { id: 'SUP006', name: 'Sri Murugan Workshop', type: 'Maintenance', city: 'Coimbatore', contact: '97505 55555', gstin: '33AASM7890H1Z7', creditLimit: 200000, creditDays: 30 },
  { id: 'SUP007', name: 'Office Needs', type: 'Office', city: 'Coimbatore', contact: '96556 66666', gstin: '33AAON2345I1Z5', creditLimit: 50000, creditDays: 15 },
];

const ledgerEntries = [
  { date: '01 Jun 2026', type: 'Purchase', ref: 'PUR/2026/145', desc: 'Diesel - 1,250 Ltrs @ ₹ 96.40', debit: 0, credit: 120500, balance: 285000 },
  { date: '02 Jun 2026', type: 'Payment', ref: 'PAY/2026/088', desc: 'Payment via NEFT', debit: 100000, credit: 0, balance: 185000 },
  { date: '03 Jun 2026', type: 'Purchase', ref: 'PUR/2026/149', desc: 'Diesel - 1,500 Ltrs @ ₹ 96.40', debit: 0, credit: 144600, balance: 329600 },
  { date: '04 Jun 2026', type: 'Payment', ref: 'PAY/2026/092', desc: 'Payment via NEFT', debit: 150000, credit: 0, balance: 179600 },
  { date: '05 Jun 2026', type: 'Purchase', ref: 'PUR/2026/153', desc: 'Diesel - 1,100 Ltrs @ ₹ 96.40', debit: 0, credit: 106040, balance: 285640 },
  { date: '06 Jun 2026', type: 'Debit Note', ref: 'DN/2026/004', desc: 'Quality deduction - short supply', debit: 5000, credit: 0, balance: 280640 },
  { date: '07 Jun 2026', type: 'Purchase', ref: 'PUR/2026/158', desc: 'Diesel - 1,300 Ltrs @ ₹ 96.40', debit: 0, credit: 125320, balance: 405960 },
  { date: '07 Jun 2026', type: 'Payment', ref: 'PAY/2026/096', desc: 'Payment via NEFT', debit: 150000, credit: 0, balance: 255960 },
];

const fmt = (v: number) => v > 0 ? '₹ ' + v.toLocaleString('en-IN') : '-';

export default function SupplierLedgerPage() {
  const [selectedSupplier, setSelectedSupplier] = useState('SUP001');
  const [fromDate, setFromDate] = useState('2026-06-01');
  const [toDate, setToDate] = useState('2026-06-07');

  const supplier = SUPPLIERS.find(s => s.id === selectedSupplier);
  const totalDebit = ledgerEntries.reduce((s, e) => s + e.debit, 0);
  const totalCredit = ledgerEntries.reduce((s, e) => s + e.credit, 0);
  const closing = ledgerEntries[ledgerEntries.length - 1]?.balance || 0;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Supplier Ledger</h1>
          <p className="text-sm text-gray-500">Dashboard / Suppliers / Supplier Ledger</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-white"><Printer size={15} /> Print</button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Download size={15} /> Export</button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Select Supplier</label>
            <div className="relative">
              <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200">
                {SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Show Ledger</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
              {supplier?.name[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{supplier?.name}</p>
              <p className="text-xs text-gray-400">{selectedSupplier} · {supplier?.type}</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Credit Limit</span><span className="font-medium text-gray-700">₹ {supplier?.creditLimit.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Credit Days</span><span className="font-medium text-gray-700">{supplier?.creditDays} Days</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Contact</span><span className="font-medium text-gray-700">{supplier?.contact}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">City</span><span className="font-medium text-gray-700">{supplier?.city}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">GSTIN</span><span className="font-medium text-gray-700">{supplier?.gstin}</span></div>
          </div>
        </div>

        {[
          { label: 'Opening Balance', value: '₹ 1,64,500', sub: 'As on 01 Jun 2026', color: 'text-gray-700', icon: FileText },
          { label: 'Total Purchases', value: '₹ 4,96,460', sub: 'This Period', color: 'text-red-500', icon: ArrowUpRight },
          { label: 'Total Payments', value: '₹ 4,05,000', sub: 'This Period', color: 'text-green-600', icon: ArrowDownLeft },
          { label: 'Closing Balance', value: '₹ 2,55,960', sub: 'Payable (Cr)', color: 'text-orange-500', icon: FileText },
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
            Ledger — {supplier?.name} &nbsp;
            <span className="text-sm font-normal text-gray-400">(01 Jun 2026 to 07 Jun 2026)</span>
          </h3>
        </div>

        <div className="bg-blue-50 rounded-lg px-4 py-2.5 mb-2 flex items-center justify-between text-sm">
          <span className="text-blue-700 font-medium">Opening Balance as on 01 Jun 2026</span>
          <span className="text-blue-700 font-bold">₹ 1,64,500 Cr</span>
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
              <tr key={i} className={`border-b border-gray-50 hover:bg-gray-50 ${e.type === 'Payment' ? 'bg-green-50/40' : e.type === 'Debit Note' ? 'bg-yellow-50/40' : ''}`}>
                <td className="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">{e.date}</td>
                <td className="py-3 pr-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    e.type === 'Purchase' ? 'bg-blue-100 text-blue-700' :
                    e.type === 'Payment' ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'}`}>{e.type}</span>
                </td>
                <td className="py-3 pr-4 text-xs text-blue-600 font-medium">{e.ref}</td>
                <td className="py-3 pr-4 text-xs text-gray-600">{e.desc}</td>
                <td className="py-3 pr-4 text-right text-xs font-medium text-green-600">{fmt(e.debit)}</td>
                <td className="py-3 pr-4 text-right text-xs font-medium text-red-500">{fmt(e.credit)}</td>
                <td className="py-3 text-right text-xs font-bold text-gray-800">₹ {e.balance.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold">
              <td colSpan={4} className="py-3 pr-4 text-sm text-gray-700">Total</td>
              <td className="py-3 pr-4 text-right text-sm text-green-600">₹ {totalDebit.toLocaleString('en-IN')}</td>
              <td className="py-3 pr-4 text-right text-sm text-red-500">₹ {totalCredit.toLocaleString('en-IN')}</td>
              <td className="py-3 text-right text-sm text-gray-800">₹ {closing.toLocaleString('en-IN')} Cr</td>
            </tr>
          </tfoot>
        </table>

        <div className="bg-orange-50 rounded-lg px-4 py-2.5 mt-2 flex items-center justify-between text-sm">
          <span className="text-orange-700 font-medium">Closing Balance as on 07 Jun 2026</span>
          <span className="text-orange-700 font-bold">₹ 2,55,960 Cr</span>
        </div>
      </div>
    </div>
  );
}

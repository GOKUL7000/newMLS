'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Topbar from '@/components/layout/Topbar';
import {
  Download, Printer, ChevronDown, FileText,
  ArrowUpRight, ArrowDownLeft, Loader2, Search,
} from 'lucide-react';

const supabase = createClientComponentClient();

// ─── Types ────────────────────────────────────────────────────────────────────
interface Supplier {
  id: string;
  supplier_no: string;
  name: string;
  category: string;
  mobile: string | null;
  email: string | null;
  city: string | null;
  credit_limit: number | null;
  outstanding: number | null;
  gstin: string | null;
  pan: string | null;
}

interface LedgerEntry {
  id: string;
  date: string;
  type: 'Trip' | 'Payment';
  ref_no: string;
  description: string;
  debit: number;
  credit: number;
  supplier_id: string;
  trip_no: string | null;
  freight_amount: number | null;
  supplier_amount: number | null;
   supplier_charge: number | null;
   trip_status: string | null;
    invoice_status: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  v > 0 ? '₹ ' + v.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '—';

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// ─────────────────────────────────────────────────────────────────────────────
export default function SupplierLedgerPage() {
  const [suppliers, setSuppliers]               = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [fromDate, setFromDate]                 = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate]                     = useState(() => new Date().toISOString().split('T')[0]);
  const [ledger, setLedger]                     = useState<LedgerEntry[]>([]);
  const [openingBalance, setOpeningBalance]     = useState(0);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [loadingLedger, setLoadingLedger]       = useState(false);
  const [searched, setSearched]                 = useState(false);
  const [tripStats, setTripStats] = useState({
  total: 0, pending: 0, settled: 0, totalFreight: 0
   });


  // ── Fetch suppliers ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoadingSuppliers(true);
      const { data } = await supabase
        .from('suppliers')
        .select('id, supplier_no, name, category, mobile, email, city, credit_limit, outstanding, gstin, pan')
        .eq('deleted', false)
        .eq('status', 'Active')
        .order('name');
      const list = data || [];
      setSuppliers(list);
      if (list.length > 0) setSelectedSupplierId(list[0].id);
      setLoadingSuppliers(false);
    };
    fetchSuppliers();
  }, []);

  // ── Fetch ledger ───────────────────────────────────────────────────────────
  const fetchLedger = useCallback(async () => {
    if (!selectedSupplierId) return;
    setLoadingLedger(true);
    setSearched(true);

    // ── Opening balance: all transactions BEFORE fromDate ──────────────────
    const { data: beforeData } = await supabase
      .from('v_supplier_ledger')
      .select('debit, credit')
      .eq('supplier_id', selectedSupplierId)
      .lt('date', fromDate);

    const opening = (beforeData || []).reduce(
      (acc, row) => acc + (row.credit - row.debit), 0
    );
    setOpeningBalance(opening);

    // ── Ledger entries within date range ───────────────────────────────────
    const { data: ledgerData, error } = await supabase
      .from('v_supplier_ledger')
      .select('*')
      .eq('supplier_id', selectedSupplierId)
      .gte('date', fromDate)
      .lte('date', toDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Ledger fetch error:', error);
      setLoadingLedger(false);
      return;
    }

    // Fetch trip stats for this supplier
    const { data: tripData } = await supabase
      .from('trips')
      .select('status, freight_amount')
      .eq('supplier_id', selectedSupplierId)
      .eq('deleted', false);

    const trips = tripData || [];
    setTripStats({
      total:        trips.length,
      pending:      trips.filter(t => t.status === 'Pending').length,
      settled:      trips.filter(t => t.status === 'Settled').length,
      totalFreight: trips.reduce((s, t) => s + (t.freight_amount || 0), 0),
    });

    setLedger(ledgerData || []);
    setLoadingLedger(false);
  }, [selectedSupplierId, fromDate, toDate]);

  // ── Computed values ────────────────────────────────────────────────────────
  const supplier = suppliers.find(s => s.id === selectedSupplierId);

  // Running balance rows
  const rows = ledger.reduce<(LedgerEntry & { balance: number })[]>((acc, entry) => {
    const prev  = acc.length > 0 ? acc[acc.length - 1].balance : openingBalance;
    const balance = prev + entry.credit - entry.debit;
    acc.push({ ...entry, balance });
    return acc;
  }, []);

  const totalDebit   = ledger.reduce((s, e) => s + e.debit,  0);
  const totalCredit  = ledger.reduce((s, e) => s + e.credit, 0);
  const closingBalance = openingBalance + totalCredit - totalDebit;

  // ── Print ──────────────────────────────────────────────────────────────────
  const handlePrint = () => window.print();

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = ['Date','Type','Reference No','Description','Debit','Credit','Balance'];
    const csvRows = [
      headers.join(','),
      `Opening Balance,,,,,${openingBalance}`,
      ...rows.map(r => [
        r.date, r.type, r.ref_no,
        `"${r.description}"`,
        r.debit, r.credit, r.balance
      ].join(',')),
      `Total,,,,${totalDebit},${totalCredit},${closingBalance}`,
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${supplier?.name}_ledger_${fromDate}_to_${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Supplier Ledger" breadcrumbs={[{ label:'Suppliers' }, { label:'Supplier Ledger' }]}/>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ── Header actions ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-gray-800">Supplier Ledger</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">Track purchases and payments per supplier</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[12px] hover:bg-white">
              <Printer size={13}/> Print
            </button>
            <button onClick={handleExport} disabled={!searched || rows.length === 0}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-blue-700 disabled:opacity-40">
              <Download size={13}/> Export CSV
            </button>
          </div>
        </div>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-[11px] text-gray-500 block mb-1">Select Supplier</label>
              {loadingSuppliers ? (
                <div className="flex items-center gap-2 text-gray-400 text-[12px]">
                  <Loader2 size={13} className="animate-spin"/> Loading…
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200">
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} — {s.category}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                </div>
              )}
            </div>
            <div>
              <label className="text-[11px] text-gray-500 block mb-1">From Date</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"/>
            </div>
            <div>
              <label className="text-[11px] text-gray-500 block mb-1">To Date</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"/>
            </div>
            <button onClick={fetchLedger} disabled={loadingLedger || !selectedSupplierId}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-[12px] font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5">
              {loadingLedger
                ? <><Loader2 size={13} className="animate-spin"/> Loading…</>
                : <><Search size={13}/> Show Ledger</>
              }
            </button>
          </div>
        </div>

        {/* ── Summary Cards ───────────────────────────────────────────────── */}
        {supplier && (
         <div className="grid grid-cols-4 gap-3 lg:grid-cols-4">
            {/* Supplier info card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-[16px]">
                  {supplier.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-[13px] leading-tight">{supplier.name}</p>
                  <p className="text-[11px] text-gray-400">{supplier.supplier_no} · {supplier.category}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-[11px]">
                {[
                  ['Credit Limit', supplier.credit_limit ? `₹ ${supplier.credit_limit.toLocaleString('en-IN')}` : '—'],
                  ['Outstanding',  supplier.outstanding  ? `₹ ${supplier.outstanding.toLocaleString('en-IN')}` : '₹ 0'],
                  ['Contact',      supplier.mobile || '—'],
                  ['City',         supplier.city   || '—'],
                  ['GSTIN',        supplier.gstin  || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-400">{k}</span>
                    <span className="font-medium text-gray-700">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats cards */}
            {[
              {
                label: 'Opening Balance',
                value: `₹ ${Math.abs(openingBalance).toLocaleString('en-IN', {maximumFractionDigits:2})}`,
                sub:   openingBalance >= 0 ? 'Payable (Cr)' : 'Advance (Dr)',
                color: 'text-gray-700',
                icon:  FileText,
                bg:    'bg-gray-50',
              },
              {
                label: 'Total Purchases',
                value: `₹ ${totalCredit.toLocaleString('en-IN', {maximumFractionDigits:2})}`,
                sub:   `${ledger.filter(e => e.type==='Trip').length} transactions`,
                color: 'text-red-500',
                icon:  ArrowUpRight,
                bg:    'bg-red-50',
              },
              {
                label: 'Total Payments',
                value: `₹ ${totalDebit.toLocaleString('en-IN', {maximumFractionDigits:2})}`,
                sub:   `${ledger.filter(e => e.type==='Payment').length} transactions`,
                color: 'text-green-600',
                icon:  ArrowDownLeft,
                bg:    'bg-green-50',
              },
              {
                label: 'Closing Balance',
                value: `₹ ${Math.abs(closingBalance).toLocaleString('en-IN', {maximumFractionDigits:2})}`,
                sub:   closingBalance >= 0 ? 'Payable (Cr)' : 'Advance (Dr)',
                color: closingBalance > 0 ? 'text-orange-500' : 'text-green-600',
                icon:  FileText,
                bg:    'bg-orange-50',
              },
              {
                  label: 'Total Trips',
                  value: String(tripStats.total),
                  sub:   'All time',
                  color: 'text-blue-600',
                  icon:  FileText,
                  bg:    'bg-blue-50',
                },
                {
                  label: 'Pending Trips',
                  value: String(tripStats.pending),
                  sub:   'Not yet settled',
                  color: 'text-yellow-600',
                  icon:  ArrowUpRight,
                  bg:    'bg-yellow-50',
                },
                {
                  label: 'Settled Trips',
                  value: String(tripStats.settled),
                  sub:   'Completed',
                  color: 'text-green-600',
                  icon:  ArrowDownLeft,
                  bg:    'bg-green-50',
                },
                // {
                //   label: 'Total Freight',
                //   value: `₹ ${(tripStats.totalFreight / 100000).toFixed(1)}L`,
                //   sub:   'Supplier trips value',
                //   color: 'text-purple-600',
                //   icon:  FileText,
                //   bg:    'bg-purple-50',
                // },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[11px] text-gray-400">{c.label}</p>
                  <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center`}>
                    <c.icon size={13} className="text-gray-400"/>
                  </div>
                </div>
                <p className={`text-[18px] font-bold ${c.color}`}>{searched ? c.value : '—'}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{c.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Ledger Table ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-gray-800">
              {supplier ? `Ledger — ${supplier.name}` : 'Ledger'}
              {searched && (
                <span className="text-[12px] font-normal text-gray-400 ml-2">
                  ({fmtDate(fromDate)} to {fmtDate(toDate)})
                </span>
              )}
            </h3>
            {rows.length > 0 && (
              <span className="text-[11px] text-gray-400">{rows.length} entries</span>
            )}
          </div>

          {!searched ? (
            <div className="text-center py-16 text-gray-400 text-[12px]">
              <Search size={24} className="mx-auto mb-2 opacity-30"/>
              Select a supplier and date range, then click Show Ledger
            </div>
          ) : loadingLedger ? (
            <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin"/> Loading ledger…
            </div>
          ) : (
            <>
              {/* Opening balance row */}
              <div className="bg-blue-50 rounded-lg px-4 py-2.5 mb-2 flex items-center justify-between text-[12px]">
                <span className="text-blue-700 font-medium">
                  Opening Balance as on {fmtDate(fromDate)}
                </span>
                <span className="text-blue-700 font-bold">
                  ₹ {Math.abs(openingBalance).toLocaleString('en-IN', {maximumFractionDigits:2})}
                  {' '}{openingBalance >= 0 ? 'Cr' : 'Dr'}
                </span>
              </div>

              {rows.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-[12px]">
                  No transactions found for this period
                </div>
              ) : (
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-2.5 px-2 font-medium">Date</th>
                      <th className="text-left py-2.5 px-2 font-medium">Type</th>
                      <th className="text-left py-2.5 px-2 font-medium">Reference No.</th>
                      <th className="text-left py-2.5 px-2 font-medium">Description</th>
                      <th className="text-left py-2.5 px-2 font-medium">Trip No.</th>
                      <th className="text-right py-2.5 px-2 font-medium">Freight (₹)</th>
                      <th className="text-right py-2.5 px-2 font-medium">Supplier Charge (₹)</th>
                      <th className="text-left py-2.5 px-2 font-medium">Trip Status</th>
                      <th className="text-left py-2.5 px-2 font-medium">Payment Status</th>
                      <th className="text-right py-2.5 px-2 font-medium">Debit (₹)</th>
                      <th className="text-right py-2.5 px-2 font-medium">Credit (₹)</th>
                      <th className="text-right py-2.5 px-2 font-medium">Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((e, i) => (
                      <tr key={e.id}
                        className={`border-b border-gray-50 hover:bg-gray-50 transition-colors
                          ${e.type==='Payment' ? 'bg-green-50/30' : ''}`}>
                        <td className="py-2.5 px-2 text-gray-500 whitespace-nowrap">{fmtDate(e.date)}</td>
                        <td className="py-2.5 px-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium
                            ${e.type==='Trip'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'}`}>
                            {e.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-blue-600 font-medium">{e.ref_no}</td>
                        <td className="py-2.5 px-2 text-gray-600 max-w-[200px] truncate">{e.description}</td>
                        <td className="py-2.5 px-2 text-gray-400">{e.trip_no || '—'}</td>
                        <td className="py-2.5 px-2 text-right font-medium text-blue-600">
                          {e.freight_amount ? fmt(e.freight_amount) : '—'}
                        </td>
                        <td className="py-2.5 px-2 text-right font-medium text-orange-500">
                              {e.supplier_charge ? fmt(e.supplier_charge) : '—'}
                            </td>
                            <td className="py-2.5 px-2">
                              {e.trip_status ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                                  {e.trip_status}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="py-2.5 px-2">
                              {e.invoice_status ? (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium
                                  ${e.invoice_status === 'PaidOut' ? 'bg-green-100 text-green-700'
                                    : e.invoice_status === 'PaymentReceived' ? 'bg-blue-100 text-blue-700'
                                    : 'bg-yellow-100 text-yellow-700'}`}>
                                  {e.invoice_status}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="py-2.5 px-2 text-right font-medium text-green-600">{fmt(e.debit)}</td>
                        <td className="py-2.5 px-2 text-right font-medium text-red-500">{fmt(e.credit)}</td>
                        <td className="py-2.5 px-2 text-right font-bold text-gray-800">
                          ₹ {Math.abs(e.balance).toLocaleString('en-IN', {maximumFractionDigits:2})}
                          <span className={`text-[10px] ml-1 font-normal ${e.balance >= 0 ? 'text-red-400' : 'text-green-500'}`}>
                            {e.balance >= 0 ? 'Cr' : 'Dr'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold">
                      <td colSpan={9} className="py-2.5 px-2 text-[12px] text-gray-700">Total</td>
                      <td className="py-2.5 px-2 text-right text-[12px] text-green-600">
                        ₹ {totalDebit.toLocaleString('en-IN', {maximumFractionDigits:2})}
                      </td>
                      <td className="py-2.5 px-2 text-right text-[12px] text-red-500">
                        ₹ {totalCredit.toLocaleString('en-IN', {maximumFractionDigits:2})}
                      </td>
                      <td className="py-2.5 px-2 text-right text-[12px] text-gray-800">
                        ₹ {Math.abs(closingBalance).toLocaleString('en-IN', {maximumFractionDigits:2})}
                        <span className={`text-[10px] ml-1 font-normal ${closingBalance >= 0 ? 'text-red-400' : 'text-green-500'}`}>
                          {closingBalance >= 0 ? 'Cr' : 'Dr'}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}

              {/* Closing balance row */}
              {rows.length > 0 && (
                <div className="bg-orange-50 rounded-lg px-4 py-2.5 mt-2 flex items-center justify-between text-[12px]">
                  <span className="text-orange-700 font-medium">
                    Closing Balance as on {fmtDate(toDate)}
                  </span>
                  <span className="text-orange-700 font-bold">
                    ₹ {Math.abs(closingBalance).toLocaleString('en-IN', {maximumFractionDigits:2})}
                    {' '}{closingBalance >= 0 ? 'Cr' : 'Dr'}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
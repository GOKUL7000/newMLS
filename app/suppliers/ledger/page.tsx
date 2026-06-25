'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Download, Printer, ChevronDown, FileText, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';

const supabase = createClientComponentClient();

const fmt = (v: number) => v > 0 ? '₹ ' + v.toLocaleString('en-IN') : '-';
const fmtMoney = (v: number) => '₹ ' + v.toLocaleString('en-IN');
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

interface Supplier {
  id: string;
  supplier_no: string;
  name: string;
  category: string;
  mobile: string | null;
  city: string | null;
  gstin: string | null;
  credit_limit: number;
  outstanding: number;
}

interface LedgerRow {
  date: string;
  type: 'Trip Cost' | 'Advance';
  ref: string;
  desc: string;
  debit: number;   // advance paid out
  credit: number;  // supplier cost owed
  balance: number;
  tripId: string;
}

export default function SupplierLedgerPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  // ── Load suppliers dropdown ──────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from('suppliers')
      .select('id, supplier_no, name, category, mobile, city, gstin, credit_limit, outstanding')
      .eq('deleted', false)
      .eq('status', 'Active')
      .order('name')
      .then(({ data }) => {
        if (data?.length) {
          setSuppliers(data);
          setSelectedId(data[0].id);
        }
      });
  }, []);

  // ── Build ledger ─────────────────────────────────────────────────────────
  const loadLedger = useCallback(async () => {
    if (!selectedId) return;
    setLoading(true);

    // 1. Trips in range for this supplier
    const { data: trips } = await supabase
      .from('trips')
      .select('id, trip_no, start_date, origin, destination, supplier_amount, charges_value, tds_amount, ownership')
      .eq('supplier_id', selectedId)
      // .gte('start_date', fromDate)
      // .lte('start_date', toDate)
      //.order('start_date');

      //console.log(selectedId)

    // 2. Trips BEFORE range → opening balance
    const { data: prevTrips } = await supabase
      .from('trips')
      .select('id, supplier_amount, charges_value, tds_amount')
      .eq('supplier_id', selectedId)
      .eq('ownership', 'Marker Truck')
      .eq('deleted', false)
      .lt('start_date', fromDate);

    // 3. Advances for all relevant trip IDs
    const allTripIds = [
      ...(trips?.map(t => t.id) || []),
      ...(prevTrips?.map(t => t.id) || []),
    ];

    const { data: allExpenses } = allTripIds.length
      ? await supabase
          .from('trip_expenses')
          .select('trip_id, advance_amount')
          .in('trip_id', allTripIds)
      : { data: [] };

    // Group advances by trip_id
    const advanceByTrip: Record<string, number> = {};
    for (const e of allExpenses || []) {
      advanceByTrip[e.trip_id] = (advanceByTrip[e.trip_id] || 0) + Number(e.advance_amount || 0);
    }

    // Opening balance = sum of (supplier_cost - advance) for trips BEFORE range
    const opening = (prevTrips || []).reduce((sum, t) => {
      const cost = Number(t.supplier_amount || 0) - Number(t.charges_value || 0);
      const adv  = advanceByTrip[t.id] || 0;
      return sum + cost - adv;
    }, 0);
    setOpeningBalance(opening);

    // Build ledger rows — one "Trip Cost" row + one "Advance" row per trip
    let runningBalance = opening;
    const rows: LedgerRow[] = [];

    for (const t of trips || []) {
      const supplierCost = Number(t.supplier_amount || 0) - Number(t.charges_value || 0);
      const advance      = advanceByTrip[t.id] || 0;
      const desc         = `${t.origin || ''} → ${t.destination || ''}`;

      // Credit row: supplier cost (what we owe)
      if (supplierCost > 0) {
        runningBalance += supplierCost;
        rows.push({
          date: t.start_date,
          type: 'Trip Cost',
          ref: t.trip_no || t.id.slice(0, 8).toUpperCase(),
          desc,
          debit: 0,
          credit: supplierCost,
          balance: runningBalance,
          tripId: t.id,
        });
      }

      // Debit row: advance paid (reduces what we owe)
      if (advance > 0) {
        runningBalance -= advance;
        rows.push({
          date: t.start_date,
          type: 'Advance',
          ref: t.trip_no || t.id.slice(0, 8).toUpperCase(),
          desc: `Advance — ${desc}`,
          debit: advance,
          credit: 0,
          balance: runningBalance,
          tripId: t.id,
        });
      }
    }

    setLedger(rows);
    setLoading(false);
  }, [selectedId, fromDate, toDate]);

  // auto-load when supplier changes
  useEffect(() => { loadLedger(); }, [loadLedger]);

  const supplier     = suppliers.find(s => s.id === selectedId);
  const totalCredit  = ledger.reduce((s, r) => s + r.credit, 0);
  const totalDebit   = ledger.reduce((s, r) => s + r.debit, 0);
  const closingBal   = ledger[ledger.length - 1]?.balance ?? openingBalance;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Supplier Ledger</h1>
          <p className="text-sm text-gray-500">Dashboard / Suppliers / Supplier Ledger</p>
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
            <label className="text-xs text-gray-500 block mb-1">Select Supplier</label>
            <div className="relative">
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200">
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
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
          <button onClick={loadLedger}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Show Ledger
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Supplier Info Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
              {supplier?.name?.[0] ?? '?'}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{supplier?.name}</p>
              <p className="text-xs text-gray-400">{supplier?.supplier_no} · {supplier?.category}</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Credit Limit</span>
              <span className="font-medium text-gray-700">{fmtMoney(supplier?.credit_limit || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Outstanding</span>
              <span className="font-medium text-orange-600">{fmtMoney(supplier?.outstanding || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Contact</span>
              <span className="font-medium text-gray-700">{supplier?.mobile || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">City</span>
              <span className="font-medium text-gray-700">{supplier?.city || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">GSTIN</span>
              <span className="font-medium text-gray-700">{supplier?.gstin || '—'}</span>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        {[
          { label: 'Opening Balance', value: fmtMoney(Math.abs(openingBalance)), sub: `As on ${fmtDate(fromDate)}`, color: 'text-gray-700', icon: FileText },
          { label: 'Total Trip Cost',  value: fmtMoney(totalCredit), sub: 'This Period (Cr)',  color: 'text-red-500',    icon: ArrowUpRight },
          { label: 'Total Advance',    value: fmtMoney(totalDebit),  sub: 'This Period (Dr)',  color: 'text-green-600',  icon: ArrowDownLeft },
          {
            label: 'Closing Balance',
            value: fmtMoney(Math.abs(closingBal)),
            sub: closingBal >= 0 ? 'Payable (Cr)' : 'Advance Excess (Dr)',
            color: closingBal >= 0 ? 'text-orange-500' : 'text-green-600',
            icon: FileText,
          },
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
            Ledger — {supplier?.name}
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({fmtDate(fromDate)} to {fmtDate(toDate)})
            </span>
          </h3>
        </div>

        {/* Opening Balance Banner */}
        <div className="bg-blue-50 rounded-lg px-4 py-2.5 mb-2 flex items-center justify-between text-sm">
          <span className="text-blue-700 font-medium">Opening Balance as on {fmtDate(fromDate)}</span>
          <span className="text-blue-700 font-bold">
            {fmtMoney(Math.abs(openingBalance))} {openingBalance >= 0 ? 'Cr' : 'Dr'}
          </span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-gray-200">
              <th className="text-left py-3 pr-4">Date</th>
              <th className="text-left py-3 pr-4">Type</th>
              <th className="text-left py-3 pr-4">Trip No.</th>
              <th className="text-left py-3 pr-4">Description</th>
              <th className="text-right py-3 pr-4">Advance / Dr (₹)</th>
              <th className="text-right py-3 pr-4">Trip Cost / Cr (₹)</th>
              <th className="text-right py-3">Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400 text-sm">
                  <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                  Loading ledger...
                </td>
              </tr>
            ) : ledger.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400 text-sm">
                  No transactions found for this period.
                </td>
              </tr>
            ) : (
              ledger.map((row, i) => (
                <tr key={i}
                  className={`border-b border-gray-50 hover:bg-gray-50 ${
                    row.type === 'Advance' ? 'bg-green-50/40' : ''
                  }`}>
                  <td className="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">{fmtDate(row.date)}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      row.type === 'Trip Cost'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>{row.type}</span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-blue-600 font-medium">{row.ref}</td>
                  <td className="py-3 pr-4 text-xs text-gray-600">{row.desc}</td>
                  <td className="py-3 pr-4 text-right text-xs font-medium text-green-600">{fmt(row.debit)}</td>
                  <td className="py-3 pr-4 text-right text-xs font-medium text-red-500">{fmt(row.credit)}</td>
                  <td className="py-3 text-right text-xs font-bold text-gray-800">
                    {fmtMoney(Math.abs(row.balance))} {row.balance >= 0 ? 'Cr' : 'Dr'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {!loading && ledger.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold">
                <td colSpan={4} className="py-3 pr-4 text-sm text-gray-700">Total</td>
                <td className="py-3 pr-4 text-right text-sm text-green-600">{fmtMoney(totalDebit)}</td>
                <td className="py-3 pr-4 text-right text-sm text-red-500">{fmtMoney(totalCredit)}</td>
                <td className="py-3 text-right text-sm text-gray-800">
                  {fmtMoney(Math.abs(closingBal))} {closingBal >= 0 ? 'Cr' : 'Dr'}
                </td>
              </tr>
            </tfoot>
          )}
        </table>

        {/* Closing Balance Banner */}
        {!loading && ledger.length > 0 && (
          <div className="bg-orange-50 rounded-lg px-4 py-2.5 mt-2 flex items-center justify-between text-sm">
            <span className="text-orange-700 font-medium">Closing Balance as on {fmtDate(toDate)}</span>
            <span className="text-orange-700 font-bold">
              {fmtMoney(Math.abs(closingBal))} {closingBal >= 0 ? 'Cr' : 'Dr'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
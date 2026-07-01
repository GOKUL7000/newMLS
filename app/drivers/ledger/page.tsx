'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Topbar from '@/components/layout/Topbar';
import {
  Download, Printer, ChevronDown, FileText,
  ArrowUpRight, ArrowDownLeft, Loader2, Search, CheckCircle2, Clock,
} from 'lucide-react';

const supabase = createClientComponentClient();

// ─── Types ────────────────────────────────────────────────────────────────────
interface Driver {
  id: string;
  driver_no?: string;
  name: string;
  mobile: string | null;
  license_no?: string | null;
}

interface DriverTripRow {
  id: string;
  date: string;
  ref_no: string;          // trip_no
  description: string;     // route
  trip_no: string | null;
  freight_amount: number | null;
  driver_bata: number;
  advance_given: number;
  net_payable: number;
  trip_status: string | null;
  invoice_status: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  v > 0 ? '₹ ' + v.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '—';

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const isPaid = (invoiceStatus: string | null) => invoiceStatus === 'PaidOut';

// ─────────────────────────────────────────────────────────────────────────────
export default function DriverLedgerPage() {
  const [drivers, setDrivers]                 = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate]   = useState(() => new Date().toISOString().split('T')[0]);
  const [rows, setRows]       = useState<DriverTripRow[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [loadingLedger, setLoadingLedger]   = useState(false);
  const [searched, setSearched]             = useState(false);
  const [search, setSearch]                 = useState('');

  // ── Fetch drivers ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDrivers = async () => {
      setLoadingDrivers(true);
      const { data } = await supabase
        .from('drivers')
        .select('id, name, mobile')
        .eq('deleted', false)
        .eq('status', 'Active')
        .order('name');
      const list = data || [];
      setDrivers(list);
      if (list.length > 0) setSelectedDriverId(list[0].id);
      setLoadingDrivers(false);
    };
    fetchDrivers();
  }, []);

  // ── Fetch driver ledger ────────────────────────────────────────────────────
  const fetchLedger = useCallback(async () => {
    if (!selectedDriverId) return;
    setLoadingLedger(true);
    setSearched(true);

    const { data, error } = await supabase
      .from('v_driver_ledger')
      .select('*')
      .eq('driver_id', selectedDriverId)
      .gte('date', fromDate)
      .lte('date', toDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Driver ledger fetch error:', error);
      setLoadingLedger(false);
      return;
    }

    setRows((data || []).map((r: any) => ({
      id:             r.id,
      date:           r.date,
      ref_no:         r.trip_no,
      description:    r.description,
      trip_no:        r.trip_no,
      freight_amount: r.freight_amount,
      driver_bata:    parseFloat(r.driver_bata) || 0,
      advance_given:  parseFloat(r.advance_given) || 0,
      net_payable:    parseFloat(r.net_payable) || 0,
      trip_status:    r.trip_status,
      invoice_status: r.invoice_status,
    })));

    setLoadingLedger(false);
  }, [selectedDriverId, fromDate, toDate]);

  // ── Computed values ────────────────────────────────────────────────────────
  const driver = drivers.find(d => d.id === selectedDriverId);

  const filteredRows = rows.filter(r =>
    (r.trip_no || '').toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalTrips      = filteredRows.length;
  const paidTrips        = filteredRows.filter(r => isPaid(r.invoice_status)).length;
  const pendingTrips      = totalTrips - paidTrips;
  const totalBata        = filteredRows.reduce((s, r) => s + r.driver_bata, 0);
  const totalAdvance     = filteredRows.reduce((s, r) => s + r.advance_given, 0);
  const totalNetPayable  = filteredRows.reduce((s, r) => s + r.net_payable, 0);
  const totalPaidAmount  = filteredRows.filter(r => isPaid(r.invoice_status)).reduce((s, r) => s + r.net_payable, 0);
  const totalPendingAmount = totalNetPayable - totalPaidAmount;

  // ── Print ──────────────────────────────────────────────────────────────────
  const handlePrint = () => window.print();

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = ['Date','Trip No','Route','Driver Bata','Advance','Net Payable','Trip Status','Payment Status'];
    const csvRows = [
      headers.join(','),
      ...filteredRows.map(r => [
        fmtDate(r.date), r.trip_no, `"${r.description}"`,
        r.driver_bata, r.advance_given, r.net_payable,
        r.trip_status, r.invoice_status || 'No Invoice',
      ].join(',')),
      `Total,,,${totalBata},${totalAdvance},${totalNetPayable},,`,
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${driver?.name}_ledger_${fromDate}_to_${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Driver Ledger" breadcrumbs={[{ label:'Drivers' }, { label:'Driver Ledger' }]}/>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-gray-800">Driver Ledger</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">Track driver bata, advances and payments per trip</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[12px] hover:bg-white">
              <Printer size={13}/> Print
            </button>
            <button onClick={handleExport} disabled={!searched || filteredRows.length===0}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-blue-700 disabled:opacity-40">
              <Download size={13}/> Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-[11px] text-gray-500 block mb-1">Select Driver</label>
              {loadingDrivers ? (
                <div className="flex items-center gap-2 text-gray-400 text-[12px]">
                  <Loader2 size={13} className="animate-spin"/> Loading…
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedDriverId}
                    onChange={e => setSelectedDriverId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200">
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} {d.mobile ? `— ${d.mobile}` : ''}</option>
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
            <button onClick={fetchLedger} disabled={loadingLedger || !selectedDriverId}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-[12px] font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5">
              {loadingLedger
                ? <><Loader2 size={13} className="animate-spin"/> Loading…</>
                : <><Search size={13}/> Show Ledger</>
              }
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {driver && (
          <div className="grid grid-cols-4 gap-3">
            {/* Driver info card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-[16px]">
                  {driver.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-[13px] leading-tight">{driver.name}</p>
                  <p className="text-[11px] text-gray-400">{driver.mobile || '—'}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-[11px]">
                {[
                  ['Total Trips',    String(totalTrips)],
                  ['Paid Trips',     String(paidTrips)],
                  ['Pending Trips',  String(pendingTrips)],
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
                label: 'Total Driver Bata',
                value: searched ? fmt(totalBata) : '—',
                sub:   `${totalTrips} trips`,
                color: 'text-blue-600',
                icon:  FileText,
                bg:    'bg-blue-50',
              },
              {
                label: 'Total Advance Given',
                value: searched ? fmt(totalAdvance) : '—',
                sub:   'Deducted from bata',
                color: 'text-orange-500',
                icon:  ArrowDownLeft,
                bg:    'bg-orange-50',
              },
              {
                label: 'Payment Done',
                value: searched ? String(paidTrips) : '—',
                sub:   searched ? fmt(totalPaidAmount) : '—',
                color: 'text-green-600',
                icon:  CheckCircle2,
                bg:    'bg-green-50',
              },
              {
                label: 'Payment Pending',
                value: searched ? String(pendingTrips) : '—',
                sub:   searched ? fmt(totalPendingAmount) : '—',
                color: 'text-yellow-600',
                icon:  Clock,
                bg:    'bg-yellow-50',
              },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[11px] text-gray-400">{c.label}</p>
                  <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center`}>
                    <c.icon size={13} className="text-gray-400"/>
                  </div>
                </div>
                <p className={`text-[18px] font-bold ${c.color}`}>{c.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{c.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Net Payable summary banner */}
        {searched && filteredRows.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-500">Net Total Payable to {driver?.name}</p>
              <p className="text-[20px] font-bold text-gray-800">{fmt(totalNetPayable)}</p>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-[11px] text-green-600 font-medium">Already Paid</p>
                <p className="text-[16px] font-bold text-green-700">{fmt(totalPaidAmount)}</p>
              </div>
              <div>
                <p className="text-[11px] text-yellow-600 font-medium">Still Pending</p>
                <p className="text-[16px] font-bold text-yellow-700">{fmt(totalPendingAmount)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Ledger Table */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-gray-800">
              {driver ? `Trip Ledger — ${driver.name}` : 'Trip Ledger'}
              {searched && (
                <span className="text-[12px] font-normal text-gray-400 ml-2">
                  ({fmtDate(fromDate)} to {fmtDate(toDate)})
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {filteredRows.length > 0 && (
                <span className="text-[11px] text-gray-400">{filteredRows.length} trips</span>
              )}
              {searched && (
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search trip, route…"
                    className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] w-44 focus:outline-none focus:border-blue-400"/>
                </div>
              )}
            </div>
          </div>

          {!searched ? (
            <div className="text-center py-16 text-gray-400 text-[12px]">
              <Search size={24} className="mx-auto mb-2 opacity-30"/>
              Select a driver and date range, then click Show Ledger
            </div>
          ) : loadingLedger ? (
            <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin"/> Loading ledger…
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-[12px]">
              No trips found for this period
            </div>
          ) : (
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-gray-400 border-b border-gray-200 bg-gray-50">
                  <th className="text-left  py-2.5 px-2 font-medium">Date</th>
                  <th className="text-left  py-2.5 px-2 font-medium">Trip No.</th>
                  <th className="text-left  py-2.5 px-2 font-medium">Route</th>
                  {/* <th className="text-right py-2.5 px-2 font-medium">Freight (₹)</th> */}
                  <th className="text-right py-2.5 px-2 font-medium">Driver Bata (₹)</th>
                  <th className="text-right py-2.5 px-2 font-medium">Advance (₹)</th>
                  <th className="text-right py-2.5 px-2 font-medium">Net Payable (₹)</th>
                  <th className="text-left  py-2.5 px-2 font-medium">Trip Status</th>
                  <th className="text-left  py-2.5 px-2 font-medium">Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map(r => (
                  <tr key={r.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors
                      ${isPaid(r.invoice_status) ? 'bg-green-50/20' : ''}`}>
                    <td className="py-2.5 px-2 text-gray-500 whitespace-nowrap">{fmtDate(r.date)}</td>
                    <td className="py-2.5 px-2 text-blue-600 font-medium">{r.trip_no}</td>
                    <td className="py-2.5 px-2 text-gray-600 max-w-[180px] truncate">{r.description}</td>
                    {/* <td className="py-2.5 px-2 text-right text-gray-600">
                      {r.freight_amount ? fmt(r.freight_amount) : '—'}
                    </td> */}
                    <td className="py-2.5 px-2 text-right font-medium text-blue-600">{fmt(r.driver_bata)}</td>
                    <td className="py-2.5 px-2 text-right font-medium text-orange-500">{fmt(r.advance_given)}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-gray-800">{fmt(r.net_payable)}</td>
                    <td className="py-2.5 px-2">
                      {r.trip_status ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                          {r.trip_status}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-2.5 px-2">
                      {isPaid(r.invoice_status) ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                          <CheckCircle2 size={9}/> Paid
                        </span>
                      ) : r.invoice_status ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">
                          {r.invoice_status}
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
                          No Invoice
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold">
                  <td colSpan={2} className="py-2.5 px-2 text-[12px] text-gray-700">
                    Total ({filteredRows.length} trips)
                  </td>
                  <td/>
                  <td className="py-2.5 px-2 text-right text-[12px] text-blue-600">{fmt(totalBata)}</td>
                  <td className="py-2.5 px-2 text-right text-[12px] text-orange-500">{fmt(totalAdvance)}</td>
                  <td className="py-2.5 px-2 text-right text-[12px] text-gray-800">{fmt(totalNetPayable)}</td>
                  <td colSpan={2}/>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
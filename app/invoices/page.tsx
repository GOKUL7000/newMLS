'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Topbar from '@/components/layout/Topbar';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  Search, X, Loader2, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, FileText, CreditCard,
  ArrowRight, Clock, CheckCheck, Wallet,
} from 'lucide-react';

const supabase = createClientComponentClient();

// ─── Types ────────────────────────────────────────────────────────────────────
interface Invoice {
  id: string;
  invoice_no: string;
  trip_id: string;
  customer_id: string | null;
  invoice_date: string;
  amount: number;
  status: 'Pending' | 'PaymentReceived' | 'PaidOut';
  payment_received_at: string | null;
  payment_received_amount: number | null;
  paid_out_at: string | null;
  paid_out_amount: number | null;
  notes: string | null;
  // joined from trips + nested
  customer_name?: string;
  trip_no?: string;
  trip_date?: string | null;
  vehicle_no?: string;
  origin?: string;
  destination?: string;
  ownership?: string;
  driver_name?: string;
  supplier_name?: string;
  estimated_profit?: number | null;
  supplier_amount?: number | null;
  tds_amount?: number | null;
  material?: string | null;
}

interface ReadyTrip {
  id: string;
  trip_no: string;
  trip_date: string;
  customer_id: string | null;
  customer_name?: string;
  vehicle_no?: string;
  origin: string | null;
  destination: string | null;
  freight_amount: number | null;
  ownership: string;
  driver_name?: string;
  supplier_name?: string;
  material: string | null;
  estimated_profit: number | null;
}

type ToastType = 'success' | 'error';
interface Toast { id: number; type: ToastType; message: string; }

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;
const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  Pending:         { label: 'Pending',          color: 'bg-yellow-100 text-yellow-700', dot: '#f59e0b' },
  PaymentReceived: { label: 'Payment Received', color: 'bg-blue-100 text-blue-700',    dot: '#3b82f6' },
  PaidOut:         { label: 'Paid Out',         color: 'bg-green-100 text-green-700',  dot: '#22c55e' },
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-[12px] font-medium text-white pointer-events-auto
          ${t.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
          {t.type === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {t.message}
          <button onClick={() => onRemove(t.id)} className="ml-2 opacity-70 hover:opacity-100"><X size={12} /></button>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [readyTrips, setReadyTrips] = useState<ReadyTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState(0);       // 0 = Ready to Invoice, 1 = All Invoices
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedTrips, setSelectedTrips] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const toast = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  // ── Fetch trips ready to invoice (status = GenerateInvoice, no invoice yet) ─
 const fetchReadyTrips = useCallback(async () => {
  const { data, error } = await supabase
    .from('trips')
    .select(`*, customers(name), vehicles(vehicle_no), drivers(name), suppliers(name)`)
    .eq('status', 'Settled')
    .eq('deleted', false)
    .order('created_at', { ascending: false });

  if (error) { toast('error', 'Failed to load trips: ' + error.message); return; }

  setReadyTrips((data || []).map((t: any) => ({
    ...t,
    customer_name: t.customers?.name || '—',
    vehicle_no:    t.vehicles?.vehicle_no || '—',
    driver_name:   t.drivers?.name || '—',
    supplier_name: t.suppliers?.name || '—',
  })));
}, [toast]);
  // ── Fetch all invoices with joined trip data ────────────────────────────────
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customers(name),
        trips(
          trip_no, trip_date, origin, destination, ownership,
          freight_amount, estimated_profit, supplier_amount, tds_amount, material,
          vehicles(vehicle_no), drivers(name), suppliers(name)
        )
      `)
      .eq('deleted', false)
      .order('created_at', { ascending: false });

    if (error) { toast('error', 'Failed to load invoices: ' + error.message); setLoading(false); return; }

    setInvoices((data || []).map((inv: any) => ({
      ...inv,
      customer_name:    inv.customers?.name                  || '—',
      trip_no:          inv.trips?.trip_no                   || '—',
      trip_date:        inv.trips?.trip_date                 || null,
      vehicle_no:       inv.trips?.vehicles?.vehicle_no      || '—',
      origin:           inv.trips?.origin                    || '—',
      destination:      inv.trips?.destination               || '—',
      ownership:        inv.trips?.ownership                 || '—',
      driver_name:      inv.trips?.drivers?.name             || '—',
      supplier_name:    inv.trips?.suppliers?.name           || '—',
      estimated_profit: inv.trips?.estimated_profit          ?? null,
      supplier_amount:  inv.trips?.supplier_amount           ?? null,
      tds_amount:       inv.trips?.tds_amount                ?? null,
      material:         inv.trips?.material                  || null,
    })));
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchReadyTrips(); fetchInvoices(); }, [fetchReadyTrips, fetchInvoices]);

  // ── Auto-increment invoice_no ──────────────────────────────────────────────
  const getNextInvoiceNo = async (): Promise<string> => {
    const { data } = await supabase.from('invoices').select('invoice_no');
    if (!data || data.length === 0) return 'INV001';
    const max = data.reduce((acc, r) => {
      const n = parseInt((r.invoice_no || 'INV000').replace(/\D/g, ''), 10);
      return n > acc ? n : acc;
    }, 0);
    return `INV${String(max + 1).padStart(3, '0')}`;
  };

  // ── Generate one invoice per selected trip ─────────────────────────────────
  const generateInvoices = async () => {
    if (selectedTrips.size === 0) { toast('error', 'Select at least one trip'); return; }
    setGenerating(true);

    const tripsToInvoice = readyTrips.filter(t => selectedTrips.has(t.id));
    let successCount = 0;
    let failCount = 0;

    for (const trip of tripsToInvoice) {
      const invoice_no = await getNextInvoiceNo();

      const { data: inv, error: invErr } = await supabase
        .from('invoices')
        .insert({
            invoice_no,
            trip_id:      trip.id,
            customer_id:  trip.customer_id,
            invoice_date: new Date().toISOString().split('T')[0],
            amount:       trip.freight_amount || 0,
            status:       'Pending',
        })
        .select()
        .single();
      if (invErr) { failCount++; continue; }

      // Link invoice back to trip and advance status to Settled
      const { error: tripErr } = await supabase
        .from('trips')
        .update({ invoice_id: inv.id, status: 'Settled' })
        .eq('id', trip.id);

      if (tripErr) failCount++; else successCount++;
    }

    if (successCount > 0) toast('success', `${successCount} invoice${successCount > 1 ? 's' : ''} generated`);
    if (failCount > 0)    toast('error',   `${failCount} invoice${failCount > 1 ? 's' : ''} failed`);

    setSelectedTrips(new Set());
    await fetchReadyTrips();
    await fetchInvoices();
    if (successCount > 0) setActiveTab(1);
    setGenerating(false);
  };

  // ── Payment status actions ─────────────────────────────────────────────────
  const markPaymentReceived = async (inv: Invoice) => {
    setActionLoading(true);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'PaymentReceived', payment_received_at: now, payment_received_amount: inv.amount })
      .eq('id', inv.id);

    if (error) { toast('error', 'Failed: ' + error.message); }
    else {
      toast('success', 'Payment marked as received');
      const updated = { ...inv, status: 'PaymentReceived' as const, payment_received_at: now };
      setSelectedInvoice(prev => prev?.id === inv.id ? updated : prev);
      setInvoices(prev => prev.map(i => i.id === inv.id ? updated : i));
    }
    setActionLoading(false);
  };

  const markPaidOut = async (inv: Invoice) => {
    setActionLoading(true);
    const now = new Date().toISOString();
    // For Marker Truck pay out supplier_amount; for My Truck pay out full freight
    const paidAmt = inv.ownership === 'Marker Truck' ? (inv.supplier_amount || 0) : (inv.amount || 0);

    const { error } = await supabase
      .from('invoices')
      .update({ status: 'PaidOut', paid_out_at: now, paid_out_amount: paidAmt })
      .eq('id', inv.id);

    if (error) { toast('error', 'Failed: ' + error.message); }
    else {
      toast('success', 'Payment done!');
      const updated = { ...inv, status: 'PaidOut' as const, paid_out_at: now, paid_out_amount: paidAmt };
      setSelectedInvoice(prev => prev?.id === inv.id ? updated : prev);
      setInvoices(prev => prev.map(i => i.id === inv.id ? updated : i));
    }
    setActionLoading(false);
  };

  // ── Filter & paginate ──────────────────────────────────────────────────────
  const filteredInvoices = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (inv.invoice_no    || '').toLowerCase().includes(q) ||
      (inv.customer_name || '').toLowerCase().includes(q) ||
      (inv.trip_no       || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredInvoices.length / PAGE_SIZE);
  const paginated  = filteredInvoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Aggregate stats ────────────────────────────────────────────────────────
  const stats = {
    total:       invoices.length,
    pending:     invoices.filter(i => i.status === 'Pending').length,
    received:    invoices.filter(i => i.status === 'PaymentReceived').length,
    paidOut:     invoices.filter(i => i.status === 'PaidOut').length,
    totalAmount: invoices.reduce((s, i) => s + (i.amount || 0), 0),
    outstanding: invoices.filter(i => i.status === 'Pending').reduce((s, i) => s + (i.amount || 0), 0),
  };

  const pieData = [
    { name: 'Pending',          value: stats.pending,  color: '#f59e0b' },
    { name: 'Payment Received', value: stats.received, color: '#3b82f6' },
    { name: 'Paid Out',         value: stats.paidOut,  color: '#22c55e' },
  ].filter(d => d.value > 0);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fmtDate  = (s: string | null | undefined) =>
    s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const fmtMoney = (n: number | null | undefined) =>
    n != null ? `₹ ${Number(n).toLocaleString('en-IN')}` : '₹ 0';

  const toggleTrip = (id: string) =>
    setSelectedTrips(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const toggleAll = () =>
    setSelectedTrips(selectedTrips.size === readyTrips.length && readyTrips.length > 0
      ? new Set()
      : new Set(readyTrips.map(t => t.id)));

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Topbar title="Invoices" breadcrumbs={[{ label: 'Invoices' }]} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ── Stats Cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Total Invoices',    value: stats.total,                                       color: 'text-blue-600',   sub: 'All Time' },
            { label: 'Pending',           value: stats.pending,                                      color: 'text-yellow-600', sub: 'Awaiting Payment' },
            { label: 'Payment Received',  value: stats.received,                                     color: 'text-blue-600',   sub: 'Customer Paid' },
            { label: 'Paid Out',          value: stats.paidOut,                                      color: 'text-green-600',  sub: 'Fully Settled' },
            { label: 'Total Billed',      value: `₹ ${(stats.totalAmount / 100000).toFixed(1)}L`,   color: 'text-blue-600',   sub: 'Invoice Amount' },
            { label: 'Outstanding',       value: `₹ ${(stats.outstanding / 100000).toFixed(1)}L`,   color: 'text-red-500',    sub: 'Pending Payment' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400">{c.label}</p>
              <p className={`text-[18px] font-bold ${c.color} mt-1`}>{c.value}</p>
              <p className="text-[10px] text-gray-400">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Main Grid ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3">

          {/* ── Left: Tab Panel ─────────────────────────────────────────── */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm">

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-4">
              {[
                { label: 'Ready to Invoice', icon: <Clock size={12} />,     badge: readyTrips.length },
                { label: 'All Invoices',     icon: <FileText size={12} />,  badge: null },
              ].map((t, i) => (
                <button key={t.label} onClick={() => { setActiveTab(i); setPage(1); setSearch(''); setStatusFilter('All'); }}
                  className={`py-3 px-4 text-[12px] font-medium border-b-2 transition-colors flex items-center gap-1.5
                    ${activeTab === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                  {t.icon}
                  {t.label}
                  {t.badge != null && t.badge > 0 && (
                    <span className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                      {t.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-4">

              {/* ── Tab 0: Ready to Invoice ──────────────────────────────── */}
              {activeTab === 0 && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[12px] text-gray-400">
                      Trips at <span className="font-medium text-gray-600">Generate Invoice</span> stage — select and generate
                    </p>
                    <button
                      onClick={generateInvoices}
                      disabled={selectedTrips.size === 0 || generating}
                      className="flex items-center gap-1.5 bg-[#1a56db] text-white px-4 py-1.5 rounded-lg text-[12px] font-medium hover:bg-blue-700 disabled:opacity-40 transition-opacity">
                      {generating
                        ? <Loader2 size={12} className="animate-spin" />
                        : <FileText size={12} />}
                      Generate Invoice{selectedTrips.size > 1 ? 's' : ''}
                      {selectedTrips.size > 0 && ` (${selectedTrips.size})`}
                    </button>
                  </div>

                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                        <th className="px-2 py-2 w-8">
                          <input
                            type="checkbox"
                            checked={selectedTrips.size === readyTrips.length && readyTrips.length > 0}
                            onChange={toggleAll}
                            className="rounded accent-blue-600"
                          />
                        </th>
                        {['Trip No', 'Date', 'Customer', 'Vehicle', 'Route', 'Type', 'Freight', 'Est. Profit'].map(h => (
                          <th key={h} className="text-left px-2 py-2 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {readyTrips.length === 0
                        ? (
                          <tr>
                            <td colSpan={9} className="text-center py-14 text-gray-300 text-[12px]">
                              No trips ready for invoicing
                            </td>
                          </tr>
                        )
                        : readyTrips.map(t => (
                          <tr
                            key={t.id}
                            onClick={() => toggleTrip(t.id)}
                            className={`border-b border-gray-50 cursor-pointer transition-colors
                              ${selectedTrips.has(t.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                            <td className="px-2 py-2.5" onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedTrips.has(t.id)}
                                onChange={() => toggleTrip(t.id)}
                                className="rounded accent-blue-600"
                              />
                            </td>
                            <td className="px-2 py-2.5 text-blue-600 font-medium">{t.trip_no}</td>
                            <td className="px-2 py-2.5 text-gray-500">{fmtDate(t.trip_date)}</td>
                            <td className="px-2 py-2.5 font-medium text-gray-700 max-w-[100px] truncate">{t.customer_name}</td>
                            <td className="px-2 py-2.5 text-gray-500">{t.vehicle_no}</td>
                            <td className="px-2 py-2.5 text-gray-500 max-w-[110px] truncate">{t.origin} → {t.destination}</td>
                            <td className="px-2 py-2.5">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium
                                ${t.ownership === 'My Truck'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'}`}>
                                {t.ownership}
                              </span>
                            </td>
                            <td className="px-2 py-2.5 font-medium text-gray-700">{fmtMoney(t.freight_amount)}</td>
                            <td className={`px-2 py-2.5 font-medium
                              ${(t.estimated_profit || 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {fmtMoney(t.estimated_profit)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* ── Tab 1: All Invoices ──────────────────────────────────── */}
              {activeTab === 1 && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search invoice, customer, trip…"
                        className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] w-64 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] focus:outline-none">
                      <option value="All">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="PaymentReceived">Payment Received</option>
                      <option value="PaidOut">Paid Out</option>
                    </select>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                      <Loader2 size={16} className="animate-spin" /> Loading invoices…
                    </div>
                  ) : (
                    <>
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                            {['Invoice No', 'Date', 'Customer', 'Trip', 'Route', 'Freight', 'Est. Profit', 'Status', ''].map(h => (
                              <th key={h} className="text-left px-2 py-2 font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {paginated.length === 0
                            ? (
                              <tr>
                                <td colSpan={9} className="text-center py-14 text-gray-300 text-[12px]">
                                  No invoices found
                                </td>
                              </tr>
                            )
                            : paginated.map(inv => (
                              <tr
                                key={inv.id}
                                onClick={() => setSelectedInvoice(selectedInvoice?.id === inv.id ? null : inv)}
                                className={`border-b border-gray-50 cursor-pointer transition-colors
                                  ${selectedInvoice?.id === inv.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                <td className="px-2 py-2.5 text-blue-600 font-medium">{inv.invoice_no}</td>
                                <td className="px-2 py-2.5 text-gray-500">{fmtDate(inv.invoice_date)}</td>
                                <td className="px-2 py-2.5 font-medium text-gray-700 max-w-[100px] truncate">{inv.customer_name}</td>
                                <td className="px-2 py-2.5 text-gray-500">{inv.trip_no}</td>
                                <td className="px-2 py-2.5 text-gray-500 max-w-[110px] truncate">
                                  {inv.origin} → {inv.destination}
                                </td>
                                <td className="px-2 py-2.5 font-medium text-gray-700">{fmtMoney(inv.amount)}</td>
                                <td className={`px-2 py-2.5 font-medium
                                  ${(inv.estimated_profit || 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                  {fmtMoney(inv.estimated_profit)}
                                </td>
                                <td className="px-2 py-2.5">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium
                                    ${STATUS_CONFIG[inv.status]?.color || 'bg-gray-100 text-gray-500'}`}>
                                    {STATUS_CONFIG[inv.status]?.label || inv.status}
                                  </span>
                                </td>
                                {/* Quick-action button in table row */}
                                <td className="px-2 py-2.5" onClick={e => e.stopPropagation()}>
                                  {inv.status === 'Pending' && (
                                    <button
                                      onClick={() => markPaymentReceived(inv)}
                                      className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700 whitespace-nowrap">
                                      Mark Received
                                    </button>
                                  )}
                                  {inv.status === 'PaymentReceived' && (
                                    <button
                                      onClick={() => markPaidOut(inv)}
                                      className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700 whitespace-nowrap">
                                      Tap to Pay
                                    </button>
                                  )}
                                  {inv.status === 'PaidOut' && (
                                    <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5">
                                      <CheckCheck size={10} /> Done
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>

                      {filteredInvoices.length > PAGE_SIZE && (
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-[11px] text-gray-400">
                            Showing {(page - 1) * PAGE_SIZE + 1} – {Math.min(page * PAGE_SIZE, filteredInvoices.length)} of {filteredInvoices.length}
                          </p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setPage(p => Math.max(1, p - 1))}
                              disabled={page === 1}
                              className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30">
                              <ChevronLeft size={12} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                              <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-6 h-6 text-[10px] rounded ${p === page ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                                {p}
                              </button>
                            ))}
                            <button
                              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                              disabled={page === totalPages}
                              className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30">
                              <ChevronRight size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Right Panel ───────────────────────────────────────────────── */}
          <div className="space-y-3">

            {/* Status donut chart */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[13px] font-semibold text-gray-700 mb-2">Invoice Status</h3>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={110}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={44} dataKey="value">
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1 mt-1">
                    {pieData.map(d => (
                      <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="flex-1 text-gray-500">{d.name}</span>
                        <span className="font-semibold">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-[11px] text-gray-300 text-center py-6">No invoices yet</p>
              )}
            </div>

            {/* Quick filters */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[12px] font-semibold text-gray-700 mb-2">Quick Filters</h3>
              <div className="space-y-1">
                {[
                  { key: 'All',             label: 'All Invoices',     count: invoices.length },
                  { key: 'Pending',         label: 'Pending',          count: stats.pending   },
                  { key: 'PaymentReceived', label: 'Payment Received', count: stats.received  },
                  { key: 'PaidOut',         label: 'Paid Out',         count: stats.paidOut   },
                ].map(s => (
                  <button
                    key={s.key}
                    onClick={() => { setStatusFilter(s.key); setActiveTab(1); setPage(1); }}
                    className={`w-full text-left text-[11px] px-2 py-1 rounded transition-colors
                      ${statusFilter === s.key && activeTab === 1
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-500 hover:bg-gray-50'}`}>
                    {s.label}
                    <span className="float-right text-[10px] text-gray-400">{s.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Invoice Detail Drawer (slides in from right) ─────────────────────── */}
      <div className={`fixed inset-y-0 right-0 w-[360px] bg-white shadow-2xl border-l border-gray-100 z-40
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${selectedInvoice ? 'translate-x-0' : 'translate-x-full'}`}>

        {selectedInvoice && (
          <InvoiceDetailDrawer
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            onMarkReceived={markPaymentReceived}
            onMarkPaidOut={markPaidOut}
            actionLoading={actionLoading}
            fmtDate={fmtDate}
            fmtMoney={fmtMoney}
          />
        )}
      </div>

      {/* Backdrop for drawer */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}

// ─── Invoice Detail Drawer ────────────────────────────────────────────────────
function InvoiceDetailDrawer({
  invoice, onClose, onMarkReceived, onMarkPaidOut, actionLoading, fmtDate, fmtMoney,
}: {
  invoice: Invoice;
  onClose: () => void;
  onMarkReceived: (inv: Invoice) => void;
  onMarkPaidOut: (inv: Invoice) => void;
  actionLoading: boolean;
  fmtDate: (s: string | null | undefined) => string;
  fmtMoney: (n: number | null | undefined) => string;
}) {
  const isMarker = invoice.ownership === 'Marker Truck';
  const stepIdx  = invoice.status === 'Pending' ? 0 : invoice.status === 'PaymentReceived' ? 1 : 2;

  const steps = [
    { label: 'Invoice Sent',      desc: 'Waiting for customer payment' },
    { label: 'Payment Received',  desc: `Customer paid ${fmtMoney(invoice.amount)}` },
    { label: isMarker ? 'Supplier Paid' : 'Driver Paid',
                                  desc: `Paid out to ${isMarker ? invoice.supplier_name : invoice.driver_name}` },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#1a56db] text-white flex-shrink-0">
        <div>
          <p className="text-[15px] font-bold">{invoice.invoice_no}</p>
          <p className="text-[11px] opacity-80 mt-0.5">{invoice.customer_name}</p>
        </div>
        <button onClick={onClose} className="opacity-80 hover:opacity-100">
          <X size={16} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">

        {/* Progress stepper */}
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-col gap-3">
            {steps.map((step, i) => {
              const done    = i < stepIdx;
              const active  = i === stepIdx;
              const pending = i > stepIdx;
              return (
                <div key={step.label} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                    ${done ? 'bg-green-500' : active ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    {done
                      ? <CheckCheck size={11} className="text-white" />
                      : <span className="text-[10px] font-bold text-white">{i + 1}</span>
                    }
                  </div>
                  <div className={`${pending ? 'opacity-40' : ''}`}>
                    <p className={`text-[12px] font-semibold ${active ? 'text-blue-700' : done ? 'text-green-700' : 'text-gray-500'}`}>
                      {step.label}
                    </p>
                    <p className="text-[11px] text-gray-400">{step.desc}</p>
                    {done && i === 0 && invoice.payment_received_at && (
                      <p className="text-[10px] text-green-600 mt-0.5">on {fmtDate(invoice.payment_received_at)}</p>
                    )}
                    {done && i === 1 && invoice.paid_out_at && (
                      <p className="text-[10px] text-green-600 mt-0.5">{fmtMoney(invoice.paid_out_amount)} on {fmtDate(invoice.paid_out_at)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trip info */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Trip Details</p>
          <div className="space-y-2 text-[12px]">
            <Row label="Trip No">{invoice.trip_no}</Row>
            <Row label="Trip Date">{fmtDate(invoice.trip_date)}</Row>
            <Row label="Route">{invoice.origin} <ArrowRight size={10} className="inline mx-0.5" /> {invoice.destination}</Row>
            <Row label="Vehicle">{invoice.vehicle_no}</Row>
            <Row label="Material">{invoice.material || '—'}</Row>
            <Row label="Type">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium
                ${isMarker ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {invoice.ownership}
              </span>
            </Row>
            {isMarker
              ? <Row label="Supplier">{invoice.supplier_name}</Row>
              : <Row label="Driver">{invoice.driver_name}</Row>
            }
          </div>
        </div>

        {/* Financials */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Financials</p>
          <div className="space-y-2 text-[12px]">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer Freight</span>
              <span className="font-semibold text-blue-600">{fmtMoney(invoice.amount)}</span>
            </div>
            {isMarker && (
              <div className="flex justify-between">
                <span className="text-gray-500">Supplier Cost</span>
                <span className="font-semibold text-red-500">{fmtMoney(invoice.supplier_amount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">TDS Deduction</span>
              <span className="font-semibold text-gray-500">– {fmtMoney(invoice.tds_amount)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 mt-1">
              <span className="font-semibold text-gray-700">Est. Profit</span>
              <span className={`font-bold ${(invoice.estimated_profit || 0) >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {fmtMoney(invoice.estimated_profit)}
              </span>
            </div>
          </div>
        </div>

        {/* Payout info */}
        {isMarker && (
          <div className="px-5 py-4 border-b border-gray-100 bg-purple-50">
            <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wide mb-1">Supplier Payout</p>
            <p className="text-[12px] text-purple-700">
              {invoice.supplier_name} will receive <span className="font-bold">{fmtMoney(invoice.supplier_amount)}</span> when you tap to pay.
            </p>
          </div>
        )}
        {!isMarker && (
          <div className="px-5 py-4 border-b border-gray-100 bg-blue-50">
            <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide mb-1">Driver Payout</p>
            <p className="text-[12px] text-blue-700">
              {invoice.driver_name} will receive <span className="font-bold">{fmtMoney(invoice.amount)}</span> when you tap to pay.
            </p>
          </div>
        )}
      </div>

      {/* Sticky action footer */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-white">
        {invoice.status === 'Pending' && (
          <button
            onClick={() => onMarkReceived(invoice)}
            disabled={actionLoading}
            className="w-full py-2.5 bg-[#1a56db] text-white rounded-lg text-[13px] font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
            Mark Payment Received
          </button>
        )}

        {invoice.status === 'PaymentReceived' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-green-700 bg-green-50 rounded-lg px-3 py-2">
              <CheckCircle2 size={13} />
              Customer payment received on {fmtDate(invoice.payment_received_at)}
            </div>
            <button
              onClick={() => onMarkPaidOut(invoice)}
              disabled={actionLoading}
              className="w-full py-2.5 bg-green-600 text-white rounded-lg text-[13px] font-semibold hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Wallet size={14} />}
              Tap to Pay {isMarker ? 'Supplier' : 'Driver'}
            </button>
          </div>
        )}

        {invoice.status === 'PaidOut' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-green-700 bg-green-50 rounded-lg px-3 py-2">
              <CheckCircle2 size={13} />
              Customer payment received on {fmtDate(invoice.payment_received_at)}
            </div>
            <div className="w-full py-2.5 bg-green-100 text-green-800 rounded-lg text-[13px] font-bold flex items-center justify-center gap-2">
              <CheckCheck size={15} />
              Payment Done · {fmtMoney(invoice.paid_out_amount)} paid out
            </div>
            {invoice.paid_out_at && (
              <p className="text-[10px] text-gray-400 text-center">on {fmtDate(invoice.paid_out_at)}</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Small helper for detail rows
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-gray-400 flex-shrink-0">{label}</span>
      <span className="font-medium text-gray-700 text-right">{children}</span>
    </div>
  );
}
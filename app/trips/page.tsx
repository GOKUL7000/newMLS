'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Topbar from '@/components/layout/Topbar';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  Plus, Search, X, Loader2, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Pencil, Trash2,
  ArrowRight, Truck, Upload, ExternalLink,
} from 'lucide-react';

const supabase = createClientComponentClient();
const TRIP_BUCKET = 'Trips';



// ─── Types ────────────────────────────────────────────────────────────────────
interface Trip {
  id: string;
  trip_no: string;
  trip_date: string;
  customer_id: string | null;
  vehicle_id: string | null;
  ownership: 'My Truck' | 'Marker Truck';
  driver_id: string | null;
  supplier_id: string | null;
  origin: string | null;
  destination: string | null;
  bill_type: string;
  freight_amount: number | null;
  rate: number | null;
  total_tonnage: number | null;
  supplier_bill_type: string | null;
  supplier_rate: number | null;
  supplier_tonnage: number | null;
  supplier_amount: number | null;
  lr_no: string | null;
  material: string | null;
  notes: string | null;
  status: string;
  start_date: string | null;
  start_km: number | null;
  start_km_doc: string | null;
  loading_date: string | null;
  loading_km: number | null;
  loading_km_doc: string | null;
  unloading_date: string | null;
  unloading_km: number | null;
  unloading_photo: string | null;
  end_date: string | null;
  end_km: number | null;
  end_km_photo: string | null;
  total_km: number | null;
  pop_received_date: string | null;
  pop_doc: string | null;
  pop_submitted_date: string | null;
  invoice_generated_at: string | null;
  settled_at: string | null;
  settled_amount: number | null;
  deleted: boolean;
  created_at?: string;
  // joined
  customer_name?: string;
  vehicle_no?: string;
  driver_name?: string;
  supplier_name?: string;
  trip_cost: number | null;
  tds_type: string | null;
  tds_value: number | null;
  tds_amount: number | null;
  trip_charges: number | null;
   charges_type: string;     
   
   charges_value: number | null;
    estimated_profit: number | null;
    do_no: string | null;
    shipment_no: string | null;
}

interface DropItem { id: string; label: string; }

type ToastType = 'success' | 'error';
interface Toast { id: number; type: ToastType; message: string; }

// ─── Constants ────────────────────────────────────────────────────────────────
const BILL_TYPES = ['Fixed','Per Tonne','Per Kg','Per Km','Per Trip','Per Day','Per Hour','Per Litre','Per Bag'];
const EXPENSE_CATEGORIES = ['Diesel','Toll','Driver Bata','Repair','Tyre','Loading Charges','Unloading Charges','Other'];

const PIPELINE: { key: string; label: string; color: string }[] = [
  { key: 'Pending',         label: 'Pending',          color: '#6b7280' },
  { key: 'Started',         label: 'Started',          color: '#3b82f6' },
  { key: 'Loading',         label: 'Loading',          color: '#f59e0b' },
  { key: 'Unloading',       label: 'Unloading',        color: '#8b5cf6' },
  { key: 'TripCompleted',   label: 'Trip Completed',   color: '#10b981' },
  { key: 'POPReceived',     label: 'POP Received',     color: '#06b6d4' },
  { key: 'POPSubmitted',    label: 'POP Submitted',    color: '#0ea5e9' },
  { key: 'GenerateInvoice', label: 'Generate Invoice', color: '#f97316' },
  { key: 'Settled',         label: 'Settled',          color: '#22c55e' },
];

const STATUS_COLOR: Record<string, string> = {
  Pending:         'bg-gray-100 text-gray-600',
  Started:         'bg-blue-100 text-blue-700',
  Loading:         'bg-yellow-100 text-yellow-700',
  Unloading:       'bg-purple-100 text-purple-700',
  TripCompleted:   'bg-teal-100 text-teal-700',
  POPReceived:     'bg-cyan-100 text-cyan-700',
  POPSubmitted:    'bg-sky-100 text-sky-700',
  GenerateInvoice: 'bg-orange-100 text-orange-700',
  Settled:         'bg-green-100 text-green-700',
};

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";
const PAGE_SIZE = 10;

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

function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <label className="text-[11px] text-gray-500 block mb-1">{label}</label>
      {children}
    </div>
  );
}

// ─── Pipeline Bar ─────────────────────────────────────────────────────────────
function PipelineBar({ current }: { current: string }) {
  const idx = PIPELINE.findIndex(p => p.key === current);
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {PIPELINE.map((step, i) => {
        const done = i <= idx;
        const active = i === idx;
        return (
          <div key={step.key} className="flex items-center">
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap
              ${active ? 'text-white' : done ? 'text-white opacity-80' : 'bg-gray-100 text-gray-400'}`}
              style={done ? { backgroundColor: step.color } : {}}>
              {done && !active && <CheckCircle2 size={10} />}
              {step.label}
            </div>
            {i < PIPELINE.length - 1 && (
              <ArrowRight size={10} className={`mx-0.5 ${done && i < idx ? 'text-gray-400' : 'text-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [customers, setCustomers] = useState<DropItem[]>([]);
  const [myTruckVehicles, setMyTruckVehicles] = useState<DropItem[]>([]);
  const [markerVehicles, setMarkerVehicles] = useState<DropItem[]>([]);
  const [drivers, setDrivers] = useState<DropItem[]>([]);
  const [suppliers, setSuppliers] = useState<DropItem[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const emptyForm = {
    trip_date: new Date().toISOString().split('T')[0],
    customer_id: '', vehicle_id: '', ownership: 'My Truck' as 'My Truck' | 'Marker Truck',
    driver_id: '', supplier_id: '',
    origin: '', destination: '',
    bill_type: 'Fixed', freight_amount: '', rate: '', total_tonnage: '',
    supplier_bill_type: 'Fixed', supplier_rate: '', supplier_tonnage: '',
    lr_no: '', material: '', notes: '', status: 'Pending',
    trip_cost: '',
    tds_type: 'Percentage',
    tds_value: '',
    trip_charges: '',
    charges_type: 'Fixed',    
    charges_value: '',  
    do_no: '',
  shipment_no: '',
    
  };
  const [form, setForm] = useState(emptyForm);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const toast = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  // ── Fetch dropdowns ────────────────────────────────────────────────────────
  const fetchDropdowns = useCallback(async () => {
    const [c, v, d, s] = await Promise.all([
      supabase.from('customers').select('id, name').eq('status', 'Active'),
      supabase.from('vehicles').select('id, vehicle_no, ownership').eq('deleted', false).neq('status', 'Inactive'),
      supabase.from('drivers').select('id, name').eq('status', 'Active').eq('deleted', false),
      supabase.from('suppliers').select('id, name').eq('status', 'Active').eq('deleted', false),
    ]);
    setCustomers((c.data || []).map(x => ({ id: x.id, label: x.name })));
    setMyTruckVehicles((v.data || []).filter((x: any) => x.ownership === 'My Truck').map(x => ({ id: x.id, label: x.vehicle_no })));
    setMarkerVehicles((v.data || []).filter((x: any) => x.ownership === 'Marker Truck').map(x => ({ id: x.id, label: x.vehicle_no })));
    setDrivers((d.data || []).map(x => ({ id: x.id, label: x.name })));
    setSuppliers((s.data || []).map(x => ({ id: x.id, label: x.name })));
  }, []);

  // ── Fetch trips ────────────────────────────────────────────────────────────
  const fetchTrips = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trips')
      .select(`*, customers(name), vehicles(vehicle_no), drivers(name), suppliers(name)`)
      .eq('deleted', false)
      .order('created_at', { ascending: false });

    if (error) { toast('error', 'Failed to load: ' + error.message); setLoading(false); return; }

    const mapped = (data || []).map((t: any) => ({
      ...t,
      customer_name: t.customers?.name || '—',
      vehicle_no: t.vehicles?.vehicle_no || '—',
      driver_name: t.drivers?.name || '—',
      supplier_name: t.suppliers?.name || '—',
    }));
    setTrips(mapped);
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchTrips(); fetchDropdowns(); }, [fetchTrips, fetchDropdowns]);

  // ── Next trip_no ───────────────────────────────────────────────────────────
  const getNextTripNo = async () => {
    const { data } = await supabase.from('trips').select('trip_no');
    if (!data || data.length === 0) return 'TRP001';
    const max = data.reduce((acc, r) => {
      const n = parseInt((r.trip_no || 'TRP000').replace(/\D/g, ''), 10);
      return n > acc ? n : acc;
    }, 0);
    return `TRP${String(max + 1).padStart(3, '0')}`;
  };

  // ── Computed values ────────────────────────────────────────────────────────
  const computedFreight = form.bill_type === 'Fixed'
    ? parseFloat(form.freight_amount || '0')
    : (parseFloat(form.rate || '0') * parseFloat(form.total_tonnage || '0'));

  const computedSupplierAmount = form.supplier_bill_type === 'Fixed'
    ? parseFloat(form.freight_amount || '0')
    : (parseFloat(form.supplier_rate || '0') * parseFloat(form.supplier_tonnage || '0'));

  const computedTdsAmount =
    form.tds_type === 'Percentage'
      ? (computedFreight * parseFloat(form.tds_value || '0')) / 100
      : form.tds_type === 'Fixed'
      ? parseFloat(form.tds_value || '0')
      : parseFloat(form.tds_value || '0') * parseFloat(form.total_tonnage || '0');

  const computedChargesAmount =
  form.charges_type === 'Percentage'
    ? (computedSupplierAmount * parseFloat(form.charges_value || '0')) / 100
    : form.charges_type === 'Fixed'
    ? parseFloat(form.charges_value || '0')
    : parseFloat(form.charges_value || '0') * parseFloat(form.supplier_tonnage || '0');

  const computedProfit =
    computedFreight -
    computedSupplierAmount +
   computedChargesAmount +
   
    computedTdsAmount;

  const computedProfitMyTruck =
    computedFreight -
    computedTdsAmount;

    const finalEstimatedProfit = form.ownership === 'My Truck' ? computedProfitMyTruck : computedProfit;

  // ── Save ───────────────────────────────────────────────────────────────────
  const save = async () => {
    if (!form.customer_id) { toast('error', 'Customer is required'); return; }
    if (!form.vehicle_id) { toast('error', 'Vehicle is required'); return; }
    setSaving(true);

    const payload: any = {
      trip_date: form.trip_date,
      customer_id: form.customer_id || null,
      vehicle_id: form.vehicle_id || null,
      ownership: form.ownership,
      driver_id: form.ownership === 'My Truck' ? (form.driver_id || null) : null,
      supplier_id: form.ownership === 'Marker Truck' ? (form.supplier_id || null) : null,
      origin: form.origin || null,
      destination: form.destination || null,
      bill_type: form.bill_type,
      freight_amount: form.bill_type === 'Fixed' ? parseFloat(form.freight_amount || '0') : computedFreight,
      rate: form.bill_type !== 'Fixed' ? parseFloat(form.rate || '0') : null,
      total_tonnage: form.bill_type !== 'Fixed' ? parseFloat(form.total_tonnage || '0') : null,
      supplier_bill_type: form.ownership === 'Marker Truck' ? form.supplier_bill_type : null,
      supplier_rate: form.ownership === 'Marker Truck' ? parseFloat(form.supplier_rate || '0') : null,
      supplier_tonnage: form.ownership === 'Marker Truck' ? parseFloat(form.supplier_tonnage || '0') : null,
      supplier_amount: form.ownership === 'Marker Truck' ? computedSupplierAmount : null,
      lr_no: form.lr_no || null,
      material: form.material || null,
      notes: form.notes || null,
      status: form.status,
      trip_cost: parseFloat(form.trip_cost || '0'),
      tds_type: form.tds_type,
      tds_value: parseFloat(form.tds_value || '0'),
      tds_amount: computedTdsAmount,
      trip_charges: parseFloat(form.trip_charges || '0'),
      charges_value : parseFloat(form.charges_value || '0'),
      charges_type:form.charges_type,
       estimated_profit: finalEstimatedProfit,
       do_no: form.do_no || null,
      shipment_no: form.shipment_no || null,
    };

    if (editId) {
      const { error } = await supabase.from('trips').update(payload).eq('id', editId);
      if (error) toast('error', 'Update failed: ' + error.message);
      else { toast('success', 'Trip updated'); setShowModal(false); fetchTrips(); }
    } else {
      const trip_no = await getNextTripNo();
      const { error } = await supabase.from('trips').insert({ ...payload, trip_no, deleted: false });
      if (error) toast('error', 'Insert failed: ' + error.message);
      else { toast('success', `Trip ${trip_no} created`); setShowModal(false); fetchTrips(); }
    }
    setSaving(false);
  };

  // ── Open modals ────────────────────────────────────────────────────────────
  const openAdd = () => { setEditId(null); setForm(emptyForm); setActiveTab(0); setShowModal(true); };
  const openEdit = (t: Trip) => {
    setEditId(t.id);
    setForm({
      trip_date: t.trip_date || '', customer_id: t.customer_id || '',
      vehicle_id: t.vehicle_id || '', ownership: t.ownership,
      driver_id: t.driver_id || '', supplier_id: t.supplier_id || '',
      origin: t.origin || '', destination: t.destination || '',
      bill_type: t.bill_type, freight_amount: String(t.freight_amount || ''),
      rate: String(t.rate || ''), total_tonnage: String(t.total_tonnage || ''),
      supplier_bill_type: t.supplier_bill_type || 'Fixed',
      supplier_rate: String(t.supplier_rate || ''),
      supplier_tonnage: String(t.supplier_tonnage || ''),
      lr_no: t.lr_no || '', material: t.material || '',
      notes: t.notes || '', status: t.status,
      trip_cost: String(t.trip_cost || '0'),
      tds_type: t.tds_type || 'Percentage',
      tds_value: String(t.tds_value || ''),
      trip_charges: String(t.trip_charges || ''),
      charges_type: t.charges_type|| 'Fixed',    
      charges_value: String(t.charges_value || '') , 
      do_no: String(t.do_no || ''), 
     shipment_no: String(t.shipment_no || ''),

    });
    setActiveTab(0); setShowModal(true);
  };

  const setInactive = async (id: string) => {
    const { error } = await supabase.from('trips').update({ deleted: true }).eq('id', id);
    if (error) toast('error', 'Failed: ' + error.message);
    else { toast('success', 'Trip removed'); fetchTrips(); }
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = trips.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.trip_no.toLowerCase().includes(q) ||
      (t.customer_name || '').toLowerCase().includes(q) ||
      (t.vehicle_no || '').toLowerCase().includes(q) ||
      (t.origin || '').toLowerCase().includes(q) ||
      (t.destination || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total: trips.length,
    active: trips.filter(t => !['Settled','Pending'].includes(t.status)).length,
    completed: trips.filter(t => t.status === 'TripCompleted' || t.status === 'Settled').length,
    pending: trips.filter(t => t.status === 'Pending').length,
    settled: trips.filter(t => t.status === 'Settled').length,
    totalFreight: trips.reduce((s, t) => s + (t.freight_amount || 0), 0),
  };

  const pieData = PIPELINE.map(p => ({
    name: p.label,
    value: trips.filter(t => t.status === p.key).length,
    color: p.color,
  })).filter(d => d.value > 0);

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const fmtMoney = (n: number | null) => n ? `₹ ${Number(n).toLocaleString('en-IN')}` : '₹ 0';

  const MODAL_TABS = ['Trip Info', 'Billing', 'Supplier Billing'];
  const vehicleOptions = form.ownership === 'My Truck' ? myTruckVehicles : markerVehicles;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Topbar title="Trips" breadcrumbs={[{ label: 'Trips' }]} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Total Trips',    value: stats.total,                                            color: 'text-blue-600',  sub: 'All Time' },
            { label: 'Active Trips',   value: stats.active,                                           color: 'text-green-600', sub: 'In Progress' },
            { label: 'Pending',        value: stats.pending,                                          color: 'text-gray-500',  sub: 'Not Started' },
            { label: 'Completed',      value: stats.completed,                                        color: 'text-teal-600',  sub: 'Trip Done' },
            { label: 'Settled',        value: stats.settled,                                          color: 'text-green-700', sub: 'Fully Settled' },
            { label: 'Total Freight',  value: `₹ ${(stats.totalFreight / 100000).toFixed(1)}L`,       color: 'text-blue-600',  sub: 'Billed Amount' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400">{c.label}</p>
              <p className={`text-[18px] font-bold ${c.color} mt-1`}>{c.value}</p>
              <p className="text-[10px] text-gray-400">{c.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {/* Table */}
          <div className="col-span-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-700">All Trips</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search trip, customer, vehicle…"
                    className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] w-60 focus:outline-none" />
                </div>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11px]">
                  <option value="All">All Status</option>
                  {PIPELINE.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
                <button onClick={openAdd}
                  className="flex items-center gap-1.5 bg-[#1a56db] text-white px-3 py-1.5 rounded-lg text-[11px] font-medium hover:bg-blue-700">
                  <Plus size={12} /> Create Trip
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                <Loader2 size={16} className="animate-spin" /> Loading trips…
              </div>
            ) : (
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                    {['LR No','Date','Customer','Vehicle','Route','Material','Freight','Est. Profit','Status',''].map(h => (
                      <th key={h} className="text-left px-2 py-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0
                    ? <tr><td colSpan={9} className="text-center py-12 text-gray-400">No trips found.</td></tr>
                    : paginated.map(t => (
                      <tr key={t.id}
                        onClick={() => setSelectedTrip(selectedTrip?.id === t.id ? null : t)}
                        className={`border-b border-gray-50 cursor-pointer transition-colors
                          ${selectedTrip?.id === t.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                        <td className="px-2 py-2 text-blue-600 font-medium">{t.lr_no}</td>
                        <td className="px-2 py-2 text-gray-500">{fmtDate(t.trip_date)}</td>
                        <td className="px-2 py-2 text-gray-700 font-medium max-w-[120px] truncate">{t.customer_name}</td>
                        <td className="px-2 py-2 text-gray-500">{t.vehicle_no}</td>
                        <td className="px-2 py-2 text-gray-500 max-w-[120px] truncate">{t.origin} → {t.destination}</td>
                        <td className="px-2 py-2 text-gray-400">{t.material || '—'}</td>
                        <td className="px-2 py-2 text-gray-700 font-medium">{fmtMoney(t.freight_amount)}</td>
                        <td className={`px-2 py-2 font-medium ${Number(t.estimated_profit) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {fmtMoney(t.estimated_profit)}
                          </td>
                        <td className="px-2 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_COLOR[t.status] || 'bg-gray-100 text-gray-500'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                            <button onClick={() => openEdit(t)} className="text-gray-400 hover:text-green-600"><Pencil size={12} /></button>
                            <button onClick={() => setInactive(t.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )}

            {!loading && filtered.length > 0 && (
              <div className="flex items-center justify-between mt-3">
                <p className="text-[11px] text-gray-400">
                  Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={12} /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-6 h-6 text-[10px] rounded ${p === page ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{p}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={12} /></button>
                </div>
              </div>
            )}

            {/* Trip Detail Panel */}
            {selectedTrip && (
              <TripDetailPanel
                trip={selectedTrip}
                onClose={() => setSelectedTrip(null)}
                onRefresh={fetchTrips}
                toast={toast}
                drivers={drivers}
                suppliers={suppliers}
              />
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[13px] font-semibold text-gray-700 mb-2">Trip Status</h3>
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
                <p className="text-[11px] text-gray-300 text-center py-6">No trips yet</p>
              )}
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[12px] font-semibold text-gray-700 mb-2">Quick Filters</h3>
              <div className="space-y-1">
                {['All', ...PIPELINE.map(p => p.key)].map(s => (
                  <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                    className={`w-full text-left text-[11px] px-2 py-1 rounded transition-colors
                      ${statusFilter === s ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
                    {s === 'All' ? 'All Trips' : PIPELINE.find(p => p.key === s)?.label || s}
                    <span className="float-right text-[10px] text-gray-400">
                      {s === 'All' ? trips.length : trips.filter(t => t.status === s).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Create / Edit Trip Modal ─────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-[14px] font-bold text-gray-800">{editId ? 'Edit Trip' : 'Create New Trip'}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Fill all required details</p>
              </div>
              <button onClick={() => setShowModal(false)}><X size={16} className="text-gray-400" /></button>
            </div>

            <div className="flex border-b border-gray-100 px-5">
              {MODAL_TABS.map((t, i) => (
                <button key={t} onClick={() => setActiveTab(i)}
                  className={`py-2.5 px-3 text-[11px] font-medium border-b-2 transition-colors
                    ${activeTab === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">

              {/* Tab 0 – Trip Info */}
              {activeTab === 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Trip Date *">
                    <input type="date" value={form.trip_date} onChange={f('trip_date')} className={inputCls} />
                  </Field>
                  <Field label="DO Number">
                    <input
                      value={form.do_no}
                      onChange={f('do_no')}
                      placeholder="Enter DO Number"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Shipment Number">
                    <input
                      value={form.shipment_no}
                      onChange={f('shipment_no')}
                      placeholder="Enter Shipment Number"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Customer *">
                    <select value={form.customer_id} onChange={f('customer_id')} className={inputCls}>
                      <option value="">— Select Customer —</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </Field>

                  <div className="col-span-2">
                    <label className="text-[11px] text-gray-500 block mb-2">Vehicle Ownership *</label>
                    <div className="flex gap-3">
                      {(['My Truck', 'Marker Truck'] as const).map(opt => (
                        <button key={opt} type="button"
                          onClick={() => setForm(prev => ({ ...prev, ownership: opt, vehicle_id: '', driver_id: '', supplier_id: '' }))}
                          className={`flex-1 py-2 rounded-lg border text-[12px] font-medium transition-colors
                            ${form.ownership === opt ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                          {opt === 'My Truck' ? '🚛 My Truck' : '📦 Marker Truck'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Field label={`Vehicle (${form.ownership}) *`}>
                    <select value={form.vehicle_id} onChange={f('vehicle_id')} className={inputCls}>
                      <option value="">— Select Vehicle —</option>
                      {vehicleOptions.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                    </select>
                  </Field>

                  {form.ownership === 'My Truck' ? (
                    <Field label="Driver">
                      <select value={form.driver_id} onChange={f('driver_id')} className={inputCls}>
                        <option value="">— Select Driver —</option>
                        {drivers.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                      </select>
                    </Field>
                  ) : (
                    <Field label="Supplier">
                      <select value={form.supplier_id} onChange={f('supplier_id')} className={inputCls}>
                        <option value="">— Select Supplier —</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </Field>
                  )}

                  <Field label="Origin *">
                    <input value={form.origin} onChange={f('origin')} placeholder="From city / location" className={inputCls} />
                  </Field>
                  <Field label="Destination *">
                    <input value={form.destination} onChange={f('destination')} placeholder="To city / location" className={inputCls} />
                  </Field>
                  <Field label="LR Number">
                    <input value={form.lr_no} onChange={f('lr_no')} placeholder="Lorry Receipt No." className={inputCls} />
                  </Field>
                  <Field label="Material">
                    <input value={form.material} onChange={f('material')} placeholder="e.g. Steel Coils" className={inputCls} />
                  </Field>
                  <Field label="Status">
                    <select value={form.status} onChange={f('status')} className={inputCls}>
                      {PIPELINE.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Notes" span2>
                    <textarea value={form.notes} onChange={f('notes')} rows={2} placeholder="Any additional notes…" className={inputCls + ' resize-none'} />
                  </Field>
                </div>
              )}

              {/* Tab 1 – Customer Billing */}
              {activeTab === 1 && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Bill Type *" span2>
                    <select value={form.bill_type} onChange={f('bill_type')} className={inputCls}>
                      {BILL_TYPES.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </Field>
                  {form.bill_type === 'Fixed' ? (
                    <Field label="Freight Amount (₹) *" span2>
                      <input type="number" value={form.freight_amount} onChange={f('freight_amount')} placeholder="0" className={inputCls} />
                    </Field>
                  ) : (
                    <>
                      <Field label={`Rate (₹ / ${form.bill_type.replace('Per ', '')})`}>
                        <input type="number" value={form.rate} onChange={f('rate')} placeholder="0" className={inputCls} />
                      </Field>
                      <Field label="Total Quantity">
                        <input type="number" value={form.total_tonnage} onChange={f('total_tonnage')} placeholder="0" className={inputCls} />
                      </Field>
                      <div className="col-span-2 bg-blue-50 rounded-lg px-4 py-3">
                        <p className="text-[11px] text-gray-500">Freight Amount</p>
                        <p className="text-[18px] font-bold text-blue-600">₹ {computedFreight.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-gray-400">Rate × Quantity = {form.rate || 0} × {form.total_tonnage || 0}</p>
                      </div>
                    </>
                  )}

                  {form.ownership === 'My Truck' && (
                    <>
                      <div className="grid grid-cols-2 gap-3 col-span-2">

                        {/* <Field label="Trip Cost (₹)"> 
                          <input type="number" value={form.trip_cost} onChange={f('trip_cost')} placeholder="0" className={inputCls} />
                        </Field>
                        <Field label="Charges (₹)">
                          <input type="number" value={form.trip_charges} onChange={f('trip_charges')} placeholder="0" className={inputCls} />
                        </Field>*/}
                        <Field label="TDS Type">
                          <select value={form.tds_type} onChange={f('tds_type')} className={inputCls}>
                            <option value="Percentage">Percentage</option>
                            <option value="Fixed">Fixed</option>
                          </select>
                        </Field>
                        <Field label={form.tds_type === 'Percentage' ? 'TDS (%)' : 'TDS Amount (₹)'}>
                          <input type="number" value={form.tds_value} onChange={f('tds_value')} placeholder="0" className={inputCls} />
                        </Field>
                      </div>

                      <div className="col-span-2 bg-green-50 rounded-lg px-4 py-3 border border-green-100">
                        <p className="text-[11px] text-gray-500 mb-1">Profit Estimate</p>
                        <div className="flex justify-between text-[12px]">
                          <span className="text-gray-500">Customer Freight</span>
                          <span className="font-semibold text-blue-600">₹ {computedFreight.toLocaleString('en-IN')}</span>
                        </div>
                           {/*
                        <div className="flex justify-between text-[12px]">
                          <span className="text-gray-500">Trip Cost</span>
                          <span className="font-semibold text-blue-500">₹ {Number(form.trip_cost || 0).toLocaleString('en-IN')}</span>
                        </div>

                      <div className="flex justify-between text-[12px]">
                          <span className="text-gray-500">Charges</span>
                          <span className="font-semibold text-blue-500">₹ {Number(form.trip_charges || 0).toLocaleString('en-IN')}</span>
                        </div> */}
                        <div className="flex justify-between text-[12px]">
                          <span className="text-gray-500">Charges (TDS)</span>
                          <span className="font-semibold text-red-500">₹ {computedTdsAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-[12px] border-t border-green-200 mt-2 pt-2">
                          <span className="font-semibold text-gray-700">Est. Profit</span>
                          <span className={`font-bold ${computedProfitMyTruck >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                            ₹ {computedProfitMyTruck.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab 2 – Supplier Billing */}
              {activeTab === 2 && (
                form.ownership === 'Marker Truck' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Supplier Bill Type *" span2>
                      <select value={form.supplier_bill_type} onChange={f('supplier_bill_type')} className={inputCls}>
                        {BILL_TYPES.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </Field>

                    {form.supplier_bill_type === 'Fixed' ? (
                      <Field label="Supplier Amount (₹)" span2>
                        <input type="number" value={form.freight_amount} onChange={f('freight_amount')} placeholder="0" className={inputCls} />
                      </Field>
                    ) : (
                      <>
                        <Field label={`Supplier Rate (₹ / ${(form.supplier_bill_type || '').replace('Per ', '')})`}>
                          <input type="number" value={form.supplier_rate} onChange={f('supplier_rate')} placeholder="0" className={inputCls} />
                        </Field>
                        <Field label="Supplier Quantity">
                          <input type="number" value={form.supplier_tonnage} onChange={f('supplier_tonnage')} placeholder="0" className={inputCls} />
                        </Field>
                        <div className="col-span-2 bg-orange-50 rounded-lg px-4 py-3">
                          <p className="text-[11px] text-gray-500">Supplier Payable</p>
                          <p className="text-[18px] font-bold text-orange-600">₹ {computedSupplierAmount.toLocaleString('en-IN')}</p>
                        </div>
                      </>
                    )}

                    {/* <Field label="Trip Cost (₹)">
                      <input type="number" value={form.trip_cost} onChange={f('trip_cost')} placeholder="0" className={inputCls} />
                    </Field> 
                    <Field label="Charges (₹)">
                      <input type="number" value={form.trip_charges} onChange={f('trip_charges')} placeholder="0" className={inputCls} />
                    </Field>*/}
                    <Field label="Charges Type">
                      <select value={form.charges_type} onChange={f('charges_type')} className={inputCls}>
                        <option value="Fixed">Fixed</option>
                        <option value="Percentage">Percentage</option>
                        <option value="Per Ton">Per Ton</option>
                      </select>
                    </Field>
                    <Field label={
                      form.charges_type === 'Percentage' ? 'Charges (%)' :
                      form.charges_type === 'Fixed' ? 'Charges Amount (₹)' :
                      'Charges Per Ton (₹)'
                    }>
                      <input type="number" value={form.charges_value} onChange={f('charges_value')} placeholder="0" className={inputCls} />
                    </Field>
                    <Field label="TDS Type">
                      <select value={form.tds_type} onChange={f('tds_type')} className={inputCls}>
                        <option value="Percentage">Percentage</option>
                        <option value="Fixed">Fixed</option>
                        <option value="Per Ton">Per Ton</option>
                      </select>
                    </Field>
                    <Field label={form.tds_type === 'Percentage' ? 'TDS (%)' : form.tds_type === 'Fixed' ? 'TDS Amount (₹)' : 'TDS Per Ton (₹)'}>
                      <input type="number" value={form.tds_value} onChange={f('tds_value')} placeholder="0" className={inputCls} />
                    </Field>

                    <div className="col-span-2 bg-green-50 rounded-lg px-4 py-3 border border-green-100">
                      <p className="text-[11px] text-gray-500 mb-1">Profit Estimate</p>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-gray-500">Customer Freight</span>
                        <span className="font-semibold text-blue-600">₹ {computedFreight.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-gray-500">Supplier Cost</span>
                        <span className="font-semibold text-red-500">₹ {computedSupplierAmount.toLocaleString('en-IN')}</span>
                      </div>

                      {/* <div className="flex justify-between text-[12px]"> 
                        <span className="text-gray-500">Trip Cost</span>
                        <span className="font-semibold text-blue-500">₹ {Number(form.trip_cost || 0).toLocaleString('en-IN')}</span>
                      </div>*/}
                     <div className="flex justify-between text-[12px]">
                        <span className="text-gray-500">Supplier Charges</span>
                        <span className="font-semibold text-blue-500">₹ {computedChargesAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-gray-500">Charges (TDS)</span>
                        <span className="font-semibold text-blue-500">₹ {computedTdsAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-[12px] border-t border-green-200 mt-1 pt-1">
                        <span className="font-semibold text-gray-700">Est. Profit</span>
                        <span className={`font-bold ${computedProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                          ₹ {computedProfit.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 text-gray-400 text-[12px]">
                    Supplier billing is only applicable for Marker Truck trips.
                  </div>
                )
              )}
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <div className="flex gap-1">
                {MODAL_TABS.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === activeTab ? 'bg-blue-600' : 'bg-gray-200'}`} />
                ))}
              </div>
              <div className="flex gap-2">
                {activeTab > 0 && (
                  <button onClick={() => setActiveTab(t => t - 1)} className="px-4 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-100">← Back</button>
                )}
                {activeTab < MODAL_TABS.length - 1 ? (
                  <button onClick={() => setActiveTab(t => t + 1)} className="px-4 py-1.5 bg-[#1a56db] text-white rounded-lg text-[12px] font-medium hover:bg-blue-700">Next →</button>
                ) : (
                  <button onClick={save} disabled={saving}
                    className="px-5 py-1.5 bg-[#1a56db] text-white rounded-lg text-[12px] font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center gap-1.5">
                    {saving && <Loader2 size={12} className="animate-spin" />}
                    {editId ? '✓ Update Trip' : '✓ Create Trip'}
                  </button>
                )}
                <button onClick={() => setShowModal(false)} className="px-4 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-100">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── Trip Detail Panel ────────────────────────────────────────────────────────
function TripDetailPanel({ trip, onClose, onRefresh, toast, drivers, suppliers }: {
  trip: Trip;
  onClose: () => void;
  onRefresh: () => void;
  toast: (type: ToastType, message: string) => void;
  drivers: DropItem[];
  suppliers: DropItem[];
}) {
  const [activeSection, setActiveSection] = useState('Overview');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expLoading, setExpLoading] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);
  const [expForm, setExpForm] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    category: 'Diesel', amount: '', paid_by: 'Company', notes: '',advance_amount: '',
  });
  const [statusSaving, setStatusSaving] = useState(false);
  const [stepForm, setStepForm] = useState<Record<string, string | number>>({});
  const [showStepModal, setShowStepModal] = useState(false);
  const [pendingNext, setPendingNext] = useState<{ key: string; label: string } | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const SECTIONS = ['Overview', 'Pipeline', 'Expenses', 'Financials'];

  const totalAdvance = expenses.reduce(
  (s, e) => s + Number(e.advance_amount || 0),
  0
);

  const DocumentViewer = ({
  label,
  path,
}: {
  label: string;
  path?: string | null;
}) => {
  if (!path) return null;

  return (
    <button
      onClick={() => openStepDoc(path)}
      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-[11px] mt-1"
    >
      <ExternalLink size={10} />
      {label}
    </button>
  );
};

const PhotoPreview = ({
  title,
  path,
}: {
  title: string;
  path?: string | null;
}) => {
  if (!path) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => openStepDoc(path)}
        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-[11px]"
      >
        <ExternalLink size={10} />
        {title}
      </button>
    </div>
  );
};


  // ── Step config ────────────────────────────────────────────────────────────
  const STEP_CONFIG: Record<string, { kmField: string; kmLabel: string; docField: string; docLabel: string }> = {
    Started: {
      kmField: 'start_km', kmLabel: 'Start KM Reading',
      docField: 'start_km_doc', docLabel: 'Start KM Photo',
    },
    Loading: {
      kmField: 'loading_km', kmLabel: 'Loading KM Reading',
      docField: 'loading_km_doc', docLabel: 'Loading KM Photo',
    },
    Unloading: {
      kmField: 'unloading_km', kmLabel: 'Unloading KM Reading',
      docField: 'unloading_photo', docLabel: 'Unloading Photo',
    },
    TripCompleted: {
      kmField: 'end_km', kmLabel: 'End KM Reading',
      docField: 'end_km_photo', docLabel: 'End KM Photo',
    },
    POPReceived: {
      kmField: '', kmLabel: '',
      docField: 'pop_doc', docLabel: 'POP Document',
    },
  };

  // ── Upload helper ──────────────────────────────────────────────────────────
  const uploadStepFile = async (file: File, field: string): Promise<string | null> => {
    setUploadingField(field);
    const ext = file.name.split('.').pop();
    const path = `${trip.trip_no}/${field}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(TRIP_BUCKET).upload(path, file, { upsert: true });
    setUploadingField(null);
    if (error) { toast('error', `Upload failed: ${error.message}`); return null; }
    return path;
  };

  const openStepDoc = async (path: string) => {
    const { data, error } = await supabase.storage.from(TRIP_BUCKET).createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) { toast('error', 'Could not open document'); return; }
    window.open(data.signedUrl, '_blank');
  };

  // ── Fetch expenses ─────────────────────────────────────────────────────────
  const fetchExpenses = useCallback(async () => {
    setExpLoading(true);
    const { data } = await supabase.from('trip_expenses').select('*').eq('trip_id', trip.id).order('expense_date');
    setExpenses(data || []);
    setExpLoading(false);
  }, [trip.id]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const profit = Number(trip.estimated_profit || 0);

  // ── Next status ────────────────────────────────────────────────────────────
  const nextStatus = () => {
    const idx = PIPELINE.findIndex(p => p.key === trip.status);
    return idx < PIPELINE.length - 1 ? PIPELINE[idx + 1] : null;
  };

  // ── Advance status ─────────────────────────────────────────────────────────
  const advanceStatus = async () => {
    const next = nextStatus();
    if (!next) return;
    if (STEP_CONFIG[next.key]) {
      setPendingNext(next);
      setStepForm({});
      setShowStepModal(true);
      return;
    }
    setStatusSaving(true);
    const { error } = await supabase.from('trips').update({ status: next.key }).eq('id', trip.id);
    if (error) toast('error', 'Failed: ' + error.message);
    else { toast('success', `Status → ${next.label}`); onRefresh(); }
    setStatusSaving(false);
  };

  const confirmStepAdvance = async () => {
    if (!pendingNext) return;
    setStatusSaving(true);

    const updates: Record<string, any> = { status: pendingNext.key, ...stepForm };
    if (pendingNext.key === 'Started')       updates.start_date        = new Date().toISOString();
    if (pendingNext.key === 'Loading')       updates.loading_date      = new Date().toISOString();
    if (pendingNext.key === 'Unloading')     updates.unloading_date    = new Date().toISOString();
    if (pendingNext.key === 'TripCompleted') updates.end_date          = new Date().toISOString();
    if (pendingNext.key === 'POPReceived')   updates.pop_received_date = new Date().toISOString();

    if (pendingNext.key === 'TripCompleted' && stepForm.end_km && trip.start_km) {
      updates.total_km = Number(stepForm.end_km) - Number(trip.start_km);
    }

    const { error } = await supabase.from('trips').update(updates).eq('id', trip.id);
    if (error) toast('error', 'Failed: ' + error.message);
    else {
      toast('success', `Status → ${pendingNext.label}`);
      setShowStepModal(false);
      setPendingNext(null);
      onRefresh();
    }
    setStatusSaving(false);
  };

  // ── Step data save (pipeline tab) ──────────────────────────────────────────
  const saveStepData = async () => {
    const { error } = await supabase.from('trips').update(stepForm).eq('id', trip.id);
    if (error) toast('error', 'Save failed: ' + error.message);
    else { toast('success', 'Saved'); onRefresh(); setStepForm({}); }
  };

  // ── Expense helpers ────────────────────────────────────────────────────────
  const saveExpense = async () => {
  const {error} = await supabase.from('trip_expenses').insert({
    trip_id: trip.id,
    expense_date: expForm.expense_date,
    category: expForm.category,
    amount: parseFloat(expForm.amount) || 0,
    advance_amount: parseFloat(expForm.advance_amount) || 0,
    paid_by: expForm.paid_by,
    notes: expForm.notes || null,
  });
    if (error) toast('error', 'Failed: ' + error.message);
    else {
      toast('success', 'Expense added');
      setShowExpModal(false);
      fetchExpenses();
      setExpForm({ expense_date: new Date().toISOString().split('T')[0], category: 'Diesel', amount: '', paid_by: 'Company', notes: '',advance_amount:'' });
    }
  };

  const deleteExpense = async (id: string) => {
    await supabase.from('trip_expenses').delete().eq('id', id);
    fetchExpenses();
  };

  const panelInputCls = "w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400";
  const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const fmtMoney = (n: number | null | undefined) => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <div className="mt-4 border border-blue-100 rounded-xl bg-blue-50/30 overflow-hidden">

      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-blue-100">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
            <Truck size={13} className="text-blue-600" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-gray-800">{trip.trip_no}</p>
            <p className="text-[10px] text-gray-400">{trip.customer_name} · {trip.vehicle_no} · {trip.origin} → {trip.destination}</p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLOR[trip.status]}`}>{trip.status}</span>
        </div>
        <div className="flex items-center gap-2">
          {nextStatus() && (
            <button onClick={advanceStatus} disabled={statusSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-medium hover:bg-blue-700 disabled:opacity-60">
              {statusSaving ? <Loader2 size={11} className="animate-spin" /> : <ArrowRight size={11} />}
              Move to {nextStatus()?.label}
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
        </div>
      </div>

      {/* Pipeline bar */}
      <div className="px-4 py-2 bg-white border-b border-gray-100">
        <PipelineBar current={trip.status} />
      </div>

      {/* Section tabs */}
      <div className="flex border-b border-gray-200 bg-white px-4">
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={`py-2 px-3 text-[11px] font-medium border-b-2 transition-colors
              ${activeSection === s ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="p-4">

        {/* OVERVIEW */}
        {activeSection === 'Overview' && (
          <div className="grid grid-cols-3 gap-4 text-[11px]">
            <div>
              <p className="font-semibold text-gray-600 mb-2">Basic Info</p>
              {[
                ['Trip No', trip.trip_no],
                ['Date', fmtDate(trip.trip_date)],
                ['Customer', trip.customer_name || '—'],
                ['Vehicle', trip.vehicle_no || '—'],
                ['Driver / Supplier', trip.ownership === 'My Truck' ? (trip.driver_name || '—') : (trip.supplier_name || '—')],
                ['Material', trip.material || '—'],
                ['LR No', trip.lr_no || '—'],
                ['DO No', trip.do_no || '—'],
                ['Shipment No', trip.shipment_no || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-1 mb-1">
                  <span className="text-gray-400 w-28 shrink-0">{k}</span>
                  <span className="text-gray-700 font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="font-semibold text-gray-600 mb-2">Route & KM</p>
              {[
                ['Origin', trip.origin || '—'],
                ['Destination', trip.destination || '—'],
                ['Start KM', trip.start_km ? `${trip.start_km.toLocaleString('en-IN')} KM` : '—'],
                ['Loading KM', trip.loading_km ? `${trip.loading_km.toLocaleString('en-IN')} KM` : '—'],
                ['Unloading KM', trip.unloading_km ? `${trip.unloading_km.toLocaleString('en-IN')} KM` : '—'],
                ['End KM', trip.end_km ? `${trip.end_km.toLocaleString('en-IN')} KM` : '—'],
                ['Total KM', trip.total_km ? `${trip.total_km.toLocaleString('en-IN')} KM` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-1 mb-1">
                  <span className="text-gray-400 w-28 shrink-0">{k}</span>
                  <span className="text-gray-700 font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="font-semibold text-gray-600 mb-2">Financial</p>
              {[
                ['Freight', fmtMoney(trip.freight_amount)],
                ['Supplier Cost', fmtMoney(trip.supplier_amount)],
                ['Total Expenses', fmtMoney(totalExpenses)],
                ['Supplier Charges', fmtMoney(trip.charges_value)],
                ['TDS Amount', fmtMoney(trip.tds_amount)],
                ['Est. Profit', fmtMoney(trip.estimated_profit)],
                                ['Bill Type', trip.bill_type],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between mb-1">
                  <span className="text-gray-400">{k}</span>
                  <span className={`font-semibold ${k === 'Est. Profit' ? (profit >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-700'}`}>{v}</span>
                </div>
              ))}
              {trip.notes && (
                <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                  <p className="text-[10px] text-gray-400 mb-0.5">Notes</p>
                  <p className="text-[11px] text-gray-600">{trip.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PIPELINE */}
        {activeSection === 'Pipeline' && (
          <div className="space-y-3">
            {[
              { key: 'Started',       label: 'Start Trip',     fields: [{ f: 'start_km',     l: 'Start KM Reading',    type: 'number' }] },
              { key: 'Loading',       label: 'Loading',        fields: [{ f: 'loading_km',   l: 'Loading KM Reading',  type: 'number' }] },
              { key: 'Unloading',     label: 'Unloading',      fields: [{ f: 'unloading_km', l: 'Unloading KM Reading',type: 'number' }] },
              { key: 'TripCompleted', label: 'Trip Completed', fields: [{ f: 'end_km',       l: 'End KM Reading',      type: 'number' }] },
            ].map(step => {
              const pIdx = PIPELINE.findIndex(p => p.key === trip.status);
              const sIdx = PIPELINE.findIndex(p => p.key === step.key);
              const isPast = sIdx <= pIdx;
              return (
                <div key={step.key} className={`border rounded-lg p-3 ${isPast ? 'border-green-200 bg-green-50/30' : 'border-gray-100 bg-white'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold ${isPast ? 'bg-green-500' : 'bg-gray-200'}`}>
                      {isPast ? '✓' : '○'}
                    </div>
                    <p className="text-[12px] font-semibold text-gray-700">{step.label}</p>
                    {isPast && <span className="text-[10px] text-green-600 font-medium">Done</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 ml-7">
                   <div className="grid grid-cols-2 gap-3 ml-7">
  
                        {/* KM Section */}
                        <div>
                          {step.fields.map(field => (
                            <div key={field.f}>
                              <label className="text-[10px] text-gray-400 block mb-1">
                                {field.l}
                              </label>

                              <input
                                type={field.type}
                                defaultValue={(trip as any)[field.f] || ''}
                                onChange={e =>
                                  setStepForm(prev => ({
                                    ...prev,
                                    [field.f]: e.target.value
                                  }))
                                }
                                className={panelInputCls}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Photo Section */}
                        <div className="space-y-2">
                          
                          {step.key === 'Started' && trip.start_km_doc && (
                            <button
                              onClick={() => openStepDoc(trip.start_km_doc!)}
                              className="flex items-center gap-1 text-blue-600 text-[11px] hover:underline"
                            >
                              <ExternalLink size={10} />
                              View Start Meter Photo
                            </button>
                          )}

                          {step.key === 'Loading' && trip.loading_km_doc && (
                            <button
                              onClick={() => openStepDoc(trip.loading_km_doc!)}
                              className="flex items-center gap-1 text-blue-600 text-[11px] hover:underline"
                            >
                              <ExternalLink size={10} />
                              View Loading Photo
                            </button>
                          )}
                    {/* 
                          {step.key === 'Loading' && trip.loaded_meter_photo && (
                            <button
                              onClick={() => openStepDoc(trip.loaded_meter_photo!)}
                              className="flex items-center gap-1 text-blue-600 text-[11px] hover:underline"
                            >
                              <ExternalLink size={10} />
                              View Loaded Meter Photo
                            </button>
                          )} */}

                          {/* {step.key === 'Unloading' && trip.unloading_photo && (
                            <button
                              onClick={() => openStepDoc(trip.unloading_photo!)}
                              className="flex items-center gap-1 text-blue-600 text-[11px] hover:underline"
                            >
                              <ExternalLink size={10} />
                              View Unloading Photo
                            </button>
                          )} */}

                          {step.key === 'Unloading' && trip.loading_km_doc && (
                            <button
                              onClick={() => openStepDoc(trip.loading_km_doc!)}
                              className="flex items-center gap-1 text-blue-600 text-[11px] hover:underline"
                            >
                              <ExternalLink size={10} />
                              View Unloaded Meter Photo
                            </button>
                          )}

                          {step.key === 'TripCompleted' && trip.end_km_photo && (
                            <button
                              onClick={() => openStepDoc(trip.end_km_photo!)}
                              className="flex items-center gap-1 text-blue-600 text-[11px] hover:underline"
                            >
                              <ExternalLink size={10} />
                              View End Meter Photo
                            </button>
                          )}
                        </div>

                      </div>
                  </div>
                  {Object.keys(stepForm).length > 0 && (
                    <button onClick={saveStepData} className="ml-7 mt-2 px-3 py-1 bg-blue-600 text-white rounded text-[11px]">Save</button>
                  )}
                </div>
              );
            })}

            <div className={`border rounded-lg p-3 ${['POPReceived','POPSubmitted','GenerateInvoice','Settled'].includes(trip.status) ? 'border-green-200 bg-green-50/30' : 'border-gray-100 bg-white'}`}>
              <p className="text-[12px] font-semibold text-gray-700 mb-1">POP (Proof of Payment)</p>
              <p className="text-[10px] text-gray-400">Received: {trip.pop_received_date ? fmtDate(trip.pop_received_date) : '—'}</p>
              <p className="text-[10px] text-gray-400">Submitted: {trip.pop_submitted_date ? fmtDate(trip.pop_submitted_date) : '—'}</p>
              {trip.pop_doc && (
                <button
                  onClick={() => openStepDoc(trip.pop_doc!)}
                  className="mt-1 flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                >
                  <ExternalLink size={10} />
                  View POD Document
                </button>
              )}
            </div>
          </div>
        )}

        {/* EXPENSES */}
        {activeSection === 'Expenses' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold text-gray-700">Trip Expenses</p>
              <button onClick={() => setShowExpModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-medium">
                <Plus size={11} /> Add Expense
              </button>
            </div>
            {expLoading ? (
              <div className="flex justify-center py-6"><Loader2 size={14} className="animate-spin text-gray-400" /></div>
            ) : expenses.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-[11px]">No expenses added yet.</p>
            ) : (
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                    {['Date','Category','Amount','Advance','Paid By','Notes',''].map(h => (
                      <th key={h} className="text-left px-2 py-1.5 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(e => (
                    <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-2 py-1.5 text-gray-500">{fmtDate(e.expense_date)}</td>
                      <td className="px-2 py-1.5 font-medium text-gray-700">{e.category}</td>
                      <td className="px-2 py-1.5 text-red-500 font-semibold">₹ {Number(e.amount).toLocaleString('en-IN')}</td>
                      <td className="px-2 py-1.5 text-orange-500 font-semibold">
                              ₹ {Number(e.advance_amount || 0).toLocaleString('en-IN')}
                            </td>
                      <td className="px-2 py-1.5 text-gray-500">{e.paid_by}</td>
                      <td className="px-2 py-1.5 text-gray-400">{e.notes || '—'}</td>
                      <td className="px-2 py-1.5">
                        <button onClick={() => deleteExpense(e.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={11} /></button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={2} className="px-2 py-2 text-gray-600">Total Expenses</td>
                    <td className="px-2 py-2 text-red-600">₹ {totalExpenses.toLocaleString('en-IN')}</td>
                    <td colSpan={3} />
                  </tr>
                  <tr className="bg-orange-50 font-semibold">
                    <td colSpan={2} className="px-2 py-2 text-orange-700">
                      Total Advance
                    </td>

                    <td className="px-2 py-2 text-orange-600">
                      ₹ {totalAdvance.toLocaleString('en-IN')}
                    </td>

                    <td colSpan={4}></td>
                  </tr>
                </tbody>
              </table>
            )}

            {showExpModal && (
              <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-2xl w-80 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[13px] font-bold text-gray-800">Add Expense</p>
                    <button onClick={() => setShowExpModal(false)}><X size={14} className="text-gray-400" /></button>
                  </div>
                  <div className="space-y-3">
                    <div><label className="text-[11px] text-gray-500 block mb-1">Date</label>
                      <input type="date" value={expForm.expense_date} onChange={e => setExpForm(p => ({ ...p, expense_date: e.target.value }))} className={panelInputCls} />
                    </div>
                    <div><label className="text-[11px] text-gray-500 block mb-1">Category</label>
                      <select value={expForm.category} onChange={e => setExpForm(p => ({ ...p, category: e.target.value }))} className={panelInputCls}>
                        {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div><label className="text-[11px] text-gray-500 block mb-1">Amount (₹)</label>
                      <input type="number" value={expForm.amount} onChange={e => setExpForm(p => ({ ...p, amount: e.target.value }))} placeholder="0" className={panelInputCls} />
                    </div>
                    <div>
                          <label className="text-[11px] text-gray-500 block mb-1">
                            Advance Amount (₹)
                          </label>

                          <input
                            type="number"
                            value={expForm.advance_amount}
                            onChange={e =>
                              setExpForm(p => ({
                                ...p,
                                advance_amount: e.target.value
                              }))
                            }
                            placeholder="0"
                            className={panelInputCls}
                          />
                        </div>
                    <div><label className="text-[11px] text-gray-500 block mb-1">Paid By</label>
                      <select value={expForm.paid_by} onChange={e => setExpForm(p => ({ ...p, paid_by: e.target.value }))} className={panelInputCls}>
                        <option>Company</option><option>Driver</option><option>Supplier</option>
                      </select>
                    </div>
                    <div><label className="text-[11px] text-gray-500 block mb-1">Notes</label>
                      <input value={expForm.notes} onChange={e => setExpForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" className={panelInputCls} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={saveExpense} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-[12px] font-medium">Add</button>
                    <button onClick={() => setShowExpModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-[12px]">Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FINANCIALS */}
        {activeSection === 'Financials' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-[12px] font-semibold text-gray-700 mb-3">Income</p>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between"><span className="text-gray-500">Customer Freight</span><span className="font-semibold text-blue-600">{fmtMoney(trip.freight_amount)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Bill Type</span><span className="text-gray-600">{trip.bill_type}</span></div>
                {trip.bill_type !== 'Fixed' && (
                  <>
                    <div className="flex justify-between"><span className="text-gray-500">Rate</span><span className="text-gray-600">{fmtMoney(trip.rate)} / unit</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Quantity</span><span className="text-gray-600">{trip.total_tonnage}</span></div>
                  </>
                )}
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-[12px] font-semibold text-gray-700 mb-3">Expenses & Cost</p>
              <div className="space-y-2 text-[11px]">
                {trip.ownership === 'Marker Truck' && (
                  <div className="flex justify-between"><span className="text-gray-500">Supplier Cost</span><span className="font-semibold text-orange-600">{fmtMoney(trip.supplier_amount)}</span></div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Supplier Charges</span>
                  <span className="font-semibold text-orange-600">
                    {fmtMoney(trip.charges_value)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">TDS Amount</span>
                  <span className="font-semibold text-red-500">
                    {fmtMoney(trip.tds_amount)}
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-gray-500">Trip Expenses</span><span className="font-semibold text-red-500">{fmtMoney(totalExpenses)}</span></div>
                {expenses.map(e => (
                  <div key={e.id} className="flex justify-between pl-3 text-[10px]">
                    <span className="text-gray-400">{e.category}</span>
                    <span className="text-gray-500">₹ {Number(e.amount).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-2 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
              <p className="text-[12px] font-semibold text-gray-700 mb-3">Summary</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: 'Total Income', value: fmtMoney(trip.freight_amount), color: 'text-blue-600' },
                 {
                    label: 'Total Cost',
                    value: fmtMoney(
                      (trip.supplier_amount || 0) +
                      (trip.tds_amount || 0) -
                      (trip.charges_value || 0) +
                      totalExpenses
                    )
                    , color: 'text-red-500'
                  },
                  { label: 'Net Profit', value: fmtMoney(profit), color: profit >= 0 ? 'text-green-700' : 'text-red-700' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-lg p-3 border border-white/80">
                    <p className="text-[10px] text-gray-400">{s.label}</p>
                    <p className={`text-[16px] font-bold mt-0.5 ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Step Advance Modal ── */}
      {showStepModal && pendingNext && (() => {
        const cfg = STEP_CONFIG[pendingNext.key];
        return (
          <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-96 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[13px] font-bold text-gray-800">Move to — {pendingNext.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{trip.trip_no} · Enter details before advancing</p>
                </div>
                <button onClick={() => setShowStepModal(false)}><X size={15} className="text-gray-400" /></button>
              </div>

              <div className="space-y-3">
                {/* KM field */}
                {cfg.kmField && (
                  <div>
                    <label className="text-[11px] text-gray-500 block mb-1">{cfg.kmLabel} *</label>
                    <input
                      type="number"
                      placeholder="Enter KM reading"
                      value={(stepForm[cfg.kmField] as string) || ''}
                      onChange={e => setStepForm(p => ({ ...p, [cfg.kmField]: e.target.value }))}
                      className={panelInputCls}
                    />
                  </div>
                )}

                {/* Doc upload */}
                <div>
                  <label className="text-[11px] text-gray-500 block mb-1">{cfg.docLabel}</label>
                  <div className="flex items-center gap-2">
                    <label className={`flex-1 flex items-center gap-2 cursor-pointer border border-dashed rounded-lg px-3 py-2 transition-colors
                      ${uploadingField === cfg.docField ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
                      {uploadingField === cfg.docField
                        ? <Loader2 size={12} className="text-blue-500 animate-spin" />
                        : <Upload size={12} className="text-gray-400" />}
                      <span className="text-[11px] text-gray-500 truncate max-w-[200px]">
                        {uploadingField === cfg.docField
                          ? 'Uploading…'
                          : stepForm[cfg.docField]
                          ? (stepForm[cfg.docField] as string).split('/').pop()
                          : 'Upload file'}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        disabled={uploadingField !== null}
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const path = await uploadStepFile(file, cfg.docField);
                          if (path) setStepForm(p => ({ ...p, [cfg.docField]: path }));
                        }}
                      />
                    </label>
                    {stepForm[cfg.docField] && (
                      <button
                        type="button"
                        onClick={() => openStepDoc(stepForm[cfg.docField] as string)}
                        className="flex items-center gap-1 px-2 py-1.5 border border-blue-200 bg-blue-50 text-blue-600 rounded-lg text-[11px] hover:bg-blue-100 whitespace-nowrap">
                        <ExternalLink size={11} /> View
                      </button>
                    )}
                  </div>
                </div>

                {/* Total KM preview */}
                {pendingNext.key === 'TripCompleted' && stepForm.end_km && trip.start_km && (
                  <div className="bg-blue-50 rounded-lg px-3 py-2 text-[11px]">
                    <span className="text-gray-500">Total KM: </span>
                    <span className="font-bold text-blue-600">
                      {(Number(stepForm.end_km) - Number(trip.start_km)).toLocaleString('en-IN')} KM
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={confirmStepAdvance}
                  disabled={statusSaving || uploadingField !== null || (!!cfg.kmField && !stepForm[cfg.kmField])}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-[12px] font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1.5">
                  {statusSaving ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
                  Confirm & Move
                </button>
                <button
                  onClick={() => setShowStepModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-[12px]">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

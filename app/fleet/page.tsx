'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Topbar from '@/components/layout/Topbar';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Eye, Pencil, Trash2, Plus, Search, X, Upload,
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, Loader2, ExternalLink,
  FileText, Truck, BadgeIndianRupee, CheckCheck,
} from 'lucide-react';

const supabase = createClientComponentClient();
const BUCKET = 'Vehicles';
const DOC_FOLDER: Record<DocField, string> = {
  rc_doc:        'rcDoc',
  insurance_doc: 'insuranceDoc',
  permit_doc:    'permitDoc',
  fc_doc:        'fcDoc',
  other_doc:     'otherDoc',
};
type DocField = 'rc_doc' | 'insurance_doc' | 'permit_doc' | 'fc_doc' | 'other_doc';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Vehicle {
  id: string;
  vehicle_no: string;
  type: string;
  model: string;
  brand: string;
  year: number;
  capacity: string | null;
  body_length: string | null;
  ownership: 'My Truck' | 'Marker Truck';
  supplier_id: string | null;
  driver_id: string | null;
  rc_no: string | null;
  rc_doc: string | null;
  engine_no: string | null;
  chassis_no: string | null;
  insurance_valid_up_to: string | null;
  insurance_doc: string | null;
  permit_valid_up_to: string | null;
  permit_doc: string | null;
  fc_valid_up_to: string | null;
  fc_doc: string | null;
  status: 'Running' | 'Available' | 'Workshop' | 'Breakdown' | 'Inactive';
  location: string | null;
  current_odometer: number | null;
  other_doc: string | null;
  deleted: boolean;
  emi_amount: number | null;
  emi_due_date: string | null;
  emi_paid: boolean;
  created_at?: string;
}

interface DropdownItem { id: string; label: string; }

type FormState = {
  vehicle_no: string; type: string; model: string; brand: string; year: string;
  capacity: string; body_length: string; ownership: 'My Truck' | 'Marker Truck';
  supplier_id: string; driver_id: string;
  rc_no: string; rc_doc: string;
  engine_no: string; chassis_no: string;
  insurance_valid_up_to: string; insurance_doc: string;
  permit_valid_up_to: string; permit_doc: string;
  fc_valid_up_to: string; fc_doc: string;
  status: string; location: string; current_odometer: string;
  other_doc: string;
  emi_amount: string;
  emi_due_date: string;
  emi_paid: boolean;
};

const EMPTY_FORM: FormState = {
  vehicle_no: '', type: 'Open Body Truck', model: '', brand: '', year: '',
  capacity: '', body_length: '', ownership: 'My Truck',
  supplier_id: '', driver_id: '',
  rc_no: '', rc_doc: '',
  engine_no: '', chassis_no: '',
  insurance_valid_up_to: '', insurance_doc: '',
  permit_valid_up_to: '', permit_doc: '',
  fc_valid_up_to: '', fc_doc: '',
  status: 'Available', location: '', current_odometer: '',
  other_doc: '',
  emi_amount: '',
  emi_due_date: '',
  emi_paid: false,
};

const TABS = ['Basic Info', 'EMI / Loan', 'Documents', 'Assignment'];
const PAGE_SIZE = 10;
const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";

const STATUS_COLOR: Record<string, string> = {
  Running: 'bg-green-100 text-green-700',
  Available: 'bg-blue-100 text-blue-700',
  Workshop: 'bg-yellow-100 text-yellow-700',
  Breakdown: 'bg-red-100 text-red-700',
  Inactive: 'bg-gray-100 text-gray-500',
};

const VEHICLE_TYPES = ['Mini Truck / LCV', 'Open Body Truck', 'Closed Container', 'Trailer', 'Tanker', 'Tipper'];

const byType = [
  { name: 'Trailer', value: 25, color: '#3b82f6' },
  { name: 'Truck', value: 20, color: '#10b981' },
  { name: 'Tanker', value: 3, color: '#f59e0b' },
  { name: 'Tipper', value: 2, color: '#8b5cf6' },
];

const services = [
  { vehicle: 'TN 04 GH 3456', type: 'Engine Service', due: '12 Jun 2026', km: '1,20,000', current: '1,05,230', days: '5 Days', status: 'Due Soon' },
  { vehicle: 'TN 06 KL 1122', type: 'Oil Change', due: '15 Jun 2026', km: '80,000', current: '75,120', days: '8 Days', status: 'Due Soon' },
  { vehicle: 'TN 08 OP 3344', type: 'Full Service', due: '18 Jun 2026', km: '1,00,000', current: '92,350', days: '11 Days', status: 'Due Soon' },
  { vehicle: 'TN 10 ST 5566', type: 'Brakes Check', due: '20 Jun 2026', km: '70,000', current: '62,480', days: '13 Days', status: 'Due Soon' },
];

// ─── Toast ────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error';
interface Toast { id: number; type: ToastType; message: string; }

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

// ─── Signed URL viewer ────────────────────────────────────────────────────────
async function openDoc(path: string | null) {
  if (!path) return;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) { alert('Could not open document: ' + (error?.message || '')); return; }
  window.open(data.signedUrl, '_blank');
}

// ─── File Upload Button ───────────────────────────────────────────────────────
function FileUploadBtn({ label, storagePath, uploading, onChange }: {
  label: string; storagePath: string; uploading: boolean; onChange: (f: File) => void;
}) {
  const fileName = storagePath ? storagePath.split('/').pop() : null;
  return (
    <div>
      <label className="text-[11px] text-gray-500 block mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <label className={`flex-1 flex items-center gap-2 cursor-pointer border border-dashed rounded-lg px-3 py-2 transition-colors
          ${uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
          {uploading ? <Loader2 size={12} className="text-blue-500 animate-spin" /> : <Upload size={12} className="text-gray-400" />}
          <span className="text-[11px] text-gray-500 truncate max-w-[160px]">{uploading ? 'Uploading…' : fileName || 'Upload file'}</span>
          <input type="file" className="hidden" disabled={uploading} onChange={e => { if (e.target.files?.[0]) onChange(e.target.files[0]); }} />
        </label>
        {storagePath && (
          <button type="button" onClick={() => openDoc(storagePath)}
            className="flex items-center gap-1 px-2 py-1.5 border border-blue-200 bg-blue-50 text-blue-600 rounded-lg text-[11px] hover:bg-blue-100 whitespace-nowrap">
            <ExternalLink size={11} /> View
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-[11px] text-gray-500 block mb-1">{label}</label>{children}</div>;
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-600">{icon}{title}</div>
      <div className="p-3 space-y-2">{children}</div>
    </div>
  );
}
function Row2({ a, b }: { a: [string, string | null]; b: [string, string | null] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[a, b].map(([l, v]) => (
        <div key={l}><p className="text-[10px] text-gray-400">{l}</p><p className="text-[12px] text-gray-700 font-medium">{v || '—'}</p></div>
      ))}
    </div>
  );
}
function Row1({ label, value }: { label: string; value: string | null }) {
  return <div><p className="text-[10px] text-gray-400">{label}</p><p className="text-[12px] text-gray-700 font-medium">{value || '—'}</p></div>;
}
function DocRow({ label, path }: { label: string; path: string | null }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400">{label}</p>
      {path
        ? <button type="button" onClick={() => openDoc(path)} className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-medium">
            <ExternalLink size={10} /> View Document
          </button>
        : <p className="text-[12px] text-gray-400">—</p>}
    </div>
  );
}

// ─── Expiry / EMI helpers ─────────────────────────────────────────────────────
function isExpiringSoon(dateStr: string | null, days = 30): boolean {
  if (!dateStr) return false;
  const diff = (new Date(dateStr).getTime() - Date.now()) / 86400000;
  return diff >= 0 && diff <= days;
}
function isExpired(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < Date.now();
}
function fmtDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function dateCls(dateStr: string | null) {
  if (isExpired(dateStr)) return 'text-red-600 font-semibold';
  if (isExpiringSoon(dateStr)) return 'text-orange-500 font-medium';
  return 'text-gray-500';
}
function emiDueCls(dateStr: string | null): string {
  if (!dateStr) return 'text-gray-400';
  if (isExpired(dateStr)) return 'text-red-600 font-semibold';
  if (isExpiringSoon(dateStr, 7)) return 'text-orange-500 font-semibold';
  return 'text-gray-600';
}
function fmtINR(amount: number | null): string {
  if (!amount) return '—';
  return '₹' + amount.toLocaleString('en-IN');
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [viewVehicle, setViewVehicle] = useState<Vehicle | null>(null);
  const [confirmInactiveId, setConfirmInactiveId] = useState<string | null>(null);
  const [confirmPaidId, setConfirmPaidId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [uploadingField, setUploadingField] = useState<DocField | null>(null);
  const [suppliers, setSuppliers] = useState<DropdownItem[]>([]);
  const [drivers, setDrivers] = useState<DropdownItem[]>([]);
  const [supplierMap, setSupplierMap] = useState<Record<string, string>>({});
  const [driverMap, setDriverMap] = useState<Record<string, string>>({});
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const toast = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  // ── Fetch vehicles ────────────────────────────────────────────────────────
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('vehicles')
      .select('*')
      .eq('deleted', false)
      .order('created_at', { ascending: false });
    if (error) toast('error', 'Failed to load: ' + error.message);
    else setVehicles(data || []);
    setLoading(false);
  }, [toast]);

  // ── Fetch suppliers & drivers for dropdowns ───────────────────────────────
  const fetchDropdowns = useCallback(async () => {
    const [{ data: sup }, { data: drv }] = await Promise.all([
      (supabase as any).from('suppliers').select('id, name').eq('status', 'Active').eq('deleted', false),
      (supabase as any).from('drivers').select('id, name').eq('status', 'Active').eq('deleted', false),
    ]);
    setSuppliers((sup || []).map((s: any) => ({ id: s.id, label: s.name })));
    setDrivers((drv || []).map((d: any) => ({ id: d.id, label: d.name })));
    const sMap: Record<string, string> = {};
    (sup || []).forEach((s: any) => { sMap[s.id] = s.name; });
    setSupplierMap(sMap);
    const dMap: Record<string, string> = {};
    (drv || []).forEach((d: any) => { dMap[d.id] = d.name; });
    setDriverMap(dMap);
  }, []);

  useEffect(() => { fetchVehicles(); fetchDropdowns(); }, [fetchVehicles, fetchDropdowns]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total: vehicles.length,
    running: vehicles.filter(v => v.status === 'Running').length,
    available: vehicles.filter(v => v.status === 'Available').length,
    workshop: vehicles.filter(v => v.status === 'Workshop').length,
    breakdown: vehicles.filter(v => v.status === 'Breakdown').length,
    inactive: vehicles.filter(v => v.status === 'Inactive').length,
    emiDueSoon: vehicles.filter(v => !v.emi_paid && v.emi_due_date && isExpiringSoon(v.emi_due_date, 7)).length,
    emiOverdue: vehicles.filter(v => !v.emi_paid && v.emi_due_date && isExpired(v.emi_due_date)).length,
  };

  const fleetStatusData = [
    { name: 'Running', value: stats.running, color: '#10b981' },
    { name: 'Available', value: stats.available, color: '#3b82f6' },
    { name: 'Workshop', value: stats.workshop, color: '#f59e0b' },
    { name: 'Breakdown', value: stats.breakdown, color: '#ef4444' },
    { name: 'Inactive', value: stats.inactive, color: '#6b7280' },
  ].filter(d => d.value > 0);

  const docAlerts = [
    { label: 'Insurance Expiring in 30 Days', value: vehicles.filter(v => isExpiringSoon(v.insurance_valid_up_to)).length, color: 'text-orange-500' },
    { label: 'Insurance Expired', value: vehicles.filter(v => isExpired(v.insurance_valid_up_to)).length, color: 'text-red-600' },
    { label: 'Permit Expiring in 30 Days', value: vehicles.filter(v => isExpiringSoon(v.permit_valid_up_to)).length, color: 'text-orange-500' },
    { label: 'FC Expiring in 30 Days', value: vehicles.filter(v => isExpiringSoon(v.fc_valid_up_to)).length, color: 'text-yellow-600' },
  ];

  const brandData = Array.from(
    vehicles.reduce((map, v) => { map.set(v.brand, (map.get(v.brand) || 0) + 1); return map; }, new Map<string, number>())
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);

  const typeData = Array.from(
    vehicles.reduce((map, v) => { map.set(v.type, (map.get(v.type) || 0) + 1); return map; }, new Map<string, number>())
  ).map(([name, value], i) => ({ name, value, color: ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#6b7280'][i] || '#6b7280' }));

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q || v.vehicle_no.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q) || v.type.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'All' || v.status === filterStatus;
    const matchType = filterType === 'All' || v.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Open modals ───────────────────────────────────────────────────────────
  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setActiveTab(0); setShowModal(true); };
  const openEdit = (v: Vehicle) => {
    setEditId(v.id);
    setForm({
      vehicle_no: v.vehicle_no, type: v.type, model: v.model, brand: v.brand,
      year: String(v.year), capacity: v.capacity || '', body_length: v.body_length || '',
      ownership: v.ownership || 'My Truck',
      supplier_id: v.supplier_id || '', driver_id: v.driver_id || '',
      rc_no: v.rc_no || '', rc_doc: v.rc_doc || '',
      engine_no: v.engine_no || '', chassis_no: v.chassis_no || '',
      insurance_valid_up_to: v.insurance_valid_up_to || '', insurance_doc: v.insurance_doc || '',
      permit_valid_up_to: v.permit_valid_up_to || '', permit_doc: v.permit_doc || '',
      fc_valid_up_to: v.fc_valid_up_to || '', fc_doc: v.fc_doc || '',
      status: v.status, location: v.location || '',
      current_odometer: v.current_odometer ? String(v.current_odometer) : '',
      other_doc: v.other_doc || '',
      emi_amount: v.emi_amount ? String(v.emi_amount) : '',
      emi_due_date: v.emi_due_date || '',
      emi_paid: v.emi_paid || false,
    });
    setActiveTab(0);
    setShowModal(true);
  };

  // ── Upload ────────────────────────────────────────────────────────────────
  const uploadFile = async (file: File, field: DocField, vehicleNo: string): Promise<string | null> => {
    setUploadingField(field);
    const ext = file.name.split('.').pop();
    const path = `${DOC_FOLDER[field]}/${vehicleNo}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
    setUploadingField(null);
    if (error) { toast('error', `Upload failed: ${error.message}`); return null; }
    return path;
  };

  const handleFileChange = async (file: File, field: DocField) => {
    const prefix = editId ? (vehicles.find(v => v.id === editId)?.vehicle_no || 'NEW') : (form.vehicle_no || 'NEW');
    const path = await uploadFile(file, field, prefix);
    if (path) setForm(prev => ({ ...prev, [field]: path }));
  };

  // ── Mark EMI Paid ─────────────────────────────────────────────────────────
  const markEmiPaid = async (id: string) => {
    setMarkingPaid(id);
    const vehicle = vehicles.find(v => v.id === id);
    
    // Auto-advance due date by 1 month
    let nextDueDate: string | null = null;
    if (vehicle?.emi_due_date) {
      const d = new Date(vehicle.emi_due_date);
      d.setMonth(d.getMonth() + 1);
      nextDueDate = d.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    const { error } = await (supabase as any)
      .from('vehicles')
      .update({ emi_paid: false, emi_due_date: nextDueDate })
      .eq('id', id);
    setMarkingPaid(null);
    if (error) toast('error', 'Failed to mark paid: ' + error.message);
    else {
      toast('success', `EMI paid ✓ — next due date set to ${nextDueDate ? fmtDate(nextDueDate) : '—'}`);
      setConfirmPaidId(null);
      fetchVehicles();
    }
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const save = async () => {
    if (!form.vehicle_no.trim()) { toast('error', 'Vehicle number is required'); return; }
    if (!form.model.trim()) { toast('error', 'Model is required'); return; }
    if (!form.brand.trim()) { toast('error', 'Brand is required'); return; }
    if (!form.year) { toast('error', 'Year is required'); return; }
    setSaving(true);

    const payload = {
      vehicle_no: form.vehicle_no.trim().toUpperCase(),
      type: form.type,
      model: form.model.trim(),
      brand: form.brand.trim(),
      year: parseInt(form.year),
      capacity: form.capacity || null,
      body_length: form.body_length || null,
      ownership: form.ownership,
      supplier_id: form.ownership === 'Marker Truck' && form.supplier_id ? form.supplier_id : null,
      driver_id: form.ownership === 'My Truck' && form.driver_id ? form.driver_id : null,
      rc_no: form.rc_no || null,
      rc_doc: form.rc_doc || null,
      engine_no: form.engine_no || null,
      chassis_no: form.chassis_no || null,
      insurance_valid_up_to: form.insurance_valid_up_to || null,
      insurance_doc: form.insurance_doc || null,
      permit_valid_up_to: form.permit_valid_up_to || null,
      permit_doc: form.permit_doc || null,
      fc_valid_up_to: form.fc_valid_up_to || null,
      fc_doc: form.fc_doc || null,
      status: form.status,
      location: form.location || null,
      current_odometer: form.current_odometer ? parseInt(form.current_odometer) : 0,
      other_doc: form.other_doc || null,
      emi_amount: form.emi_amount ? parseFloat(form.emi_amount) : null,
      emi_due_date: form.emi_due_date || null,
      // When editing and a new due date is set, reset paid status automatically
      emi_paid: editId
        ? (form.emi_due_date
            ? (form.emi_due_date !== (vehicles.find(v => v.id === editId)?.emi_due_date || '')
                ? false          // new date entered → reset to unpaid
                : form.emi_paid) // same date → keep current
            : form.emi_paid)
        : false,
    };

    if (editId) {
      const { error } = await (supabase as any).from('vehicles').update(payload).eq('id', editId);
      if (error) toast('error', 'Update failed: ' + error.message);
      else { toast('success', 'Vehicle updated successfully'); setShowModal(false); fetchVehicles(); }
    } else {
      const { error } = await (supabase as any).from('vehicles').insert({ ...payload, deleted: false });
      if (error) toast('error', 'Insert failed: ' + error.message);
      else { toast('success', `Vehicle ${payload.vehicle_no} added successfully`); setShowModal(false); fetchVehicles(); }
    }
    setSaving(false);
  };

  // ── Set Inactive ──────────────────────────────────────────────────────────
  const setInactive = async (id: string) => {
    const { error } = await (supabase as any).from('vehicles').update({ status: 'Inactive' }).eq('id', id);
    if (error) toast('error', 'Failed: ' + error.message);
    else { toast('success', 'Vehicle set as Inactive'); setConfirmInactiveId(null); fetchVehicles(); }
  };

  const f = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  // ── EMI status label ──────────────────────────────────────────────────────
  function emiStatusBadge(v: Vehicle) {
    if (!v.emi_amount) return null;
    if (v.emi_paid) {
      return <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">Paid</span>;
    }
    if (!v.emi_due_date) {
      return <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]">No Due Date</span>;
    }
    if (isExpired(v.emi_due_date)) {
      return <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium">Overdue</span>;
    }
    if (isExpiringSoon(v.emi_due_date, 7)) {
      return <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-medium">Due Soon</span>;
    }
    return <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">Pending</span>;
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Topbar title="Fleet / Trucks" breadcrumbs={[{ label: 'Fleet / Trucks' }]} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Total Vehicles', value: stats.total, sub: 'All Vehicles', color: 'text-blue-600' },
            { label: 'Running', value: stats.running, sub: `${stats.total ? Math.round(stats.running / stats.total * 100) : 0}% of Total`, color: 'text-green-600' },
            { label: 'Available', value: stats.available, sub: `${stats.total ? Math.round(stats.available / stats.total * 100) : 0}% of Total`, color: 'text-blue-500' },
            { label: 'Workshop', value: stats.workshop, sub: 'Under Service', color: 'text-yellow-600' },
            { label: 'EMI Overdue', value: stats.emiOverdue, sub: 'Payment Overdue', color: 'text-red-600' },
            { label: 'EMI Due Soon', value: stats.emiDueSoon, sub: 'Within 7 Days', color: 'text-orange-500' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400">{c.label}</p>
              <p className={`text-[22px] font-bold ${c.color} mt-1`}>{c.value}</p>
              <p className="text-[10px] text-gray-400">{c.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {/* Table */}
          <div className="col-span-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-700">All Vehicles</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search vehicle no, model, brand…"
                    className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] w-56 focus:outline-none" />
                </div>
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11px]">
                  <option value="All">All Status</option>
                  <option>Running</option><option>Available</option><option>Workshop</option><option>Breakdown</option><option>Inactive</option>
                </select>
                <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11px]">
                  <option value="All">All Types</option>
                  {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <button onClick={openAdd}
                  className="flex items-center gap-1.5 bg-[#1a56db] text-white px-3 py-1.5 rounded-lg text-[11px] font-medium hover:bg-blue-700">
                  <Plus size={12} /> Add Vehicle
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                <Loader2 size={16} className="animate-spin" /> Loading vehicles…
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                      {['Vehicle No','Type','Brand / Model','Ownership','Insurance Expiry','Status','EMI Amount','EMI Due Date','EMI Status','Actions'].map(h => (
                        <th key={h} className="text-left px-2 py-2 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0
                      ? <tr><td colSpan={10} className="text-center py-12 text-gray-400">No vehicles found.</td></tr>
                      : paginated.map(v => (
                        <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-2 py-2 text-blue-600 font-medium whitespace-nowrap">{v.vehicle_no}</td>
                          <td className="px-2 py-2 text-gray-500 whitespace-nowrap">{v.type}</td>
                          <td className="px-2 py-2 text-gray-700 font-medium">{v.brand} {v.model}</td>
                          <td className="px-2 py-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${v.ownership === 'My Truck' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                              {v.ownership}
                            </span>
                          </td>
                          <td className={`px-2 py-2 whitespace-nowrap ${dateCls(v.insurance_valid_up_to)}`}>{fmtDate(v.insurance_valid_up_to)}</td>
                          <td className="px-2 py-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_COLOR[v.status]}`}>{v.status}</span>
                          </td>

                          {/* EMI Amount */}
                          <td className="px-2 py-2 text-gray-700 font-medium whitespace-nowrap">
                            {v.emi_amount ? fmtINR(v.emi_amount) : <span className="text-gray-300">—</span>}
                          </td>

                          {/* EMI Due Date — hidden when paid */}
                          <td className={`px-2 py-2 whitespace-nowrap ${emiDueCls(v.emi_paid ? null : v.emi_due_date)}`}>
                            {v.emi_amount
                              ? v.emi_paid
                                ? <span className="text-gray-300 italic text-[10px]">— set next date —</span>
                                : fmtDate(v.emi_due_date)
                              : <span className="text-gray-300">—</span>}
                          </td>

                          {/* EMI Status badge */}
                          <td className="px-2 py-2">{emiStatusBadge(v)}</td>

                          {/* Actions */}
                          <td className="px-2 py-2">
                            <div className="flex gap-1 items-center">
                              <button onClick={() => setViewVehicle(v)} className="text-gray-400 hover:text-blue-600" title="View"><Eye size={12} /></button>
                              <button onClick={() => openEdit(v)} className="text-gray-400 hover:text-green-600" title="Edit"><Pencil size={12} /></button>
                              {v.status !== 'Inactive' && (
                                <button onClick={() => setConfirmInactiveId(v.id)} className="text-gray-400 hover:text-red-500" title="Set Inactive"><Trash2 size={12} /></button>
                              )}
                              {/* Mark EMI Paid button — only show if EMI exists and not yet paid */}
                              {v.emi_amount && !v.emi_paid && (
                                <button
                                  onClick={() => setConfirmPaidId(v.id)}
                                  title="Mark EMI Paid"
                                  className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded text-[10px] font-medium hover:bg-green-100 whitespace-nowrap">
                                  <CheckCheck size={10} /> Paid
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="flex items-center justify-between mt-3">
                <p className="text-[11px] text-gray-400">
                  Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries
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
          </div>

          {/* Right Panel */}
          <div className="space-y-3">
            {/* Fleet Status Donut */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[13px] font-semibold text-gray-700 mb-2">Fleet Status</h3>
              {fleetStatusData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={100}>
                    <PieChart><Pie data={fleetStatusData} cx="50%" cy="50%" innerRadius={28} outerRadius={44} dataKey="value">
                      {fleetStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie></PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1 mt-1">
                    {fleetStatusData.map(d => (
                      <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="flex-1 text-gray-500">{d.name}</span>
                        <span className="font-semibold">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-[11px] text-gray-300 text-center py-4">No data</p>
              )}
            </div>

            {/* EMI Summary */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[12px] font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <BadgeIndianRupee size={13} className="text-blue-500" /> EMI Summary
              </h3>
              {[
                { label: 'EMI Overdue', value: stats.emiOverdue, color: 'text-red-600' },
                { label: 'Due within 7 days', value: stats.emiDueSoon, color: 'text-orange-500' },
                { label: 'Vehicles with EMI', value: vehicles.filter(v => !!v.emi_amount).length, color: 'text-blue-600' },
                { label: 'Paid this cycle', value: vehicles.filter(v => v.emi_paid).length, color: 'text-green-600' },
              ].map(d => (
                <div key={d.label} className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] text-gray-500">{d.label}</span>
                  <span className={`text-[11px] font-semibold ${d.color}`}>{d.value}</span>
                </div>
              ))}
            </div>

            {/* Doc Expiry */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[12px] font-semibold text-gray-700 mb-2">Document Expiry Alerts</h3>
              {docAlerts.map(d => (
                <div key={d.label} className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] text-gray-500">⚠️ {d.label}</span>
                  <span className={`text-[10px] font-semibold ${d.color}`}>{d.value} Vehicles</span>
                </div>
              ))}
            </div>

            {/* Ownership split */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[12px] font-semibold text-gray-700 mb-2">Ownership</h3>
              {[
                { label: 'My Truck', value: vehicles.filter(v => v.ownership === 'My Truck').length, color: 'bg-purple-100 text-purple-600' },
                { label: 'Marker Truck', value: vehicles.filter(v => v.ownership === 'Marker Truck').length, color: 'bg-orange-100 text-orange-600' },
              ].map(o => (
                <div key={o.label} className="flex justify-between items-center mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${o.color}`}>{o.label}</span>
                  <span className="text-[11px] font-semibold text-gray-700">{o.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Vehicles by Type</h3>
            <div className="flex items-center gap-3">
              <ResponsiveContainer width={100} height={100}><PieChart><Pie data={byType} cx="50%" cy="50%" innerRadius={25} outerRadius={42} dataKey="value">{byType.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart></ResponsiveContainer>
              <div className="space-y-1.5">{byType.map(d=>(<div key={d.name} className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:d.color}}/><span className="text-[11px] text-gray-500 flex-1">{d.name}</span><span className="text-[11px] font-semibold">{d.value} ({Math.round(d.value/50*100)}%)</span></div>))}</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Vehicles by Brand</h3>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={brandData}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide /><Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Vehicles by Type</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={100} height={100}>
                <PieChart><Pie data={typeData} cx="50%" cy="50%" innerRadius={25} outerRadius={42} dataKey="value">
                  {typeData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie></PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 flex-1">
                {typeData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] text-gray-500 flex-1">{d.name}</span>
                    <span className="text-[10px] font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-gray-700">Upcoming Services & Maintenance</h3>
            <a href="#" className="text-[10px] text-blue-600">View All</a>
          </div>
          <table className="w-full text-[11px]">
            <thead><tr className="text-gray-400 border-b border-gray-100"><th className="text-left py-2">Vehicle No.</th><th className="text-left py-2">Service Type</th><th className="text-left py-2">Due Date</th><th className="text-left py-2">KM Due</th><th className="text-left py-2">Current KM</th><th className="text-left py-2">Days Left</th><th className="text-left py-2">Status</th></tr></thead>
            <tbody>{services.map(s=>(<tr key={s.vehicle} className="border-b border-gray-50"><td className="py-2 text-blue-600">{s.vehicle}</td><td className="py-2 text-gray-600">{s.type}</td><td className="py-2 text-gray-500">{s.due}</td><td className="py-2 text-gray-500">{s.km}</td><td className="py-2 text-gray-500">{s.current}</td><td className="py-2 text-orange-500 font-medium">{s.days}</td><td className="py-2"><span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px]">{s.status}</span></td></tr>))}</tbody>
          </table>
        </div>
      </div>

      {/* ─── Add / Edit Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-[14px] font-bold text-gray-800">{editId ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{editId ? 'Update vehicle information' : 'Fill details to register a new vehicle'}</p>
              </div>
              <button onClick={() => setShowModal(false)}><X size={16} className="text-gray-400 hover:text-gray-700" /></button>
            </div>

            <div className="flex border-b border-gray-100 px-5">
              {TABS.map((t, i) => (
                <button key={t} onClick={() => setActiveTab(i)}
                  className={`py-2.5 px-3 text-[11px] font-medium border-b-2 transition-colors
                    ${activeTab === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">

              {/* Tab 0 – Basic Info */}
              {activeTab === 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Vehicle Number *">
                    <input value={form.vehicle_no} onChange={f('vehicle_no')} placeholder="e.g. TN 01 AB 1234" className={inputCls}
                      disabled={!!editId} />
                  </Field>
                  <Field label="Vehicle Type *">
                    <select value={form.type} onChange={f('type')} className={inputCls}>
                      {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Brand *"><input value={form.brand} onChange={f('brand')} placeholder="e.g. Ashok Leyland" className={inputCls} /></Field>
                  <Field label="Model *"><input value={form.model} onChange={f('model')} placeholder="e.g. 2518 IL" className={inputCls} /></Field>
                  <Field label="Year *"><input type="number" value={form.year} onChange={f('year')} placeholder="e.g. 2021" className={inputCls} /></Field>
                  <Field label="Capacity"><input value={form.capacity} onChange={f('capacity')} placeholder="e.g. 20 Tonnes" className={inputCls} /></Field>
                  <Field label="Body Length"><input value={form.body_length} onChange={f('body_length')} placeholder="e.g. 32 Feet" className={inputCls} /></Field>
                  <Field label="Current Odometer (KM)"><input type="number" value={form.current_odometer} onChange={f('current_odometer')} placeholder="0" className={inputCls} /></Field>
                  <Field label="Status">
                    <select value={form.status} onChange={f('status')} className={inputCls}>
                      <option>Running</option><option>Available</option><option>Workshop</option><option>Breakdown</option><option>Inactive</option>
                    </select>
                  </Field>
                  <Field label="Location"><input value={form.location} onChange={f('location')} placeholder="e.g. Chennai" className={inputCls} /></Field>
                </div>
              )}

              {/* Tab 1 – EMI / Loan */}
              {activeTab === 1 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-[11px] text-blue-700">
                    💡 Enter the monthly EMI amount and next due date. Once paid, click <strong>Mark Paid</strong> in the table — the due date will be hidden until you set the next month's date here.
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Monthly EMI Amount (₹)">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[12px]">₹</span>
                        <input
                          type="number"
                          value={form.emi_amount}
                          onChange={f('emi_amount')}
                          placeholder="e.g. 45000"
                          className={`${inputCls} pl-6`}
                        />
                      </div>
                    </Field>
                    <Field label="Next EMI Due Date">
                      <input
                        type="date"
                        value={form.emi_due_date}
                        onChange={f('emi_due_date')}
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  {/* Current status preview when editing */}
                  {editId && (() => {
                    const v = vehicles.find(x => x.id === editId);
                    if (!v?.emi_amount) return null;
                    return (
                      <div className={`rounded-lg p-3 border text-[11px] ${
                        v.emi_paid
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : isExpired(v.emi_due_date)
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}>
                        <p className="font-semibold mb-1">Current EMI Status</p>
                        <p>Amount: <strong>{fmtINR(v.emi_amount)}</strong></p>
                        <p>Due Date: <strong>{fmtDate(v.emi_due_date)}</strong></p>
                        <p>Status: <strong>{v.emi_paid ? '✅ Paid' : isExpired(v.emi_due_date) ? '🔴 Overdue' : '🟡 Pending'}</strong></p>
                        {!v.emi_paid && <p className="mt-1 text-[10px] opacity-75">To reset: set a new due date above and save — status will auto-reset to Pending.</p>}
                      </div>
                    );
                  })()}

                  {/* Clear EMI option */}
                  {(form.emi_amount || form.emi_due_date) && (
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, emi_amount: '', emi_due_date: '', emi_paid: false }))}
                      className="text-[11px] text-red-500 hover:text-red-700 underline"
                    >
                      Clear EMI details
                    </button>
                  )}
                </div>
              )}

              {/* Tab 2 – Documents */}
              {activeTab === 2 && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="RC Number"><input value={form.rc_no} onChange={f('rc_no')} placeholder="RC number" className={inputCls} /></Field>
                  <div className="col-span-1">
                    <FileUploadBtn label="RC Document" storagePath={form.rc_doc}
                      uploading={uploadingField === 'rc_doc'} onChange={file => handleFileChange(file, 'rc_doc')} />
                  </div>
                  <Field label="Engine Number"><input value={form.engine_no} onChange={f('engine_no')} placeholder="Engine number" className={inputCls} /></Field>
                  <Field label="Chassis Number"><input value={form.chassis_no} onChange={f('chassis_no')} placeholder="Chassis number" className={inputCls} /></Field>
                  <Field label="Insurance Valid Up To"><input type="date" value={form.insurance_valid_up_to} onChange={f('insurance_valid_up_to')} className={inputCls} /></Field>
                  <div className="col-span-1">
                    <FileUploadBtn label="Insurance Document" storagePath={form.insurance_doc}
                      uploading={uploadingField === 'insurance_doc'} onChange={file => handleFileChange(file, 'insurance_doc')} />
                  </div>
                  <Field label="Permit Valid Up To"><input type="date" value={form.permit_valid_up_to} onChange={f('permit_valid_up_to')} className={inputCls} /></Field>
                  <div className="col-span-1">
                    <FileUploadBtn label="Permit Document" storagePath={form.permit_doc}
                      uploading={uploadingField === 'permit_doc'} onChange={file => handleFileChange(file, 'permit_doc')} />
                  </div>
                  <Field label="FC Valid Up To"><input type="date" value={form.fc_valid_up_to} onChange={f('fc_valid_up_to')} className={inputCls} /></Field>
                  <div className="col-span-1">
                    <FileUploadBtn label="FC Document" storagePath={form.fc_doc}
                      uploading={uploadingField === 'fc_doc'} onChange={file => handleFileChange(file, 'fc_doc')} />
                  </div>
                  <div className="col-span-2">
                    <FileUploadBtn label="Other Documents" storagePath={form.other_doc}
                      uploading={uploadingField === 'other_doc'} onChange={file => handleFileChange(file, 'other_doc')} />
                  </div>
                </div>
              )}

              {/* Tab 3 – Assignment */}
              {activeTab === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] text-gray-500 block mb-2">Ownership *</label>
                    <div className="flex gap-3">
                      {(['My Truck', 'Marker Truck'] as const).map(opt => (
                        <button key={opt} type="button"
                          onClick={() => setForm(prev => ({ ...prev, ownership: opt, supplier_id: '', driver_id: '' }))}
                          className={`flex-1 py-2 rounded-lg border text-[12px] font-medium transition-colors
                            ${form.ownership === opt
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                          {opt === 'My Truck' ? '🚛 My Truck' : '📦 Marker Truck'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.ownership === 'Marker Truck' && (
                    <div>
                      <label className="text-[11px] text-gray-500 block mb-1">Select Supplier</label>
                      <select value={form.supplier_id} onChange={f('supplier_id')} className={inputCls}>
                        <option value="">— Select Supplier —</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                      {suppliers.length === 0 && (
                        <p className="text-[10px] text-gray-400 mt-1">No active suppliers found. Add suppliers first.</p>
                      )}
                    </div>
                  )}

                  {form.ownership === 'My Truck' && (
                    <div>
                      <label className="text-[11px] text-gray-500 block mb-1">Assign Driver</label>
                      <select value={form.driver_id} onChange={f('driver_id')} className={inputCls}>
                        <option value="">— Select Driver —</option>
                        {drivers.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                      </select>
                      {drivers.length === 0 && (
                        <p className="text-[10px] text-gray-400 mt-1">No active drivers found. Add drivers first.</p>
                      )}
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-[11px] text-blue-600">
                    {form.ownership === 'My Truck'
                      ? '🚛 My Truck — owned by MLS Transports. Assign a driver who will operate this vehicle.'
                      : '📦 Marker Truck — hired from a supplier. Select the supplier this vehicle belongs to.'}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <div className="flex gap-1">
                {TABS.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === activeTab ? 'bg-blue-600' : 'bg-gray-200'}`} />
                ))}
              </div>
              <div className="flex gap-2">
                {activeTab > 0 && (
                  <button onClick={() => setActiveTab(t => t - 1)} className="px-4 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-100">← Back</button>
                )}
                {activeTab < TABS.length - 1 ? (
                  <button onClick={() => setActiveTab(t => t + 1)} className="px-4 py-1.5 bg-[#1a56db] text-white rounded-lg text-[12px] font-medium hover:bg-blue-700">Next →</button>
                ) : (
                  <button onClick={save} disabled={saving || uploadingField !== null}
                    className="px-5 py-1.5 bg-[#1a56db] text-white rounded-lg text-[12px] font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center gap-1.5">
                    {saving && <Loader2 size={12} className="animate-spin" />}
                    {editId ? '✓ Update Vehicle' : '✓ Add Vehicle'}
                  </button>
                )}
                <button onClick={() => setShowModal(false)} className="px-4 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-100">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Modal ───────────────────────────────────────────────────── */}
      {viewVehicle && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Truck size={16} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-800">{viewVehicle.vehicle_no}</p>
                  <p className="text-[11px] text-gray-400">{viewVehicle.brand} {viewVehicle.model} · {viewVehicle.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_COLOR[viewVehicle.status]}`}>{viewVehicle.status}</span>
                <button onClick={() => setViewVehicle(null)}><X size={16} className="text-gray-400" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <Section icon={<Truck size={13} />} title="Basic Info">
                <Row2 a={['Year', String(viewVehicle.year)]} b={['Capacity', viewVehicle.capacity]} />
                <Row2 a={['Body Length', viewVehicle.body_length]} b={['Odometer', viewVehicle.current_odometer ? `${viewVehicle.current_odometer.toLocaleString('en-IN')} KM` : null]} />
                <Row2 a={['Location', viewVehicle.location]} b={['Ownership', viewVehicle.ownership]} />
              </Section>

              {/* EMI Section in view modal */}
              {viewVehicle.emi_amount && (
                <Section icon={<BadgeIndianRupee size={13} />} title="EMI / Loan">
                  <Row2
                    a={['Monthly EMI', fmtINR(viewVehicle.emi_amount)]}
                    b={['Due Date', viewVehicle.emi_paid ? '— set next date —' : fmtDate(viewVehicle.emi_due_date)]}
                  />
                  <Row1 label="Payment Status" value={
                    viewVehicle.emi_paid
                      ? '✅ Paid'
                      : viewVehicle.emi_due_date
                      ? isExpired(viewVehicle.emi_due_date) ? '🔴 Overdue' : '🟡 Pending'
                      : 'No due date set'
                  } />
                </Section>
              )}

              <Section icon={<FileText size={13} />} title="Documents">
                <Row2 a={['RC Number', viewVehicle.rc_no]} b={['', null]} />
                <div className="grid grid-cols-2 gap-2">
                  <DocRow label="RC Document" path={viewVehicle.rc_doc} />
                  <DocRow label="Insurance Doc" path={viewVehicle.insurance_doc} />
                </div>
                <Row2 a={['Insurance Expiry', fmtDate(viewVehicle.insurance_valid_up_to)]} b={['Permit Expiry', fmtDate(viewVehicle.permit_valid_up_to)]} />
                <div className="grid grid-cols-2 gap-2">
                  <DocRow label="Permit Document" path={viewVehicle.permit_doc} />
                  <DocRow label="FC Document" path={viewVehicle.fc_doc} />
                </div>
                <Row1 label="FC Expiry" value={fmtDate(viewVehicle.fc_valid_up_to)} />
                <DocRow label="Other Document" path={viewVehicle.other_doc} />
              </Section>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => { setViewVehicle(null); openEdit(viewVehicle); }}
                className="px-4 py-1.5 bg-[#1a56db] text-white rounded-lg text-[12px] font-medium hover:bg-blue-700 flex items-center gap-1.5">
                <Pencil size={12} /> Edit
              </button>
              <button onClick={() => setViewVehicle(null)} className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-[12px]">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Set Inactive Confirm ─────────────────────────────────────────── */}
      {confirmInactiveId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-80 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center">
                <Trash2 size={16} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-800">Set Vehicle as Inactive?</p>
                <p className="text-[11px] text-gray-400">Vehicle will be marked Inactive. Record is kept.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setInactive(confirmInactiveId)}
                className="flex-1 bg-yellow-500 text-white py-2 rounded-lg text-[12px] font-medium hover:bg-yellow-600">
                Yes, Set Inactive
              </button>
              <button onClick={() => setConfirmInactiveId(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-[12px]">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Mark EMI Paid Confirm ────────────────────────────────────────── */}
      {confirmPaidId && (() => {
        const v = vehicles.find(x => x.id === confirmPaidId);
        return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl w-80 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCheck size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-800">Mark EMI as Paid?</p>
                  <p className="text-[11px] text-gray-400">{v?.vehicle_no} — {fmtINR(v?.emi_amount ?? null)}</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mb-4">
                Due date will <strong>auto-advance by 1 month</strong> after marking paid. No manual update needed.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => markEmiPaid(confirmPaidId)}
                  disabled={markingPaid === confirmPaidId}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg text-[12px] font-medium hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-1.5">
                  {markingPaid === confirmPaidId && <Loader2 size={12} className="animate-spin" />}
                  ✓ Yes, Mark Paid
                </button>
                <button onClick={() => setConfirmPaidId(null)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-[12px]">Cancel</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

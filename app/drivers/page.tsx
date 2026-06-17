'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Topbar from '@/components/layout/Topbar';
import {
  Eye, Pencil, Trash2, Plus, Search, X, Upload,
  User, CreditCard, Phone, FileText, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Loader2, ExternalLink,
} from 'lucide-react';

const supabase = createClientComponentClient();
const BUCKET = 'Drivers'; // root bucket name in Supabase Storage

// Each doc type goes into its own folder inside the bucket
const DOC_FOLDER: Record<'license_doc' | 'bank_doc' | 'other_doc', string> = {
  license_doc: 'LicenseDoc',
  bank_doc:    'BankDetails',
  other_doc:   'OtherDoc',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Driver {
  id: string;
  driver_no: string;
  name: string;
  mobile: string;
  license_no: string | null;
  license_expiry: string | null;
  license_doc: string | null;   // storage path
  status: 'Active' | 'On Trip' | 'Inactive';
  type: string | null;
  experience: string | null;
  city: string | null;
  address: string | null;
  joined_date: string | null;
  bank_account_no: string | null;
  bank_name: string | null;
  gpay_no: string | null;
  ifsc_code: string | null;
  branch_name: string | null;
  bank_doc: string | null;      // storage path
  emergency_name: string | null;
  emergency_phone: string | null;
  other_doc: string | null;     // storage path
  deleted: boolean;
  created_at?: string;
}

type FormState = Omit<Driver, 'id' | 'driver_no' | 'deleted' | 'created_at'>;

// ─── Toast ────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error';
interface Toast { id: number; type: ToastType; message: string; }

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-[12px] font-medium text-white pointer-events-auto
            ${t.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
          {t.type === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {t.message}
          <button onClick={() => onRemove(t.id)} className="ml-2 opacity-70 hover:opacity-100"><X size={12} /></button>
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  'On Trip': 'bg-blue-100 text-blue-700',
  Inactive: 'bg-gray-100 text-gray-500',
};

const EMPTY_FORM: FormState = {
  name: '', mobile: '', license_no: '', license_expiry: '', license_doc: '',
  status: 'Active', type: 'Heavy Vehicle', experience: '', city: '', address: '',
  joined_date: '', bank_account_no: '', bank_name: '', gpay_no: '', ifsc_code: '',
  branch_name: '', bank_doc: '', emergency_name: '', emergency_phone: '', other_doc: '',
};

const TABS = ['Personal', 'License', 'Bank Details', 'Emergency & Docs'];
const PAGE_SIZE = 10;
const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";

// ─── Open signed URL for any storage path (works for private & public buckets) ─
async function openDoc(path: string | null) {
  if (!path) return;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60); // 1-hour expiry
  if (error || !data?.signedUrl) {
    alert('Could not open document. ' + (error?.message || ''));
    return;
  }
  window.open(data.signedUrl, '_blank');
}

// ─── File Upload Button with View ─────────────────────────────────────────────
function FileUploadBtn({
  label, storagePath, uploading, onChange,
}: {
  label: string;
  storagePath: string | null;
  uploading: boolean;
  onChange: (file: File) => void;
}) {
  const fileName = storagePath ? storagePath.split('/').pop() : null;

  return (
    <div>
      <label className="text-[11px] text-gray-500 block mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <label className={`flex-1 flex items-center gap-2 cursor-pointer border border-dashed rounded-lg px-3 py-2 transition-colors
          ${uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
          {uploading
            ? <Loader2 size={12} className="text-blue-500 animate-spin" />
            : <Upload size={12} className="text-gray-400" />}
          <span className="text-[11px] text-gray-500 truncate max-w-[160px]">
            {uploading ? 'Uploading…' : fileName || 'Upload file'}
          </span>
          <input type="file" className="hidden" disabled={uploading}
            onChange={e => { if (e.target.files?.[0]) onChange(e.target.files[0]); }} />
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
  return (
    <div>
      <label className="text-[11px] text-gray-500 block mb-1">{label}</label>
      {children}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-600">
        {icon}{title}
      </div>
      <div className="p-3 space-y-2">{children}</div>
    </div>
  );
}

function Row2({ a, b }: { a: [string, string | null]; b: [string, string | null] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[a, b].map(([l, v]) => (
        <div key={l}>
          <p className="text-[10px] text-gray-400">{l}</p>
          <p className="text-[12px] text-gray-700 font-medium">{v || '—'}</p>
        </div>
      ))}
    </div>
  );
}

function DocRow({ label, path }: { label: string; path: string | null }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400">{label}</p>
      {path
        ? <button type="button" onClick={() => openDoc(path)}
            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-medium">
            <ExternalLink size={10} /> View Document
          </button>
        : <p className="text-[12px] text-gray-400">—</p>}
    </div>
  );
}

function Row1({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className="text-[12px] text-gray-700 font-medium">{value || '—'}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [viewDriver, setViewDriver] = useState<Driver | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // uploading state per field
  const [uploadingField, setUploadingField] = useState<'license_doc' | 'bank_doc' | 'other_doc' | null>(null);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const toast = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('deleted', false)
      .order('created_at', { ascending: false });
    if (error) toast('error', 'Failed to load: ' + error.message);
    else setDrivers(data || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total: drivers.length,
    active: drivers.filter(d => d.status === 'Active').length,
    onTrip: drivers.filter(d => d.status === 'On Trip').length,
    inactive: drivers.filter(d => d.status === 'Inactive').length,
    expiring: drivers.filter(d => {
      if (!d.license_expiry) return false;
      const diff = (new Date(d.license_expiry).getTime() - Date.now()) / 86400000;
      return diff >= 0 && diff <= 30;
    }).length,
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = drivers.filter(d => {
    const matchStatus = filterStatus === 'All' || d.status === filterStatus;
    const q = search.toLowerCase();
    return matchStatus && (!q ||
      d.name.toLowerCase().includes(q) ||
      d.driver_no.toLowerCase().includes(q) ||
      d.mobile.includes(q) ||
      (d.license_no || '').toLowerCase().includes(q));
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Open modals ───────────────────────────────────────────────────────────
  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setActiveTab(0); setShowModal(true); };
  const openEdit = (d: Driver) => {
    setEditId(d.id);
    setForm({
      name: d.name, mobile: d.mobile,
      license_no: d.license_no || '', license_expiry: d.license_expiry || '', license_doc: d.license_doc || '',
      status: d.status, type: d.type || 'Heavy Vehicle', experience: d.experience || '',
      city: d.city || '', address: d.address || '', joined_date: d.joined_date || '',
      bank_account_no: d.bank_account_no || '', bank_name: d.bank_name || '',
      gpay_no: d.gpay_no || '', ifsc_code: d.ifsc_code || '', branch_name: d.branch_name || '',
      bank_doc: d.bank_doc || '', emergency_name: d.emergency_name || '',
      emergency_phone: d.emergency_phone || '', other_doc: d.other_doc || '',
    });
    setActiveTab(0);
    setShowModal(true);
  };

  // ── Upload file to Supabase Storage ──────────────────────────────────────
  const uploadFile = async (
    file: File,
    field: 'license_doc' | 'bank_doc' | 'other_doc',
    driverNo: string,
  ): Promise<string | null> => {
    setUploadingField(field);
    const ext = file.name.split('.').pop();
    const folder = DOC_FOLDER[field];
    // Path inside bucket: e.g. LicenseDoc/DRV001_1234567890.pdf
    const path = `${folder}/${driverNo}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
    setUploadingField(null);
    if (error) { toast('error', `Upload failed: ${error.message}`); return null; }
    return path;
  };

  // ── Handle file pick (upload immediately, store path in form) ─────────────
  const handleFileChange = async (
    file: File,
    field: 'license_doc' | 'bank_doc' | 'other_doc',
  ) => {
    // Use existing driver_no for edits, or a temp prefix for new
    const prefix = editId
      ? (drivers.find(d => d.id === editId)?.driver_no || 'NEW')
      : 'NEW';
    const path = await uploadFile(file, field, prefix);
    if (path) setForm(prev => ({ ...prev, [field]: path }));
  };

  // ── Generate next driver_no ───────────────────────────────────────────────
  const getNextDriverNo = async (): Promise<string> => {
    // Fetch max driver_no numerically from ALL rows (including deleted)
    const { data } = await supabase
      .from('drivers')
      .select('driver_no');
    if (!data || data.length === 0) return 'DRV001';
    const max = data.reduce((acc, row) => {
      const num = parseInt((row.driver_no || 'DRV000').replace(/\D/g, ''), 10);
      return num > acc ? num : acc;
    }, 0);
    return `DRV${String(max + 1).padStart(3, '0')}`;
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const save = async () => {
    if (!form.name.trim()) { toast('error', 'Driver name is required'); return; }
    if (!form.mobile.trim()) { toast('error', 'Mobile number is required'); return; }
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      license_no: form.license_no || null,
      license_expiry: form.license_expiry || null,
      license_doc: form.license_doc || null,
      status: form.status,
      type: form.type || null,
      experience: form.experience || null,
      city: form.city || null,
      address: form.address || null,
      joined_date: form.joined_date || null,
      bank_account_no: form.bank_account_no || null,
      bank_name: form.bank_name || null,
      gpay_no: form.gpay_no || null,
      ifsc_code: form.ifsc_code || null,
      branch_name: form.branch_name || null,
      bank_doc: form.bank_doc || null,
      emergency_name: form.emergency_name || null,
      emergency_phone: form.emergency_phone || null,
      other_doc: form.other_doc || null,
    };

    if (editId) {
      const { error } = await supabase.from('drivers').update(payload).eq('id', editId);
      if (error) toast('error', 'Update failed: ' + error.message);
      else { toast('success', 'Driver updated successfully'); setShowModal(false); fetchDrivers(); }
    } else {
      const driver_no = await getNextDriverNo();
      const { error } = await supabase.from('drivers').insert({ ...payload, driver_no, deleted: false });
      if (error) toast('error', 'Insert failed: ' + error.message);
      else { toast('success', `Driver ${driver_no} added successfully`); setShowModal(false); fetchDrivers(); }
    }
    setSaving(false);
  };

  // ── Set Inactive (soft delete) ────────────────────────────────────────────
  // We do NOT set deleted=true. We just set status = 'Inactive'.
  const setInactive = async (id: string) => {
    const { error } = await supabase
      .from('drivers')
      .update({ status: 'Inactive' })
      .eq('id', id);
    if (error) toast('error', 'Failed: ' + error.message);
    else { toast('success', 'Driver marked as Inactive'); setConfirmDeleteId(null); fetchDrivers(); }
  };

  const formatDate = (s: string | null) => {
    if (!s) return '—';
    return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isExpiringSoon = (s: string | null) => {
    if (!s) return false;
    const diff = (new Date(s).getTime() - Date.now()) / 86400000;
    return diff >= 0 && diff <= 30;
  };

  const f = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Topbar title="Drivers" breadcrumbs={[{ label: 'Drivers' }]} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Total Drivers', value: stats.total, sub: 'All Drivers', color: 'text-blue-600' },
            { label: 'Active', value: stats.active, sub: 'Available', color: 'text-green-600' },
            { label: 'On Trip', value: stats.onTrip, sub: 'Currently Running', color: 'text-blue-500' },
            { label: 'Inactive', value: stats.inactive, sub: 'Not Active', color: 'text-gray-500' },
            { label: 'License Expiring', value: stats.expiring, sub: 'Within 30 Days', color: 'text-red-600' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400">{c.label}</p>
              <p className={`text-[22px] font-bold ${c.color} mt-0.5`}>{c.value}</p>
              <p className="text-[10px] text-gray-400">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-gray-700">All Drivers</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search name, ID, mobile, license…"
                  className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] w-64 focus:outline-none" />
              </div>
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11px]">
                <option>All</option><option>Active</option><option>On Trip</option><option>Inactive</option>
              </select>
              <button onClick={openAdd}
                className="flex items-center gap-1.5 bg-[#1a56db] text-white px-3 py-1.5 rounded-lg text-[11px] font-medium hover:bg-blue-700">
                <Plus size={12} /> Add Driver
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                <Loader2 size={16} className="animate-spin" /> Loading drivers…
              </div>
            ) : (
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                    {['Driver No','Name','Mobile','License No','License Expiry','Type','Experience','City','Joined','Status','Actions'].map(h => (
                      <th key={h} className="text-left px-2 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0
                    ? <tr><td colSpan={11} className="text-center py-12 text-gray-400">No drivers found.</td></tr>
                    : paginated.map(d => (
                      <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-2 py-2 text-blue-600 font-medium">{d.driver_no}</td>
                        <td className="px-2 py-2 font-medium text-gray-700">{d.name}</td>
                        <td className="px-2 py-2 text-gray-500">{d.mobile}</td>
                        <td className="px-2 py-2 text-gray-500">{d.license_no || '—'}</td>
                        <td className={`px-2 py-2 font-medium ${isExpiringSoon(d.license_expiry) ? 'text-red-500' : 'text-gray-500'}`}>
                          {formatDate(d.license_expiry)}
                        </td>
                        <td className="px-2 py-2 text-gray-500">{d.type || '—'}</td>
                        <td className="px-2 py-2 text-gray-500">{d.experience || '—'}</td>
                        <td className="px-2 py-2 text-gray-500">{d.city || '—'}</td>
                        <td className="px-2 py-2 text-gray-500">{formatDate(d.joined_date)}</td>
                        <td className="px-2 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor[d.status]}`}>{d.status}</span>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex gap-1">
                            <button onClick={() => setViewDriver(d)} className="text-gray-400 hover:text-blue-600" title="View"><Eye size={12} /></button>
                            <button onClick={() => openEdit(d)} className="text-gray-400 hover:text-green-600" title="Edit"><Pencil size={12} /></button>
                            {d.status !== 'Inactive' && (
                              <button onClick={() => setConfirmDeleteId(d.id)} className="text-gray-400 hover:text-red-500" title="Set Inactive"><Trash2 size={12} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )}
          </div>

          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between mt-3">
              <p className="text-[11px] text-gray-400">
                Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30">
                  <ChevronLeft size={12} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-6 h-6 text-[10px] rounded ${p === page ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30">
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Add / Edit Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-[14px] font-bold text-gray-800">{editId ? 'Edit Driver' : 'Add New Driver'}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{editId ? 'Update driver information' : 'Fill details to register a new driver'}</p>
              </div>
              <button onClick={() => setShowModal(false)}><X size={16} className="text-gray-400 hover:text-gray-700" /></button>
            </div>

            {/* Tabs */}
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
              {/* Personal */}
              {activeTab === 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Full Name *"><input value={form.name} onChange={f('name')} placeholder="e.g. Arun Kumar" className={inputCls} /></Field>
                  <Field label="Mobile *"><input value={form.mobile} onChange={f('mobile')} placeholder="10-digit mobile number" className={inputCls} /></Field>
                  <Field label="Status">
                    <select value={form.status} onChange={f('status')} className={inputCls}>
                      <option>Active</option><option>On Trip</option><option>Inactive</option>
                    </select>
                  </Field>
                  <Field label="Vehicle Type">
                    <select value={form.type || ''} onChange={f('type')} className={inputCls}>
                      <option>Heavy Vehicle</option><option>Light Vehicle</option>
                    </select>
                  </Field>
                  <Field label="Experience"><input value={form.experience || ''} onChange={f('experience')} placeholder="e.g. 5 Years" className={inputCls} /></Field>
                  <Field label="Joined Date"><input type="date" value={form.joined_date || ''} onChange={f('joined_date')} className={inputCls} /></Field>
                  <Field label="City"><input value={form.city || ''} onChange={f('city')} placeholder="e.g. Coimbatore" className={inputCls} /></Field>
                  <Field label="Address"><input value={form.address || ''} onChange={f('address')} placeholder="Full address" className={inputCls} /></Field>
                </div>
              )}

              {/* License */}
              {activeTab === 1 && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="License Number"><input value={form.license_no || ''} onChange={f('license_no')} placeholder="e.g. TN1234567890" className={inputCls} /></Field>
                  <Field label="License Expiry Date"><input type="date" value={form.license_expiry || ''} onChange={f('license_expiry')} className={inputCls} /></Field>
                  <div className="col-span-2">
                    <FileUploadBtn
                      label="License Document"
                      storagePath={form.license_doc}
                      uploading={uploadingField === 'license_doc'}
                      onChange={file => handleFileChange(file, 'license_doc')}
                    />
                  </div>
                </div>
              )}

              {/* Bank */}
              {activeTab === 2 && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Account Number"><input value={form.bank_account_no || ''} onChange={f('bank_account_no')} placeholder="Account number" className={inputCls} /></Field>
                  <Field label="Bank Name"><input value={form.bank_name || ''} onChange={f('bank_name')} placeholder="e.g. State Bank of India" className={inputCls} /></Field>
                  <Field label="IFSC Code"><input value={form.ifsc_code || ''} onChange={f('ifsc_code')} placeholder="e.g. SBIN0001234" className={inputCls} /></Field>
                  <Field label="Branch Name"><input value={form.branch_name || ''} onChange={f('branch_name')} placeholder="e.g. RS Puram" className={inputCls} /></Field>
                  <Field label="GPay Number"><input value={form.gpay_no || ''} onChange={f('gpay_no')} placeholder="GPay linked mobile" className={inputCls} /></Field>
                  <div className="col-span-2">
                    <FileUploadBtn
                      label="Bank Account Document"
                      storagePath={form.bank_doc}
                      uploading={uploadingField === 'bank_doc'}
                      onChange={file => handleFileChange(file, 'bank_doc')}
                    />
                  </div>
                </div>
              )}

              {/* Emergency & Docs */}
              {activeTab === 3 && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Emergency Contact Name"><input value={form.emergency_name || ''} onChange={f('emergency_name')} placeholder="Contact person name" className={inputCls} /></Field>
                  <Field label="Emergency Contact Phone"><input value={form.emergency_phone || ''} onChange={f('emergency_phone')} placeholder="Contact phone number" className={inputCls} /></Field>
                  <div className="col-span-2">
                    <FileUploadBtn
                      label="Other Documents"
                      storagePath={form.other_doc}
                      uploading={uploadingField === 'other_doc'}
                      onChange={file => handleFileChange(file, 'other_doc')}
                    />
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
                  <button onClick={() => setActiveTab(t => t - 1)}
                    className="px-4 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-100">← Back</button>
                )}
                {activeTab < TABS.length - 1 ? (
                  <button onClick={() => setActiveTab(t => t + 1)}
                    className="px-4 py-1.5 bg-[#1a56db] text-white rounded-lg text-[12px] font-medium hover:bg-blue-700">Next →</button>
                ) : (
                  <button onClick={save} disabled={saving || uploadingField !== null}
                    className="px-5 py-1.5 bg-[#1a56db] text-white rounded-lg text-[12px] font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center gap-1.5">
                    {saving && <Loader2 size={12} className="animate-spin" />}
                    {editId ? '✓ Update Driver' : '✓ Add Driver'}
                  </button>
                )}
                <button onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-100">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Modal ───────────────────────────────────────────────────── */}
      {viewDriver && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[13px]">
                  {viewDriver.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-800">{viewDriver.name}</p>
                  <p className="text-[11px] text-gray-400">{viewDriver.driver_no} · {viewDriver.type || 'Driver'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusColor[viewDriver.status]}`}>{viewDriver.status}</span>
                <button onClick={() => setViewDriver(null)}><X size={16} className="text-gray-400" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <Section icon={<User size={13} />} title="Personal Details">
                <Row2 a={['Mobile', viewDriver.mobile]} b={['Experience', viewDriver.experience]} />
                <Row2 a={['City', viewDriver.city]} b={['Joined', formatDate(viewDriver.joined_date)]} />
                <Row1 label="Address" value={viewDriver.address} />
              </Section>
              <Section icon={<FileText size={13} />} title="License Details">
                <Row2 a={['License No', viewDriver.license_no]} b={['Expiry', formatDate(viewDriver.license_expiry)]} />
                <DocRow label="License Document" path={viewDriver.license_doc} />
              </Section>
              <Section icon={<CreditCard size={13} />} title="Bank Details">
                <Row2 a={['Account No', viewDriver.bank_account_no]} b={['Bank', viewDriver.bank_name]} />
                <Row2 a={['IFSC', viewDriver.ifsc_code]} b={['Branch', viewDriver.branch_name]} />
                <Row2 a={['GPay No', viewDriver.gpay_no]} b={['', '']} />
                <DocRow label="Bank Document" path={viewDriver.bank_doc} />
              </Section>
              <Section icon={<Phone size={13} />} title="Emergency Contact">
                <Row2 a={['Name', viewDriver.emergency_name]} b={['Phone', viewDriver.emergency_phone]} />
                <DocRow label="Other Document" path={viewDriver.other_doc} />
              </Section>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => { setViewDriver(null); openEdit(viewDriver); }}
                className="px-4 py-1.5 bg-[#1a56db] text-white rounded-lg text-[12px] font-medium hover:bg-blue-700 flex items-center gap-1.5">
                <Pencil size={12} /> Edit
              </button>
              <button onClick={() => setViewDriver(null)}
                className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-[12px]">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Set Inactive Confirm ─────────────────────────────────────────── */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-80 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center">
                <Trash2 size={16} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-800">Set Driver as Inactive?</p>
                <p className="text-[11px] text-gray-400">Driver will be marked Inactive. Record is kept.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setInactive(confirmDeleteId)}
                className="flex-1 bg-yellow-500 text-white py-2 rounded-lg text-[12px] font-medium hover:bg-yellow-600">
                Yes, Set Inactive
              </button>
              <button onClick={() => setConfirmDeleteId(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-[12px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

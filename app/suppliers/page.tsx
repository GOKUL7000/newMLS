'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Topbar from '@/components/layout/Topbar';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Eye, Pencil, Trash2, Plus, Search, X, Upload,
  User, CreditCard, Phone, FileText, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Loader2, ExternalLink, Building2,
} from 'lucide-react';
import PortalUserField from '@/components/PortalUserField';

const supabase = createClientComponentClient();
const BUCKET = 'Suppliers';

const DOC_FOLDER: Record<'gst_doc' | 'pan_doc' | 'bank_doc' | 'other_doc', string> = {
  gst_doc:   'gstDoc',
  pan_doc:   'panDoc',
  bank_doc:  'bankDetails',
  other_doc: 'otherDoc',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Supplier {
  id: string;
  supplier_no: string;
  name: string;
  category: string;
  mobile: string | null;
  email: string | null;
  city: string | null;
  address: string | null;
  // credit_limit: number | null;
  outstanding: number | null;
  status: 'Active' | 'Inactive';
  gstin: string | null;
  pan: string | null;
  gst_doc: string | null;
  pan_doc: string | null;
  bank_account_no: string | null;
  bank_name: string | null;
  gpay_no: string | null;
  ifsc_code: string | null;
  branch_name: string | null;
  bank_doc: string | null;
  emergency_name: string | null;
  emergency_phone: string | null;
  other_doc: string | null;
  deleted: boolean;
  created_at?: string;

  portal_user_id: string | null;
  portal_access: boolean;
}

type FormState = Omit<Supplier, 'id' | 'supplier_no' | 'deleted' | 'created_at'>;

const EMPTY_FORM: FormState = {
  name: '', category: 'Truck', mobile: '', email: '', city: '', address: '',
  // credit_limit: null, 
  outstanding: null, status: 'Active',
  gstin: '', pan: '', gst_doc: '', pan_doc: '',
  bank_account_no: '', bank_name: '', gpay_no: '', ifsc_code: '', branch_name: '', bank_doc: '',
  emergency_name: '', emergency_phone: '', other_doc: '', portal_user_id: '', portal_access: true,
};

const TABS = ['Basic Info', 'GST & PAN', 'Bank Details', 'Emergency & Docs'];
const PAGE_SIZE = 8;
const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";

const statusColor: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-500',
};

const categoryColor: Record<string, string> = {
  Truck: 'bg-red-50 text-red-600',
  Fuel: 'bg-orange-50 text-orange-600',
  Tyre: 'bg-blue-50 text-blue-600',
  Maintenance: 'bg-purple-50 text-purple-600',
  Insurance: 'bg-green-50 text-green-600',
  Others: 'bg-gray-50 text-gray-600',
};

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

// ─── Open signed URL ──────────────────────────────────────────────────────────
async function openDoc(path: string | null) {
  if (!path) return;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) { alert('Could not open document: ' + (error?.message || '')); return; }
  window.open(data.signedUrl, '_blank');
}

// ─── File Upload Button ───────────────────────────────────────────────────────
function FileUploadBtn({ label, storagePath, uploading, onChange }: {
  label: string; storagePath: string | null; uploading: boolean; onChange: (f: File) => void;
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

const paymentsTrend = Array.from({length: 30}, (_, i) => ({day: i+1, amount: 50000 + Math.random() * 200000}));
const topSuppliers = [
  { name: 'Indian Oil - Peelamedu', amount: 392500 },
  { name: 'Bharat Petroleum', amount: 314000 },
  { name: 'Shell - Coimbatore', amount: 230000 },
  { name: 'Sri Balaji Tyres', amount: 85000 },
  { name: 'Ashok Leyland Service', amount: 65000 },
];
const upcomingPayments = [
  { supplier: 'Indian Oil - Peelamedu', amount: 45000, due: '10 Jun 2026', type: 'Diesel', status: 'Due Soon' },
  { supplier: 'Bharat Petroleum', amount: 32000, due: '12 Jun 2026', type: 'Diesel', status: 'Due Soon' },
  { supplier: 'Sri Balaji Tyres', amount: 18000, due: '15 Jun 2026', type: 'Tyres', status: 'Upcoming' },
  { supplier: 'Ashok Leyland Service', amount: 25000, due: '18 Jun 2026', type: 'Maintenance', status: 'Upcoming' },
];


// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);
  const [confirmInactiveId, setConfirmInactiveId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [uploadingField, setUploadingField] = useState<'gst_doc' | 'pan_doc' | 'bank_doc' | 'other_doc' | null>(null);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const toast = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('deleted', false)
      .order('created_at', { ascending: false });
    if (error) toast('error', 'Failed to load: ' + error.message);
    else setSuppliers(data || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total: suppliers.length,
    active: suppliers.filter(s => s.status === 'Active').length,
    totalPayable: suppliers.reduce((a, s) => a + (s.outstanding || 0), 0),
  };

  // Payables donut data
  const payablesData = [
    { name: 'Truck', value: suppliers.filter(s => s.category === 'Truck').reduce((a, s) => a + (s.outstanding || 0), 0),  pct: '36.9%', color: '#fc0909' },
    { name: 'Fuel', value: suppliers.filter(s => s.category === 'Fuel').reduce((a, s) => a + (s.outstanding || 0), 0),  pct: '36.9%', color: '#f97316' },
    { name: 'Tyre', value: suppliers.filter(s => s.category === 'Tyre').reduce((a, s) => a + (s.outstanding || 0), 0),  pct: '25.9%', color: '#3b82f6' },
    { name: 'Maintenance', value: suppliers.filter(s => s.category === 'Maintenance').reduce((a, s) => a + (s.outstanding || 0), 0), pct: '25.9%', color: '#8b5cf6' },
    { name: 'Insurance', value: suppliers.filter(s => s.category === 'Insurance').reduce((a, s) => a + (s.outstanding || 0), 0), pct: '25.9%', color: '#10b981' },
    { name: 'Others', value: suppliers.filter(s => s.category === 'Others').reduce((a, s) => a + (s.outstanding || 0), 0), pct: '25.9%', color: '#6b7280' },
  ];

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = suppliers.filter(s => {
    const matchCat = filterCategory === 'All' || s.category === filterCategory;
    const q = search.toLowerCase();
    return matchCat && (!q || s.name.toLowerCase().includes(q) || s.supplier_no.toLowerCase().includes(q) || (s.city || '').toLowerCase().includes(q) || (s.mobile || '').includes(q));
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Open modals ───────────────────────────────────────────────────────────
  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setActiveTab(0); setShowModal(true); };
  const openEdit = (s: Supplier) => {
    setEditId(s.id);
    setForm({
      name: s.name, category: s.category, mobile: s.mobile || '', email: s.email || '',
      city: s.city || '', address: s.address || '',
      // credit_limit: s.credit_limit, 
      outstanding: s.outstanding, status: s.status,
      gstin: s.gstin || '', pan: s.pan || '',
      gst_doc: s.gst_doc || '', pan_doc: s.pan_doc || '',
      bank_account_no: s.bank_account_no || '', bank_name: s.bank_name || '',
      gpay_no: s.gpay_no || '', ifsc_code: s.ifsc_code || '', branch_name: s.branch_name || '',
      bank_doc: s.bank_doc || '', emergency_name: s.emergency_name || '',
      emergency_phone: s.emergency_phone || '', other_doc: s.other_doc || '', 
      portal_user_id: s.portal_user_id || '', portal_access: s.portal_access || true,
    });
    setActiveTab(0);
    setShowModal(true);
  };

  // ── Next supplier_no ──────────────────────────────────────────────────────
  const getNextSupplierNo = async (): Promise<string> => {
    const { data } = await supabase.from('suppliers').select('supplier_no');
    if (!data || data.length === 0) return 'SUP001';
    const max = data.reduce((acc, row) => {
      const num = parseInt((row.supplier_no || 'SUP000').replace(/\D/g, ''), 10);
      return num > acc ? num : acc;
    }, 0);
    return `SUP${String(max + 1).padStart(3, '0')}`;
  };

  // ── Upload file ───────────────────────────────────────────────────────────
  const uploadFile = async (file: File, field: 'gst_doc' | 'pan_doc' | 'bank_doc' | 'other_doc', supplierNo: string): Promise<string | null> => {
    setUploadingField(field);
    const ext = file.name.split('.').pop();
    const path = `${DOC_FOLDER[field]}/${supplierNo}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
    setUploadingField(null);
    if (error) { toast('error', `Upload failed: ${error.message}`); return null; }
    return path;
  };

  const handleFileChange = async (file: File, field: 'gst_doc' | 'pan_doc' | 'bank_doc' | 'other_doc') => {
    const prefix = editId ? (suppliers.find(s => s.id === editId)?.supplier_no || 'NEW') : 'NEW';
    const path = await uploadFile(file, field, prefix);
    if (path) setForm(prev => ({ ...prev, [field]: path }));
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const save = async () => {
    if (!form.name.trim()) { toast('error', 'Supplier name is required'); return; }
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      category: form.category,
      mobile: form.mobile || null,
      email: form.email || null,
      city: form.city || null,
      address: form.address || null,
      // credit_limit: form.credit_limit || 0,
      outstanding: form.outstanding || 0,
      status: form.status,
      gstin: form.gstin || null,
      pan: form.pan || null,
      gst_doc: form.gst_doc || null,
      pan_doc: form.pan_doc || null,
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
      const { error } = await supabase.from('suppliers').update(payload).eq('id', editId);
      if (error) toast('error', 'Update failed: ' + error.message);
      else { toast('success', 'Supplier updated successfully'); setShowModal(false); fetchSuppliers(); }
    } else {
      const supplier_no = await getNextSupplierNo();
      const { error } = await supabase.from('suppliers').insert({ ...payload, supplier_no, deleted: false });
      if (error) toast('error', 'Insert failed: ' + error.message);
      else { toast('success', `Supplier ${supplier_no} added successfully`); setShowModal(false); fetchSuppliers(); }
    }
    setSaving(false);
  };

  // ── Set Inactive ──────────────────────────────────────────────────────────
  const setInactive = async (id: string) => {
    const { error } = await supabase.from('suppliers').update({ status: 'Inactive' }).eq('id', id);
    if (error) toast('error', 'Failed: ' + error.message);
    else { toast('success', 'Supplier marked as Inactive'); setConfirmInactiveId(null); fetchSuppliers(); }
  };

  const f = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  const fmt = (n: number | null) => n ? `₹ ${n.toLocaleString('en-IN')}` : '₹ 0';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Topbar title="Suppliers" breadcrumbs={[{ label: 'Suppliers' }]} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Active Suppliers', value: String(stats.active), sub: 'Active Suppliers', color: 'text-blue-600' },
            { label: 'Invoice This Month', value: '₹ 85,00,000', sub: `From 45 Suppliers`, color: 'text-green-600' },
            { label: 'Paid This Month', value: '₹ 85,00,000', sub: 'From 45 Suppliers', color: 'text-gray-500' },
            { label: 'Total Payable', value: fmt(stats.totalPayable), sub: 'Outstanding', color: 'text-red-500' },
            // { label: 'Fuel Suppliers', value: String(suppliers.filter(s => s.category === 'Fuel').length), sub: 'Fuel Category', color: 'text-orange-500' },
            // { label: 'Maintenance', value: String(suppliers.filter(s => s.category === 'Maintenance').length), sub: 'Maintenance Category', color: 'text-purple-600' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400">{c.label}</p>
              <p className={`text-[17px] font-bold ${c.color} mt-1`}>{c.value}</p>
              <p className="text-[10px] text-gray-400">{c.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {/* Table */}
          <div className="col-span-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-700">All Suppliers</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search name, ID, city, mobile…"
                    className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] w-60 focus:outline-none" />
                </div>
                <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11px]">
                  <option value="All">All Types</option>
                    <option>Truck</option><option>Fuel</option><option>Tyre</option><option>Maintenance</option><option>Insurance</option><option>Others</option>
                </select>
                <button onClick={openAdd}
                  className="flex items-center gap-1.5 bg-[#1a56db] text-white px-3 py-1.5 rounded-lg text-[11px] font-medium hover:bg-blue-700">
                  <Plus size={12} /> Add Supplier
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                <Loader2 size={16} className="animate-spin" /> Loading suppliers…
              </div>
            ) : (
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                    {['Supplier No','Name','Mobile','City','Type','Outstanding','Status','Actions'].map(h => (
                      <th key={h} className={`text-left px-2 py-2 ${['Outstanding'].includes(h) ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0
                    ? <tr><td colSpan={9} className="text-center py-12 text-gray-400">No suppliers found.</td></tr>
                    : paginated.map(s => (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-2 py-2 text-blue-600 font-medium">{s.supplier_no}</td>
                        <td className="px-2 py-2 font-medium text-gray-700">{s.name}</td>
                        <td className="px-2 py-2 text-gray-500">{s.mobile || '—'}</td>
                        <td className="px-2 py-2 text-gray-500">{s.city || '—'}</td>
                        <td className="px-2 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${categoryColor[s.category] || 'bg-gray-50 text-gray-600'}`}>{s.category}</span>
                        </td>
                        {/* <td className="px-2 py-2 text-right text-gray-600">{s.credit_limit ? s.credit_limit.toLocaleString('en-IN') : '—'}</td> */}
                        <td className="px-2 py-2 text-right font-medium text-red-500">{s.outstanding ? s.outstanding.toLocaleString('en-IN') : '0'}</td>
                        <td className="px-2 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor[s.status]}`}>{s.status}</span>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex gap-1">
                            <button onClick={() => setViewSupplier(s)} className="text-gray-400 hover:text-blue-600" title="View"><Eye size={12} /></button>
                            <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-green-600" title="Edit"><Pencil size={12} /></button>
                            {s.status !== 'Inactive' && (
                              <button onClick={() => setConfirmInactiveId(s.id)} className="text-gray-400 hover:text-red-500" title="Set Inactive"><Trash2 size={12} /></button>
                            )}
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

          {/* Payables Donut */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-2">Payables by Category</h3>
            {payablesData.length > 0 ? (
              <>
                <div className="relative">
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie data={payablesData} cx="50%" cy="50%" innerRadius={32} outerRadius={52} dataKey="value">
                        {payablesData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <p className="text-[11px] font-bold text-gray-800">{fmt(stats.totalPayable)}</p>
                    <p className="text-[9px] text-gray-400">Total</p>
                  </div>
                </div>
                <div className="space-y-1.5 mt-1">
                  {payablesData.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="flex-1 text-gray-500">{d.name}</span>
                      <span className="font-semibold">{fmt(d.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-300 text-[11px]">No outstanding payables</div>
            )}
          </div>
        </div>

        {/* Charts + Upcoming Payments */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Top Suppliers by Spend (This Month)</h3>
            {topSuppliers.map(s => (<div key={s.name} className="flex items-center gap-2 mb-2"><span className="text-[10px] text-gray-500 w-28 truncate">{s.name}</span><div className="flex-1 bg-gray-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width:`${s.amount/392500*100}%`}}/></div><span className="text-[10px] font-semibold text-gray-700 w-20 text-right">₹ {(s.amount/100000).toFixed(2)}L</span></div>))}
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3"><h3 className="text-[13px] font-semibold text-gray-700">Payments Made (This Month)</h3></div>
            <ResponsiveContainer width="100%" height={120}><LineChart data={paymentsTrend.filter((_,i)=>i%5===0)}><XAxis dataKey="day" tick={{fontSize:9}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip/><Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} dot={{r:2}}/></LineChart></ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3"><h3 className="text-[13px] font-semibold text-gray-700">Upcoming Payments</h3><a href="#" className="text-[10px] text-blue-600">View All →</a></div>
            {upcomingPayments.map(p=>(<div key={p.supplier} className="flex justify-between items-center border-b border-gray-50 py-1.5 last:border-0">
              <div><p className="text-[11px] text-gray-700">{p.supplier}</p><p className="text-[10px] text-gray-400">{p.type} · Due {p.due}</p></div>
              <div className="text-right"><p className="text-[11px] font-semibold text-red-500">₹ {p.amount.toLocaleString('en-IN')}</p><span className={`text-[9px] px-1.5 py-0.5 rounded ${p.status==='Due Soon'?'bg-red-100 text-red-600':'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></div>
            </div>))}
          </div>
        </div>

        {/* Quick Actions */}
        {/* <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-6 gap-3">
            {[{label:'Add Supplier',icon:'➕'},{label:'Make Payment',icon:'💰'},{label:'Supplier Ledger',icon:'📋'},{label:'Payables Report',icon:'📊'},{label:'Record Bill',icon:'📄'},{label:'Supplier Statement',icon:'📑'}].map(a => (
              <button key={a.label} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-[11px] text-blue-600">{a.icon} {a.label}</button>
            ))}
          </div>
        </div> */}
      </div>

      {/* ─── Add / Edit Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-[14px] font-bold text-gray-800">{editId ? 'Edit Supplier' : 'Add New Supplier'}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{editId ? 'Update supplier information' : 'Fill details to register a new supplier'}</p>
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

              {/* Basic Info */}
              {activeTab === 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Supplier Name *"><input value={form.name} onChange={f('name')} placeholder="e.g. Indian Oil - Peelamedu" className={inputCls} /></Field>
                  <Field label="Category">
                    <select value={form.category} onChange={f('category')} className={inputCls}>
                      <option>Truck</option><option>Fuel</option><option>Tyre</option><option>Maintenance</option><option>Insurance</option><option>Others</option>
                    </select>
                  </Field>
                  <Field label="Mobile"><input value={form.mobile || ''} onChange={f('mobile')} placeholder="Mobile number" className={inputCls} /></Field>
                  <Field label="Email"><input type="email" value={form.email || ''} onChange={f('email')} placeholder="email@example.com" className={inputCls} /></Field>
                  <Field label="City"><input value={form.city || ''} onChange={f('city')} placeholder="e.g. Coimbatore" className={inputCls} /></Field>
                  <Field label="Status">
                    <select value={form.status} onChange={f('status')} className={inputCls}>
                      <option>Active</option><option>Inactive</option>
                    </select>
                  </Field>
                  {/* <Field label="Credit Limit (₹)"><input type="number" value={form.credit_limit || ''} onChange={f('credit_limit')} placeholder="0" className={inputCls} /></Field> */}
                  <Field label="Address"><input value={form.address || ''} onChange={f('address')} placeholder="Full address" className={inputCls} /></Field>
                  <PortalUserField
                    role="supplier"
                    entityId={editId}             // null when adding new, uuid when editing
                    hasPortalAccess={!!suppliers.find(c => c.id === editId)?.portal_user_id}
                    toast={toast}
                    onSuccess={fetchSuppliers}
                  />
                
                </div>
              )}

              {/* GST & PAN */}
              {activeTab === 1 && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="GST Number"><input value={form.gstin || ''} onChange={f('gstin')} placeholder="e.g. 33AABCU9603R1ZX" className={inputCls} /></Field>
                  <Field label="PAN Number"><input value={form.pan || ''} onChange={f('pan')} placeholder="e.g. AABCU9603R" className={inputCls} /></Field>
                  <div className="col-span-2">
                    <FileUploadBtn label="GST Document Upload" storagePath={form.gst_doc}
                      uploading={uploadingField === 'gst_doc'} onChange={file => handleFileChange(file, 'gst_doc')} />
                  </div>
                  <div className="col-span-2">
                    <FileUploadBtn label="PAN Card Document Upload" storagePath={form.pan_doc}
                      uploading={uploadingField === 'pan_doc'} onChange={file => handleFileChange(file, 'pan_doc')} />
                  </div>
                </div>
              )}

              {/* Bank Details */}
              {activeTab === 2 && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Account Number"><input value={form.bank_account_no || ''} onChange={f('bank_account_no')} placeholder="Account number" className={inputCls} /></Field>
                  <Field label="Bank Name"><input value={form.bank_name || ''} onChange={f('bank_name')} placeholder="e.g. State Bank of India" className={inputCls} /></Field>
                  <Field label="IFSC Code"><input value={form.ifsc_code || ''} onChange={f('ifsc_code')} placeholder="e.g. SBIN0001234" className={inputCls} /></Field>
                  <Field label="Branch Name"><input value={form.branch_name || ''} onChange={f('branch_name')} placeholder="e.g. RS Puram" className={inputCls} /></Field>
                  <Field label="GPay Number"><input value={form.gpay_no || ''} onChange={f('gpay_no')} placeholder="GPay linked mobile" className={inputCls} /></Field>
                  <div className="col-span-2">
                    <FileUploadBtn label="Bank Account Document Upload" storagePath={form.bank_doc}
                      uploading={uploadingField === 'bank_doc'} onChange={file => handleFileChange(file, 'bank_doc')} />
                  </div>
                </div>
              )}

              {/* Emergency & Docs */}
              {activeTab === 3 && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Emergency Contact Name"><input value={form.emergency_name || ''} onChange={f('emergency_name')} placeholder="Contact person name" className={inputCls} /></Field>
                  <Field label="Emergency Contact Phone"><input value={form.emergency_phone || ''} onChange={f('emergency_phone')} placeholder="Contact phone number" className={inputCls} /></Field>
                  <div className="col-span-2">
                    <FileUploadBtn label="Other Documents Upload" storagePath={form.other_doc}
                      uploading={uploadingField === 'other_doc'} onChange={file => handleFileChange(file, 'other_doc')} />
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
                    {editId ? '✓ Update Supplier' : '✓ Add Supplier'}
                  </button>
                )}
                <button onClick={() => setShowModal(false)} className="px-4 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-100">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Modal ───────────────────────────────────────────────────── */}
      {viewSupplier && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[13px]">
                  {viewSupplier.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-800">{viewSupplier.name}</p>
                  <p className="text-[11px] text-gray-400">{viewSupplier.supplier_no} · {viewSupplier.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusColor[viewSupplier.status]}`}>{viewSupplier.status}</span>
                <button onClick={() => setViewSupplier(null)}><X size={16} className="text-gray-400" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <Section icon={<Building2 size={13} />} title="Basic Info">
                <Row2 a={['Mobile', viewSupplier.mobile]} b={['Email', viewSupplier.email]} />
                <Row2 a={['City', viewSupplier.city]} b={['City', viewSupplier.city]} />
                <Row2 a={['Outstanding', viewSupplier.outstanding ? `₹ ${viewSupplier.outstanding.toLocaleString('en-IN')}` : '₹ 0']} b={['', null]} />
                <Row1 label="Address" value={viewSupplier.address} />
              </Section>
              <Section icon={<FileText size={13} />} title="GST & PAN">
                <Row2 a={['GST Number', viewSupplier.gstin]} b={['PAN Number', viewSupplier.pan]} />
                <div className="grid grid-cols-2 gap-2">
                  <DocRow label="GST Document" path={viewSupplier.gst_doc} />
                  <DocRow label="PAN Document" path={viewSupplier.pan_doc} />
                </div>
              </Section>
              <Section icon={<CreditCard size={13} />} title="Bank Details">
                <Row2 a={['Account No', viewSupplier.bank_account_no]} b={['Bank', viewSupplier.bank_name]} />
                <Row2 a={['IFSC', viewSupplier.ifsc_code]} b={['Branch', viewSupplier.branch_name]} />
                <Row2 a={['GPay No', viewSupplier.gpay_no]} b={['', null]} />
                <DocRow label="Bank Document" path={viewSupplier.bank_doc} />
              </Section>
              <Section icon={<Phone size={13} />} title="Emergency Contact">
                <Row2 a={['Name', viewSupplier.emergency_name]} b={['Phone', viewSupplier.emergency_phone]} />
                <DocRow label="Other Document" path={viewSupplier.other_doc} />
              </Section>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => { setViewSupplier(null); openEdit(viewSupplier); }}
                className="px-4 py-1.5 bg-[#1a56db] text-white rounded-lg text-[12px] font-medium hover:bg-blue-700 flex items-center gap-1.5">
                <Pencil size={12} /> Edit
              </button>
              <button onClick={() => setViewSupplier(null)} className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-[12px]">Close</button>
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
                <p className="text-[13px] font-bold text-gray-800">Set Supplier as Inactive?</p>
                <p className="text-[11px] text-gray-400">Supplier will be marked Inactive. Record is kept.</p>
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
    </div>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Topbar from '@/components/layout/Topbar';
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Eye, Pencil, Trash2, Plus, Search, X, Upload,
  User, CreditCard, Phone, FileText, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Loader2, ExternalLink, Building2,
} from 'lucide-react';
import PortalUserField from '@/components/PortalUserField';




const supabase = createClientComponentClient();
const BUCKET = 'Customers';

const DOC_FOLDER: Record<'gst_doc_url' | 'pan_doc_url' | 'bank_doc_url' | 'other_doc_url', string> = {
  gst_doc_url:   'gstDoc',
  pan_doc_url:   'panDoc',
  bank_doc_url:  'bankDetails',
  other_doc_url: 'otherDoc',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Customer {
  id: string;
  customer_no: string;
  name: string;
  mobile: string | null;
  email: string | null;
  city: string | null;
  address: string | null;
  // credit_limit: number | null;
  outstanding: number | null;
  status: 'Active' | 'Inactive';
  gstin: string | null;
  pan_number: string | null;
  gst_doc_url: string | null;
  pan_doc_url: string | null;
  bank_account_no: string | null;
  bank_name: string | null;
  gpay_no: string | null;
  ifsc_code: string | null;
  branch_name: string | null;
  bank_doc_url: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  other_doc_url: string | null;
  created_at?: string;

  portal_user_id: string | null;
  portal_access: boolean; 
}

type FormState = {
  name: string;
  mobile: string;
  email: string;
  city: string;
  address: string;
  // credit_limit: string;
  status: 'Active' | 'Inactive';
  gstin: string;
  pan_number: string;
  gst_doc_url: string;
  pan_doc_url: string;
  bank_account_no: string;
  bank_name: string;
  gpay_no: string;
  ifsc_code: string;
  branch_name: string;
  bank_doc_url: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  other_doc_url: string;
};

const EMPTY_FORM: FormState = {
  name: '', mobile: '', email: '', city: '', address: '', status: 'Active',
  gstin: '', pan_number: '', gst_doc_url: '', pan_doc_url: '',
  bank_account_no: '', bank_name: '', gpay_no: '', ifsc_code: '', branch_name: '', bank_doc_url: '',
  emergency_contact_name: '', emergency_contact_phone: '', other_doc_url: '',
};

const TABS = ['Basic Info', 'GST & PAN', 'Bank Details', 'Emergency & Docs'];
const PAGE_SIZE = 10;
const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";

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

// ─── Static mock data (kept for charts/ledger as in original) ─────────────────
const topCustomers = [
  { name: 'ABC Steels Pvt Ltd', amount: 1250000 },
  { name: 'Kaveri Industries', amount: 980000 },
  { name: 'Sri Venkateshwara Traders', amount: 875000 },
  { name: 'Global Enterprises', amount: 720000 },
  { name: 'Sakthi Traders', amount: 610000 },
];
const recentPayments = [
  { date: '07 Jun 2026', customer: 'ABC Steels Pvt Ltd', amount: 125000, mode: 'NEFT', invoice: 'INV/2026/068' },
  { date: '06 Jun 2026', customer: 'Kaveri Industries', amount: 95000, mode: 'NEFT', invoice: 'INV/2026/067' },
  { date: '06 Jun 2026', customer: 'Sri Venkateshwara Traders', amount: 80000, mode: 'RTGS', invoice: 'INV/2026/066' },
  { date: '05 Jun 2026', customer: 'Global Enterprises', amount: 110000, mode: 'NEFT', invoice: 'INV/2026/065' },
  { date: '04 Jun 2026', customer: 'Sakthi Traders', amount: 70000, mode: 'Cash', invoice: 'INV/2026/064' },
];
const paymentsTrend = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, amount: 200000 + Math.random() * 600000 }));

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [cities, setCities] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [confirmInactiveId, setConfirmInactiveId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [uploadingField, setUploadingField] = useState<keyof typeof DOC_FOLDER | null>(null);

  // Stats derived from DB
  const [outstandingData, setOutstandingData] = useState<any[]>([]);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [stats, setStats] = useState({ totalCustomers: 0, activeCustomers: 0, outstandingAmount: 0, outstandingCustomers: 0 });

  // ── Toast ─────────────────────────────────────────────────────────────────
  const toast = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('customer_no', { ascending: true });

    if (error) { toast('error', 'Failed to load: ' + error.message); setLoading(false); return; }

    const rows: Customer[] = data || [];
    setCustomers(rows);

    // Cities
    const uniqueCities = Array.from(new Set(rows.map(c => c.city).filter(Boolean))) as string[];
    setCities(uniqueCities);

    // Stats
    const totalOut = rows.reduce((s, c) => s + Number(c.outstanding || 0), 0);
    setTotalOutstanding(totalOut);
    setStats({
      totalCustomers: rows.length,
      activeCustomers: rows.filter(c => c.status === 'Active').length,
      outstandingAmount: totalOut,
      outstandingCustomers: rows.filter(c => Number(c.outstanding || 0) > 0).length,
    });

    // Outstanding donut by range
    const ranges = [
      { name: '0-1 Lakh', value: 0, color: '#22c55e' },
      { name: '1-3 Lakh', value: 0, color: '#f59e0b' },
      { name: '3+ Lakh', value: 0, color: '#ef4444' },
    ];
    rows.forEach(c => {
      const amt = Number(c.outstanding || 0);
      if (amt <= 100000) ranges[0].value += amt;
      else if (amt <= 300000) ranges[1].value += amt;
      else ranges[2].value += amt;
    });
    setOutstandingData(ranges.map(r => ({
      ...r,
      pct: totalOut > 0 ? `${((r.value / totalOut) * 100).toFixed(1)}%` : '0%',
    })));

    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || (c.customer_no || '').toLowerCase().includes(q) || (c.city || '').toLowerCase().includes(q) || (c.mobile || '').includes(q);
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchCity = cityFilter === 'All' || c.city === cityFilter;
    return matchSearch && matchStatus && matchCity;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Open modals ───────────────────────────────────────────────────────────
  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setActiveTab(0); setShowModal(true); };
  const openEdit = (c: Customer) => {
    setEditId(c.id);
    setForm({
      name: c.name, mobile: c.mobile || '', email: c.email || '',
      city: c.city || '', address: c.address || '',
      // credit_limit: c.credit_limit ? String(c.credit_limit) : '',
      status: c.status,
      gstin: c.gstin || '', pan_number: c.pan_number || '',
      gst_doc_url: c.gst_doc_url || '', pan_doc_url: c.pan_doc_url || '',
      bank_account_no: c.bank_account_no || '', bank_name: c.bank_name || '',
      gpay_no: c.gpay_no || '', ifsc_code: c.ifsc_code || '', branch_name: c.branch_name || '',
      bank_doc_url: c.bank_doc_url || '',
      emergency_contact_name: c.emergency_contact_name || '',
      emergency_contact_phone: c.emergency_contact_phone || '',
      other_doc_url: c.other_doc_url || '',
    });
    setActiveTab(0);
    setShowModal(true);
  };

  // ── Upload ────────────────────────────────────────────────────────────────
  const uploadFile = async (file: File, field: keyof typeof DOC_FOLDER, customerNo: string): Promise<string | null> => {
    setUploadingField(field);
    const ext = file.name.split('.').pop();
    const path = `${DOC_FOLDER[field]}/${customerNo}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
    setUploadingField(null);
    if (error) { toast('error', `Upload failed: ${error.message}`); return null; }
    return path;
  };

  const handleFileChange = async (file: File, field: keyof typeof DOC_FOLDER) => {
    const prefix = editId ? (customers.find(c => c.id === editId)?.customer_no || 'NEW') : 'NEW';
    const path = await uploadFile(file, field, prefix);
    if (path) setForm(prev => ({ ...prev, [field]: path }));
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const save = async () => {
    if (!form.name.trim()) { toast('error', 'Customer name is required'); return; }
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      mobile: form.mobile || null,
      email: form.email || null,
      city: form.city || null,
      address: form.address || null,
      // credit_limit: form.credit_limit ? Number(form.credit_limit) : 0,
      status: form.status,
      gstin: form.gstin || null,
      pan_number: form.pan_number || null,
      gst_doc_url: form.gst_doc_url || null,
      pan_doc_url: form.pan_doc_url || null,
      bank_account_no: form.bank_account_no || null,
      bank_name: form.bank_name || null,
      gpay_no: form.gpay_no || null,
      ifsc_code: form.ifsc_code || null,
      branch_name: form.branch_name || null,
      bank_doc_url: form.bank_doc_url || null,
      emergency_contact_name: form.emergency_contact_name || null,
      emergency_contact_phone: form.emergency_contact_phone || null,
      other_doc_url: form.other_doc_url || null,
    };

    if (editId) {
      const { error } = await supabase.from('customers').update(payload).eq('id', editId);
      if (error) toast('error', 'Update failed: ' + error.message);
      else { toast('success', 'Customer updated successfully'); setShowModal(false); fetchCustomers(); }
    } else {
      // customer_no is auto-generated by DB trigger (generate_customer_no)
      const { error } = await supabase.from('customers').insert({ ...payload, outstanding: 0 });
      if (error) toast('error', 'Insert failed: ' + error.message);
      else { toast('success', 'Customer added successfully'); setShowModal(false); fetchCustomers(); }
    }
    setSaving(false);
  };

  // ── Set Inactive ──────────────────────────────────────────────────────────
  const setInactive = async (id: string) => {
    const { error } = await supabase.from('customers').update({ status: 'Inactive' }).eq('id', id);
    if (error) toast('error', 'Failed: ' + error.message);
    else { toast('success', 'Customer marked as Inactive'); setConfirmInactiveId(null); fetchCustomers(); }
  };

  const f = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  const fmt = (n: number | null) => n ? `₹ ${n.toLocaleString('en-IN')}` : '₹ 0';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Topbar title="Customers" breadcrumbs={[{ label: 'Customers' }]} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Total Active Customers', value: String(stats.activeCustomers), sub: 'All Customers', color: 'text-blue-600' },
            { label: 'Revenue This Month', value: '₹ 0', sub: 'Total Revenue', color: 'text-green-600' },
            { label: 'Invoice This Month', value: '₹ 0', sub: `From 0 Customers`, color: 'text-green-600' },
            { label: 'Received This Month', value: '₹ 0', sub: 'From 0 Customers', color: 'text-green-600' },
            { label: 'Outstanding Amount', value: fmt(stats.outstandingAmount), sub: `From ${stats.outstandingCustomers} Customers`, color: 'text-orange-500' },            
            { label: 'Invoices This Month', value: '0', sub: 'Total Invoices', color: 'text-blue-600' },
            
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
              <h3 className="text-[13px] font-semibold text-gray-700">All Customers</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search name, ID, city…"
                    className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] w-56 focus:outline-none" />
                </div>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11px]">
                  <option value="All">All Status</option><option>Active</option><option>Inactive</option>
                </select>
                <select value={cityFilter} onChange={e => { setCityFilter(e.target.value); setPage(1); }}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11px]">
                  <option value="All">All Cities</option>
                  {cities.map(city => <option key={city}>{city}</option>)}
                </select>
                <button onClick={openAdd}
                  className="flex items-center gap-1.5 bg-[#1a56db] text-white px-3 py-1.5 rounded-lg text-[11px] font-medium hover:bg-blue-700">
                  <Plus size={12} /> Add Customer
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                <Loader2 size={16} className="animate-spin" /> Loading customers…
              </div>
            ) : (
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                    {['Customer ID','Name','Mobile','Email','City','Outstanding (₹)','Status','Actions'].map(h => (
                      <th key={h} className={`text-left px-2 py-2 ${h === 'Outstanding (₹)' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0
                    ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">No customers found.</td></tr>
                    : paginated.map(c => (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-2 py-2 text-blue-600 font-medium">{c.customer_no}</td>
                        <td className="px-2 py-2 font-medium text-gray-700">{c.name}</td>
                        <td className="px-2 py-2 text-gray-500">{c.mobile || '—'}</td>
                        <td className="px-2 py-2 text-gray-500">{c.email || '—'}</td>
                        <td className="px-2 py-2 text-gray-500">{c.city || '—'}</td>
                        <td className="px-2 py-2 text-right font-medium text-orange-500">
                          {Number(c.outstanding || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-2 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.status}</span>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex gap-1">
                            <button onClick={() => setViewCustomer(c)} className="text-gray-400 hover:text-blue-600" title="View"><Eye size={12} /></button>
                            <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-green-600" title="Edit"><Pencil size={12} /></button>
                            {c.status !== 'Inactive' && (
                              <button onClick={() => setConfirmInactiveId(c.id)} className="text-gray-400 hover:text-red-500" title="Set Inactive"><Trash2 size={12} /></button>
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

          {/* Outstanding Donut */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-2">Outstanding Summary</h3>
            {outstandingData.length > 0 ? (
              <>
                <div className="relative">
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={outstandingData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value">
                        {outstandingData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <p className="text-[13px] font-bold text-gray-800">₹ {(totalOutstanding / 100000).toFixed(1)}L</p>
                    <p className="text-[9px] text-gray-400">Total Outstanding</p>
                  </div>
                </div>
                <div className="space-y-1.5 mt-1">
                  {outstandingData.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="flex-1 text-gray-500">{d.name}</span>
                      <span className="font-semibold">₹ {(d.value / 100000).toFixed(2)}L ({d.pct})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-300 text-[11px]">No outstanding</div>
            )}
          </div>
        </div>

        {/* Charts + Recent Payments */}
        {/* <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Top Customers by Revenue</h3>
            {topCustomers.map(c => (
              <div key={c.name} className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-gray-500 w-28 truncate">{c.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${c.amount / 1250000 * 100}%` }} /></div>
                <span className="text-[10px] font-semibold text-gray-700 w-20 text-right">₹ {(c.amount / 100000).toFixed(2)}L</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Payments Received (This Month)</h3>
            <ResponsiveContainer width="100%" height={130}>
              <LineChart data={paymentsTrend.filter((_, i) => i % 5 === 0)}>
                <XAxis dataKey="day" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide /><Tooltip formatter={(v: number) => ['₹ ' + (v / 100000).toFixed(1) + 'L']} />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-700">Recent Payments</h3>
            </div>
            <table className="w-full text-[11px]">
              <thead><tr className="text-gray-400 border-b border-gray-100">
                <th className="text-left pb-2">Date</th><th className="text-left pb-2">Customer</th>
                <th className="text-right pb-2">Amount</th><th className="text-left pb-2">Mode</th>
              </tr></thead>
              <tbody>{recentPayments.map((p, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-1.5 text-gray-500">{p.date}</td>
                  <td className="py-1.5 text-gray-600 text-[10px] max-w-[80px] truncate">{p.customer}</td>
                  <td className="py-1.5 text-right font-medium">₹ {p.amount.toLocaleString('en-IN')}</td>
                  <td className="py-1.5 text-gray-500">{p.mode}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div> */}
      </div>

      {/* ─── Add / Edit Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-[14px] font-bold text-gray-800">{editId ? 'Edit Customer' : 'Add New Customer'}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{editId ? 'Update customer information' : 'Fill details to register a new customer'}</p>
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
                  <Field label="Customer Name *"><input value={form.name} onChange={f('name')} placeholder="e.g. ABC Steels Pvt Ltd" className={inputCls} /></Field>
                  <Field label="Mobile"><input value={form.mobile} onChange={f('mobile')} placeholder="Mobile number" className={inputCls} /></Field>
                  <Field label="Email"><input type="email" value={form.email} onChange={f('email')} placeholder="email@example.com" className={inputCls} /></Field>
                  <Field label="City"><input value={form.city} onChange={f('city')} placeholder="e.g. Coimbatore" className={inputCls} /></Field>
                  {/* <Field label="Credit Limit (₹)"><input type="number" value={form.credit_limit} onChange={f('credit_limit')} placeholder="0" className={inputCls} /></Field> */}
                  <Field label="Status">
                    <select value={form.status} onChange={f('status')} className={inputCls}>
                      <option>Active</option><option>Inactive</option>
                    </select>
                  </Field>
                  <div className="col-span-2">
                    <Field label="Address"><textarea value={form.address} onChange={f('address')} placeholder="Full address" rows={2} className={inputCls + ' resize-none'} /></Field>
                  </div>
                  <PortalUserField
                      role="customer"
                      entityId={editId}             // null when adding new, uuid when editing
                      hasPortalAccess={!!customers.find(c => c.id === editId)?.portal_user_id}
                      toast={toast}
                      onSuccess={fetchCustomers}
                    />
                </div>

                
              )}

              {/* GST & PAN */}
              {activeTab === 1 && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="GST Number"><input value={form.gstin} onChange={f('gstin')} placeholder="e.g. 33AABCU9603R1ZX" className={inputCls} /></Field>
                  <Field label="PAN Number"><input value={form.pan_number} onChange={f('pan_number')} placeholder="e.g. AABCU9603R" className={inputCls} /></Field>
                  <div className="col-span-2">
                    <FileUploadBtn label="GST Document Upload" storagePath={form.gst_doc_url}
                      uploading={uploadingField === 'gst_doc_url'} onChange={file => handleFileChange(file, 'gst_doc_url')} />
                  </div>
                  <div className="col-span-2">
                    <FileUploadBtn label="PAN Card Document Upload" storagePath={form.pan_doc_url}
                      uploading={uploadingField === 'pan_doc_url'} onChange={file => handleFileChange(file, 'pan_doc_url')} />
                  </div>
                </div>
              )}

              {/* Bank Details */}
              {activeTab === 2 && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Account Number"><input value={form.bank_account_no} onChange={f('bank_account_no')} placeholder="Account number" className={inputCls} /></Field>
                  <Field label="Bank Name"><input value={form.bank_name} onChange={f('bank_name')} placeholder="e.g. State Bank of India" className={inputCls} /></Field>
                  <Field label="IFSC Code"><input value={form.ifsc_code} onChange={f('ifsc_code')} placeholder="e.g. SBIN0001234" className={inputCls} /></Field>
                  <Field label="Branch Name"><input value={form.branch_name} onChange={f('branch_name')} placeholder="e.g. RS Puram" className={inputCls} /></Field>
                  <Field label="GPay Number"><input value={form.gpay_no} onChange={f('gpay_no')} placeholder="GPay linked mobile" className={inputCls} /></Field>
                  <div className="col-span-2">
                    <FileUploadBtn label="Bank Account Document Upload" storagePath={form.bank_doc_url}
                      uploading={uploadingField === 'bank_doc_url'} onChange={file => handleFileChange(file, 'bank_doc_url')} />
                  </div>
                </div>
              )}

              {/* Emergency & Docs */}
              {activeTab === 3 && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Emergency Contact Name"><input value={form.emergency_contact_name} onChange={f('emergency_contact_name')} placeholder="Contact person name" className={inputCls} /></Field>
                  <Field label="Emergency Contact Phone"><input value={form.emergency_contact_phone} onChange={f('emergency_contact_phone')} placeholder="Contact phone number" className={inputCls} /></Field>
                  <div className="col-span-2">
                    <FileUploadBtn label="Other Documents Upload" storagePath={form.other_doc_url}
                      uploading={uploadingField === 'other_doc_url'} onChange={file => handleFileChange(file, 'other_doc_url')} />
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
                    {editId ? '✓ Update Customer' : '✓ Add Customer'}
                  </button>
                )}
                <button onClick={() => setShowModal(false)} className="px-4 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-100">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Modal ───────────────────────────────────────────────────── */}
      {viewCustomer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[13px]">
                  {viewCustomer.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-800">{viewCustomer.name}</p>
                  <p className="text-[11px] text-gray-400">{viewCustomer.customer_no}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${viewCustomer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{viewCustomer.status}</span>
                <button onClick={() => setViewCustomer(null)}><X size={16} className="text-gray-400" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <Section icon={<Building2 size={13} />} title="Basic Info">
                <Row2 a={['Mobile', viewCustomer.mobile]} b={['Email', viewCustomer.email]} />
                <Row2 a={['City', viewCustomer.city]} b={['City', viewCustomer.city]} />
                <Row2 a={['Outstanding', `₹ ${Number(viewCustomer.outstanding || 0).toLocaleString('en-IN')}`]} b={['', null]} />
                <Row1 label="Address" value={viewCustomer.address} />
              </Section>
              <Section icon={<FileText size={13} />} title="GST & PAN">
                <Row2 a={['GST Number', viewCustomer.gstin]} b={['PAN Number', viewCustomer.pan_number]} />
                <div className="grid grid-cols-2 gap-2">
                  <DocRow label="GST Document" path={viewCustomer.gst_doc_url} />
                  <DocRow label="PAN Document" path={viewCustomer.pan_doc_url} />
                </div>
              </Section>
              <Section icon={<CreditCard size={13} />} title="Bank Details">
                <Row2 a={['Account No', viewCustomer.bank_account_no]} b={['Bank', viewCustomer.bank_name]} />
                <Row2 a={['IFSC', viewCustomer.ifsc_code]} b={['Branch', viewCustomer.branch_name]} />
                <Row2 a={['GPay No', viewCustomer.gpay_no]} b={['', null]} />
                <DocRow label="Bank Document" path={viewCustomer.bank_doc_url} />
              </Section>
              <Section icon={<Phone size={13} />} title="Emergency Contact">
                <Row2 a={['Name', viewCustomer.emergency_contact_name]} b={['Phone', viewCustomer.emergency_contact_phone]} />
                <DocRow label="Other Document" path={viewCustomer.other_doc_url} />
              </Section>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => { setViewCustomer(null); openEdit(viewCustomer); }}
                className="px-4 py-1.5 bg-[#1a56db] text-white rounded-lg text-[12px] font-medium hover:bg-blue-700 flex items-center gap-1.5">
                <Pencil size={12} /> Edit
              </button>
              <button onClick={() => setViewCustomer(null)} className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-[12px]">Close</button>
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
                <p className="text-[13px] font-bold text-gray-800">Set Customer as Inactive?</p>
                <p className="text-[11px] text-gray-400">Customer will be marked Inactive. Record is kept.</p>
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

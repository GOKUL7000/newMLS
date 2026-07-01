'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Truck, LogOut, Loader2, ChevronDown, ChevronUp, ArrowLeft,
  MapPin, Plus, X, Upload, ExternalLink, ArrowRight, CheckCircle2,
  XCircle, Wallet, IndianRupee,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Session { portalUserId: string; role: string; entityId: string; username: string; name: string; }

interface Trip {
  id: string; trip_no: string; trip_date: string;
  origin: string | null; destination: string | null;
  status: string; lr_no: string | null;
  freight_amount: number | null; settled_amount: number | null;
  start_km: number | null; start_km_doc: string | null;
  loading_km: number | null; loading_km_doc: string | null;
  unloading_km: number | null; unloading_photo: string | null;
  end_km: number | null; end_km_photo: string | null; total_km: number | null;
  customers?: { name: string } | null;
}

interface TripExpense {
  id: string; trip_id: string; expense_date: string;
  category: string; amount: number; advance_amount: number | null;
  paid_by: string | null; notes: string | null; receipt_doc: string | null;
}

type ToastType = 'success' | 'error';
interface Toast { id: number; type: ToastType; message: string; }

const EXPENSE_CATEGORIES = ['Diesel', 'Toll', 'Food', 'Repair', 'Police', 'Loading Charges', 'Unloading Charges', 'Other'];
const PIPELINE_ORDER = ['Pending', 'Started', 'Loading', 'Unloading', 'TripCompleted', 'POPReceived', 'POPSubmitted', 'GenerateInvoice', 'Settled'];
const PENDING_GROUP = ['Pending', 'Started', 'Loading', 'Unloading'];

const DRIVER_STEPS: Record<string, { next: string; nextLabel: string; kmField: keyof Trip; kmLabel: string; docField: keyof Trip; docLabel: string }> = {
  Pending:   { next: 'Started',       nextLabel: 'Started',        kmField: 'start_km',     kmLabel: 'Start KM',     docField: 'start_km_doc',    docLabel: 'Start KM Photo' },
  Started:   { next: 'Loading',       nextLabel: 'Loading',        kmField: 'loading_km',   kmLabel: 'Loading KM',   docField: 'loading_km_doc',  docLabel: 'Loading Photo' },
  Loading:   { next: 'Unloading',     nextLabel: 'Unloading',      kmField: 'unloading_km', kmLabel: 'Unloading KM', docField: 'unloading_photo', docLabel: 'Unloading Photo' },
  Unloading: { next: 'TripCompleted', nextLabel: 'Trip Completed', kmField: 'end_km',       kmLabel: 'End KM',       docField: 'end_km_photo',    docLabel: 'End KM Photo' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Pending:       { bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400' },
  Started:       { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  Loading:       { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  Unloading:     { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  TripCompleted: { bg: 'bg-cyan-100',   text: 'text-cyan-700',   dot: 'bg-cyan-500' },
  POPReceived:   { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  POPSubmitted:  { bg: 'bg-sky-100',    text: 'text-sky-700',    dot: 'bg-sky-500' },
  Settled:       { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
};

const API = {
  trips: '/api/portal/driver-trips',
  advance: '/api/portal/driver-trips-advance',
  expenses: '/api/portal/driver-expenses',
  upload: '/api/portal/driver-upload',
  doc: '/api/portal/driver-doc',
};

const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const inr = (n: number) => '₹ ' + Math.round(n).toLocaleString('en-IN');
const inputCls = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50";

async function openDoc(path: string | null) {
  if (!path) return;
  const res = await fetch(`${API.doc}?path=${encodeURIComponent(path)}`);
  const data = await res.json();
  if (!res.ok || !data.url) { alert('Could not open document.'); return; }
  window.open(data.url, '_blank');
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-[12px] font-medium text-white pointer-events-auto
            ${t.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
          {t.type === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {t.message}
          <button onClick={() => onRemove(t.id)} className="ml-2 opacity-70 hover:opacity-100"><X size={12} /></button>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

// ─── Step Advance Modal ────────────────────────────────────────────────────────
function StepModal({ trip, step, onClose, onSaved, toast }: {
  trip: Trip; step: typeof DRIVER_STEPS[string];
  onClose: () => void; onSaved: () => Promise<void>;
  toast: (type: ToastType, msg: string) => void;
}) {
  const [km, setKm] = useState('');
  const [docPath, setDocPath] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file); fd.append('tripId', trip.id);
    fd.append('tripNo', trip.trip_no); fd.append('fieldName', step.docField as string);
    const res = await fetch(API.upload, { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { toast('error', `Upload failed: ${data.error}`); return; }
    setDocPath(data.path);
  };

  const handleConfirm = async () => {
    if (!km) { toast('error', `${step.kmLabel} is required`); return; }
    setSaving(true);
    const res = await fetch(API.advance, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId: trip.id, kmValue: km, docPath: docPath || undefined }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { toast('error', data.error || 'Failed to update'); return; }
    toast('success', `Moved to ${step.nextLabel}`);
    onClose(); await onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[15px] font-bold text-gray-800">Move to {step.nextLabel}</p>
            <p className="text-[12px] text-gray-400 mt-0.5">{trip.trip_no}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-gray-600 block mb-1.5">{step.kmLabel} *</label>
            <input type="number" inputMode="numeric" placeholder="Enter KM reading"
              value={km} onChange={e => setKm(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-[12px] font-medium text-gray-600 block mb-1.5">{step.docLabel}</label>
            <div className="flex gap-2">
              <label className={`flex-1 flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-xl px-3 py-2.5 transition-colors
                ${uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}>
                {uploading ? <Loader2 size={14} className="text-blue-500 animate-spin" /> : <Upload size={14} className="text-gray-400" />}
                <span className="text-[12px] text-gray-500 truncate">
                  {uploading ? 'Uploading…' : docPath ? docPath.split('/').pop() : 'Take / upload photo'}
                </span>
                <input type="file" accept="image/*" capture="environment" className="hidden" disabled={uploading}
                  onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
              </label>
              {docPath && (
                <button onClick={() => openDoc(docPath)}
                  className="px-3 border border-blue-200 bg-blue-50 text-blue-600 rounded-xl text-[12px] hover:bg-blue-100 flex items-center gap-1">
                  <ExternalLink size={12} />
                </button>
              )}
            </div>
          </div>
          {step.next === 'TripCompleted' && km && trip.start_km && (
            <div className="bg-blue-50 rounded-xl px-4 py-2.5 text-[12px]">
              Total KM: <span className="font-bold text-blue-700">{(parseInt(km) - trip.start_km).toLocaleString('en-IN')} km</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleConfirm} disabled={saving || uploading || !km}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-[13px] font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
            Confirm
          </button>
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-[13px] font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Expense Modal ────────────────────────────────────────────────────────
function ExpenseModal({ trip, onClose, onSaved, toast }: {
  trip: Trip; onClose: () => void;
  onSaved: () => Promise<void>; toast: (type: ToastType, msg: string) => void;
}) {
  const [form, setForm] = useState({ expense_date: new Date().toISOString().slice(0, 10), category: 'Diesel', amount: '', advance_amount: '', paid_by: 'Driver', notes: '', receipt_doc: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file); fd.append('tripId', trip.id);
    fd.append('tripNo', trip.trip_no); fd.append('fieldName', 'receipt');
    const res = await fetch(API.upload, { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { toast('error', `Upload failed: ${data.error}`); return; }
    setForm(p => ({ ...p, receipt_doc: data.path }));
  };

  const handleSave = async () => {
    if (!form.amount && !form.advance_amount) { toast('error', 'Enter expense or advance amount'); return; }
    setSaving(true);
    const res = await fetch(API.expenses, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId: trip.id, ...form }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { toast('error', data.error || 'Failed to save'); return; }
    toast('success', 'Expense added'); onClose(); await onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-[15px] font-bold text-gray-800">Add Expense</p>
            <p className="text-[12px] text-gray-400">Trip {trip.trip_no}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-gray-600 block mb-1.5">Date</label>
              <input type="date" value={form.expense_date} onChange={f('expense_date')} className={inputCls} />
            </div>
            <div>
              <label className="text-[12px] font-medium text-gray-600 block mb-1.5">Category</label>
              <select value={form.category} onChange={f('category')} className={inputCls}>
                {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-gray-600 block mb-1.5">Expense (₹)</label>
              <input type="number" inputMode="decimal" value={form.amount} onChange={f('amount')} placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className="text-[12px] font-medium text-gray-600 block mb-1.5">Advance (₹)</label>
              <input type="number" inputMode="decimal" value={form.advance_amount} onChange={f('advance_amount')} placeholder="0" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-gray-600 block mb-1.5">Paid By</label>
            <select value={form.paid_by} onChange={f('paid_by')} className={inputCls}>
              <option>Driver</option><option>Company</option>
            </select>
          </div>

          <div>
            <label className="text-[12px] font-medium text-gray-600 block mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={f('notes')} rows={2} placeholder="Optional notes" className={inputCls + ' resize-none'} />
          </div>

          <div>
            <label className="text-[12px] font-medium text-gray-600 block mb-1.5">Receipt</label>
            <label className={`flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-xl px-3 py-2.5 transition-colors
              ${uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}>
              {uploading ? <Loader2 size={14} className="text-blue-500 animate-spin" /> : <Upload size={14} className="text-gray-400" />}
              <span className="text-[12px] text-gray-500 truncate">
                {uploading ? 'Uploading…' : form.receipt_doc ? form.receipt_doc.split('/').pop() : 'Take / upload receipt (optional)'}
              </span>
              <input type="file" accept="image/*" capture="environment" className="hidden" disabled={uploading}
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
            </label>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={handleSave} disabled={saving || uploading}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-[13px] font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-1.5 transition-colors">
            {saving && <Loader2 size={13} className="animate-spin" />}
            Save Expense
          </button>
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-[13px] font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Trip Card ────────────────────────────────────────────────────────────────
function TripCard({ trip, expenses, expLoading, onAddExpense, onAdvance }: {
  trip: Trip; expenses: TripExpense[]; expLoading: boolean;
  onAddExpense: (t: Trip) => void; onAdvance: (t: Trip) => void;
}) {
  const [open, setOpen] = useState(false);

  const advanceTotal = expenses.reduce((s, e) => s + (e.advance_amount || 0), 0);
  const expenseTotal = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const inHand = advanceTotal - expenseTotal;

  const driverStep = DRIVER_STEPS[trip.status];
  const isLocked = PIPELINE_ORDER.indexOf(trip.status) >= PIPELINE_ORDER.indexOf('TripCompleted');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[13px] font-bold text-blue-600">{trip.trip_no}</p>
            <StatusBadge status={trip.status} />
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={11} className="text-gray-400 shrink-0" />
            <p className="text-[12px] text-gray-500 truncate">{trip.origin || '—'} → {trip.destination || '—'}</p>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {fmtDate(trip.trip_date)} {trip.customers?.name ? `· ${trip.customers.name}` : ''}
          </p>
        </div>
        {open ? <ChevronUp size={15} className="text-gray-300 shrink-0" /> : <ChevronDown size={15} className="text-gray-300 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4 bg-gray-50">

          {/* Advance pipeline button */}
          {driverStep && (
            <button onClick={() => onAdvance(trip)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-semibold hover:bg-blue-700 transition-colors">
              <ArrowRight size={14} /> Move to {driverStep.nextLabel}
            </button>
          )}

          {/* Advance / Expense / In-hand summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 mb-0.5">Advance</p>
              <p className="text-[14px] font-bold text-blue-600">{inr(advanceTotal)}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 mb-0.5">Expenses</p>
              <p className="text-[14px] font-bold text-red-500">{inr(expenseTotal)}</p>
            </div>
            <div className={`rounded-xl p-3 border text-center ${inHand >= 0 ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
              <p className="text-[10px] text-gray-400 mb-0.5">{inHand >= 0 ? 'In Hand' : 'Owed'}</p>
              <p className={`text-[14px] font-bold ${inHand >= 0 ? 'text-green-600' : 'text-orange-500'}`}>{inr(Math.abs(inHand))}</p>
            </div>
          </div>

          {/* Expenses list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-semibold text-gray-600">Expenses</p>
              {!isLocked && (
                <button onClick={() => onAddExpense(trip)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-medium hover:bg-blue-700 transition-colors">
                  <Plus size={11} /> Add
                </button>
              )}
            </div>

            {expLoading ? (
              <div className="flex justify-center py-4"><Loader2 size={14} className="animate-spin text-gray-400" /></div>
            ) : expenses.length === 0 ? (
              <p className="text-[12px] text-gray-400 text-center py-4">No expenses yet.</p>
            ) : (
              <div className="space-y-2">
                {expenses.map(e => (
                  <div key={e.id} className="bg-white rounded-xl border border-gray-100 px-3 py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-semibold text-gray-700">{e.category}</p>
                      <p className="text-[11px] text-gray-400">{fmtDate(e.expense_date)} · {e.paid_by || '—'}</p>
                      {e.notes && <p className="text-[11px] text-gray-400 italic">{e.notes}</p>}
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      {e.amount ? <p className="text-[12px] font-semibold text-red-500">- {inr(e.amount)}</p> : null}
                      {e.advance_amount ? <p className="text-[12px] font-semibold text-blue-600">+ {inr(e.advance_amount)}</p> : null}
                      {e.receipt_doc && (
                        <button onClick={() => openDoc(e.receipt_doc)} className="text-blue-500 text-[11px] flex items-center gap-0.5 mt-0.5 hover:underline">
                          <ExternalLink size={10} /> Receipt
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DriverTripsPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [expensesByTrip, setExpensesByTrip] = useState<Record<string, TripExpense[]>>({});
  const [expLoading, setExpLoading] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState<'pending' | 'completed'>('pending');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [stepTrip, setStepTrip] = useState<Trip | null>(null);
  const [expenseTrip, setExpenseTrip] = useState<Trip | null>(null);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts(p => [...p, { id, type, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  const removeToast = (id: number) => setToasts(p => p.filter(t => t.id !== id));

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    const sessionRes = await fetch('/api/portal/session');
    if (!sessionRes.ok) { router.push('/portal/login'); return; }
    const s: Session = await sessionRes.json();
    if (s.role !== 'driver') { router.push('/portal/login'); return; }
    setSession(s);
    const res = await fetch(API.trips);
    const data = await res.json();
    if (!res.ok) { toast('error', data.error || 'Failed to load trips'); setLoading(false); return; }
    setTrips(data.trips || []);
    setLoading(false);
  }, [router, toast]);

  const fetchExpenses = useCallback(async (tripId: string) => {
    setExpLoading(p => ({ ...p, [tripId]: true }));
    const res = await fetch(`${API.expenses}?tripId=${tripId}`);
    const data = await res.json();
    setExpensesByTrip(p => ({ ...p, [tripId]: data.expenses || [] }));
    setExpLoading(p => ({ ...p, [tripId]: false }));
  }, []);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);
  useEffect(() => { trips.forEach(t => { if (!(t.id in expensesByTrip)) fetchExpenses(t.id); }); }, [trips]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  };

  const pendingTrips = trips.filter(t => PENDING_GROUP.includes(t.status));
  const completedTrips = trips.filter(t => !PENDING_GROUP.includes(t.status));
  const visibleTrips = tab === 'pending' ? pendingTrips : completedTrips;

  const allExpenses = Object.values(expensesByTrip).flat();
  const totalAdvance = allExpenses.reduce((s, e) => s + (e.advance_amount || 0), 0);
  const totalExpenses = allExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const netInHand = totalAdvance - totalExpenses;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center gap-2 text-gray-400">
      <Loader2 size={16} className="animate-spin" /> Loading trips…
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/portal/driver')}
              className="text-gray-400 hover:text-gray-700 transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center">
                <Truck size={14} className="text-white" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-800 leading-none">My Trips</p>
                <p className="text-[10px] text-gray-400 leading-none mt-0.5">MLS Transports</p>
              </div>
            </div>
          </div>
          {session && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[12px] font-semibold text-gray-700">{session.name}</p>
                <p className="text-[10px] text-gray-400">@{session.username}</p>
              </div>
              <button onClick={handleLogout} disabled={loggingOut}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors">
                {loggingOut ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={13} />}
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-2">
              <Wallet size={15} className="text-blue-600" />
            </div>
            <p className="text-[18px] font-bold text-blue-600">{inr(totalAdvance)}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Total Advance</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center mb-2">
              <IndianRupee size={15} className="text-red-500" />
            </div>
            <p className="text-[18px] font-bold text-red-500">{inr(totalExpenses)}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Total Expenses</p>
          </div>
          <div className={`rounded-2xl p-4 border shadow-sm ${netInHand >= 0 ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${netInHand >= 0 ? 'bg-green-100' : 'bg-orange-100'}`}>
              <CheckCircle2 size={15} className={netInHand >= 0 ? 'text-green-600' : 'text-orange-500'} />
            </div>
            <p className={`text-[18px] font-bold ${netInHand >= 0 ? 'text-green-600' : 'text-orange-500'}`}>{inr(Math.abs(netInHand))}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{netInHand >= 0 ? 'In Hand' : 'Owed to You'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button onClick={() => setTab('pending')}
            className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all ${tab === 'pending' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            In Progress ({pendingTrips.length})
          </button>
          <button onClick={() => setTab('completed')}
            className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all ${tab === 'completed' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            Completed ({completedTrips.length})
          </button>
        </div>

        {/* Trip Cards */}
        {visibleTrips.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-[13px]">
            {tab === 'pending' ? 'No active trips right now.' : 'No completed trips yet.'}
          </div>
        ) : (
          <div className="space-y-3">
            {visibleTrips.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                expenses={expensesByTrip[trip.id] || []}
                expLoading={!!expLoading[trip.id]}
                onAddExpense={setExpenseTrip}
                onAdvance={setStepTrip}
              />
            ))}
          </div>
        )}
      </main>

      {stepTrip && DRIVER_STEPS[stepTrip.status] && (
        <StepModal trip={stepTrip} step={DRIVER_STEPS[stepTrip.status]}
          onClose={() => setStepTrip(null)}
          onSaved={async () => { await fetchTrips(); }}
          toast={toast} />
      )}

      {expenseTrip && (
        <ExpenseModal trip={expenseTrip}
          onClose={() => setExpenseTrip(null)}
          onSaved={async () => { await fetchExpenses(expenseTrip.id); }}
          toast={toast} />
      )}
    </div>
  );
}

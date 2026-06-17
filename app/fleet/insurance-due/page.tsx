'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Topbar from '@/components/layout/Topbar';
import { Search, AlertTriangle, Eye, Loader2, RefreshCw } from 'lucide-react';

const supabase = createClientComponentClient();

interface VehicleRow {
  id: string;
  vehicle_no: string;
  brand: string;
  model: string;
  insurance_valid_up_to: string | null;
  driver_id: string | null;
  status: string;
  // joined
  driver_name?: string;
}

interface Row {
  id: string;
  vehicle_no: string;
  brand: string;
  model: string;
  driver_name: string;
  due_date: string | null;
  days_left: number;
  alert: 'Expired' | 'Critical' | 'Due Soon' | 'Upcoming';
}

// ── helpers ───────────────────────────────────────────────────────────────────
function daysLeft(dateStr: string | null): number {
  if (!dateStr) return -9999;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function alertLevel(days: number): Row['alert'] {
  if (days < 0)   return 'Expired';
  if (days <= 7)  return 'Critical';
  if (days <= 30) return 'Due Soon';
  return 'Upcoming';
}

function alertCls(alert: Row['alert']) {
  return {
    Expired:  'bg-red-200 text-red-800',
    Critical: 'bg-red-100 text-red-700',
    'Due Soon': 'bg-orange-100 text-orange-700',
    Upcoming: 'bg-green-100 text-green-700',
  }[alert];
}

function daysCls(days: number) {
  if (days < 0)   return 'text-red-700 font-semibold';
  if (days <= 7)  return 'text-red-600 font-medium';
  if (days <= 30) return 'text-orange-500 font-medium';
  return 'text-gray-600';
}

function fmtDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InsuranceDuePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAlert, setFilterAlert] = useState<'All' | Row['alert']>('All');

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Fetch vehicles + join drivers name
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('id, vehicle_no, brand, model, insurance_valid_up_to, driver_id, status')
      .eq('deleted', false)
      .neq('status', 'Inactive');

    if (error) { console.error(error); setLoading(false); return; }

    // Fetch driver names if any driver_ids exist
    const driverIds = (vehicles || []).map(v => v.driver_id).filter(Boolean) as string[];
    let driverMap: Record<string, string> = {};

    if (driverIds.length > 0) {
      const { data: drivers } = await supabase
        .from('drivers')
        .select('id, name')
        .in('id', driverIds);
      (drivers || []).forEach(d => { driverMap[d.id] = d.name; });
    }

    const mapped: Row[] = (vehicles || []).map(v => {
      const days = daysLeft(v.insurance_valid_up_to);
      return {
        id: v.id,
        vehicle_no: v.vehicle_no,
        brand: v.brand,
        model: v.model,
        driver_name: v.driver_id ? (driverMap[v.driver_id] || '—') : '—',
        due_date: v.insurance_valid_up_to,
        days_left: days,
        alert: alertLevel(days),
      };
    });

    // Sort: Expired first, then by days ascending
    mapped.sort((a, b) => a.days_left - b.days_left);
    setRows(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Stats
  const stats = {
    expired:  rows.filter(r => r.alert === 'Expired').length,
    critical: rows.filter(r => r.alert === 'Critical').length,
    dueSoon:  rows.filter(r => r.alert === 'Due Soon').length,
    upcoming: rows.filter(r => r.alert === 'Upcoming').length,
    total:    rows.length,
  };

  // Filter
  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.vehicle_no.toLowerCase().includes(q) || r.driver_name.toLowerCase().includes(q) || r.brand.toLowerCase().includes(q);
    const matchAlert = filterAlert === 'All' || r.alert === filterAlert;
    return matchSearch && matchAlert;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Insurance Due" breadcrumbs={[{ label: 'Fleet' }, { label: 'Insurance Due' }]} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Expired', value: stats.expired, color: 'text-red-700', bg: 'bg-red-50 border-red-100', sub: 'Needs Immediate Action' },
            { label: 'Critical (≤7 Days)', value: stats.critical, color: 'text-red-500', bg: 'bg-white border-gray-100', sub: 'Urgent Renewal' },
            { label: 'Due Soon (8–30 Days)', value: stats.dueSoon, color: 'text-orange-500', bg: 'bg-white border-gray-100', sub: 'Schedule Renewal' },
            { label: 'Upcoming (>30 Days)', value: stats.upcoming, color: 'text-green-600', bg: 'bg-white border-gray-100', sub: 'On Track' },
            { label: 'Total Vehicles', value: stats.total, color: 'text-blue-600', bg: 'bg-white border-gray-100', sub: 'All Active Vehicles' },
          ].map(c => (
            <div key={c.label} className={`rounded-xl p-4 border shadow-sm ${c.bg}`}>
              <p className="text-[10px] text-gray-400">{c.label}</p>
              <p className={`text-[26px] font-bold ${c.color} mt-0.5`}>{c.value}</p>
              <p className="text-[10px] text-gray-400">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[13px] font-semibold text-gray-800">Insurance Due — All Vehicles</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Sorted by urgency. Red = expired or critical.</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Alert filter pills */}
              <div className="flex gap-1">
                {(['All', 'Expired', 'Critical', 'Due Soon', 'Upcoming'] as const).map(a => (
                  <button key={a} onClick={() => setFilterAlert(a)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors
                      ${filterAlert === a ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {a}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search vehicle, driver, brand…"
                  className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] w-52 focus:outline-none" />
              </div>
              <button onClick={fetchData} className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-300" title="Refresh">
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" /> Loading vehicles…
            </div>
          ) : (
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                  {['#', 'Vehicle No.', 'Brand / Model', 'Assigned Driver', 'Insurance Expiry', 'Days Left', 'Alert', ''].map((h, i) => (
                    <th key={i} className="text-left px-2 py-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No vehicles found.</td></tr>
                ) : filtered.map((v, idx) => (
                  <tr key={v.id} className={`border-b border-gray-50 hover:bg-gray-50 ${v.alert === 'Expired' ? 'bg-red-50/40' : ''}`}>
                    <td className="px-2 py-2.5 text-gray-400">{idx + 1}</td>
                    <td className="px-2 py-2.5 font-bold text-gray-800">{v.vehicle_no}</td>
                    <td className="px-2 py-2.5 text-gray-600">{v.brand} {v.model}</td>
                    <td className="px-2 py-2.5 text-gray-500">{v.driver_name}</td>
                    <td className="px-2 py-2.5 text-gray-600">{fmtDate(v.due_date)}</td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-1">
                        {(v.alert === 'Expired' || v.alert === 'Critical') && (
                          <AlertTriangle size={11} className={v.alert === 'Expired' ? 'text-red-700' : 'text-red-500'} />
                        )}
                        <span className={daysCls(v.days_left)}>
                          {v.days_left < 0 ? `${Math.abs(v.days_left)} days ago` : `${v.days_left} days`}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${alertCls(v.alert)}`}>
                        {v.alert}
                      </span>
                    </td>
                    {/* <td className="px-2 py-2.5">
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600">
                        <Eye size={12} />
                      </button>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && (
            <p className="text-[10px] text-gray-400 mt-3">
              Showing {filtered.length} of {rows.length} vehicles
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

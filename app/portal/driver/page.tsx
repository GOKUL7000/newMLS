'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Truck, LogOut, Loader2, ChevronDown, ChevronUp,
  MapPin, Package, Activity, Gauge,
  ArrowRight,
} from 'lucide-react';

interface Session { portalUserId: string; role: string; entityId: string; username: string; name: string; }
interface Trip {
  id: string; trip_no: string; trip_date: string;
  origin: string | null; destination: string | null;
  status: string; lr_no: string | null;
  start_km: number | null; end_km: number | null; total_km: number | null;
  freight_amount: number | null;
  customers?: { name: string } | null;
}

const ACTIVE_STATUSES = ['Started', 'Loading', 'Unloading', 'TripCompleted', 'POPReceived', 'POPSubmitted'];
const PENDING_GROUP = ['Pending', 'Started', 'Loading', 'Unloading'];

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

const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

export default function DriverPortalDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [filter, setFilter] = useState('All Trips');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const sessionRes = await fetch('/api/portal/session');
    if (!sessionRes.ok) { router.push('/portal/login'); return; }
    const s: Session = await sessionRes.json();
    if (s.role !== 'driver') { router.push('/portal/login'); return; }
    setSession(s);
    const tripsRes = await fetch(`/api/portal/driver-data?driverId=${s.entityId}`);
    const data = await tripsRes.json();
    setTrips(data.trips || []);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  };

  const totalKm = trips.reduce((s, t) => s + (t.total_km || 0), 0);
  const activeCount = trips.filter(t => ACTIVE_STATUSES.includes(t.status)).length;
  const completedCount = trips.filter(t => ['TripCompleted', 'POPReceived', 'POPSubmitted', 'Settled'].includes(t.status)).length;

  const filtered = trips.filter(t => {
    if (filter === 'All Trips') return true;
    if (filter === 'Pending') return PENDING_GROUP.includes(t.status);
    if (filter === 'Completed') return !PENDING_GROUP.includes(t.status);
    return true;
  });

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center gap-2 text-gray-400">
      <Loader2 size={16} className="animate-spin" /> Loading…
    </div>
  );
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
              <Truck size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-gray-800 leading-none truncate">MLS Transports</p>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">Driver Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[12px] font-semibold text-gray-700">{session.name}</p>
              <p className="text-[10px] text-gray-400">@{session.username}</p>
            </div>
            <button onClick={handleLogout} disabled={loggingOut}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[12px] text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors shrink-0">
              {loggingOut ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={13} />}
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-[18px] sm:text-[22px] font-bold text-gray-800">Hello, {session.name} 👋</h1>
          <p className="text-[12px] sm:text-[13px] text-gray-400 mt-0.5">Your assigned trips overview</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Trips', value: trips.length, icon: <Package size={18} className="text-blue-500 sm:w-5 sm:h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Trips', value: activeCount, icon: <Activity size={18} className="text-orange-500 sm:w-5 sm:h-5" />, color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Completed', value: completedCount, icon: <Package size={18} className="text-green-500 sm:w-5 sm:h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Total KM', value: `${totalKm.toLocaleString('en-IN')} km`, icon: <Gauge size={18} className="text-purple-500 sm:w-5 sm:h-5" />, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${card.bg} flex items-center justify-center mb-2 sm:mb-3`}>
                {card.icon}
              </div>
              <p className={`text-[18px] sm:text-[26px] font-bold ${card.color} leading-none truncate`}>{card.value}</p>
              <p className="text-[11px] sm:text-[12px] text-gray-400 mt-1 sm:mt-1.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Trip List */}
        <button onClick={() => router.push('/portal/driver/trips')}
                  className="w-full bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm flex items-center justify-between hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Truck size={17} className="text-blue-600 sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800">My Trips</p>
                      <p className="text-[11px] text-gray-400 truncate">Update status, log expenses & advance</p>
                    </div>
                  </div>
                  <ArrowRight size={15} className="text-gray-300 shrink-0" />
                </button>
      </main>
    </div>
  );
}
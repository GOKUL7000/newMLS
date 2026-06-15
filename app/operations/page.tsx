'use client';
import Topbar from '@/components/layout/Topbar';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Eye } from 'lucide-react';

const tripStatus = [
  { name: 'Loading', value: 8, pct: '6.4%', color: '#f59e0b' },
  { name: 'In Transit', value: 20, pct: '16.0%', color: '#3b82f6' },
  { name: 'Unloading', value: 7, pct: '5.6%', color: '#8b5cf6' },
  { name: 'Completed', value: 90, pct: '72.0%', color: '#10b981' },
  { name: 'Delayed', value: 5, pct: '4.0%', color: '#ef4444' },
];
const byLocation = [
  { location: 'Bangalore', trips: 5, vehicles: 5, eta: '6.2 Hrs' },
  { location: 'Chennai', trips: 4, vehicles: 4, eta: '4.8 Hrs' },
  { location: 'Hyderabad', trips: 3, vehicles: 3, eta: '7.5 Hrs' },
  { location: 'Mumbai', trips: 3, vehicles: 3, eta: '8.1 Hrs' },
  { location: 'Coimbatore', trips: 2, vehicles: 2, eta: '2.3 Hrs' },
  { location: 'Others', trips: 3, vehicles: 3, eta: '5.0 Hrs' },
];
const activeTrips = [
  { id: 'TRP1256', date: '07 Jun 2026', vehicle: 'TN 01 AB 1234', driver: 'Arun', route: 'Coimbatore → Chennai', load: 'Steel Coils 12 MT', status: 'In Transit', eta: '4.2 Hrs' },
  { id: 'TRP1255', date: '07 Jun 2026', vehicle: 'TN 02 CD 5678', driver: 'Kumar', route: 'Bangalore → Coimbatore', load: 'Machinery 8 MT', status: 'In Transit', eta: '5.1 Hrs' },
  { id: 'TRP1254', date: '07 Jun 2026', vehicle: 'TN 03 EF 9012', driver: 'Ramesh', route: 'Hyderabad → Chennai', load: 'Cement Bags 20 MT', status: 'In Transit', eta: '6.3 Hrs' },
  { id: 'TRP1253', date: '07 Jun 2026', vehicle: 'TN 04 GH 3456', driver: 'Suresh', route: 'Mumbai → Coimbatore', load: 'FMCG Goods 10 MT', status: 'In Transit', eta: '7.0 Hrs' },
  { id: 'TRP1252', date: '07 Jun 2026', vehicle: 'TN 05 IJ 7890', driver: 'Vijay', route: 'Coimbatore → Madurai', load: 'Tiles 15 MT', status: 'In Transit', eta: '3.5 Hrs' },
];
const alerts = [
  { label: 'Delayed Trips', value: '5 Trips', color: 'text-red-500' },
  { label: 'Loading Pending', value: '8 Trips', color: 'text-orange-500' },
  { label: 'Unloading Pending', value: '7 Trips', color: 'text-yellow-600' },
  { label: 'Breakdown Vehicles', value: '2 Vehicles', color: 'text-red-500' },
  { label: 'Driver On Duty > 12 Hrs', value: '3 Drivers', color: 'text-orange-500' },
];
const tasks = [
  { label: 'Permit Expiry', sub: '3 Vehicles', date: '8 Jun 2026' },
  { label: 'Insurance Expiry', sub: '2 Vehicles', date: '12 Jun 2026' },
  { label: 'FC Due Date', sub: '1 Vehicle', date: '15 Jun 2026' },
  { label: 'Service Due', sub: '4 Vehicles', date: '10 Jun 2026' },
];
const loadingPoints = [
  { location: 'Coimbatore', trips: 3, vehicle: 'TN 09 KL 1122', time: '2.5 Hrs' },
  { location: 'Bangalore', trips: 2, vehicle: 'TN 02 CD 5678', time: '3.0 Hrs' },
  { location: 'Chennai', trips: 2, vehicle: 'TN 11 MN 2233', time: '1.2 Hrs' },
  { location: 'Mumbai', trips: 1, vehicle: 'TN 22 OP 3344', time: '4.5 Hrs' },
];
const unloadingPoints = [
  { location: 'Chennai', trips: 3, vehicle: 'TN 01 AB 1234', time: '3.2 Hrs' },
  { location: 'Coimbatore', trips: 2, vehicle: 'TN 03 EF 9012', time: '2.0 Hrs' },
  { location: 'Madurai', trips: 1, vehicle: 'TN 05 IJ 7890', time: '1.5 Hrs' },
  { location: 'Hyderabad', trips: 1, vehicle: 'TN 07 QR 4455', time: '6.0 Hrs' },
];
const delayed = [
  { id: 'TRP1244', route: 'Bangalore → Chennai', delay: '6.5 Hrs' },
  { id: 'TRP1241', route: 'Mumbai → Coimbatore', delay: '5.0 Hrs' },
  { id: 'TRP1238', route: 'Hyderabad → Chennai', delay: '4.2 Hrs' },
  { id: 'TRP1237', route: 'Coimbatore → Madurai', delay: '3.8 Hrs' },
  { id: 'TRP1233', route: 'Chennai → Bangalore', delay: '3.0 Hrs' },
];

const statusColor: Record<string, string> = {
  'In Transit': 'bg-blue-100 text-blue-700',
  'Loading': 'bg-yellow-100 text-yellow-700',
  'Unloading': 'bg-purple-100 text-purple-700',
};

export default function OperationsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Operations" breadcrumbs={[{ label: 'Operations' }]} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stat Cards */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Active Trips', value: '35', color: 'text-blue-600', icon: '🚛' },
            { label: 'Loading Pending', value: '8', color: 'text-yellow-600', icon: '📦' },
            { label: 'In Transit', value: '20', color: 'text-blue-600', icon: '🚚' },
            { label: 'Unloading Pending', value: '7', color: 'text-purple-600', icon: '📤' },
            { label: 'Completed Today', value: '12', color: 'text-green-600', icon: '✅' },
            { label: 'Delayed Trips', value: '5', color: 'text-red-600', icon: '⏰' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400">{c.label}</p>
              <p className={`text-[22px] font-bold ${c.color} mt-1`}>{c.value}</p>
              <a href="#" className="text-[10px] text-blue-500">View Details →</a>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {/* Trip Status */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Trip Status Overview</h3>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={tripStatus} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value">
                    {tripStatus.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-1 mt-2">
                {tripStatus.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-gray-500">{d.name}</span>
                    </div>
                    <span className="font-semibold">{d.value} ({d.pct})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* By Location */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Trips by Location (In Transit)</h3>
            <table className="w-full text-[11px]">
              <thead><tr className="text-gray-400 border-b border-gray-100">
                <th className="text-left pb-2">Location</th><th className="text-right pb-2">Trips</th><th className="text-right pb-2">Vehicles</th><th className="text-right pb-2">ETA (Avg)</th>
              </tr></thead>
              <tbody>{byLocation.map(r => (
                <tr key={r.location} className="border-b border-gray-50">
                  <td className="py-1.5 text-gray-600">{r.location}</td>
                  <td className="py-1.5 text-right">{r.trips}</td>
                  <td className="py-1.5 text-right">{r.vehicles}</td>
                  <td className="py-1.5 text-right text-blue-600">{r.eta}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>

          {/* Live Tracking placeholder */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-700">Live Trip Tracking</h3>
              <a href="#" className="text-[10px] text-blue-600">View All</a>
            </div>
            <div className="h-36 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center text-gray-400 text-xs">
              🗺️ Live Map View
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-700">Critical Alerts</h3>
              <a href="#" className="text-[10px] text-blue-600">View All</a>
            </div>
            <div className="space-y-2 mb-4">
              {alerts.map(a => (
                <div key={a.label} className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-500">⚠️ {a.label}</span>
                  <span className={`text-[11px] font-semibold ${a.color}`}>{a.value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[12px] font-semibold text-gray-700">Upcoming Tasks</h3>
              <a href="#" className="text-[10px] text-blue-600">View All</a>
            </div>
            {tasks.map(t => (
              <div key={t.label} className="flex justify-between items-center mb-1.5">
                <div>
                  <span className="text-[11px] text-gray-600">📅 {t.label}</span>
                  <span className="text-[10px] text-gray-400 ml-1">({t.sub})</span>
                </div>
                <span className="text-[10px] text-blue-600">{t.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Trips Table */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-gray-700">Active Trips</h3>
            <a href="/trips" className="text-[10px] text-blue-600">View All</a>
          </div>
          <table className="w-full text-[11px]">
            <thead><tr className="text-gray-400 border-b border-gray-100">
              <th className="text-left pb-2">Trip ID</th><th className="text-left pb-2">Date</th><th className="text-left pb-2">Vehicle No.</th>
              <th className="text-left pb-2">Driver</th><th className="text-left pb-2">Route</th><th className="text-left pb-2">Load</th>
              <th className="text-left pb-2">Status</th><th className="text-left pb-2">ETA</th><th className="text-left pb-2">Actions</th>
            </tr></thead>
            <tbody>{activeTrips.map(t => (
              <tr key={t.id} className="border-b border-gray-50">
                <td className="py-1.5 text-blue-600 font-medium">{t.id}</td>
                <td className="py-1.5 text-gray-500">{t.date}</td>
                <td className="py-1.5 text-gray-600">{t.vehicle}</td>
                <td className="py-1.5 text-gray-600">{t.driver}</td>
                <td className="py-1.5 text-gray-600">{t.route}</td>
                <td className="py-1.5 text-gray-500">{t.load}</td>
                <td className="py-1.5"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor[t.status] || 'bg-gray-100 text-gray-600'}`}>{t.status}</span></td>
                <td className="py-1.5 text-blue-600">{t.eta}</td>
                <td className="py-1.5"><Eye size={13} className="text-gray-400 cursor-pointer" /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[12px] font-semibold text-gray-700">Loading Points (Pending)</h3>
              <a href="#" className="text-[10px] text-blue-600">View All</a>
            </div>
            <table className="w-full text-[11px]">
              <thead><tr className="text-gray-400 border-b border-gray-100"><th className="text-left pb-2">Location</th><th className="text-right pb-2">Trips</th><th className="text-left pb-2">Vehicle No.</th><th className="text-right pb-2">Time</th></tr></thead>
              <tbody>{loadingPoints.map(r => (<tr key={r.location} className="border-b border-gray-50"><td className="py-1.5 text-gray-600">{r.location}</td><td className="py-1.5 text-right">{r.trips}</td><td className="py-1.5 text-gray-500">{r.vehicle}</td><td className="py-1.5 text-right text-blue-600">{r.time}</td></tr>))}</tbody>
            </table>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[12px] font-semibold text-gray-700">Unloading Points (Pending)</h3>
              <a href="#" className="text-[10px] text-blue-600">View All</a>
            </div>
            <table className="w-full text-[11px]">
              <thead><tr className="text-gray-400 border-b border-gray-100"><th className="text-left pb-2">Location</th><th className="text-right pb-2">Trips</th><th className="text-left pb-2">Vehicle No.</th><th className="text-right pb-2">Time</th></tr></thead>
              <tbody>{unloadingPoints.map(r => (<tr key={r.location} className="border-b border-gray-50"><td className="py-1.5 text-gray-600">{r.location}</td><td className="py-1.5 text-right">{r.trips}</td><td className="py-1.5 text-gray-500">{r.vehicle}</td><td className="py-1.5 text-right text-blue-600">{r.time}</td></tr>))}</tbody>
            </table>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[12px] font-semibold text-gray-700">Top Delayed Trips</h3>
              <a href="#" className="text-[10px] text-blue-600">View All</a>
            </div>
            <table className="w-full text-[11px]">
              <thead><tr className="text-gray-400 border-b border-gray-100"><th className="text-left pb-2">Trip ID</th><th className="text-left pb-2">Route</th><th className="text-right pb-2">Delay</th></tr></thead>
              <tbody>{delayed.map(r => (<tr key={r.id} className="border-b border-gray-50"><td className="py-1.5 text-blue-600">{r.id}</td><td className="py-1.5 text-gray-500">{r.route}</td><td className="py-1.5 text-right text-red-500 font-semibold">{r.delay}</td></tr>))}</tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            {[{ label: 'Create New Trip', icon: '➕', color: 'text-green-600' }, { label: 'Trip Planning', icon: '📅', color: 'text-blue-600' }, { label: 'Add Vehicle', icon: '🚛', color: 'text-purple-600' }, { label: 'Add Driver', icon: '👷', color: 'text-orange-600' }].map(a => (
              <button key={a.label} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-[12px]">
                <span>{a.icon}</span><span className={a.color}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

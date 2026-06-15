'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Topbar from '@/components/layout/Topbar';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Eye, Pencil, Trash2, MoreHorizontal, Plus, Search, Printer, X } from 'lucide-react';

const MOCK_TRIPS = [
  { id: 'TRP1256', date: '07 Jun 2026', vehicle: 'TN 01 AB 1234', driver: 'Arun', route: 'Coimbatore → Chennai', loadType: 'Steel Coils', load: '12 MT', status: 'In Transit', eta: '4.2 Hrs' },
  { id: 'TRP1255', date: '07 Jun 2026', vehicle: 'TN 02 CD 5678', driver: 'Kumar', route: 'Bangalore → Coimbatore', loadType: 'Machinery', load: '8 MT', status: 'In Transit', eta: '5.1 Hrs' },
  { id: 'TRP1254', date: '07 Jun 2026', vehicle: 'TN 03 EF 9012', driver: 'Ramesh', route: 'Hyderabad → Chennai', loadType: 'Cement Bags', load: '20 MT', status: 'Unloading', eta: '1.3 Hrs' },
  { id: 'TRP1253', date: '07 Jun 2026', vehicle: 'TN 04 GH 3456', driver: 'Suresh', route: 'Mumbai → Coimbatore', loadType: 'FMCG Goods', load: '10 MT', status: 'Loading', eta: '2.0 Hrs' },
  { id: 'TRP1252', date: '07 Jun 2026', vehicle: 'TN 05 IJ 7890', driver: 'Vijay', route: 'Coimbatore → Madurai', loadType: 'Tiles', load: '15 MT', status: 'In Transit', eta: '3.5 Hrs' },
  { id: 'TRP1251', date: '06 Jun 2026', vehicle: 'TN 06 KL 1122', driver: 'Manikandan', route: 'Chennai → Bangalore', loadType: 'Auto Parts', load: '9 MT', status: 'Completed', eta: 'Completed' },
  { id: 'TRP1250', date: '06 Jun 2026', vehicle: 'TN 07 MN 2233', driver: 'Prakash', route: 'Coimbatore → Trichy', loadType: 'Chemicals', load: '14 MT', status: 'Completed', eta: 'Completed' },
  { id: 'TRP1249', date: '06 Jun 2026', vehicle: 'TN 08 OP 3344', driver: 'Senthil', route: 'Madurai → Coimbatore', loadType: 'Textile Rolls', load: '7 MT', status: 'Completed', eta: 'Completed' },
  { id: 'TRP1248', date: '05 Jun 2026', vehicle: 'TN 09 OR 4455', driver: 'Murugan', route: 'Bangalore → Hyderabad', loadType: 'Electronics', load: '6 MT', status: 'Delayed', eta: '2.1 Hrs Late' },
  { id: 'TRP1247', date: '05 Jun 2026', vehicle: 'TN 10 ST 5566', driver: 'Saravanan', route: 'Chennai → Coimbatore', loadType: 'Paper Rolls', load: '11 MT', status: 'Delayed', eta: '1.4 Hrs Late' },
];
const tripStatusData = [
  { name: 'In Transit', value: 35, pct: '28%', color: '#3b82f6' },
  { name: 'Loading', value: 8, pct: '6%', color: '#f59e0b' },
  { name: 'Unloading', value: 7, pct: '6%', color: '#8b5cf6' },
  { name: 'Completed', value: 90, pct: '72%', color: '#10b981' },
  { name: 'Delayed', value: 5, pct: '4%', color: '#ef4444' },
];
const statusColor: Record<string, string> = {
  'In Transit': 'bg-blue-100 text-blue-700',
  'Loading': 'bg-yellow-100 text-yellow-700',
  'Unloading': 'bg-purple-100 text-purple-700',
  'Completed': 'bg-green-100 text-green-700',
  'Delayed': 'bg-red-100 text-red-700',
};

const VEHICLES = ['TN 01 AB 1234','TN 02 CD 5678','TN 03 EF 9012','TN 04 GH 3456','TN 05 IJ 7890'];
const DRIVERS = ['Arun','Kumar','Ramesh','Suresh','Vijay','Manikandan','Prakash'];
const CUSTOMERS = ['ABC Steels Pvt Ltd','Kaveri Industries','Sri Venkateshwara Traders','Global Enterprises','Sakthi Traders'];

export default function TripsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showModal, setShowModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [form, setForm] = useState({ vehicle: '', driver: '', customer: '', from: '', to: '', loadType: '', load: '', date: '07 Jun 2026' });

  const filtered = MOCK_TRIPS.filter(t =>
    (statusFilter === 'All Status' || t.status === statusFilter) &&
    (t.id.toLowerCase().includes(search.toLowerCase()) || t.driver.toLowerCase().includes(search.toLowerCase()) || t.vehicle.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Trips" breadcrumbs={[{ label: 'Trips' }]} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stat Cards */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Total Trips', value: '125', sub: 'This Month', color: 'text-blue-600' },
            { label: 'Active Trips', value: '35', sub: 'In Progress', color: 'text-green-600' },
            { label: 'Completed Trips', value: '90', sub: 'This Month', color: 'text-green-600' },
            { label: 'Delayed Trips', value: '5', sub: 'Requires Attention', color: 'text-red-600' },
            { label: 'Total Distance', value: '58,450 KM', sub: 'This Month', color: 'text-blue-600' },
            { label: 'Total Freight', value: '₹ 85,00,000', sub: 'This Month', color: 'text-green-600' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400">{c.label}</p>
              <p className={`text-[18px] font-bold ${c.color} mt-1`}>{c.value}</p>
              <p className="text-[10px] text-gray-400">{c.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {/* Trips Table */}
          <div className="col-span-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold text-gray-700">All Trips</h3>
              <div className="flex items-center gap-2">
                <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Trip ID, Vehicle, Driver, Route..." className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] w-64 focus:outline-none focus:border-blue-400" /></div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] text-gray-600">
                  <option>All Status</option><option>In Transit</option><option>Loading</option><option>Unloading</option><option>Completed</option><option>Delayed</option>
                </select>
                <button onClick={() => { setSelectedTrip(null); setShowModal(true); }} className="flex items-center gap-1.5 bg-[#1a56db] text-white px-3 py-1.5 rounded-lg text-[11px] font-medium hover:bg-blue-700">
                  <Plus size={12} /> Create New Trip
                </button>
              </div>
            </div>
            <table className="w-full text-[11px]">
              <thead><tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="text-left px-2 py-2">Trip ID</th><th className="text-left px-2 py-2">Date</th><th className="text-left px-2 py-2">Vehicle No.</th>
                <th className="text-left px-2 py-2">Driver</th><th className="text-left px-2 py-2">Route</th><th className="text-left px-2 py-2">Load Type</th>
                <th className="text-left px-2 py-2">Load</th><th className="text-left px-2 py-2">Status</th><th className="text-left px-2 py-2">ETA</th><th className="text-left px-2 py-2">Actions</th>
              </tr></thead>
              <tbody>{filtered.map(t => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-2 py-2 text-blue-600 font-medium">{t.id}</td>
                  <td className="px-2 py-2 text-gray-500">{t.date}</td>
                  <td className="px-2 py-2 text-gray-600">{t.vehicle}</td>
                  <td className="px-2 py-2 text-gray-600">{t.driver}</td>
                  <td className="px-2 py-2 text-gray-600">{t.route}</td>
                  <td className="px-2 py-2 text-gray-500">{t.loadType}</td>
                  <td className="px-2 py-2 text-gray-500">{t.load}</td>
                  <td className="px-2 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor[t.status]}`}>{t.status}</span></td>
                  <td className={`px-2 py-2 text-[10px] font-medium ${t.status === 'Delayed' ? 'text-red-500' : 'text-blue-500'}`}>{t.eta}</td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1">
                      <button className="text-gray-400 hover:text-blue-600"><Eye size={12} /></button>
                      <button className="text-gray-400 hover:text-green-600"><Pencil size={12} /></button>
                      <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
            <div className="flex items-center justify-between mt-3">
              <p className="text-[11px] text-gray-400">Showing 1 to 10 of 125 entries</p>
              <div className="flex gap-1">
                {[1,2,3,4,5,'...',13].map((p,i) => (
                  <button key={i} className={`w-6 h-6 text-[10px] rounded ${p===1?'bg-blue-600 text-white':'text-gray-500 hover:bg-gray-100'}`}>{p}</button>
                ))}
              </div>
            </div>

            {/* Trip Details Panel */}
            <div className="mt-4 p-4 border border-gray-100 rounded-xl bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-semibold text-gray-700">Trip Details – TRP1256</h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full font-medium">In Transit</span>
                </div>
                <button className="flex items-center gap-1 text-[11px] text-gray-500 border border-gray-200 px-2 py-1 rounded"><Printer size={11}/> Print</button>
              </div>
              <div className="flex gap-3 text-[11px] mb-3 border-b border-gray-200 pb-2">
                {['Overview','Route & KM','Loading','Unloading','Expenses','Documents','History'].map(t => (
                  <button key={t} className={`pb-1 ${t==='Overview'?'text-blue-600 border-b-2 border-blue-600 font-medium':'text-gray-500'}`}>{t}</button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div><h4 className="text-[11px] font-semibold text-gray-600 mb-1.5">Basic Information</h4>
                  {[['Trip ID','TRP1256'],['Date','07 Jun 2026'],['Vehicle No.','TN 01 AB 1234'],['Driver','Arun'],['Helper','Selvam'],['Customer','ABC Steels Pvt Ltd'],['Phone','98450 12345'],['Status','In Transit']].map(([k,v])=>(
                    <div key={k} className="flex gap-1 mb-0.5"><span className="text-gray-400 w-24">{k}</span><span>: {v}</span></div>
                  ))}
                </div>
                <div><h4 className="text-[11px] font-semibold text-gray-600 mb-1.5">Route Information</h4>
                  {[['From','Coimbatore'],['To','Chennai'],['Distance','496 KM'],['Start Time','07 Jun 2026 06:00 AM'],['ETA','07 Jun 2026 10:30 PM']].map(([k,v])=>(
                    <div key={k} className="flex gap-1 mb-0.5"><span className="text-gray-400 w-20">{k}</span><span>: {v}</span></div>
                  ))}
                </div>
                <div><h4 className="text-[11px] font-semibold text-gray-600 mb-1.5">Financial Summary</h4>
                  {[['Freight Amount','₹ 65,000'],['Advance Received','₹ 20,000'],['Expenses','₹ 18,750'],['Balance Amount','₹ 26,250'],['Expected Profit','₹ 20,000']].map(([k,v])=>(
                    <div key={k} className="flex justify-between mb-0.5"><span className="text-gray-400">{k}</span><span className={k==='Expected Profit'?'text-green-600 font-semibold':'font-medium'}>{v}</span></div>
                  ))}
                </div>
                <div><h4 className="text-[11px] font-semibold text-gray-600 mb-1.5">Quick Actions</h4>
                  {['Create New Trip','Trip Planning','Assign Driver','Trip Report'].map(a=>(
                    <button key={a} className="block w-full text-left text-blue-600 text-[11px] mb-1.5 hover:underline">+ {a}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Trip Status Summary</h3>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart><Pie data={tripStatusData} cx="50%" cy="50%" innerRadius={32} outerRadius={50} dataKey="value">{tripStatusData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {tripStatusData.map(d=>(
                  <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:d.color}}/>
                    <span className="text-gray-500 flex-1">{d.name}</span>
                    <span className="font-semibold">{d.value} ({d.pct})</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[12px] font-semibold text-gray-700 mb-3">Filters</h3>
              <div className="space-y-2">
                <div><label className="text-[10px] text-gray-500">Date From</label><input type="text" defaultValue="01/06/2026" className="w-full border border-gray-200 rounded px-2 py-1 text-[11px] mt-0.5"/></div>
                <div><label className="text-[10px] text-gray-500">Date To</label><input type="text" defaultValue="07/06/2026" className="w-full border border-gray-200 rounded px-2 py-1 text-[11px] mt-0.5"/></div>
                <div><label className="text-[10px] text-gray-500">Status</label><select className="w-full border border-gray-200 rounded px-2 py-1 text-[11px] mt-0.5"><option>All Status</option></select></div>
                <div><label className="text-[10px] text-gray-500">Driver</label><select className="w-full border border-gray-200 rounded px-2 py-1 text-[11px] mt-0.5"><option>All Drivers</option></select></div>
                <div><label className="text-[10px] text-gray-500">Vehicle</label><select className="w-full border border-gray-200 rounded px-2 py-1 text-[11px] mt-0.5"><option>All Vehicles</option></select></div>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 bg-blue-600 text-white text-[11px] py-1.5 rounded-lg">Apply Filters</button>
                  <button className="flex-1 border border-gray-200 text-[11px] py-1.5 rounded-lg text-gray-500">Reset</button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[12px] font-semibold text-gray-700 mb-2">Quick Actions</h3>
              {[{label:'Create New Trip',color:'text-green-600'},{label:'Trip Planning',color:'text-blue-600'},{label:'Assign Driver',color:'text-purple-600'},{label:'Trip Report',color:'text-orange-600'}].map(a=>(
                <button key={a.label} className={`flex items-center gap-2 w-full text-left text-[11px] ${a.color} mb-2 hover:underline`}>+ {a.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Trip Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[480px] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-bold text-gray-800">Create New Trip</h3>
              <button onClick={() => setShowModal(false)}><X size={16} className="text-gray-400"/></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Date', type: 'text', key: 'date' },
                { label: 'From Location', type: 'text', key: 'from' },
                { label: 'To Location', type: 'text', key: 'to' },
                { label: 'Load Type', type: 'text', key: 'loadType' },
                { label: 'Load (MT)', type: 'text', key: 'load' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[11px] text-gray-500 block mb-1">{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400"/>
                </div>
              ))}
              <div><label className="text-[11px] text-gray-500 block mb-1">Vehicle</label>
                <select value={form.vehicle} onChange={e => setForm({...form, vehicle: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px]">
                  <option value="">Select Vehicle</option>{VEHICLES.map(v=><option key={v}>{v}</option>)}
                </select>
              </div>
              <div><label className="text-[11px] text-gray-500 block mb-1">Driver</label>
                <select value={form.driver} onChange={e => setForm({...form, driver: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px]">
                  <option value="">Select Driver</option>{DRIVERS.map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-span-2"><label className="text-[11px] text-gray-500 block mb-1">Customer</label>
                <select value={form.customer} onChange={e => setForm({...form, customer: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px]">
                  <option value="">Select Customer</option>{CUSTOMERS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-[#1a56db] text-white py-2 rounded-lg text-[12px] font-medium hover:bg-blue-700">Create Trip</button>
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-[12px] hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

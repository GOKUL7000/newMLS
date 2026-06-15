'use client';
import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Pencil, MoreHorizontal, Plus, Search, X } from 'lucide-react';

const VEHICLES = [
  { no: 'TN 01 AB 1234', type: 'Trailer', model: 'Ashok Leyland', year: 2021, rc: 'TN01AB1234', insurance: '15 Aug 2026', permit: '31 Dec 2026', fc: '10 Nov 2026', status: 'Running', location: 'Chennai' },
  { no: 'TN 02 CD 5678', type: 'Truck', model: 'Bharat Benz', year: 2020, rc: 'TN02CD5678', insurance: '10 Sep 2026', permit: '05 Dec 2026', fc: '31 Dec 2026', status: 'Running', location: 'Coimbatore' },
  { no: 'TN 03 EF 9012', type: 'Trailer', model: 'Ashok Leyland', year: 2021, rc: 'TN03EF9012', insurance: '22 Jul 2026', permit: '18 Oct 2026', fc: '31 Dec 2026', status: 'Running', location: 'Hyderabad' },
  { no: 'TN 04 GH 3456', type: 'Truck', model: 'Eicher', year: 2019, rc: 'TN04GH3456', insurance: '05 Jun 2026', permit: '31 Dec 2026', fc: '22 May 2026', status: 'Maintenance', location: 'Workshop' },
  { no: 'TN 05 IJ 7890', type: 'Trailer', model: 'Bharat Benz', year: 2021, rc: 'TN05IJ7890', insurance: '18 Oct 2026', permit: '31 Dec 2026', fc: '12 Sep 2026', status: 'Running', location: 'Bangalore' },
  { no: 'TN 06 KL 1122', type: 'Truck', model: 'Tata Prima', year: 2018, rc: 'TN06KL1122', insurance: '20 Apr 2026', permit: '30 Sep 2026', fc: '15 Apr 2026', status: 'Maintenance', location: 'Workshop' },
  { no: 'TN 07 MN 2233', type: 'Trailer', model: 'Ashok Leyland', year: 2020, rc: 'TN07MN2233', insurance: '11 Nov 2026', permit: '31 Dec 2026', fc: '30 Oct 2026', status: 'Running', location: 'Madurai' },
  { no: 'TN 08 OP 3344', type: 'Truck', model: 'Eicher', year: 2019, rc: 'TN08OP3344', insurance: '25 May 2026', permit: '10 May 2026', fc: '10 May 2026', status: 'Breakdown', location: 'Workshop' },
  { no: 'TN 09 QR 4455', type: 'Trailer', model: 'Bharat Benz', year: 2022, rc: 'TN09QR4455', insurance: '12 Feb 2027', permit: '31 Jan 2027', fc: '20 Jan 2027', status: 'Running', location: 'Chennai' },
  { no: 'TN 10 ST 5566', type: 'Truck', model: 'Tata Prima', year: 2019, rc: 'TN10ST5566', insurance: '30 Mar 2026', permit: '30 Sep 2026', fc: '25 Mar 2026', status: 'Available', location: 'Chennai' },
];
const fleetStatus = [
  { name: 'Running', value: 35, pct: '70%', color: '#10b981' },
  { name: 'Available', value: 10, pct: '20%', color: '#3b82f6' },
  { name: 'Workshop', value: 3, pct: '6%', color: '#f59e0b' },
  { name: 'Breakdown', value: 2, pct: '4%', color: '#ef4444' },
  { name: 'Inactive', value: 0, pct: '0%', color: '#6b7280' },
];
const byType = [
  { name: 'Trailer', value: 25, color: '#3b82f6' },
  { name: 'Truck', value: 20, color: '#10b981' },
  { name: 'Tanker', value: 3, color: '#f59e0b' },
  { name: 'Tipper', value: 2, color: '#8b5cf6' },
];
const byBrand = [
  { name: 'Ashok Leyland', value: 20 },
  { name: 'Bharat Benz', value: 12 },
  { name: 'Tata', value: 8 },
  { name: 'Eicher', value: 6 },
  { name: 'Others', value: 4 },
];
const services = [
  { vehicle: 'TN 04 GH 3456', type: 'Engine Service', due: '12 Jun 2026', km: '1,20,000', current: '1,05,230', days: '5 Days', status: 'Due Soon' },
  { vehicle: 'TN 06 KL 1122', type: 'Oil Change', due: '15 Jun 2026', km: '80,000', current: '75,120', days: '8 Days', status: 'Due Soon' },
  { vehicle: 'TN 08 OP 3344', type: 'Full Service', due: '18 Jun 2026', km: '1,00,000', current: '92,350', days: '11 Days', status: 'Due Soon' },
  { vehicle: 'TN 10 ST 5566', type: 'Brakes Check', due: '20 Jun 2026', km: '70,000', current: '62,480', days: '13 Days', status: 'Due Soon' },
];
const statusColor: Record<string, string> = {
  Running: 'bg-green-100 text-green-700',
  Available: 'bg-blue-100 text-blue-700',
  Maintenance: 'bg-yellow-100 text-yellow-700',
  Breakdown: 'bg-red-100 text-red-700',
  Inactive: 'bg-gray-100 text-gray-600',
};

export default function FleetPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ no: '', type: 'Truck', model: '', year: '', rc: '', insurance: '', permit: '', fc: '' });

  const filtered = VEHICLES.filter(v =>
    v.no.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase()) ||
    v.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Fleet / Trucks" breadcrumbs={[{ label: 'Fleet / Trucks' }]} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stat Cards */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Total Trucks', value: '50', sub: 'All Vehicles', color: 'text-blue-600' },
            { label: 'Running', value: '35', sub: '70% of Total', color: 'text-green-600' },
            { label: 'Available', value: '10', sub: '20% of Total', color: 'text-blue-500' },
            { label: 'Workshop', value: '3', sub: '6% of Total', color: 'text-yellow-600' },
            { label: 'Breakdown', value: '2', sub: '4% of Total', color: 'text-red-600' },
            { label: 'Inactive', value: '0', sub: '0% of Total', color: 'text-gray-500' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400">{c.label}</p>
              <p className={`text-[22px] font-bold ${c.color} mt-1`}>{c.value}</p>
              <p className="text-[10px] text-gray-400">{c.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {/* Vehicles Table */}
          <div className="col-span-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-700">All Vehicles</h3>
              <div className="flex items-center gap-2">
                <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Vehicle No, Type, Model..." className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] w-56 focus:outline-none"/></div>
                <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] text-gray-600"><option>All Status</option><option>Running</option><option>Available</option><option>Workshop</option><option>Breakdown</option></select>
                <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] text-gray-600"><option>All Types</option><option>Truck</option><option>Trailer</option><option>Tanker</option></select>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-[#1a56db] text-white px-3 py-1.5 rounded-lg text-[11px] font-medium hover:bg-blue-700"><Plus size={12}/> Add Vehicle</button>
              </div>
            </div>
            <table className="w-full text-[11px]">
              <thead><tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="text-left px-2 py-2">Vehicle No.</th><th className="text-left px-2 py-2">Type</th><th className="text-left px-2 py-2">Model</th>
                <th className="text-left px-2 py-2">Year</th><th className="text-left px-2 py-2">RC No</th><th className="text-left px-2 py-2">Insurance Valid Up To</th>
                <th className="text-left px-2 py-2">Permit Valid Up To</th><th className="text-left px-2 py-2">FC Valid Up To</th>
                <th className="text-left px-2 py-2">Status</th><th className="text-left px-2 py-2">Location</th><th className="text-left px-2 py-2">Actions</th>
              </tr></thead>
              <tbody>{filtered.map(v => {
                const isInsuranceExpired = v.insurance.includes('Apr') || v.insurance.includes('Mar') || v.insurance.includes('May');
                return (
                  <tr key={v.no} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-2 py-2 text-blue-600 font-medium">{v.no}</td>
                    <td className="px-2 py-2 text-gray-600">{v.type}</td>
                    <td className="px-2 py-2 text-gray-600">{v.model}</td>
                    <td className="px-2 py-2 text-gray-500">{v.year}</td>
                    <td className="px-2 py-2 text-gray-500">{v.rc}</td>
                    <td className={`px-2 py-2 ${isInsuranceExpired ? 'text-red-500 font-medium' : 'text-gray-500'}`}>{v.insurance}</td>
                    <td className="px-2 py-2 text-gray-500">{v.permit}</td>
                    <td className={`px-2 py-2 ${v.fc.includes('Apr') || v.fc.includes('Mar') || v.fc.includes('May') ? 'text-red-500 font-medium' : 'text-gray-500'}`}>{v.fc}</td>
                    <td className="px-2 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor[v.status]}`}>{v.status}</span></td>
                    <td className="px-2 py-2 text-gray-500">{v.location}</td>
                    <td className="px-2 py-2">
                      <div className="flex gap-1"><button className="text-gray-400 hover:text-blue-600"><Eye size={12}/></button><button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={12}/></button></div>
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
            <div className="flex items-center justify-between mt-3">
              <p className="text-[11px] text-gray-400">Showing 1 to 10 of 50 entries</p>
              <div className="flex gap-1">{[1,2,3,'.',4,5].map((p,i)=><button key={i} className={`w-6 h-6 text-[10px] rounded ${p===1?'bg-blue-600 text-white':'text-gray-500 hover:bg-gray-100'}`}>{p}</button>)}</div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Fleet Status Overview</h3>
              <ResponsiveContainer width="100%" height={110}><PieChart><Pie data={fleetStatus} cx="50%" cy="50%" innerRadius={30} outerRadius={48} dataKey="value">{fleetStatus.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart></ResponsiveContainer>
              <div className="space-y-1 mt-1">{fleetStatus.map(d=>(<div key={d.name} className="flex items-center gap-1.5 text-[11px]"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:d.color}}/><span className="flex-1 text-gray-500">{d.name}</span><span className="font-semibold">{d.value} ({d.pct})</span></div>))}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[12px] font-semibold text-gray-700 mb-2">Document Expiry Summary</h3>
              {[{label:'Insurance Expiring in 30 Days',value:'4 Vehicles',color:'text-orange-500'},{label:'Permit Expiring in 30 Days',value:'3 Vehicles',color:'text-orange-500'},{label:'FC Expiring in 30 Days',value:'5 Vehicles',color:'text-yellow-600'},{label:'RC Expired',value:'2 Vehicles',color:'text-red-500'}].map(d=>(
                <div key={d.label} className="flex justify-between items-center mb-1.5"><span className="text-[10px] text-gray-500">⚠️ {d.label}</span><span className={`text-[10px] font-semibold ${d.color}`}>{d.value}</span></div>
              ))}
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[12px] font-semibold text-gray-700 mb-2">Quick Actions</h3>
              {[{label:'Add New Vehicle',icon:'➕'},{label:'Vehicle Documents',icon:'📄'},{label:'Assign Driver',icon:'👷'},{label:'Maintenance Entry',icon:'🔧'},{label:'Service History',icon:'📋'},{label:'Vehicle Report',icon:'📊'}].map(a=>(
                <button key={a.label} className="flex items-center gap-2 w-full text-left text-[11px] text-blue-600 mb-1.5 hover:underline">{a.icon} {a.label}</button>
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
            <ResponsiveContainer width="100%" height={100}><BarChart data={byBrand}><XAxis dataKey="name" tick={{fontSize:9}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip/><Bar dataKey="value" fill="#3b82f6" radius={[2,2,0,0]}/></BarChart></ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Age Analysis of Fleet</h3>
            <div className="flex items-center gap-3">
              <ResponsiveContainer width={100} height={100}><PieChart><Pie data={[{name:'0-2Y',value:12,color:'#10b981'},{name:'2-5Y',value:20,color:'#3b82f6'},{name:'5-10Y',value:14,color:'#f59e0b'},{name:'>10Y',value:4,color:'#ef4444'}]} cx="50%" cy="50%" innerRadius={25} outerRadius={42} dataKey="value">{[{color:'#10b981'},{color:'#3b82f6'},{color:'#f59e0b'},{color:'#ef4444'}].map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart></ResponsiveContainer>
              <div className="space-y-1.5">{[{name:'0-2 Years',value:12,pct:'24%',color:'#10b981'},{name:'2-5 Years',value:20,pct:'40%',color:'#3b82f6'},{name:'5-10 Years',value:14,pct:'28%',color:'#f59e0b'},{name:'Above 10 Years',value:4,pct:'8%',color:'#ef4444'}].map(d=>(<div key={d.name} className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:d.color}}/><span className="text-[11px] text-gray-500 flex-1">{d.name}</span><span className="text-[11px] font-semibold">{d.value} ({d.pct})</span></div>))}</div>
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

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[460px] p-5">
            <div className="flex items-center justify-between mb-4"><h3 className="text-[14px] font-bold text-gray-800">Add New Vehicle</h3><button onClick={()=>setShowModal(false)}><X size={16} className="text-gray-400"/></button></div>
            <div className="grid grid-cols-2 gap-3">
              {[['Vehicle No.','no','text'],['Type','type','select'],['Model','model','text'],['Year','year','text'],['RC No.','rc','text'],['Insurance Valid Up To','insurance','date'],['Permit Valid Up To','permit','date'],['FC Valid Up To','fc','date']].map(([l,k,t])=>(
                <div key={k as string}>
                  <label className="text-[11px] text-gray-500 block mb-1">{l}</label>
                  {t==='select'?<select value={(form as any)[k as string]} onChange={e=>setForm({...form,[k as string]:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px]"><option>Truck</option><option>Trailer</option><option>Tanker</option><option>Tipper</option></select>:<input type={t} value={(form as any)[k as string]} onChange={e=>setForm({...form,[k as string]:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400"/>}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>setShowModal(false)} className="flex-1 bg-[#1a56db] text-white py-2 rounded-lg text-[12px] font-medium">Add Vehicle</button>
              <button onClick={()=>setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-[12px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

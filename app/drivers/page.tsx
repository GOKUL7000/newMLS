'use client';
import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { Eye, Pencil, Trash2, Plus, Search, X } from 'lucide-react';

const DRIVERS = [
  { id: 'DRV-0001', name: 'Arun Kumar', mobile: '98450 12345', license: 'TN1234567890', licenseExp: '15 Aug 2027', type: 'Heavy Vehicle', experience: '8 Years', status: 'Active', trips: 145, vehicle: 'TN 01 AB 1234' },
  { id: 'DRV-0002', name: 'Kumaravel', mobile: '97501 23456', license: 'TN2345678901', licenseExp: '22 Mar 2026', type: 'Heavy Vehicle', experience: '5 Years', status: 'Active', trips: 112, vehicle: 'TN 02 CD 5678' },
  { id: 'DRV-0003', name: 'Ramesh Babu', mobile: '99402 34567', license: 'TN3456789012', licenseExp: '10 Dec 2027', type: 'Heavy Vehicle', experience: '12 Years', status: 'Active', trips: 198, vehicle: 'TN 03 EF 9012' },
  { id: 'DRV-0004', name: 'Suresh', mobile: '98433 45678', license: 'TN4567890123', licenseExp: '30 Jun 2026', type: 'Heavy Vehicle', experience: '6 Years', status: 'Active', trips: 89, vehicle: 'TN 04 GH 3456' },
  { id: 'DRV-0005', name: 'Vijayakumar', mobile: '97502 56789', license: 'TN5678901234', licenseExp: '18 Sep 2026', type: 'Heavy Vehicle', experience: '10 Years', status: 'Active', trips: 167, vehicle: 'TN 05 IJ 7890' },
  { id: 'DRV-0006', name: 'Manikandan', mobile: '96555 78901', license: 'TN6789012345', licenseExp: '05 Feb 2028', type: 'Heavy Vehicle', experience: '7 Years', status: 'Active', trips: 134, vehicle: 'TN 06 KL 1122' },
  { id: 'DRV-0007', name: 'Prakash', mobile: '98765 43210', license: 'TN7890123456', licenseExp: '14 Jul 2027', type: 'Light Vehicle', experience: '4 Years', status: 'Inactive', trips: 45, vehicle: '-' },
  { id: 'DRV-0008', name: 'Selvam', mobile: '97654 32109', license: 'TN8901234567', licenseExp: '20 Oct 2026', type: 'Heavy Vehicle', experience: '9 Years', status: 'Active', trips: 156, vehicle: 'TN 07 MN 2233' },
];
const statusColor: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-600',
  'On Leave': 'bg-yellow-100 text-yellow-700',
};

export default function DriversPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editDriver, setEditDriver] = useState<any>(null);
  const [form, setForm] = useState({ name: '', mobile: '', license: '', licenseExp: '', type: 'Heavy Vehicle', experience: '' });

  const filtered = DRIVERS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.id.toLowerCase().includes(search.toLowerCase()) ||
    d.mobile.includes(search)
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Drivers" breadcrumbs={[{ label: 'Drivers' }]} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Total Drivers', value: '48', sub: 'All Drivers', color: 'text-blue-600' },
            { label: 'Active Drivers', value: '40', sub: 'On Duty', color: 'text-green-600' },
            { label: 'Available', value: '8', sub: 'Not Assigned', color: 'text-blue-500' },
            { label: 'On Leave', value: '3', sub: 'This Week', color: 'text-yellow-600' },
            { label: 'License Expiring', value: '5', sub: 'In 30 Days', color: 'text-red-600' },
            { label: 'Avg Experience', value: '7.2 Yrs', sub: 'All Drivers', color: 'text-purple-600' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400">{c.label}</p>
              <p className={`text-[20px] font-bold ${c.color} mt-1`}>{c.value}</p>
              <p className="text-[10px] text-gray-400">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-gray-700">All Drivers</h3>
            <div className="flex items-center gap-2">
              <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Driver Name, ID, Mobile..." className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] w-64 focus:outline-none"/></div>
              <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11px]"><option>All Status</option><option>Active</option><option>Inactive</option><option>On Leave</option></select>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-[#1a56db] text-white px-3 py-1.5 rounded-lg text-[11px] font-medium hover:bg-blue-700"><Plus size={12}/> Add Driver</button>
            </div>
          </div>
          <table className="w-full text-[11px]">
            <thead><tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
              <th className="text-left px-2 py-2">Driver ID</th><th className="text-left px-2 py-2">Name</th><th className="text-left px-2 py-2">Mobile</th>
              <th className="text-left px-2 py-2">License No.</th><th className="text-left px-2 py-2">License Expiry</th><th className="text-left px-2 py-2">Type</th>
              <th className="text-left px-2 py-2">Experience</th><th className="text-left px-2 py-2">Total Trips</th><th className="text-left px-2 py-2">Vehicle</th>
              <th className="text-left px-2 py-2">Status</th><th className="text-left px-2 py-2">Actions</th>
            </tr></thead>
            <tbody>{filtered.map(d => {
              const expYear = parseInt(d.licenseExp.split(' ')[2]);
              const expMonth = d.licenseExp.split(' ')[1];
              const isExpiringSoon = expYear <= 2026;
              return (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-2 py-2 text-blue-600 font-medium">{d.id}</td>
                  <td className="px-2 py-2 font-medium text-gray-700">{d.name}</td>
                  <td className="px-2 py-2 text-gray-500">{d.mobile}</td>
                  <td className="px-2 py-2 text-gray-500">{d.license}</td>
                  <td className={`px-2 py-2 font-medium ${isExpiringSoon ? 'text-red-500' : 'text-gray-500'}`}>{d.licenseExp}</td>
                  <td className="px-2 py-2 text-gray-500">{d.type}</td>
                  <td className="px-2 py-2 text-gray-500">{d.experience}</td>
                  <td className="px-2 py-2 text-gray-600 font-medium">{d.trips}</td>
                  <td className="px-2 py-2 text-gray-500">{d.vehicle}</td>
                  <td className="px-2 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor[d.status]}`}>{d.status}</span></td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1">
                      <button className="text-gray-400 hover:text-blue-600"><Eye size={12}/></button>
                      <button onClick={() => { setEditDriver(d); setShowModal(true); }} className="text-gray-400 hover:text-green-600"><Pencil size={12}/></button>
                      <button className="text-gray-400 hover:text-red-500"><Trash2 size={12}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
          <div className="flex items-center justify-between mt-3">
            <p className="text-[11px] text-gray-400">Showing 1 to 8 of 48 entries</p>
            <div className="flex gap-1">{[1,2,3,4,5,6].map((p)=><button key={p} className={`w-6 h-6 text-[10px] rounded ${p===1?'bg-blue-600 text-white':'text-gray-500 hover:bg-gray-100'}`}>{p}</button>)}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-6 gap-3">
            {[{label:'Add New Driver',icon:'➕'},{label:'Driver Documents',icon:'📄'},{label:'Assign Vehicle',icon:'🚛'},{label:'Advance Payment',icon:'💰'},{label:'Driver Report',icon:'📊'},{label:'Activity Log',icon:'📋'}].map(a=>(
              <button key={a.label} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-[11px] text-blue-600">{a.icon} {a.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[460px] p-5">
            <div className="flex items-center justify-between mb-4"><h3 className="text-[14px] font-bold text-gray-800">{editDriver ? 'Edit Driver' : 'Add New Driver'}</h3><button onClick={()=>{setShowModal(false);setEditDriver(null);}}><X size={16} className="text-gray-400"/></button></div>
            <div className="grid grid-cols-2 gap-3">
              {[['Full Name','name','text'],['Mobile','mobile','text'],['License No.','license','text'],['License Expiry','licenseExp','text'],['Experience','experience','text']].map(([l,k,t])=>(
                <div key={k as string}><label className="text-[11px] text-gray-500 block mb-1">{l}</label><input type={t} value={(form as any)[k as string]} onChange={e=>setForm({...form,[k as string]:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400"/></div>
              ))}
              <div><label className="text-[11px] text-gray-500 block mb-1">License Type</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px]"><option>Heavy Vehicle</option><option>Light Vehicle</option></select></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>{setShowModal(false);setEditDriver(null);}} className="flex-1 bg-[#1a56db] text-white py-2 rounded-lg text-[12px] font-medium">{editDriver ? 'Update' : 'Add Driver'}</button>
              <button onClick={()=>{setShowModal(false);setEditDriver(null);}} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-[12px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

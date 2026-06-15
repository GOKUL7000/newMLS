'use client';
import { useState } from 'react';
import { Plus, Search, Eye, Edit, MapPin, Calendar } from 'lucide-react';

const trips = [
  { id: 'TRP1260', from: 'Coimbatore', to: 'Chennai', vehicle: 'TN 01 AB 1234', driver: 'Arun Kumar', loadDate: '08 Jun 2026', freight: 125000, customer: 'ABC Steels Pvt Ltd', status: 'Planned' },
  { id: 'TRP1261', from: 'Bangalore', to: 'Coimbatore', vehicle: 'TN 02 CD 5678', driver: 'Kumaravel', loadDate: '08 Jun 2026', freight: 98000, customer: 'Kaveri Industries', status: 'Planned' },
  { id: 'TRP1262', from: 'Chennai', to: 'Hyderabad', vehicle: 'TN 03 EF 9012', driver: 'Ramesh Babu', loadDate: '09 Jun 2026', freight: 145000, customer: 'Global Enterprises', status: 'Planned' },
  { id: 'TRP1263', from: 'Coimbatore', to: 'Mumbai', vehicle: 'TN 04 GH 3456', driver: 'Suresh', loadDate: '09 Jun 2026', freight: 210000, customer: 'Sri Venkateshwara Traders', status: 'Planned' },
  { id: 'TRP1264', from: 'Madurai', to: 'Bangalore', vehicle: 'TN 05 IJ 7890', driver: 'Vijayakumar', loadDate: '10 Jun 2026', freight: 88000, customer: 'Sakthi Traders', status: 'Planned' },
  { id: 'TRP1265', from: 'Coimbatore', to: 'Trichy', vehicle: 'TN 06 KL 1122', driver: 'Prakash', loadDate: '10 Jun 2026', freight: 65000, customer: 'MJM Infra', status: 'Planned' },
];

export default function TripPlanningPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const filtered = trips.filter(t => t.id.toLowerCase().includes(search.toLowerCase()) || t.customer.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-800">Trip Planning</h1><p className="text-sm text-gray-500">Dashboard / Operations / Trip Planning</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus size={15} /> Plan New Trip</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[{l:'Planned Trips',v:'6',c:'text-blue-600'},{l:'Vehicles Assigned',v:'6',c:'text-green-600'},{l:'Pending Assignment',v:'2',c:'text-orange-500'},{l:'Est. Revenue',v:'₹ 7,31,000',c:'text-purple-600'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-xl font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Planned Trips</h3>
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search trips..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-200" /></div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-500 border-b">{['Trip ID','Route','Vehicle','Driver','Load Date','Customer','Freight (₹)','Status',''].map((h,i)=><th key={i} className="text-left py-3 pr-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map((t,i)=>(
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 pr-3 text-xs text-blue-600 font-medium">{t.id}</td>
                <td className="py-3 pr-3"><div className="flex items-center gap-1 text-xs text-gray-700"><MapPin size={11} className="text-gray-400"/>{t.from} → {t.to}</div></td>
                <td className="py-3 pr-3 text-xs text-gray-600">{t.vehicle}</td>
                <td className="py-3 pr-3 text-xs text-gray-600">{t.driver}</td>
                <td className="py-3 pr-3"><div className="flex items-center gap-1 text-xs text-gray-500"><Calendar size={11}/>{t.loadDate}</div></td>
                <td className="py-3 pr-3 text-xs text-gray-700">{t.customer}</td>
                <td className="py-3 pr-3 text-xs font-medium text-gray-800">{t.freight.toLocaleString('en-IN')}</td>
                <td className="py-3 pr-3"><span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{t.status}</span></td>
                <td className="py-3"><div className="flex gap-1"><button className="p-1 hover:bg-gray-100 rounded text-gray-400"><Eye size={13}/></button><button className="p-1 hover:bg-gray-100 rounded text-gray-400"><Edit size={13}/></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Plan New Trip</h2>
            <div className="grid grid-cols-2 gap-4">
              {[['From Location','text'],['To Location','text'],['Vehicle No.','text'],['Driver','text'],['Customer','text'],['Load Date','date'],['Freight Amount (₹)','number'],['Distance (KM)','number']].map(([l,t],i)=>(
                <div key={i}><label className="text-xs text-gray-500 block mb-1">{l}</label><input type={t} placeholder={l} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"/></div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={()=>setShowModal(false)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">Save Trip</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

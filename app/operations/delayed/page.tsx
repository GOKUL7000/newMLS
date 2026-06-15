'use client';
import { useState } from 'react';
import { Search, Eye, MapPin, Clock } from 'lucide-react';

const trips = [
  { id: 'TRP1240', from: 'Coimbatore', to: 'Chennai', vehicle: 'TN 01 AB 1234', driver: 'Arun Kumar', startDate: '07 Jun 2026', customer: 'ABC Steels Pvt Ltd', freight: 125000, km: 510, status: 'Delayed' },
  { id: 'TRP1241', from: 'Bangalore', to: 'Coimbatore', vehicle: 'TN 02 CD 5678', driver: 'Kumaravel', startDate: '07 Jun 2026', customer: 'Kaveri Industries', freight: 98000, km: 360, status: 'Delayed' },
  { id: 'TRP1242', from: 'Chennai', to: 'Hyderabad', vehicle: 'TN 03 EF 9012', driver: 'Ramesh Babu', startDate: '06 Jun 2026', customer: 'Global Enterprises', freight: 145000, km: 630, status: 'Delayed' },
  { id: 'TRP1243', from: 'Coimbatore', to: 'Mumbai', vehicle: 'TN 04 GH 3456', driver: 'Suresh', startDate: '05 Jun 2026', customer: 'Sri Venkateshwara Traders', freight: 210000, km: 1150, status: 'Delayed' },
  { id: 'TRP1244', from: 'Madurai', to: 'Bangalore', vehicle: 'TN 05 IJ 7890', driver: 'Vijayakumar', startDate: '06 Jun 2026', customer: 'Sakthi Traders', freight: 88000, km: 440, status: 'Delayed' },
  { id: 'TRP1245', from: 'Coimbatore', to: 'Trichy', vehicle: 'TN 06 KL 1122', driver: 'Prakash', startDate: '07 Jun 2026', customer: 'MJM Infra', freight: 65000, km: 210, status: 'Delayed' },
];

export default function Page() {
  const [search, setSearch] = useState('');
  const filtered = trips.filter(t => t.id.includes(search) || t.customer.toLowerCase().includes(search.toLowerCase()) || t.vehicle.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div><h1 className="text-2xl font-bold text-gray-800">Delayed Trips</h1><p className="text-sm text-gray-500">Dashboard / Operations / Delayed Trips</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Delayed Trips',v:'3 Trips',c:'text-blue-600'},{l:'Total KM',v:'3,300 KM',c:'text-gray-700'},{l:'Est. Revenue',v:'₹ 7,31,000',c:'text-green-600'},{l:'Avg. KM / Trip',v:'550 KM',c:'text-purple-600'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-xl font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Delayed Trips</h3>
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-52 focus:outline-none"/></div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-500 border-b">{['Trip ID','Route','Vehicle','Driver','Date','Customer','Freight (₹)','KM','Status',''].map((h,i)=><th key={i} className="text-left py-3 pr-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map((t,i)=>(
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 pr-3 text-xs text-blue-600 font-medium">{t.id}</td>
                <td className="py-3 pr-3"><div className="flex items-center gap-1 text-xs text-gray-700"><MapPin size={11} className="text-gray-400"/>{t.from} → {t.to}</div></td>
                <td className="py-3 pr-3 text-xs text-gray-600">{t.vehicle}</td>
                <td className="py-3 pr-3 text-xs text-gray-600">{t.driver}</td>
                <td className="py-3 pr-3 text-xs text-gray-500">{t.startDate}</td>
                <td className="py-3 pr-3 text-xs text-gray-700">{t.customer}</td>
                <td className="py-3 pr-3 text-xs font-medium text-gray-800">{t.freight.toLocaleString('en-IN')}</td>
                <td className="py-3 pr-3 text-xs text-gray-600">{t.km}</td>
                <td className="py-3 pr-3"><span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{t.status}</span></td>
                <td className="py-3"><button className="p-1 hover:bg-gray-100 rounded text-gray-400"><Eye size={13}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-400 mt-3">Showing {filtered.length} of {trips.length} entries</p>
      </div>
    </div>
  );
}

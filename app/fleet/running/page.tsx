'use client';
import { useState } from 'react';
import { Search, Eye, Edit, AlertTriangle } from 'lucide-react';
const vehicles = [
  { no: 'TN 01 AB 1234', type: 'Truck', brand: 'Tata Motors', model: 'LPT 2518', year: 2021, driver: 'Arun Kumar', km: 128450, status: 'Running', insurance: '15 Aug 2026', permit: '20 Sep 2026', fc: '10 Oct 2026' },
  { no: 'TN 02 CD 5678', type: 'Truck', brand: 'Ashok Leyland', model: 'U-3718', year: 2020, driver: 'Kumaravel', km: 145200, status: 'Running', insurance: '12 Jun 2026', permit: '05 Jul 2026', fc: '22 Aug 2026' },
  { no: 'TN 03 EF 9012', type: 'Truck', brand: 'Tata Motors', model: 'LPT 3118', year: 2022, driver: 'Ramesh Babu', km: 98600, status: 'Running', insurance: '28 Sep 2026', permit: '15 Oct 2026', fc: '30 Nov 2026' },
  { no: 'TN 04 GH 3456', type: 'Truck', brand: 'BharatBenz', model: '3143R', year: 2021, driver: 'Suresh', km: 112300, status: 'Running', insurance: '30 Jul 2026', permit: '18 Aug 2026', fc: '25 Sep 2026' },
  { no: 'TN 05 IJ 7890', type: 'Truck', brand: 'Tata Motors', model: 'LPT 2518', year: 2019, driver: 'Vijayakumar', km: 198500, status: 'Running', insurance: '05 Jul 2026', permit: '12 Jun 2026', fc: '18 Jul 2026' },
  { no: 'TN 06 KL 1122', type: 'Truck', brand: 'Ashok Leyland', model: 'U-2518', year: 2022, driver: 'Prakash', km: 76400, status: 'Running', insurance: '22 Oct 2026', permit: '08 Nov 2026', fc: '15 Dec 2026' },
];
export default function Page() {
  const [search, setSearch] = useState('');
  const filtered = vehicles.filter(v => v.no.toLowerCase().includes(search.toLowerCase()) || v.driver.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div><h1 className="text-2xl font-bold text-gray-800">Running Vehicles</h1><p className="text-sm text-gray-500">Dashboard / Fleet / Running Vehicles</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Running Vehicles',v:'28 Vehicles',c:'text-blue-600'},{l:'Total KM (Avg)',v:'1,26,575 KM',c:'text-gray-700'},{l:'Oldest Vehicle',v:'2019 Model',c:'text-orange-500'},{l:'Newest Vehicle',v:'2022 Model',c:'text-green-600'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-xl font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Running Vehicles</h3>
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vehicles..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-52 focus:outline-none"/></div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-500 border-b">{['Vehicle No.','Type','Brand','Model','Year','Driver','KM','Status','Insurance','Permit','FC Due',''].map((h,i)=><th key={i} className="text-left py-3 pr-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>{filtered.map((v,i)=>(
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3 pr-3 text-xs font-bold text-gray-800">{v.no}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{v.type}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{v.brand}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{v.model}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{v.year}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{v.driver}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{v.km.toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3"><span className={`text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700`}>{v.status}</span></td>
              <td className="py-3 pr-3 text-xs text-gray-500">{v.insurance}</td>
              <td className="py-3 pr-3 text-xs text-gray-500">{v.permit}</td>
              <td className="py-3 pr-3 text-xs text-gray-500">{v.fc}</td>
              <td className="py-3"><div className="flex gap-1"><button className="p-1 hover:bg-gray-100 rounded text-gray-400"><Eye size={13}/></button><button className="p-1 hover:bg-gray-100 rounded text-gray-400"><Edit size={13}/></button></div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

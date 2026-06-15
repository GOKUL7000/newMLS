'use client';
import { useState } from 'react';
import { Plus, Edit } from 'lucide-react';
const pumps = [
  { name: 'Company Pump - HQ', location: 'MLS Transports HQ, Coimbatore', type: 'Own', capacity: 20000, currentStock: 11030, dispensed: 45820, rate: 91.20, status: 'Active', contact: '98451 00001' },
  { name: 'Indian Oil - Peelamedu', location: 'Peelamedu, Coimbatore', type: 'External', capacity: null, currentStock: null, dispensed: 18450, rate: 96.40, status: 'Active', contact: '98451 11111' },
  { name: 'Bharat Petroleum - RS Puram', location: 'RS Puram, Coimbatore', type: 'External', capacity: null, currentStock: null, dispensed: 12800, rate: 96.40, status: 'Active', contact: '97502 22222' },
  { name: 'HP Petrol Bunk - Peelamedu', location: 'Peelamedu, Coimbatore', type: 'External', capacity: null, currentStock: null, dispensed: 7200, rate: 96.80, status: 'Active', contact: '99403 33333' },
  { name: 'Indian Oil - Gandhipuram', location: 'Gandhipuram, Coimbatore', type: 'External', capacity: null, currentStock: null, dispensed: 5400, rate: 96.40, status: 'Inactive', contact: '98434 44444' },
];
export default function Page() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-800">Pump Management</h1><p className="text-sm text-gray-500">Dashboard / Diesel Management / Pump Management</p></div>
        <button onClick={()=>setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus size={15}/> Add Pump</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Total Pumps',v:'5',c:'text-blue-600'},{l:'Own Pump',v:'1',c:'text-green-600'},{l:'External Pumps',v:'4',c:'text-gray-700'},{l:'Active Pumps',v:'4',c:'text-teal-600'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-2xl font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        {pumps.map((p,i)=>(
          <div key={i} className={`bg-white rounded-xl p-5 shadow-sm border ${p.status==='Inactive'?'border-gray-200 opacity-70':'border-gray-100'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800">{p.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.type==='Own'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-600'}`}>{p.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.status==='Active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-400'}`}>{p.status}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{p.location}</p>
              </div>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><Edit size={14}/></button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs mt-3">
              <div><p className="text-gray-400">Rate (₹/Ltr)</p><p className="font-bold text-gray-800 text-sm">₹ {p.rate}</p></div>
              <div><p className="text-gray-400">Total Dispensed</p><p className="font-bold text-gray-800 text-sm">{p.dispensed.toLocaleString('en-IN')} L</p></div>
              <div><p className="text-gray-400">Contact</p><p className="font-medium text-gray-700">{p.contact}</p></div>
              {p.capacity && (<>
                <div><p className="text-gray-400">Capacity</p><p className="font-bold text-gray-800 text-sm">{p.capacity.toLocaleString('en-IN')} L</p></div>
                <div><p className="text-gray-400">Current Stock</p><p className={`font-bold text-sm ${p.currentStock&&p.currentStock<5000?'text-red-500':'text-green-600'}`}>{p.currentStock?.toLocaleString('en-IN')} L</p></div>
                <div><p className="text-gray-400">Usage</p>
                  <div className="mt-1 bg-gray-100 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{width:`${p.currentStock?(p.currentStock/p.capacity)*100:0}%`}}></div></div>
                  <p className="text-gray-500 mt-0.5">{p.currentStock?((p.currentStock/p.capacity)*100).toFixed(1):0}% remaining</p>
                </div>
              </>)}
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Add Pump / Station</h2>
            <div className="space-y-3">
              {[['Pump Name','text'],['Location','text'],['Type','select'],['Rate (₹/Ltr)','number'],['Contact','text'],['Tank Capacity (Ltrs)','number']].map(([l,t],i)=>(
                <div key={i}><label className="text-xs text-gray-500 block mb-1">{l}</label>
                  {t==='select'?<select className="w-full border rounded-lg px-3 py-2 text-sm"><option>Own</option><option>External</option></select>
                  :<input type={t} placeholder={l} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"/>}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5"><button onClick={()=>setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm">Cancel</button><button onClick={()=>setShowModal(false)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

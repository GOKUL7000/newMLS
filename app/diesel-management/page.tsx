'use client';
import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Plus, X } from 'lucide-react';

const issuances = [
  { no: 1, dateTime: '07 Jun 2026, 06:30 AM', vehicle: 'TN 01 AB 1234', driver: 'Arun Kumar', liters: 200, rate: 78.90, amount: 15780, issuedBy: 'Marimuthu' },
  { no: 2, dateTime: '07 Jun 2026, 07:15 AM', vehicle: 'TN 02 CD 5678', driver: 'Kumaravel', liters: 180, rate: 78.90, amount: 14202, issuedBy: 'Marimuthu' },
  { no: 3, dateTime: '07 Jun 2026, 07:45 AM', vehicle: 'TN 03 EF 9012', driver: 'Ramesh Babu', liters: 220, rate: 78.90, amount: 17358, issuedBy: 'Marimuthu' },
  { no: 4, dateTime: '07 Jun 2026, 08:30 AM', vehicle: 'TN 04 GH 3456', driver: 'Suresh', liters: 190, rate: 78.90, amount: 14991, issuedBy: 'Karthik' },
  { no: 5, dateTime: '07 Jun 2026, 09:10 AM', vehicle: 'TN 05 IJ 7890', driver: 'Vijayakumar', liters: 210, rate: 78.90, amount: 16569, issuedBy: 'Karthik' },
  { no: 6, dateTime: '07 Jun 2026, 09:45 AM', vehicle: 'TN 06 KL 1122', driver: 'Manikandan', liters: 200, rate: 78.90, amount: 15780, issuedBy: 'Karthik' },
  { no: 7, dateTime: '07 Jun 2026, 10:20 AM', vehicle: 'TN 07 MN 2233', driver: 'Prakash', liters: 160, rate: 78.90, amount: 12624, issuedBy: 'Karthik' },
  { no: 8, dateTime: '07 Jun 2026, 11:00 AM', vehicle: 'TN 08 OP 3344', driver: 'Selvam', liters: 210, rate: 78.90, amount: 16569, issuedBy: 'Karthik' },
];
const costTrend = [
  { date: '01 Jun', cost: 810000 }, { date: '08 Jun', cost: 920000 }, { date: '15 Jun', cost: 1050000 },
  { date: '22 Jun', cost: 1180000 }, { date: '30 Jun', cost: 1310000 },
];
const consumption = [
  { vehicle: 'TN 01 AB 1234', liters: 2850, cost: 224865, mileage: 3.48 },
  { vehicle: 'TN 02 CD 5678', liters: 2650, cost: 209085, mileage: 3.61 },
  { vehicle: 'TN 03 EF 9012', liters: 2410, cost: 190149, mileage: 3.74 },
  { vehicle: 'TN 04 GH 3456', liters: 2320, cost: 183048, mileage: 3.58 },
  { vehicle: 'TN 05 IJ 7890', liters: 2210, cost: 174369, mileage: 3.42 },
];
const mileageData = Array.from({length:7},(_,i)=>({day:`0${i+1} Jun`,mileage:2.5+Math.random()*2.5}));
const pumpSummary = [
  { pump: 'Indian Oil - Peelamedu', opening: 5000, received: 10000, issued: 8650, closing: 6350 },
  { pump: 'Bharat Petroleum - Avinashi Rd', opening: 3000, received: 5000, issued: 4200, closing: 3800 },
  { pump: 'Shell - Coimbatore', opening: 2500, received: 5000, issued: 4600, closing: 2900 },
];
const transactions = [
  { date: '07 Jun 2026', type: 'Issue', ref: 'DIS/2026/1258', pump: 'Indian Oil - Peelamedu', vehicle: 'TN 01 AB 1234', liters: 200, rate: 78.90, amount: 15780, by: 'Marimuthu' },
  { date: '07 Jun 2026', type: 'Issue', ref: 'DIS/2026/1257', pump: 'Indian Oil - Peelamedu', vehicle: 'TN 02 CD 5678', liters: 180, rate: 78.90, amount: 14202, by: 'Marimuthu' },
  { date: '07 Jun 2026', type: 'Receive', ref: 'REC/2026/0445', pump: 'Indian Oil - Peelamedu', vehicle: '-', liters: 5000, rate: 78.50, amount: 392500, by: 'Karthik' },
  { date: '07 Jun 2026', type: 'Issue', ref: 'DIS/2026/1256', pump: 'Indian Oil - Peelamedu', vehicle: 'TN 03 EF 9012', liters: 220, rate: 78.90, amount: 17358, by: 'Marimuthu' },
  { date: '06 Jun 2026', type: 'Issue', ref: 'DIS/2026/1255', pump: 'Bharat Petroleum - Avinashi Rd', vehicle: 'TN 04 GH 3456', liters: 190, rate: 78.60, amount: 14934, by: 'Karthik' },
];

export default function DieselManagementPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ vehicle: '', driver: '', liters: '', rate: '78.90', pump: '' });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Diesel Management" breadcrumbs={[{ label: 'Diesel Management' }]} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Diesel Issued Today', value: '12,450 Ltr', sub: 'From 28 Vehicles', color: 'text-blue-600' },
            { label: 'Diesel Cost Today', value: '₹ 9,82,350', sub: 'Avg. ₹ 78.90 / Ltr', color: 'text-blue-600' },
            { label: 'Average Mileage', value: '3.62 km/L', sub: 'This Month', color: 'text-green-600' },
            { label: 'Diesel Cost This Month', value: '₹ 28,75,420', sub: 'Total 36,410 Ltr', color: 'text-orange-500' },
            { label: 'Diesel Stock in Hand', value: '8,650 Ltr', sub: 'As on 07 Jun 2026', color: 'text-blue-600' },
            { label: 'Diesel Budget (Monthly)', value: '₹ 35,00,000', sub: 'Used 82.2%', color: 'text-red-600' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400">{c.label}</p>
              <p className={`text-[16px] font-bold ${c.color} mt-1`}>{c.value}</p>
              <p className="text-[10px] text-gray-400">{c.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Issuance Table */}
          <div className="col-span-2 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-gray-700">Diesel Issuance Today</h3>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-[#1a56db] text-white px-3 py-1.5 rounded-lg text-[11px] font-medium hover:bg-blue-700"><Plus size={12}/> Issue Diesel</button>
            </div>
            <table className="w-full text-[11px]">
              <thead><tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="text-left px-2 py-2">#</th><th className="text-left px-2 py-2">Date & Time</th><th className="text-left px-2 py-2">Vehicle No.</th>
                <th className="text-left px-2 py-2">Driver Name</th><th className="text-right px-2 py-2">Liters</th><th className="text-right px-2 py-2">Rate (₹/Ltr)</th>
                <th className="text-right px-2 py-2">Amount (₹)</th><th className="text-left px-2 py-2">Issuing Person</th><th className="px-2 py-2">Action</th>
              </tr></thead>
              <tbody>{issuances.map(i => (
                <tr key={i.no} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-2 py-2 text-gray-500">{i.no}</td>
                  <td className="px-2 py-2 text-gray-500">{i.dateTime}</td>
                  <td className="px-2 py-2 text-blue-600 font-medium">{i.vehicle}</td>
                  <td className="px-2 py-2 text-gray-600">{i.driver}</td>
                  <td className="px-2 py-2 text-right text-gray-600">{i.liters.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right text-gray-600">{i.rate.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right font-medium">{i.amount.toFixed(2)}</td>
                  <td className="px-2 py-2 text-gray-500">{i.issuedBy}</td>
                  <td className="px-2 py-2"><Eye size={12} className="text-gray-400 cursor-pointer"/></td>
                </tr>
              ))}</tbody>
            </table>
            <div className="flex justify-between items-center mt-2"><p className="text-[11px] text-gray-400">Showing 1 to 8 of 28 entries</p><a href="#" className="text-[10px] text-blue-600">View All Issuance →</a></div>
          </div>

          {/* Stock Summary */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Diesel Stock Summary</h3>
              <div className="flex gap-3 items-start">
                <div className="flex flex-col items-center gap-1">
                  <div className="relative w-12 bg-gray-200 rounded border-2 border-gray-300" style={{height:80}}>
                    {['20K Ltr','15K Ltr','10K Ltr','5K Ltr','0 Ltr'].map((l,i)=><div key={l} className="absolute right-full mr-1 text-[8px] text-gray-400" style={{bottom:`${i*25}%`}}>{l}</div>)}
                    <div className="absolute bottom-0 left-0 right-0 bg-green-400 rounded-b" style={{height:'43%'}}/>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {[['Opening Stock','12,500 Ltr'],['Received Today','5,000 Ltr'],['Issued Today','12,450 Ltr'],['Closing Stock','8,650 Ltr']].map(([k,v])=>(
                    <div key={k} className="flex justify-between text-[11px]"><span className="text-gray-500">{k}</span><span className="font-semibold">{v}</span></div>
                  ))}
                  <div className="bg-orange-50 border border-orange-200 rounded p-1.5 mt-1">
                    <p className="text-[10px] text-orange-600 font-semibold">⚠️ Low Stock Alert</p>
                    <p className="text-[9px] text-orange-500">Stock will last for 2.3 days</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-[12px] font-semibold text-gray-700 mb-2">Diesel Cost Trend (This Month)</h3>
              <ResponsiveContainer width="100%" height={80}><LineChart data={costTrend}><XAxis dataKey="date" tick={{fontSize:8}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip/><Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} dot={{r:2}}/></LineChart></ResponsiveContainer>
              <div className="grid grid-cols-3 gap-1 mt-2 text-[9px] text-center">
                <div><p className="font-bold text-gray-700">₹ 28,75,420</p><p className="text-gray-400">Total Cost</p></div>
                <div><p className="font-bold text-gray-700">₹ 78.90/Ltr</p><p className="text-gray-400">Avg. Rate</p></div>
                <div><p className="font-bold text-gray-700">36,410 Ltr</p><p className="text-gray-400">Total Liters</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Diesel Consumption by Vehicle (This Month)</h3>
            <table className="w-full text-[11px]">
              <thead><tr className="text-gray-400 border-b border-gray-100"><th className="text-left py-2">Vehicle No.</th><th className="py-2"></th><th className="text-right py-2">Total Liters</th><th className="text-right py-2">Total Cost (₹)</th><th className="text-right py-2">Avg. Mileage</th></tr></thead>
              <tbody>{consumption.map(c=><tr key={c.vehicle} className="border-b border-gray-50"><td className="py-2 text-blue-600">{c.vehicle}</td><td className="py-2"><div className="w-16 bg-gray-100 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{width:`${c.liters/2850*100}%`}}/></div></td><td className="py-2 text-right">{c.liters.toLocaleString()}</td><td className="py-2 text-right">{c.cost.toLocaleString()}</td><td className="py-2 text-right font-semibold">{c.mileage}</td></tr>)}</tbody>
            </table>
            <a href="#" className="text-[10px] text-blue-600 block mt-2">View Full Report →</a>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Mileage Report (This Month)</h3>
            <ResponsiveContainer width="100%" height={100}><LineChart data={mileageData}><XAxis dataKey="day" tick={{fontSize:8}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip/><Line type="monotone" dataKey="mileage" stroke="#10b981" strokeWidth={2} dot={{r:2}}/></LineChart></ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[{label:'Best Mileage',v:'4.85 km/L',c:'text-green-600'},{label:'Average Mileage',v:'3.62 km/L',c:'text-blue-600'},{label:'Lowest Mileage',v:'2.45 km/L',c:'text-red-500'}].map(s=><div key={s.label} className="bg-gray-50 rounded p-2 text-center"><p className={`text-[11px] font-bold ${s.c}`}>{s.v}</p><p className="text-[9px] text-gray-400">{s.label}</p></div>)}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-3"><h3 className="text-[13px] font-semibold text-gray-700">Diesel Pump / Vendor Summary</h3><a href="#" className="text-[10px] text-blue-600">View Pump Report →</a></div>
            <table className="w-full text-[10px]">
              <thead><tr className="text-gray-400 border-b border-gray-100"><th className="text-left py-2">Pump / Vendor</th><th className="text-right py-2">Opening</th><th className="text-right py-2">Received</th><th className="text-right py-2">Issued</th><th className="text-right py-2">Closing</th></tr></thead>
              <tbody>{pumpSummary.map(p=><tr key={p.pump} className="border-b border-gray-50"><td className="py-2 text-gray-600 truncate max-w-[120px]">{p.pump}</td><td className="py-2 text-right">{p.opening.toLocaleString()}</td><td className="py-2 text-right">{p.received.toLocaleString()}</td><td className="py-2 text-right">{p.issued.toLocaleString()}</td><td className="py-2 text-right font-semibold">{p.closing.toLocaleString()}</td></tr>)}</tbody>
              <tfoot><tr className="font-bold border-t border-gray-200 text-[11px]"><td className="py-2">Total</td><td className="py-2 text-right">10,500</td><td className="py-2 text-right">20,000</td><td className="py-2 text-right">17,450</td><td className="py-2 text-right">13,050</td></tr></tfoot>
            </table>
          </div>
        </div>

        {/* Transactions + Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-3"><h3 className="text-[13px] font-semibold text-gray-700">Diesel Transactions (This Month)</h3><a href="#" className="text-[10px] text-blue-600">View All Transactions →</a></div>
            <table className="w-full text-[11px]">
              <thead><tr className="text-gray-400 border-b border-gray-100"><th className="text-left py-2">Date</th><th className="text-left py-2">Type</th><th className="text-left py-2">Reference No.</th><th className="text-left py-2">Pump / Vendor</th><th className="text-left py-2">Vehicle No.</th><th className="text-right py-2">Liters</th><th className="text-right py-2">Rate</th><th className="text-right py-2">Amount</th><th className="text-left py-2">Created By</th><th className="py-2">Action</th></tr></thead>
              <tbody>{transactions.map(t=><tr key={t.ref} className="border-b border-gray-50"><td className="py-2 text-gray-500">{t.date}</td><td className="py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${t.type==='Issue'?'bg-blue-100 text-blue-700':'bg-green-100 text-green-700'}`}>{t.type}</span></td><td className="py-2 text-blue-600">{t.ref}</td><td className="py-2 text-gray-500 text-[10px]">{t.pump}</td><td className="py-2 text-gray-500">{t.vehicle}</td><td className="py-2 text-right">{t.liters.toLocaleString()}</td><td className="py-2 text-right">{t.rate}</td><td className="py-2 text-right font-medium">{t.amount.toLocaleString()}</td><td className="py-2 text-gray-500">{t.by}</td><td className="py-2"><Eye size={12} className="text-gray-400"/></td></tr>)}</tbody>
            </table>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Issue Diesel','Receive Diesel','Diesel Stock','Mileage Report','Diesel Expenses','Pump / Vendor','Diesel Report','Low Stock Alert','Settings'].map(a=><button key={a} className="px-2 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-[10px] text-blue-600">{a}</button>)}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[400px] p-5">
            <div className="flex items-center justify-between mb-4"><h3 className="text-[14px] font-bold">Issue Diesel</h3><button onClick={()=>setShowModal(false)}><X size={16} className="text-gray-400"/></button></div>
            <div className="space-y-3">
              {[['Vehicle No.','vehicle'],['Driver','driver'],['Liters','liters'],['Rate (₹/Ltr)','rate'],['Pump/Vendor','pump']].map(([l,k])=>(
                <div key={k}><label className="text-[11px] text-gray-500 block mb-1">{l}</label><input value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400"/></div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>setShowModal(false)} className="flex-1 bg-[#1a56db] text-white py-2 rounded-lg text-[12px] font-medium">Issue</button>
              <button onClick={()=>setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-[12px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
const records = [
  { vehicle: 'TN 01 AB 1234', driver: 'Arun Kumar', trips: 17, totalKm: 8450, totalLtr: 2980, avgMileage: 2.84, bestMileage: 3.12, worstMileage: 2.51, dieselCost: 287272 },
  { vehicle: 'TN 02 CD 5678', driver: 'Kumaravel', trips: 15, totalKm: 7280, totalLtr: 2840, avgMileage: 2.56, bestMileage: 2.95, worstMileage: 2.21, dieselCost: 273776 },
  { vehicle: 'TN 03 EF 9012', driver: 'Ramesh Babu', trips: 14, totalKm: 7950, totalLtr: 2520, avgMileage: 3.15, bestMileage: 3.45, worstMileage: 2.88, dieselCost: 242928 },
  { vehicle: 'TN 04 GH 3456', driver: 'Suresh', trips: 13, totalKm: 6840, totalLtr: 2480, avgMileage: 2.76, bestMileage: 3.10, worstMileage: 2.42, dieselCost: 238912 },
  { vehicle: 'TN 05 IJ 7890', driver: 'Vijayakumar', trips: 12, totalKm: 6420, totalLtr: 2100, avgMileage: 3.06, bestMileage: 3.38, worstMileage: 2.72, dieselCost: 202440 },
  { vehicle: 'TN 06 KL 1122', driver: 'Prakash', trips: 10, totalKm: 5640, totalLtr: 1920, avgMileage: 2.94, bestMileage: 3.28, worstMileage: 2.68, dieselCost: 185088 },
];
const chartData = records.map(r => ({ name: r.vehicle.slice(0,11), mileage: r.avgMileage }));
export default function Page() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div><h1 className="text-2xl font-bold text-gray-800">Mileage Report</h1><p className="text-sm text-gray-500">Dashboard / Diesel Management / Mileage Report</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Fleet Avg Mileage',v:'2.89 km/L',c:'text-blue-600'},{l:'Best Vehicle',v:'TN 03 EF 9012 (3.15)',c:'text-green-600'},{l:'Worst Vehicle',v:'TN 02 CD 5678 (2.56)',c:'text-red-500'},{l:'Target Mileage',v:'3.00 km/L',c:'text-purple-600'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-lg font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Mileage by Vehicle (This Month)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{fontSize:10}} tickLine={false}/>
            <YAxis tick={{fontSize:10}} tickLine={false} domain={[0,4]} tickFormatter={v=>`${v} km/L`}/>
            <Tooltip formatter={(v:any)=>`${v} km/L`}/>
            <ReferenceLine y={3.0} stroke="#ef4444" strokeDasharray="4 4" label={{value:'Target: 3.0',fill:'#ef4444',fontSize:10}}/>
            <Bar dataKey="mileage" fill="#3b82f6" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Vehicle-wise Mileage Details (This Month)</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-500 border-b"><th className="text-left py-3 pr-3">Vehicle No.</th><th className="text-left py-3 pr-3">Driver</th><th className="text-center py-3 pr-3">Trips</th><th className="text-right py-3 pr-3">Total KM</th><th className="text-right py-3 pr-3">Total Ltrs</th><th className="text-right py-3 pr-3">Avg Mileage (km/L)</th><th className="text-right py-3 pr-3">Best (km/L)</th><th className="text-right py-3 pr-3">Worst (km/L)</th><th className="text-right py-3">Diesel Cost (₹)</th></tr></thead>
          <tbody>{records.map((r,i)=>(
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3 pr-3 text-xs font-bold text-gray-800">{r.vehicle}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{r.driver}</td>
              <td className="py-3 pr-3 text-center text-xs text-gray-600">{r.trips}</td>
              <td className="py-3 pr-3 text-right text-xs text-gray-700">{r.totalKm.toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-right text-xs text-gray-700">{r.totalLtr.toLocaleString('en-IN')}</td>
              <td className="py-3 pr-3 text-right"><span className={`text-xs font-bold ${r.avgMileage>=3.0?'text-green-600':'text-orange-500'}`}>{r.avgMileage}</span></td>
              <td className="py-3 pr-3 text-right text-xs text-green-600">{r.bestMileage}</td>
              <td className="py-3 pr-3 text-right text-xs text-red-500">{r.worstMileage}</td>
              <td className="py-3 text-right text-xs text-gray-700">{r.dieselCost.toLocaleString('en-IN')}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

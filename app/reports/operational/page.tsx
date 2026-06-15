'use client';
import { Download, FileText } from 'lucide-react';
export default function Page() {
  const titles: Record<string,string> = { financial:'Financial Reports', operational:'Operational Reports', vehicle:'Vehicle Reports', driver:'Driver Reports', custom:'Custom Reports' };
  const title = titles['operational'] || 'operational';
  const reportSets: Record<string, {name:string,desc:string,period:string}[]> = {
    financial: [
      {name:'Profit & Loss Statement',desc:'Revenue, expenses and net profit summary',period:'Monthly / Quarterly / Yearly'},
      {name:'Balance Sheet',desc:'Assets, liabilities and equity overview',period:'Monthly / Quarterly / Yearly'},
      {name:'Cash Flow Statement',desc:'Cash inflows and outflows analysis',period:'Monthly / Quarterly'},
      {name:'Revenue Report',desc:'Freight income breakdown by customer and route',period:'Daily / Weekly / Monthly'},
      {name:'Expense Summary Report',desc:'All expense categories and vendor analysis',period:'Daily / Weekly / Monthly'},
      {name:'Outstanding & Payables Report',desc:'Customer outstanding and supplier payables aging',period:'Weekly / Monthly'},
    ],
    operational: [
      {name:'Trip Summary Report',desc:'All trips with status, revenue and performance',period:'Daily / Weekly / Monthly'},
      {name:'Fleet Utilization Report',desc:'Vehicle usage, idle time and efficiency',period:'Weekly / Monthly'},
      {name:'Driver Performance Report',desc:'Driver trips, earnings and efficiency metrics',period:'Monthly'},
      {name:'Route Analysis Report',desc:'Revenue and profitability by route',period:'Monthly / Quarterly'},
      {name:'On-time Delivery Report',desc:'Delivery performance and delay analysis',period:'Weekly / Monthly'},
      {name:'Loading / Unloading Report',desc:'Loading point performance analysis',period:'Monthly'},
    ],
    vehicle: [
      {name:'Fleet Status Report',desc:'Current status of all vehicles',period:'Daily'},
      {name:'Vehicle Mileage Report',desc:'Fuel efficiency and mileage per vehicle',period:'Weekly / Monthly'},
      {name:'Vehicle Expense Report',desc:'All expenses broken down by vehicle',period:'Monthly'},
      {name:'Document Expiry Report',desc:'Insurance, permit, FC expiry tracking',period:'Weekly'},
      {name:'Vehicle Revenue Report',desc:'Revenue generated per vehicle',period:'Monthly / Quarterly'},
      {name:'Maintenance Cost Report',desc:'Maintenance costs per vehicle over time',period:'Monthly / Quarterly'},
    ],
    driver: [
      {name:'Driver Trip Report',desc:'Trips completed by each driver',period:'Monthly'},
      {name:'Driver Expense Report',desc:'Driver-wise expense analysis',period:'Monthly'},
      {name:'Driver Earnings Report',desc:'Salary and incentive breakdown',period:'Monthly'},
      {name:'Driver Performance Score',desc:'On-time delivery, fuel efficiency scoring',period:'Monthly'},
      {name:'License & Document Expiry',desc:'Driver document renewal tracking',period:'Weekly'},
      {name:'Driver Attendance Report',desc:'Duty days, leaves and overtime',period:'Monthly'},
    ],
    custom: [
      {name:'Custom Report Builder',desc:'Build your own report with any filters',period:'Any Period'},
      {name:'Scheduled Reports',desc:'Automate report delivery via email',period:'Daily / Weekly / Monthly'},
      {name:'Data Export',desc:'Export raw data in Excel / CSV format',period:'Any Period'},
      {name:'Dashboard Summary Report',desc:'Full dashboard snapshot as PDF',period:'Any Period'},
    ],
  };
  const reports = reportSets['operational'] || reportSets.financial;
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-800">{title}</h1><p className="text-sm text-gray-500">Dashboard / Reports / {title}</p></div>
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700"><option>This Month</option><option>Last Month</option><option>This Quarter</option><option>This Year</option></select>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Available Reports',v:String(reports.length),c:'text-blue-600'},{l:'Generated Today',v:'12',c:'text-green-600'},{l:'Scheduled Reports',v:'5',c:'text-purple-600'},{l:'Last Generated',v:'07 Jun 2026',c:'text-gray-700'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-xl font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {reports.map((r,i)=>(
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-blue-300 transition-colors group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                <FileText size={18} className="text-blue-600"/>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-sm">{r.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5 mb-3">{r.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r.period}</span>
                  <div className="flex gap-2">
                    <select className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-600"><option>This Month</option><option>Last Month</option><option>This Quarter</option></select>
                    <button className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700"><Download size={11}/> Generate</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

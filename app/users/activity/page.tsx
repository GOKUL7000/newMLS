'use client';
import { useState } from 'react';
import { Search, Download, LogIn, Edit, Plus, Trash2, Lock } from 'lucide-react';
const activities = [
  { id: 1, user: 'Gokul', role: 'Super Admin', action: 'Logged in', module: 'Auth', details: 'Login from 103.21.45.67', time: '07 Jun 2026, 10:30 AM', type: 'login' },
  { id: 2, user: 'Karthik S', role: 'Admin', action: 'Created trip TRP1256', module: 'Trips', details: 'New trip Coimbatore → Chennai', time: '07 Jun 2026, 10:15 AM', type: 'create' },
  { id: 3, user: 'Manikandan R', role: 'Fleet Manager', action: 'Updated vehicle TN 01 AB 1234', module: 'Fleet', details: 'Updated insurance expiry date', time: '07 Jun 2026, 09:55 AM', type: 'edit' },
  { id: 4, user: 'Suresh P', role: 'Accounts Manager', action: 'Approved expense EXP2026/2158', module: 'Expenses', details: 'Approved diesel expense ₹ 15,780', time: '07 Jun 2026, 09:30 AM', type: 'edit' },
  { id: 5, user: 'Ramesh B', role: 'Maintenance Manager', action: 'Created work order WO/2026/2178', module: 'Maintenance', details: 'Preventive service for TN 01 AB 1234', time: '07 Jun 2026, 09:00 AM', type: 'create' },
  { id: 6, user: 'Vijay Kumar', role: 'Operations Executive', action: 'Updated trip TRP1255 status', module: 'Trips', details: 'Status changed to Loading', time: '07 Jun 2026, 08:45 AM', type: 'edit' },
  { id: 7, user: 'Karthik S', role: 'Admin', action: 'Deleted expense EXP2026/2148', module: 'Expenses', details: 'Duplicate entry deleted', time: '06 Jun 2026, 07:30 PM', type: 'delete' },
  { id: 8, user: 'Gokul', role: 'Super Admin', action: 'User Selvam T account locked', module: 'Users', details: '3 failed login attempts', time: '05 Jun 2026, 05:35 PM', type: 'lock' },
  { id: 9, user: 'Gokul', role: 'Super Admin', action: 'Added user Vijay Kumar', module: 'Users', details: 'New Operations Executive user', time: '06 Jun 2026, 07:10 PM', type: 'create' },
  { id: 10, user: 'Suresh P', role: 'Accounts Manager', action: 'Generated P&L Report', module: 'Reports', details: 'Profit & Loss - May 2026', time: '06 Jun 2026, 06:00 PM', type: 'edit' },
];
const typeConfig: Record<string,{icon:any,color:string,bg:string}> = {
  login: {icon:LogIn,color:'text-blue-600',bg:'bg-blue-100'},
  create: {icon:Plus,color:'text-green-600',bg:'bg-green-100'},
  edit: {icon:Edit,color:'text-orange-500',bg:'bg-orange-100'},
  delete: {icon:Trash2,color:'text-red-500',bg:'bg-red-100'},
  lock: {icon:Lock,color:'text-purple-600',bg:'bg-purple-100'},
};
export default function ActivityLogPage() {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const filtered = activities.filter(a =>
    (moduleFilter==='All'||a.module===moduleFilter) &&
    (a.user.toLowerCase().includes(search.toLowerCase())||a.action.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-800">Activity Log</h1><p className="text-sm text-gray-500">Dashboard / Users / Activity Log</p></div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Download size={15}/> Export Log</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Total Activities (Today)',v:'48',c:'text-blue-600'},{l:'Logins (Today)',v:'12',c:'text-green-600'},{l:'Changes (Today)',v:'36',c:'text-orange-500'},{l:'Active Users Now',v:'5',c:'text-teal-600'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-2xl font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Activity Log</h3>
          <div className="flex gap-2">
            <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search activities..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-52 focus:outline-none"/></div>
            <select value={moduleFilter} onChange={e=>setModuleFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none">
              {['All','Auth','Trips','Fleet','Expenses','Maintenance','Accounts','Users','Reports'].map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-3">
          {filtered.map((a,i)=>{
            const cfg = typeConfig[a.type];
            return (
              <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 border border-gray-100">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <cfg.icon size={15} className={cfg.color}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800">{a.user}</span>
                    <span className="text-xs text-gray-400">({a.role})</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a.module}</span>
                  </div>
                  <p className="text-xs text-gray-700 mt-0.5">{a.action}</p>
                  <p className="text-xs text-gray-400">{a.details}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{a.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

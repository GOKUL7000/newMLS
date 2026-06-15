'use client';
import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Search, Filter, Plus, Edit, MoreVertical, UserPlus, Upload, Download, Shield, Activity } from 'lucide-react';

const users = [
  { id: 1, name: 'Gokul', role: 'Super Admin', email: 'gokul@mlstransports.com', dept: 'Administration', status: 'Active', lastLogin: '07 Jun 2026, 10:30 AM', you: true, initials: 'G', bg: 'bg-blue-600' },
  { id: 2, name: 'Karthik S', role: 'Admin', email: 'karthik@mlstransports.com', dept: 'Operations', status: 'Active', lastLogin: '07 Jun 2026, 09:15 AM', you: false, initials: 'KS', bg: 'bg-indigo-500' },
  { id: 3, name: 'Manikandan R', role: 'Fleet Manager', email: 'manikandan@mlstransports.com', dept: 'Fleet', status: 'Active', lastLogin: '07 Jun 2026, 08:45 AM', you: false, initials: 'MR', bg: 'bg-green-500' },
  { id: 4, name: 'Suresh P', role: 'Accounts Manager', email: 'suresh@mlstransports.com', dept: 'Accounts', status: 'Active', lastLogin: '07 Jun 2026, 09:20 AM', you: false, initials: 'SP', bg: 'bg-yellow-500' },
  { id: 5, name: 'Ramesh B', role: 'Maintenance Manager', email: 'ramesh@mlstransports.com', dept: 'Maintenance', status: 'Active', lastLogin: '06 Jun 2026, 06:10 PM', you: false, initials: 'RB', bg: 'bg-purple-500' },
  { id: 6, name: 'Vijay Kumar', role: 'Operations Executive', email: 'vijay@mlstransports.com', dept: 'Operations', status: 'Active', lastLogin: '07 Jun 2026, 08:05 AM', you: false, initials: 'VK', bg: 'bg-teal-500' },
  { id: 7, name: 'Prakash M', role: 'Driver Supervisor', email: 'prakash@mlstransports.com', dept: 'Operations', status: 'Active', lastLogin: '06 Jun 2026, 07:40 PM', you: false, initials: 'PM', bg: 'bg-orange-500' },
  { id: 8, name: 'Arun Kumar', role: 'Dispatcher', email: 'arun@mlstransports.com', dept: 'Operations', status: 'Active', lastLogin: '07 Jun 2026, 07:55 AM', you: false, initials: 'AK', bg: 'bg-pink-500' },
  { id: 9, name: 'Selvam T', role: 'Fuel Manager', email: 'selvam@mlstransports.com', dept: 'Fuel Management', status: 'Inactive', lastLogin: '05 Jun 2026, 05:30 PM', you: false, initials: 'ST', bg: 'bg-gray-400' },
  { id: 10, name: 'Kumaravel', role: 'Viewer', email: 'kumaravel@mlstransports.com', dept: 'Reports', status: 'Locked', lastLogin: '02 Jun 2026, 03:20 PM', you: false, initials: 'K', bg: 'bg-red-400' },
];
const rolesPieData = [
  { name: 'Super Admin', value: 4, color: '#6366f1' },
  { name: 'Admin', value: 5, color: '#3b82f6' },
  { name: 'Fleet Manager', value: 3, color: '#10b981' },
  { name: 'Accounts Manager', value: 3, color: '#f59e0b' },
  { name: 'Maintenance Manager', value: 2, color: '#8b5cf6' },
  { name: 'Operations Executive', value: 6, color: '#14b8a6' },
  { name: 'Others', value: 5, color: '#9ca3af' },
];
const activityLog = [
  { user: 'Karthik S', action: 'logged in', time: '07 Jun 2026, 09:15 AM', ip: '103.21.45.67', icon: 'login' },
  { user: 'Ramesh B', action: 'updated work order WO/2026/2178', time: '07 Jun 2026, 08:50 AM', ip: '103.21.45.67', icon: 'edit' },
  { user: 'New user Vijay Kumar', action: 'added', time: '06 Jun 2026, 07:30 PM', ip: '103.21.45.67', icon: 'add' },
  { user: 'Selvam T account', action: 'locked', time: '05 Jun 2026, 05:35 PM', ip: '103.21.45.67', icon: 'lock' },
  { user: 'Password changed by Gokul', action: '(Admin)', time: '05 Jun 2026, 04:20 PM', ip: '103.21.45.67', icon: 'key' },
];
const permissions = [
  { type: 'Full Access', count: 6, pct: 21.4, color: 'bg-green-500' },
  { type: 'Module Access', count: 14, pct: 50.0, color: 'bg-blue-500' },
  { type: 'Read Only Access', count: 7, pct: 25.0, color: 'bg-orange-400' },
  { type: 'No Access', count: 1, pct: 3.6, color: 'bg-red-400' },
];
const recentUsers = [
  { name: 'Vijay Kumar', email: 'vijay@mlstransports.com', role: 'Operations Executive', added: '06 Jun', bg: 'bg-teal-500' },
  { name: 'Arun Kumar', email: 'arun@mlstransports.com', role: 'Dispatcher', added: '06 Jun', bg: 'bg-pink-500' },
  { name: 'Selvam T', email: 'selvam@mlstransports.com', role: 'Fuel Manager', added: '05 Jun', bg: 'bg-gray-400' },
];

const roleColors: Record<string, string> = {
  'Super Admin': 'bg-indigo-100 text-indigo-700',
  'Admin': 'bg-blue-100 text-blue-700',
  'Fleet Manager': 'bg-green-100 text-green-700',
  'Accounts Manager': 'bg-yellow-100 text-yellow-700',
  'Maintenance Manager': 'bg-purple-100 text-purple-700',
  'Operations Executive': 'bg-teal-100 text-teal-700',
  'Driver Supervisor': 'bg-orange-100 text-orange-700',
  'Dispatcher': 'bg-pink-100 text-pink-700',
  'Fuel Manager': 'bg-gray-100 text-gray-700',
  'Viewer': 'bg-red-100 text-red-700',
};

export default function UsersPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: '', dept: '', phone: '', password: '' });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <p className="text-sm text-gray-500">Dashboard / Users / User List</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 bg-white border px-3 py-2 rounded-lg">07 Jun 2026</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Total Users', value: '28', sub: 'All Users', color: 'text-blue-600' },
          { label: 'Active Users', value: '24', sub: '85.7% of Total', color: 'text-green-600' },
          { label: 'Inactive Users', value: '3', sub: '10.7% of Total', color: 'text-orange-500' },
          { label: 'Locked Users', value: '1', sub: '3.6% of Total', color: 'text-red-500' },
          { label: 'Administrators', value: '4', sub: '14.3% of Total', color: 'text-purple-600' },
        ].map((c,i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-gray-800">{c.value}</p>
            <p className={`text-xs mt-1 ${c.color}`}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* User List */}
        <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">User List</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input placeholder="Search users..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <button className="flex items-center gap-1 border px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"><Filter size={14} /> Filter</button>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus size={14} /> Add User</button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b">
                <th className="text-left py-2 pr-3">#</th>
                <th className="text-left py-2 pr-3">Name</th>
                <th className="text-left py-2 pr-3">Username / Email</th>
                <th className="text-left py-2 pr-3">Role</th>
                <th className="text-left py-2 pr-3">Department</th>
                <th className="text-left py-2 pr-3">Status</th>
                <th className="text-left py-2 pr-3">Last Login</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 pr-3 text-xs text-gray-500">{u.id}</td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full ${u.bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{u.initials}</div>
                      <span className="text-sm font-medium text-gray-800">{u.name}</span>
                      {u.you && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">You</span>}
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-gray-500">{u.email}</td>
                  <td className="py-2.5 pr-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[u.role] || 'bg-gray-100 text-gray-700'}`}>{u.role}</span>
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-gray-600">{u.dept}</td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-green-500' : u.status === 'Inactive' ? 'bg-yellow-400' : 'bg-red-500'}`}></div>
                      <span className="text-xs text-gray-600">{u.status}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-gray-500">{u.lastLogin}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-1">
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><Edit size={13} /></button>
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><MoreVertical size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-500">Showing 1 to 10 of 28 entries</span>
            <div className="flex gap-1">
              {[1,2,3].map(p => <button key={p} className={`w-7 h-7 text-xs rounded border ${p===1?'bg-blue-600 text-white border-blue-600':'text-gray-600 hover:bg-gray-50'}`}>{p}</button>)}
              <button className="w-7 h-7 text-xs border rounded text-gray-600">›</button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Roles Summary */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Roles Summary</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <ResponsiveContainer width={100} height={100}>
                  <PieChart>
                    <Pie data={rolesPieData} cx="50%" cy="50%" innerRadius={30} outerRadius={48} dataKey="value">
                      {rolesPieData.map((e,i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-sm font-bold text-gray-800">28</span>
                  <span className="text-xs text-gray-400">Users</span>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                {rolesPieData.map((r,i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{backgroundColor:r.color}}></div><span className="text-gray-600 truncate max-w-[100px]">{r.name}</span></div>
                    <span className="text-gray-700 font-medium">{r.value} ({((r.value/28)*100).toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="text-blue-600 text-xs mt-2 hover:underline">View All Roles →</button>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm">User Activity Log</h3>
              <button className="text-blue-600 text-xs hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {activityLog.map((a,i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity size={12} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700"><span className="font-medium">{a.user}</span> {a.action}</p>
                    <p className="text-xs text-gray-400">{a.time} · {a.ip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Permission Overview */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm mb-4">Permission Overview</h3>
          <div className="space-y-4">
            {permissions.map((p,i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">{p.type}</span>
                  <span className="font-medium text-gray-700">{p.count} Users &nbsp; {p.pct}%</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2">
                  <div className={`${p.color} h-2 rounded-full`} style={{width:`${p.pct}%`}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm">Recent Users</h3>
          </div>
          <div className="space-y-4">
            {recentUsers.map((u,i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${u.bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {u.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[u.role] || 'bg-gray-100 text-gray-700'}`}>{u.role}</span>
                  <p className="text-xs text-gray-400 mt-1">Added on {u.added} Jun</p>
                </div>
              </div>
            ))}
          </div>
          <button className="text-blue-600 text-xs mt-3 hover:underline">View All Users →</button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Add New User', icon: UserPlus, color: 'text-green-600', bg: 'bg-green-50', action: () => setShowModal(true) },
              { label: 'Roles & Permissions', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Import Users', icon: Upload, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'User Activity Report', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Export Users', icon: Download, color: 'text-teal-600', bg: 'bg-teal-50' },
              { label: 'Manage Sessions', icon: Shield, color: 'text-red-600', bg: 'bg-red-50' },
            ].map((a,i) => (
              <button key={i} onClick={a.action} className={`flex items-center gap-2 ${a.bg} p-2.5 rounded-lg text-xs font-medium ${a.color} hover:opacity-80`}>
                <a.icon size={14} /> {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Add New User</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="text-xs text-gray-500 block mb-1">Full Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Enter full name" className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Email Address</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="user@mlstransports.com" className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Phone</label><input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Mobile number" className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Select Role</option>
                  {['Super Admin','Admin','Fleet Manager','Accounts Manager','Maintenance Manager','Operations Executive','Driver Supervisor','Dispatcher','Fuel Manager','Viewer'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-gray-500 block mb-1">Department</label>
                <select value={form.dept} onChange={e => setForm({...form, dept: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Select Department</option>
                  {['Administration','Operations','Fleet','Accounts','Maintenance','Fuel Management','Reports'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-span-2"><label className="text-xs text-gray-500 block mb-1">Password</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Set initial password" className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Add User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

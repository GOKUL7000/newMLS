'use client';
import { useState } from 'react';
import { Plus, Edit, Shield } from 'lucide-react';
const roles = [
  { name: 'Super Admin', users: 1, desc: 'Full access to all modules and settings', color: 'bg-indigo-100 text-indigo-700',
    permissions: { Dashboard:true, Operations:true, Trips:true, Fleet:true, Drivers:true, Customers:true, Suppliers:true, Accounts:true, Diesel:true, Expenses:true, Maintenances:true, Reports:true, Users:true, Settings:true } },
  { name: 'Admin', users: 2, desc: 'Full access except user management and system settings', color: 'bg-blue-100 text-blue-700',
    permissions: { Dashboard:true, Operations:true, Trips:true, Fleet:true, Drivers:true, Customers:true, Suppliers:true, Accounts:true, Diesel:true, Expenses:true, Maintenances:true, Reports:true, Users:false, Settings:false } },
  { name: 'Fleet Manager', users: 3, desc: 'Manage vehicles, drivers and maintenance', color: 'bg-green-100 text-green-700',
    permissions: { Dashboard:true, Operations:false, Trips:true, Fleet:true, Drivers:true, Customers:false, Suppliers:false, Accounts:false, Diesel:true, Expenses:false, Maintenances:true, Reports:true, Users:false, Settings:false } },
  { name: 'Accounts Manager', users: 2, desc: 'Manage financial transactions and reports', color: 'bg-yellow-100 text-yellow-700',
    permissions: { Dashboard:true, Operations:false, Trips:false, Fleet:false, Drivers:false, Customers:true, Suppliers:true, Accounts:true, Diesel:false, Expenses:true, Maintenances:false, Reports:true, Users:false, Settings:false } },
  { name: 'Operations Executive', users: 5, desc: 'Manage trips and operations', color: 'bg-teal-100 text-teal-700',
    permissions: { Dashboard:true, Operations:true, Trips:true, Fleet:false, Drivers:false, Customers:false, Suppliers:false, Accounts:false, Diesel:true, Expenses:false, Maintenances:false, Reports:false, Users:false, Settings:false } },
  { name: 'Viewer', users: 3, desc: 'Read-only access to dashboard and reports', color: 'bg-gray-100 text-gray-600',
    permissions: { Dashboard:true, Operations:false, Trips:false, Fleet:false, Drivers:false, Customers:false, Suppliers:false, Accounts:false, Diesel:false, Expenses:false, Maintenances:false, Reports:true, Users:false, Settings:false } },
];
const modules = ['Dashboard','Operations','Trips','Fleet','Drivers','Customers','Suppliers','Accounts','Diesel','Expenses','Maintenances','Reports','Users','Settings'];
export default function RolesPermissionsPage() {
  const [selected, setSelected] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const role = roles[selected];
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-800">Roles & Permissions</h1><p className="text-sm text-gray-500">Dashboard / Users / Roles & Permissions</p></div>
        <button onClick={()=>setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus size={15}/> Add Role</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Total Roles',v:'8',c:'text-blue-600'},{l:'Total Users',v:'28',c:'text-gray-700'},{l:'Custom Roles',v:'3',c:'text-purple-600'},{l:'Default Roles',v:'5',c:'text-green-600'}].map((c,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{c.l}</p><p className={`text-2xl font-bold ${c.c}`}>{c.v}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">All Roles</h3>
          <div className="space-y-2">
            {roles.map((r,i)=>(
              <button key={i} onClick={()=>setSelected(i)} className={`w-full text-left p-3 rounded-lg transition-colors ${selected===i?'bg-blue-600 text-white':'hover:bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${selected===i?'text-white':'text-gray-800'}`}>{r.name}</p>
                    <p className={`text-xs ${selected===i?'text-blue-200':'text-gray-400'}`}>{r.users} users</p>
                  </div>
                  <Shield size={14} className={selected===i?'text-blue-200':'text-gray-300'}/>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="col-span-3 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${role.color}`}>{role.name}</span>
              <span className="text-sm text-gray-400">{role.users} users · {role.desc}</span>
            </div>
            <button className="flex items-center gap-1 border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50"><Edit size={13}/> Edit Role</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {modules.map((m,i)=>(
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${role.permissions[m as keyof typeof role.permissions]?'bg-green-50 border-green-200':'bg-gray-50 border-gray-200'}`}>
                <span className="text-sm font-medium text-gray-700">{m}</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${role.permissions[m as keyof typeof role.permissions]?'bg-green-500 text-white':'bg-gray-300 text-white'}`}>
                  {role.permissions[m as keyof typeof role.permissions]?'✓':'✗'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Role</h2>
            <div className="space-y-3">
              <div><label className="text-xs text-gray-500 block mb-1">Role Name</label><input placeholder="e.g. Maintenance Manager" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"/></div>
              <div><label className="text-xs text-gray-500 block mb-1">Description</label><textarea rows={2} placeholder="Role description" className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"/></div>
              <div><label className="text-xs text-gray-500 block mb-2">Based On (Copy Permissions From)</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm"><option>Select existing role...</option>{roles.map(r=><option key={r.name}>{r.name}</option>)}</select>
              </div>
            </div>
            <div className="flex gap-3 mt-5"><button onClick={()=>setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm">Cancel</button><button onClick={()=>setShowModal(false)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">Create Role</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

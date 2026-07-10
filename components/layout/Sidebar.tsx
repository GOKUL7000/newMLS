'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Briefcase, Route, Truck, UserCheck, Users,
  ShoppingCart, BookOpen, Fuel, Receipt, Wrench, BarChart3,
  Bell, Settings, LogOut, ChevronDown, ChevronRight, Menu, Shield
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

const nav = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  // { icon: Briefcase, label: 'Operations', href: '/operations', children: [
  //   { label: 'Active Trips', href: '/operations' },
  //   { label: 'Trip Planning', href: '/operations/planning' },
  //   { label: 'Loading Pending', href: '/operations/loading' },
  //   { label: 'In Transit', href: '/operations/transit' },
  //   { label: 'Completed Trips', href: '/operations/completed' },
  //   { label: 'Delayed Trips', href: '/operations/delayed' },
  // ]},
  { icon: Users, label: 'Customers', href: '/customers', children: [
    { label: 'All Customers', href: '/customers' },
    // { label: 'Customer Ledger', href: '/customers/ledger' },
    // { label: 'Customer Outstanding', href: '/customers/outstanding' },
    // { label: 'Payment History', href: '/customers/payments' },
    // { label: 'Customer Reports', href: '/customers/reports' },
  ]},
  { icon: ShoppingCart, label: 'Suppliers', href: '/suppliers', children: [
    { label: 'All Suppliers', href: '/suppliers' },
    { label: 'Supplier Ledger', href: '/suppliers/ledger' },
    { label: 'Payables / Outstanding', href: '/suppliers/payables' },
    { label: 'Payment History', href: '/suppliers/payments' },
    { label: 'Supplier Reports', href: '/suppliers/reports' },
  ]},
  { icon: UserCheck, label: 'Drivers', href: '/drivers', children: [
    { label: 'All Drivers', href: '/drivers' },
    { label: 'Drivers Ledger', href: '/drivers/ledger' },
  ]},
  { icon: Truck, label: 'Fleet / Trucks', href: '/fleet', children: [
    { label: 'All Vehicles', href: '/fleet' },
    // { label: 'Available Vehicles', href: '/fleet/available' },
    // { label: 'Running Vehicles', href: '/fleet/running' },
    // { label: 'Idle Vehicles', href: '/fleet/idle' },
    { label: 'Maintenance Due', href: '/fleet/maintenance-due' },
    { label: 'Insurance Due', href: '/fleet/insurance-due' },
    { label: 'Permit Due', href: '/fleet/permit-due' },
    { label: 'FC (Fitness) Due', href: '/fleet/fc-due' },
  ]},
  { icon: Route, label: 'Trips', href: '/trips', children: [
    { label: 'All Trips', href: '/trips' },
    // { label: 'Active Trips', href: '/trips/active' },
    // { label: 'Trip Planning', href: '/trips/planning' },
    // { label: 'Loading Pending', href: '/trips/loading' },
    // { label: 'In Transit', href: '/trips/transit' },
    // { label: 'Completed Trips', href: '/trips/completed' },
    // { label: 'Delayed Trips', href: '/trips/delayed' },
    // { label: 'Trip History', href: '/trips/history' },
  ]},  
  
  
  
  // { icon: BookOpen, label: 'Accounts', href: '/accounts', children: [
  //   { label: 'Overview', href: '/accounts' },
  //   { label: 'Cash & Bank', href: '/accounts/cash-bank' },
  //   { label: 'Journal Entries', href: '/accounts/journal-entries' },
  //   { label: 'Chart of Accounts', href: '/accounts/chart-of-accounts' },
  //   { label: 'Contra Entries', href: '/accounts/contra-entries' },
  //   { label: 'Bank Reconciliation', href: '/accounts/bank-reconciliation' },
  // ]},
  // { icon: Fuel, label: 'Diesel Management', href: '/diesel-management', children: [
  //   { label: 'Dashboard', href: '/diesel-management' },
  //   { label: 'Diesel Issuance', href: '/diesel-management/issuance' },
  //   { label: 'Diesel Stock', href: '/diesel-management/stock' },
  //   { label: 'Diesel Expenses', href: '/diesel-management/expenses' },
  //   { label: 'Mileage Report', href: '/diesel-management/mileage' },
  //   { label: 'Pump Management', href: '/diesel-management/pump' },
  // ]},
  // { icon: Receipt, label: 'Expenses', href: '/expenses', children: [
  //   { label: 'Overview', href: '/expenses' },
  //   { label: 'All Expenses', href: '/expenses/all' },
  //   { label: 'Expense Categories', href: '/expenses/categories' },
  //   { label: 'Vendor Payments', href: '/expenses/vendor-payments' },
  //   { label: 'Recurring Expenses', href: '/expenses/recurring' },
  //   { label: 'Expense Reports', href: '/expenses/reports' },
  // ]},
  // { icon: Wrench, label: 'Maintenances', href: '/maintenances', children: [
  //   { label: 'Dashboard', href: '/maintenances' },
  //   { label: 'All Maintenances', href: '/maintenances/all' },
  //   { label: 'Preventive Maintenance', href: '/maintenances/preventive' },
  //   { label: 'Work Orders', href: '/maintenances/work-orders' },
  //   { label: 'Service History', href: '/maintenances/service-history' },
  //   { label: 'Maintenance Calendar', href: '/maintenances/calendar' },
  //   { label: 'Maintenance Reports', href: '/maintenances/reports' },
  // ]},
  // { icon: BarChart3, label: 'Reports', href: '/reports', children: [
  //   { label: 'Overview', href: '/reports' },
  //   { label: 'Financial Reports', href: '/reports/financial' },
  //   { label: 'Operational Reports', href: '/reports/operational' },
  //   { label: 'Vehicle Reports', href: '/reports/vehicle' },
  //   { label: 'Driver Reports', href: '/reports/driver' },
  //   { label: 'Custom Reports', href: '/reports/custom' },
  // ]},
  // { icon: Receipt, label: 'Invoices', href: '/invoices' },
  // { icon: Bell, label: 'Notifications', href: '/notifications' },
  // { icon: Shield, label: 'Users', href: '/users', children: [
  //   { label: 'User List', href: '/users' },
  //   { label: 'Roles & Permissions', href: '/users/roles' },
  //   { label: 'Activity Log', href: '/users/activity' },
  // ]},
  // { icon: Settings, label: 'Settings', href: '/settings', children: [
  //   { label: 'General', href: '/settings' },
  //   { label: 'Company Profile', href: '/settings/company' },
  //   { label: 'Financial Settings', href: '/settings/financial' },
  //   { label: 'Notifications', href: '/settings/notifications' },
  //   { label: 'Roles & Permissions', href: '/settings/roles' },
  //   { label: 'Security', href: '/settings/security' },
  //   { label: 'Backup & Restore', href: '/settings/backup' },
  //   { label: 'Integrations', href: '/settings/integrations' },
  //   { label: 'System Logs', href: '/settings/logs' },
  // ]},
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const toggleMenu = (label: string) => setOpenMenus(p => ({ ...p, [label]: !p[label] }))

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className={clsx(
      'flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300 flex-shrink-0',
      collapsed ? 'w-[64px]' : 'w-[210px]'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-3.5 border-b border-gray-100">
        <div className="w-8 h-8 bg-[#1a56db] rounded-lg flex items-center justify-center flex-shrink-0">
          <Truck size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-extrabold text-[#1a56db] leading-none">MLS</div>
            <div className="text-[9px] text-gray-400 font-semibold tracking-widest">TRANSPORTS</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <Menu size={15} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-1.5">
        {nav.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const open = openMenus[item.label]
          const hasChildren = !!item.children?.length

          return (
            <div key={item.label}>
              <Link
                href={hasChildren ? '#' : item.href}
                onClick={hasChildren ? (e) => { e.preventDefault(); toggleMenu(item.label) } : undefined}
                className={clsx(
                  'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg mb-0.5 text-[12.5px] font-medium transition-all',
                  active ? 'bg-[#1a56db] text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                )}
              >
                <Icon size={15} className="flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {hasChildren && (open ? <ChevronDown size={12} /> : <ChevronRight size={12} />)}
                  </>
                )}
              </Link>

              {hasChildren && !collapsed && open && (
                <div className="ml-6 mb-0.5">
                  {item.children!.map(child => (
                    <Link key={child.href} href={child.href}
                      className={clsx(
                        'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium transition-all mb-0.5',
                        pathname === child.href ? 'text-[#1a56db] bg-blue-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                      )}>
                      <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', pathname === child.href ? 'bg-[#1a56db]' : 'bg-gray-300')} />
                      <span className="truncate">{child.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all mt-1">
          <LogOut size={15} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-gray-100">
          <div className="text-[10px] font-bold text-gray-600">MLS TRANSPORTS</div>
          <div className="text-[9px] text-gray-400 mt-0.5 leading-relaxed">No.45, Transport Nagar,<br />Coimbatore - 641 012.</div>
          <div className="mt-2 h-10 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
            <Truck size={24} className="text-[#1a56db] opacity-50" />
          </div>
        </div>
      )}
    </aside>
  )
}

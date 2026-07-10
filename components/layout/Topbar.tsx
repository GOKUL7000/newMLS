'use client'

import { Bell, ChevronDown, Calendar } from 'lucide-react'

interface TopbarProps {
  title: string
  breadcrumbs?: { label: string; href?: string }[]
}

export default function Topbar({ title, breadcrumbs = [] }: TopbarProps) {
  return (
    <header className="h-13 bg-white border-b border-gray-100 flex items-center px-5 gap-3 flex-shrink-0" style={{ minHeight: 52 }}>
      <div className="flex-1">
        <h1 className="text-[15px] font-bold text-gray-800 leading-tight">{title}</h1>
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <span>Dashboard</span>
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                <span>/</span>
                <span className={i === breadcrumbs.length - 1 ? 'text-gray-600 font-medium' : 'hover:text-blue-600 cursor-pointer'}>
                  {b.label}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-medium text-gray-600 hover:bg-gray-100 transition">
        <Calendar size={12} className="text-gray-400" />
        07 Jun 2026
        <ChevronDown size={11} className="text-gray-400" />
      </button> */}

      <button className="relative w-7 h-7 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
        <Bell size={13} className="text-gray-500" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">0</span>
      </button>

      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[11px] font-bold">G</div>
        <div>
          <div className="text-[11px] font-semibold text-gray-800 leading-tight">Gokul</div>
          <div className="text-[9px] text-gray-400">Admin</div>
        </div>
      </div>
    </header>
  )
}

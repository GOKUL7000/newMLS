'use client'

import { LucideIcon, X, Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useState, ReactNode } from 'react'

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string; value: string; subtitle?: string
  icon: LucideIcon; iconBg: string; iconColor: string; valueColor?: string
  trend?: string; trendUp?: boolean
}
export function StatCard({ title, value, subtitle, icon: Icon, iconBg, iconColor, valueColor = 'text-gray-800', trend, trendUp }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={17} className={iconColor} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide truncate">{title}</div>
        <div className={`text-base font-extrabold leading-tight ${valueColor}`}>{value}</div>
        {subtitle && <div className="text-[10px] text-gray-400 truncate">{subtitle}</div>}
        {trend && (
          <div className={`text-[10px] font-semibold flex items-center gap-0.5 ${trendUp ? 'text-green-500' : 'text-red-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>
}
export function CardHeader({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="card-header">
      <div className="section-title">{children}</div>
      {action}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const badgeMap: Record<string, string> = {
  Active: 'badge-active', Inactive: 'badge-inactive',
  Paid: 'badge-paid', Unpaid: 'badge-unpaid', Partial: 'badge-partial',
  'In Transit': 'badge-intransit', Loading: 'badge-loading', Unloading: 'badge-loading',
  Completed: 'badge-completed', Delayed: 'badge-delayed',
  Running: 'badge-running', Available: 'badge-active',
  Workshop: 'badge-workshop', Breakdown: 'badge-breakdown',
  Approved: 'badge-completed', Pending: 'badge-loading', Rejected: 'badge-unpaid',
  'On Trip': 'badge-intransit', 'In Progress': 'badge-intransit',
  'Due Soon': 'badge-workshop',
}
export function Badge({ status }: { status: string }) {
  return <span className={badgeMap[status] || 'badge-inactive'}>{status}</span>
}

// ─── SearchBar ────────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search...' }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div className="relative">
      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 w-52" />
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({ page, total, perPage = 10, onChange }: {
  page: number; total: number; perPage?: number; onChange: (p: number) => void
}) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1)
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
      <span className="text-[11px] text-gray-400">
        Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total} entries
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
          className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 text-xs">
          <ChevronLeft size={12} />
        </button>
        {pages.map(p => (
          <button key={p} onClick={() => onChange(p)}
            className={`w-6 h-6 flex items-center justify-center rounded border text-[11px] font-medium transition ${p === page ? 'bg-[#1a56db] text-white border-[#1a56db]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
            {p}
          </button>
        ))}
        <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
          className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 text-xs">
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 'max-w-lg' }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; width?: string
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-2xl w-full ${width} max-h-[90vh] overflow-auto`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── AddButton ────────────────────────────────────────────────────────────────
export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="btn-primary">
      <Plus size={13} />{label}
    </button>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ message = 'No data found' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <div className="text-3xl mb-2">📭</div>
      <p className="text-sm">{message}</p>
    </div>
  )
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ value, onChange, options, className = '' }: {
  value: string; onChange: (v: string) => void; options: string[]; className?: string
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className={`text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-600 ${className}`}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  )
}

// ─── QuickActionGrid ─────────────────────────────────────────────────────────
export function QuickActions({ actions }: { actions: { label: string; icon: LucideIcon; color: string; bg: string; onClick?: () => void }[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {actions.map(({ label, icon: Icon, color, bg, onClick }) => (
        <button key={label} onClick={onClick}
          className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border ${bg} transition text-center hover:opacity-80`}>
          <Icon size={16} className={color} />
          <span className="text-[10px] font-semibold text-gray-600 leading-tight">{label}</span>
        </button>
      ))}
    </div>
  )
}

// ─── DeleteConfirm ────────────────────────────────────────────────────────────
export function DeleteConfirm({ open, onClose, onConfirm, name }: {
  open: boolean; onClose: () => void; onConfirm: () => void; name: string
}) {
  return (
    <Modal open={open} onClose={onClose} title="Confirm Delete" width="max-w-sm">
      <p className="text-sm text-gray-600 mb-5">Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={onConfirm} className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition">
          Delete
        </button>
      </div>
    </Modal>
  )
}

// ─── Loading spinner ─────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-3 border-blue-200 border-t-[#1a56db] rounded-full animate-spin" style={{ borderWidth: 3 }} />
    </div>
  )
}

// ─── useTableState ────────────────────────────────────────────────────────────
export function useTableState<T>(data: T[], searchFn: (row: T, q: string) => boolean) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  const filtered = search ? data.filter(r => searchFn(r, search.toLowerCase())) : data
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  return { search, setSearch, page, setPage, filtered, paginated, perPage }
}

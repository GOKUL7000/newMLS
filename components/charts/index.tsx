'use client'

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316']

export function DonutChart({ data, centerLabel, centerSub }: {
  data: { name: string; value: number; color: string; label?: string }[]
  centerLabel?: string; centerSub?: string
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-32 h-32 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" strokeWidth={2} stroke="#fff">
              {data.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-[11px] text-gray-400 font-medium">{centerSub}</div>
            <div className="text-xs font-extrabold text-gray-800">{centerLabel}</div>
          </div>
        )}
      </div>
      <div className="flex-1 space-y-1.5">
        {data.map(item => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
            <span className="text-[11px] text-gray-500 flex-1 truncate">{item.name}</span>
            <span className="text-[11px] font-semibold text-gray-700">{item.label || item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AreaLineChart({ data, dataKey, color = '#1a56db', xKey = 'date' }: {
  data: Record<string, unknown>[]
  dataKey: string; color?: string; xKey?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={130}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id={`grad_${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f8" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
          tickFormatter={v => v >= 100000 ? `${(v/100000).toFixed(0)}L` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#grad_${dataKey})`}
          dot={{ r: 3, fill: color, strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function BarCompareChart({ data, keys, colors = COLORS, xKey = 'date' }: {
  data: Record<string, unknown>[]; keys: string[]; colors?: string[]; xKey?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f8" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
          tickFormatter={v => v >= 100000 ? `${(v/100000).toFixed(0)}L` : v} />
        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
        {keys.map((k, i) => <Bar key={k} dataKey={k} fill={colors[i]} radius={[2, 2, 0, 0]} />)}
      </BarChart>
    </ResponsiveContainer>
  )
}

export function MultiLineChart({ data, keys, colors = COLORS, xKey = 'date' }: {
  data: Record<string, unknown>[]; keys: string[]; colors?: string[]; xKey?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f8" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
        {keys.map((k, i) => (
          <Line key={k} type="monotone" dataKey={k} stroke={colors[i]} strokeWidth={2}
            dot={{ r: 3, fill: colors[i], strokeWidth: 0 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export function HorizontalBar({ label, value, max, color = '#1a56db', amount }: {
  label: string; value: number; max: number; color?: string; amount?: string
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[11px] text-gray-600 truncate flex-1">{label}</span>
        {amount && <span className="text-[11px] font-semibold text-gray-700 ml-2">{amount}</span>}
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  )
}

import { useState, useMemo, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useStore } from '../../store'
import { formatRupiah, MONTH_NAMES } from '../../lib/utils'
import ContextSwitcher from '../Layout/ContextSwitcher'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-lg text-xs">
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {formatRupiah(p.value, true)}
        </p>
      ))}
    </div>
  )
}

export default function Report() {
  const { transactions, categories, loadTransactions, activeContext } = useStore()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year,  setYear]  = useState(now.getFullYear())

  useEffect(() => { loadTransactions({ month, year }) }, [month, year])

  const filtered = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00')
      return t.context === activeContext && d.getMonth() === month && d.getFullYear() === year
    }), [transactions, activeContext, month, year])

  const byCategory = useMemo(() => {
    const map = {}
    filtered.filter(t => t.type === 'expense').forEach(t => {
      const name = categories.find(c => c.id === t.category_id)?.name || 'Lainnya'
      map[name] = (map[name] || 0) + Number(t.amount)
    })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value)
  }, [filtered, categories])

  const dailyData = useMemo(() => {
    const map = {}
    filtered.forEach(t => {
      const day = new Date(t.date + 'T00:00:00').getDate()
      if (!map[day]) map[day] = { day, income: 0, expense: 0 }
      map[day][t.type] += Number(t.amount)
    })
    return Object.values(map).sort((a,b) => a.day - b.day)
  }, [filtered])

  const totalIncome  = filtered.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0)

  const prevMonth = () => month === 0  ? (setMonth(11), setYear(y=>y-1)) : setMonth(m=>m-1)
  const nextMonth = () => month === 11 ? (setMonth(0),  setYear(y=>y+1)) : setMonth(m=>m+1)

  return (
    <div className="page-enter min-h-screen bg-white pb-24">

      {/* ── HEADER ── */}
      <div className="px-5 pt-14 pb-4 sticky top-0 bg-white z-40">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Laporan</h1>
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center active:scale-90 transition-all">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span className="text-sm font-semibold text-gray-700 w-28 text-center">{MONTH_NAMES[month]} {year}</span>
            <button onClick={nextMonth} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center active:scale-90 transition-all">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
        <ContextSwitcher />
      </div>

      <div className="px-5 space-y-8 mt-2">

        {/* ── SUMMARY ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Masuk',   val: totalIncome,                    color: 'text-brand-600' },
            { label: 'Keluar',  val: totalExpense,                   color: 'text-gray-900'  },
            { label: 'Selisih', val: totalIncome - totalExpense,     color: totalIncome-totalExpense >= 0 ? 'text-brand-600' : 'text-red-500' },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-gray-50 rounded-2xl p-4">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-2">{label}</p>
              <p className={`text-sm font-bold ${color} leading-tight`}>{formatRupiah(val, true)}</p>
            </div>
          ))}
        </div>

        {/* ── BAR CHART ── */}
        {dailyData.length > 0 && (
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-4">Harian</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={dailyData} margin={{ top:0, right:0, left:-28, bottom:0 }} barGap={2}>
                <CartesianGrid vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize:9, fill:'#bbb' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:9, fill:'#bbb' }} axisLine={false} tickLine={false} tickFormatter={v => formatRupiah(v,true)} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill:'#f9fafb' }} />
                <Bar dataKey="income"  name="Masuk"  fill="#16a34a" radius={[3,3,0,0]} />
                <Bar dataKey="expense" name="Keluar" fill="#e5e7eb" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── CATEGORY BREAKDOWN ── */}
        {byCategory.length > 0 && (
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-4">Per Kategori</p>
            <div className="space-y-4">
              {byCategory.map(({ name, value }) => {
                const pct = totalExpense > 0 ? (value / totalExpense) * 100 : 0
                return (
                  <div key={name}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-sm text-gray-700 font-medium">{name}</span>
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">{formatRupiah(value, true)}</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-900 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{pct.toFixed(0)}% dari total pengeluaran</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-300 text-sm">Belum ada data</p>
          </div>
        )}
      </div>
    </div>
  )
}

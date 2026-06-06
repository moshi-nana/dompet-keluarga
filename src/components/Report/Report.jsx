import { useState, useMemo, useEffect } from 'react'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useStore } from '../../store'
import { formatRupiah, MONTH_NAMES } from '../../lib/utils'
import ContextSwitcher from '../Layout/ContextSwitcher'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-gray-100 space-y-1">
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div style={{ width:8, height:8, borderRadius:'50%', background: p.color || p.fill }} />
          <span className="text-[11px] font-black text-gray-700">{formatRupiah(p.value, true)}</span>
        </div>
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
    return Object.entries(map).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filtered, categories])

  const dailyData = useMemo(() => {
    const map = {}
    filtered.forEach(t => {
      const day = new Date(t.date + 'T00:00:00').getDate()
      if (!map[day]) map[day] = { day, income: 0, expense: 0 }
      map[day][t.type] += Number(t.amount)
    })
    return Object.values(map).sort((a, b) => a.day - b.day)
  }, [filtered])

  // Running balance for area chart
  const balanceData = useMemo(() => {
    let running = 0
    return dailyData.map(d => {
      running += (d.income - d.expense)
      return { ...d, balance: running }
    })
  }, [dailyData])

  const totalIncome  = filtered.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0)

  const prevMonth = () => month === 0  ? (setMonth(11), setYear(y=>y-1)) : setMonth(m=>m-1)
  const nextMonth = () => month === 11 ? (setMonth(0),  setYear(y=>y+1)) : setMonth(m=>m+1)
  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear()

  return (
    <div className="page-enter min-h-screen bg-gray-50 pb-28">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-50 pt-12 pb-3 px-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-gray-800">Statistik</h1>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between bg-white rounded-full px-4 py-2.5 border border-gray-100 shadow-sm mb-4">
          <button onClick={prevMonth} className="p-1 rounded-full text-gray-500">
            <ArrowDownLeft size={18} className="rotate-45" />
          </button>
          <span className="text-sm font-black text-gray-800 tracking-widest uppercase">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={nextMonth}
            className={`p-1 rounded-full text-gray-500 ${isCurrentMonth ? 'opacity-30' : ''}`}
            disabled={isCurrentMonth}>
            <ArrowUpRight size={18} className="rotate-45" />
          </button>
        </div>

        <ContextSwitcher />
      </div>

      <div className="px-5 space-y-4 mt-2">

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label:'Masuk',   val: totalIncome,              cls:'text-green-700', bg:'bg-green-50 border-green-100'  },
            { label:'Keluar',  val: totalExpense,             cls:'text-red-700',   bg:'bg-red-50 border-red-100'      },
            { label:'Selisih', val: totalIncome-totalExpense, cls: totalIncome-totalExpense>=0?'text-blu-primary':'text-red-600', bg:'bg-white border-gray-100' },
          ].map(({ label, val, cls, bg }) => (
            <div key={label} className={`${bg} border rounded-2xl p-3 shadow-sm`}>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">{label}</p>
              <p className={`text-sm font-black ${cls} leading-tight tabular-nums`}>{formatRupiah(val, true)}</p>
            </div>
          ))}
        </div>

        {/* Bar chart — income vs expense */}
        {dailyData.length > 0 && (
          <div className="blu-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-gray-800 text-sm">Perbandingan Harian</h3>
              <div className="flex items-center gap-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blu-primary inline-block"/>Masuk
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blu-accent inline-block"/>Keluar
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dailyData} margin={{ top:0, right:0, left:-28, bottom:0 }} barGap={2}>
                <CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="3 3"/>
                <XAxis dataKey="day" tick={{ fontSize:9, fill:'#bbb' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:9, fill:'#bbb' }} axisLine={false} tickLine={false} tickFormatter={v=>formatRupiah(v,true)}/>
                <Tooltip content={<CustomTooltip />} cursor={{ fill:'#f9fafb' }}/>
                <Bar dataKey="income"  name="Masuk"  fill="#00AEEF" radius={[4,4,0,0]} barSize={10}/>
                <Bar dataKey="expense" name="Keluar" fill="#FFD700" radius={[4,4,0,0]} barSize={10}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Area chart — running balance */}
        {balanceData.length > 1 && (
          <div className="blu-card">
            <h3 className="font-black text-gray-800 text-sm mb-4">Arus Saldo</h3>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={balanceData} margin={{ top:4, right:0, left:-28, bottom:0 }}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00AEEF" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#00AEEF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="3 3"/>
                <XAxis dataKey="day" tick={{ fontSize:9, fill:'#bbb' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:9, fill:'#bbb' }} axisLine={false} tickLine={false} tickFormatter={v=>formatRupiah(v,true)}/>
                <Tooltip content={<CustomTooltip />}/>
                <Area type="monotone" dataKey="balance" stroke="#00AEEF" fill="url(#balGrad)" strokeWidth={2.5} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category breakdown — bar progress */}
        {byCategory.length > 0 && (
          <div className="blu-card">
            <h3 className="font-black text-gray-800 text-sm mb-5">Pengeluaran per Kategori</h3>
            <div className="space-y-4">
              {byCategory.map(({ name, value }) => {
                const pct = totalExpense > 0 ? (value / totalExpense) * 100 : 0
                return (
                  <div key={name}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-sm text-gray-700 font-bold">{name}</span>
                      <span className="text-sm font-black text-gray-900 tabular-nums">{formatRupiah(value, true)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blu-primary rounded-full transition-all duration-500"
                        style={{ width:`${pct}%` }}/>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 font-semibold">{pct.toFixed(0)}% dari total pengeluaran</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-300 text-sm font-semibold">Belum ada data bulan ini</p>
          </div>
        )}
      </div>
    </div>
  )
}

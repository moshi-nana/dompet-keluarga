import { useState, useMemo, useEffect } from 'react'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useStore } from '../../store'
import { formatRupiah, MONTH_NAMES } from '../../lib/utils'
import ContextSwitcher from '../Layout/ContextSwitcher'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background:'var(--bg-card)', border:'1px solid var(--border-color)',
      borderRadius:12, padding:'8px 12px', boxShadow:'0 4px 16px rgba(0,0,0,0.12)',
    }}>
      {payload.map((p,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background: p.color||p.fill }}/>
          <span style={{ fontSize:11, fontWeight:700, color:'var(--text-primary)' }}>
            {formatRupiah(p.value,true)}
          </span>
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
      const d = new Date(t.date+'T00:00:00')
      return t.context===activeContext && d.getMonth()===month && d.getFullYear()===year
    }), [transactions, activeContext, month, year])

  const byCategory = useMemo(() => {
    const map = {}
    filtered.filter(t=>t.type==='expense').forEach(t => {
      const name = categories.find(c=>c.id===t.category_id)?.name || 'Lainnya'
      map[name] = (map[name]||0) + Number(t.amount)
    })
    return Object.entries(map).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value)
  }, [filtered, categories])

  const dailyData = useMemo(() => {
    const map = {}
    filtered.forEach(t => {
      const day = new Date(t.date+'T00:00:00').getDate()
      if (!map[day]) map[day] = { day, income:0, expense:0 }
      map[day][t.type] += Number(t.amount)
    })
    return Object.values(map).sort((a,b)=>a.day-b.day)
  }, [filtered])

  const balanceData = useMemo(() => {
    let running = 0
    return dailyData.map(d => { running += (d.income-d.expense); return {...d, balance:running} })
  }, [dailyData])

  const totalIncome  = filtered.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0)
  const totalExpense = filtered.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)
  const net = totalIncome - totalExpense

  const prevMonth = () => month===0 ? (setMonth(11),setYear(y=>y-1)) : setMonth(m=>m-1)
  const nextMonth = () => month===11? (setMonth(0), setYear(y=>y+1)) : setMonth(m=>m+1)
  const isCurrentMonth = month===now.getMonth() && year===now.getFullYear()

  return (
    <div className="page-enter min-h-screen pb-28" style={{ background:'var(--bg-base)' }}>

      {/* Sticky header */}
      <div className="sticky top-0 z-40 px-5 pt-12 pb-3"
        style={{ background:'var(--bg-base)', transition:'background 0.3s' }}>
        <h1 className="text-2xl font-black mb-4" style={{ color:'var(--text-primary)' }}>Statistik</h1>

        <div className="flex items-center justify-between rounded-full px-4 py-2.5 mb-4"
          style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
          <button onClick={prevMonth} style={{ color:'var(--text-muted)' }} className="p-1">
            <ArrowDownLeft size={18} className="rotate-45"/>
          </button>
          <span className="text-sm font-black uppercase tracking-widest" style={{ color:'var(--text-primary)' }}>
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={nextMonth} disabled={isCurrentMonth}
            className={`p-1 ${isCurrentMonth?'opacity-30':''}`}
            style={{ color:'var(--text-muted)' }}>
            <ArrowUpRight size={18} className="rotate-45"/>
          </button>
        </div>

        <ContextSwitcher/>
      </div>

      <div className="px-5 space-y-4 mt-2">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label:'Masuk',   val:totalIncome,  color:'#16a34a', bg:'rgba(34,197,94,0.08)',  border:'rgba(34,197,94,0.15)'  },
            { label:'Keluar',  val:totalExpense, color:'#dc2626', bg:'rgba(239,68,68,0.08)',  border:'rgba(239,68,68,0.15)'  },
            { label:'Selisih', val:net,          color: net>=0?'var(--blu-primary)':'#dc2626',
              bg:'var(--bg-card)', border:'var(--border-color)' },
          ].map(({ label, val, color, bg, border }) => (
            <div key={label} className="rounded-2xl p-3"
              style={{ background:bg, border:`1px solid ${border}` }}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1.5"
                style={{ color:'var(--text-muted)' }}>{label}</p>
              <p className="text-sm font-black tabular-nums leading-tight" style={{ color }}>
                {formatRupiah(val,true)}
              </p>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        {dailyData.length > 0 && (
          <div className="rounded-3xl p-5" style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-sm" style={{ color:'var(--text-primary)' }}>Harian</h3>
              <div className="flex items-center gap-3" style={{ fontSize:9, fontWeight:900, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--blu-primary)', display:'inline-block' }}/>Masuk
                </span>
                <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:'#FFD700', display:'inline-block' }}/>Keluar
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={dailyData} margin={{top:0,right:0,left:-28,bottom:0}} barGap={2}>
                <CartesianGrid vertical={false} stroke="var(--border-subtle)" strokeDasharray="3 3"/>
                <XAxis dataKey="day" tick={{fontSize:9, fill:'var(--text-muted)'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:9, fill:'var(--text-muted)'}} axisLine={false} tickLine={false} tickFormatter={v=>formatRupiah(v,true)}/>
                <Tooltip content={<CustomTooltip/>} cursor={{fill:'var(--bg-muted)'}}/>
                <Bar dataKey="income"  fill="var(--blu-primary)" radius={[4,4,0,0]} barSize={10}/>
                <Bar dataKey="expense" fill="#FFD700"            radius={[4,4,0,0]} barSize={10}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Area chart */}
        {balanceData.length > 1 && (
          <div className="rounded-3xl p-5" style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
            <h3 className="font-black text-sm mb-4" style={{ color:'var(--text-primary)' }}>Arus Saldo</h3>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={balanceData} margin={{top:4,right:0,left:-28,bottom:0}}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--blu-primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--blu-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border-subtle)" strokeDasharray="3 3"/>
                <XAxis dataKey="day" tick={{fontSize:9,fill:'var(--text-muted)'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:9,fill:'var(--text-muted)'}} axisLine={false} tickLine={false} tickFormatter={v=>formatRupiah(v,true)}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="balance" stroke="var(--blu-primary)"
                  fill="url(#balGrad)" strokeWidth={2.5} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category breakdown */}
        {byCategory.length > 0 && (
          <div className="rounded-3xl p-5" style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
            <h3 className="font-black text-sm mb-5" style={{ color:'var(--text-primary)' }}>Per Kategori</h3>
            <div className="space-y-4">
              {byCategory.map(({ name, value }) => {
                const pct = totalExpense>0 ? (value/totalExpense)*100 : 0
                return (
                  <div key={name}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-sm font-bold" style={{ color:'var(--text-secondary)' }}>{name}</span>
                      <span className="text-sm font-black tabular-nums" style={{ color:'var(--text-primary)' }}>
                        {formatRupiah(value,true)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'var(--bg-muted)' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width:`${pct}%`, background:'var(--blu-primary)' }}/>
                    </div>
                    <p className="text-[10px] mt-1 font-semibold" style={{ color:'var(--text-muted)' }}>
                      {pct.toFixed(0)}%
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {filtered.length===0 && (
          <div className="py-20 text-center">
            <p className="text-sm font-semibold" style={{ color:'var(--text-muted)' }}>Belum ada data</p>
          </div>
        )}
      </div>
    </div>
  )
}

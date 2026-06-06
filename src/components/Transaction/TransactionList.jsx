import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft, Search, X, TrendingUp } from 'lucide-react'
import { useStore } from '../../store'
import { formatRupiah, MONTH_NAMES } from '../../lib/utils'
import ThemeSwitch from '../Layout/ThemeSwitch'
import TransactionItem from './TransactionItem'
import ContextSwitcher from '../Layout/ContextSwitcher'

export default function TransactionList() {
  const { transactions, categories, loadTransactions, activeContext, deleteTransaction } = useStore()
  const now = new Date()
  const [month, setMonth]     = useState(now.getMonth())
  const [year,  setYear]      = useState(now.getFullYear())
  const [revealedId, setRevealedId] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => { loadTransactions({ month, year }) }, [month, year])
  useEffect(() => { setRevealedId(null) }, [activeContext])

  const getCategoryName = id => categories.find(c => c.id === id)?.name || '—'

  const filtered = useMemo(() => {
    let list = transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00')
      return t.context === activeContext && d.getMonth() === month && d.getFullYear() === year
    })
    if (searchQuery) list = list.filter(t =>
      (t.note || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCategoryName(t.category_id).toLowerCase().includes(searchQuery.toLowerCase())
    )
    return [...list].sort((a,b) => sortOrder === 'desc'
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date))
  }, [transactions, activeContext, month, year, searchQuery, sortOrder])

  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(t => { if (!map[t.date]) map[t.date] = []; map[t.date].push(t) })
    return Object.entries(map).sort(([a],[b]) => b.localeCompare(a))
  }, [filtered])

  const totalIncome  = filtered.filter(t => t.type==='income').reduce((s,t) => s+Number(t.amount),0)
  const totalExpense = filtered.filter(t => t.type==='expense').reduce((s,t) => s+Number(t.amount),0)

  const prevMonth = () => month===0 ? (setMonth(11),setYear(y=>y-1)) : setMonth(m=>m-1)
  const nextMonth = () => month===11? (setMonth(0), setYear(y=>y+1)) : setMonth(m=>m+1)
  const isCurrentMonth = month===now.getMonth() && year===now.getFullYear()

  const formatGroupDate = ds => {
    const d = new Date(ds+'T00:00:00')
    const today=new Date(), yday=new Date(); yday.setDate(yday.getDate()-1)
    if (d.toDateString()===today.toDateString()) return 'Hari Ini'
    if (d.toDateString()===yday.toDateString())  return 'Kemarin'
    return new Intl.DateTimeFormat('id-ID',{weekday:'long',day:'numeric',month:'short'}).format(d)
  }

  return (
    <div className="page-enter min-h-screen pb-28" style={{ background:'var(--bg-base)' }}>

      {/* Sticky header */}
      <div className="sticky top-0 z-40 px-5 pt-12 pb-3"
        style={{ background:'var(--bg-base)', transition:'background 0.3s' }}>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black" style={{ color:'var(--text-primary)' }}>Riwayat</h1>
          <div className="flex items-center gap-2">
            <ThemeSwitch />
            <AnimatePresence>
              {searchOpen && (
                <motion.div initial={{width:0,opacity:0}} animate={{width:140,opacity:1}} exit={{width:0,opacity:0}} className="relative">
                  <input autoFocus value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                    placeholder="Cari..."
                    style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)',
                             color:'var(--text-primary)' }}
                    className="w-full pl-3 pr-8 py-2 rounded-xl text-sm focus:outline-none"/>
                  <button onClick={()=>{setSearchOpen(false);setSearchQuery('')}}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    style={{ color:'var(--text-muted)' }}>
                    <X size={14}/>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            {!searchOpen && (
              <>
                <button onClick={()=>setSearchOpen(true)}
                  className="p-2 rounded-xl"
                  style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', color:'var(--text-muted)' }}>
                  <Search size={16}/>
                </button>
                <button onClick={()=>setSortOrder(v=>v==='asc'?'desc':'asc')}
                  className="p-2 rounded-xl"
                  style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', color:'var(--text-muted)' }}>
                  <TrendingUp size={16} className={sortOrder==='asc'?'rotate-180':''}/>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between rounded-full px-4 py-2.5 mb-4"
          style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
          <button onClick={prevMonth} style={{ color:'var(--text-muted)' }} className="p-1">
            <ArrowDownLeft size={18} className="rotate-45"/>
          </button>
          <span className="text-sm font-black uppercase tracking-widest"
            style={{ color:'var(--text-primary)' }}>
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={nextMonth} disabled={isCurrentMonth}
            className={`p-1 ${isCurrentMonth?'opacity-30':''}`}
            style={{ color:'var(--text-muted)' }}>
            <ArrowUpRight size={18} className="rotate-45"/>
          </button>
        </div>

        <ContextSwitcher className="mb-3"/>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-1">
          <div className="rounded-2xl p-3" style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.15)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowDownLeft size={11} color="#16a34a"/>
              <p className="text-[9px] font-black uppercase tracking-wider" style={{ color:'#16a34a' }}>Pemasukan</p>
            </div>
            <p className="text-base font-black" style={{ color:'#16a34a' }}>{formatRupiah(totalIncome,true)}</p>
          </div>
          <div className="rounded-2xl p-3" style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowUpRight size={11} color="#dc2626"/>
              <p className="text-[9px] font-black uppercase tracking-wider" style={{ color:'#dc2626' }}>Pengeluaran</p>
            </div>
            <p className="text-base font-black" style={{ color:'#dc2626' }}>{formatRupiah(totalExpense,true)}</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="px-5 mt-2">
        {grouped.length===0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-semibold" style={{ color:'var(--text-muted)' }}>Tidak ada transaksi</p>
          </div>
        ) : grouped.map(([date, txs]) => (
          <div key={date} className="mb-5">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[11px] font-black uppercase tracking-widest"
                style={{ color:'var(--text-muted)' }}>{formatGroupDate(date)}</p>
              <p className="text-[10px]" style={{ color:'var(--text-muted)' }}>{txs.length} transaksi</p>
            </div>
            <AnimatePresence>
              {txs.map(tx => (
                <TransactionItem key={tx.id} tx={tx}
                  categoryName={getCategoryName(tx.category_id)}
                  isRevealed={revealedId===tx.id}
                  onReveal={v=>setRevealedId(v?tx.id:null)}
                  onEdit={()=>{}}
                  onDelete={()=>{ if(confirm('Hapus?')) deleteTransaction(tx.id) }}
                />
              ))}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}

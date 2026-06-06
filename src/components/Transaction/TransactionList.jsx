import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft, Search, X, TrendingUp, Moon, Sun } from 'lucide-react'
import { useStore } from '../../store'
import { formatRupiah, MONTH_NAMES } from '../../lib/utils'
import { useTheme } from '../../lib/theme.jsx'
import TransactionItem from './TransactionItem'
import ContextSwitcher from '../Layout/ContextSwitcher'

export default function TransactionList() {
  const { transactions, categories, loadTransactions, activeContext, deleteTransaction } = useStore()
  const { theme, toggleTheme } = useTheme()
  const now = new Date()
  const [month, setMonth]   = useState(now.getMonth())
  const [year, setYear]     = useState(now.getFullYear())
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
    return [...list].sort((a, b) => sortOrder === 'desc'
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date)
    )
  }, [transactions, activeContext, month, year, searchQuery, sortOrder])

  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(t => { if (!map[t.date]) map[t.date] = []; map[t.date].push(t) })
    return Object.entries(map).sort(([a],[b]) => b.localeCompare(a))
  }, [filtered])

  const totalIncome  = filtered.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0)

  const prevMonth = () => month === 0  ? (setMonth(11), setYear(y => y-1)) : setMonth(m => m-1)
  const nextMonth = () => month === 11 ? (setMonth(0),  setYear(y => y+1)) : setMonth(m => m+1)

  const formatGroupDate = ds => {
    const d = new Date(ds + 'T00:00:00')
    const today = new Date(), yday = new Date(); yday.setDate(yday.getDate()-1)
    if (d.toDateString() === today.toDateString()) return 'Hari Ini'
    if (d.toDateString() === yday.toDateString())  return 'Kemarin'
    return new Intl.DateTimeFormat('id-ID', { weekday:'long', day:'numeric', month:'short' }).format(d)
  }

  return (
    <div className="page-enter min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-50 pt-12 pb-3 px-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-gray-800">Catatan Riwayat</h1>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 bg-white rounded-xl shadow-sm text-gray-400 hover:text-blu-primary transition-colors">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <AnimatePresence>
              {searchOpen && (
                <motion.div initial={{ width:0,opacity:0 }} animate={{ width:160,opacity:1 }} exit={{ width:0,opacity:0 }} className="relative">
                  <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari..." className="w-full pl-3 pr-8 py-2 bg-white rounded-xl shadow-sm text-sm focus:outline-none" />
                  <button onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            {!searchOpen && (
              <button onClick={() => setSearchOpen(true)} className="p-2 bg-white rounded-xl shadow-sm text-gray-400">
                <Search size={18} />
              </button>
            )}
            <button onClick={() => setSortOrder(v => v === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-white rounded-xl shadow-sm text-gray-400">
              <TrendingUp size={18} className={sortOrder === 'asc' ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between bg-white rounded-full px-4 py-2.5 border border-gray-100 shadow-sm mb-4">
          <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-50 text-gray-500">
            <ArrowDownLeft size={18} className="rotate-45" />
          </button>
          <span className="text-sm font-black text-gray-800 tracking-widest uppercase">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={nextMonth} className={`p-1 rounded-full transition-colors ${month === now.getMonth() && year === now.getFullYear() ? 'opacity-30' : 'hover:bg-gray-50 text-gray-500'}`}>
            <ArrowUpRight size={18} className="rotate-45" />
          </button>
        </div>

        <ContextSwitcher className="mb-3" />

        {/* Summary strip */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-3 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="p-1 bg-green-500/20 rounded-md">
                <ArrowDownLeft size={11} className="text-green-600" />
              </div>
              <p className="text-[9px] font-black text-green-600 uppercase tracking-wider">Pemasukan</p>
            </div>
            <p className="text-base font-black text-green-700">{formatRupiah(totalIncome, true)}</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-3 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="p-1 bg-red-500/20 rounded-md">
                <ArrowUpRight size={11} className="text-red-600" />
              </div>
              <p className="text-[9px] font-black text-red-600 uppercase tracking-wider">Pengeluaran</p>
            </div>
            <p className="text-base font-black text-red-700">{formatRupiah(totalExpense, true)}</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="px-5 mt-2">
        {grouped.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm font-semibold">Tidak ada transaksi</p>
          </motion.div>
        ) : (
          grouped.map(([date, txs]) => (
            <div key={date} className="mb-5">
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{formatGroupDate(date)}</p>
                <p className="text-[10px] text-gray-300">{txs.length} transaksi</p>
              </div>
              <AnimatePresence>
                {txs.map(tx => (
                  <TransactionItem
                    key={tx.id}
                    tx={tx}
                    categoryName={getCategoryName(tx.category_id)}
                    isRevealed={revealedId === tx.id}
                    onReveal={v => setRevealedId(v ? tx.id : null)}
                    onEdit={() => {}}
                    onDelete={() => { if(confirm('Hapus transaksi ini?')) deleteTransaction(tx.id) }}
                  />
                ))}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

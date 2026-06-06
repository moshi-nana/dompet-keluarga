import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft, ChevronRight, Search, X, Moon, Sun } from 'lucide-react'
import { useStore } from '../../store'
import { formatRupiah, monthYear } from '../../lib/utils'
import { useTheme } from '../../lib/theme.jsx'
import ContextSwitcher from '../Layout/ContextSwitcher'
import TransactionItem from '../Transaction/TransactionItem'

export default function Dashboard() {
  const { transactions, wallets, categories, activeContext, isOnline, fullSync, isSyncing } = useStore()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const now = new Date()

  const [revealedId, setRevealedId] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00')
      return t.context === activeContext
        && d.getMonth() === now.getMonth()
        && d.getFullYear() === now.getFullYear()
    }), [transactions, activeContext])

  const income  = useMemo(() => filtered.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0), [filtered])
  const expense = useMemo(() => filtered.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0), [filtered])
  const totalBalance = useMemo(() => wallets.reduce((s,w) => s + Number(w.balance), 0), [wallets])

  const getCategoryName = id => categories.find(c => c.id === id)?.name || '—'

  const displayTxs = useMemo(() => {
    let list = [...filtered]
    if (searchQuery) list = list.filter(t =>
      (t.note || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCategoryName(t.category_id).toLowerCase().includes(searchQuery.toLowerCase())
    )
    return list.slice(0, 6)
  }, [filtered, searchQuery])

  return (
    <div className="page-enter min-h-screen bg-gray-50 pb-28">

      {/* ── HEADER (Blued style) ── */}
      <header className="bg-blu-primary text-white px-6 pt-12 pb-8 rounded-b-[32px] shadow-lg relative overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          {/* Avatar + greeting */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <span className="font-black text-xl text-blu-primary">D</span>
            </div>
            <div>
              <p className="text-xs text-white/80">Selamat Datang,</p>
              <p className="font-bold text-sm">Dompet Keluarga</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {searchOpen && (
                <motion.div initial={{ width:0,opacity:0 }} animate={{ width:160,opacity:1 }} exit={{ width:0,opacity:0 }} className="relative">
                  <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari..." className="w-full pl-3 pr-8 py-2 bg-white/20 rounded-full text-white text-sm placeholder-white/60 focus:outline-none" />
                  <button onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60">
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            {!searchOpen && (
              <>
                <button onClick={toggleTheme} className="p-2 bg-white/20 rounded-full">
                  {theme === 'light' ? <Moon size={18} className="text-white" /> : <Sun size={18} className="text-white" />}
                </button>
                <button onClick={() => setSearchOpen(true)} className="p-2 bg-white/20 rounded-full">
                  <Search size={18} className="text-white" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Balance */}
        <div className="mb-6">
          <p className="text-sm text-white/80 mb-1">Total Saldo</p>
          <h2 className="text-3xl font-black tracking-tight">{formatRupiah(totalBalance)}</h2>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-yellow-300'}`} />
            <span className="text-xs text-white/70">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Income / Expense cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-green-500/20 rounded-md">
                <ArrowDownLeft size={13} className="text-green-400" />
              </div>
              <span className="text-xs text-white/80">Pemasukan</span>
            </div>
            <p className="font-semibold text-sm">{formatRupiah(income, true)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-red-500/20 rounded-md">
                <ArrowUpRight size={13} className="text-red-400" />
              </div>
              <span className="text-xs text-white/80">Pengeluaran</span>
            </div>
            <p className="font-semibold text-sm">{formatRupiah(expense, true)}</p>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="px-5 pt-5">
        <ContextSwitcher className="mb-5" />

        {/* Recent transactions header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-800 text-base uppercase tracking-widest text-xs">Transaksi Terbaru</h3>
          <button onClick={() => navigate('/transactions')} className="text-blu-primary text-xs font-semibold flex items-center gap-0.5">
            Lihat Semua <ChevronRight size={14} />
          </button>
        </div>

        <AnimatePresence>
          {displayTxs.length === 0 ? (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="py-16 text-center">
              <p className="text-gray-300 text-sm font-medium">Belum ada catatan bulan ini</p>
              <button onClick={() => navigate('/add')}
                className="mt-4 bg-blu-primary text-white text-sm font-bold px-6 py-3 rounded-2xl active:scale-95 transition-all shadow-lg shadow-blu-primary/25">
                Catat Sekarang
              </button>
            </motion.div>
          ) : (
            displayTxs.map(tx => (
              <TransactionItem
                key={tx.id}
                tx={tx}
                categoryName={getCategoryName(tx.category_id)}
                isRevealed={revealedId === tx.id}
                onReveal={v => setRevealedId(v ? tx.id : null)}
                onEdit={() => {}}
                onDelete={() => useStore.getState().deleteTransaction(tx.id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

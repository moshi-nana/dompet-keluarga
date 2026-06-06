import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft, ChevronRight, Search, X } from 'lucide-react'
import { useStore } from '../../store'
import { formatRupiah, monthYear } from '../../lib/utils'
import ContextSwitcher from '../Layout/ContextSwitcher'
import ThemeSwitch from '../Layout/ThemeSwitch'
import TransactionItem from '../Transaction/TransactionItem'

export default function Dashboard() {
  const { transactions, wallets, categories, activeContext, isOnline, fullSync, isSyncing } = useStore()
  const navigate = useNavigate()
  const now = new Date()

  const [revealedId,   setRevealedId]   = useState(null)
  const [searchOpen,   setSearchOpen]   = useState(false)
  const [searchQuery,  setSearchQuery]  = useState('')

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
    <div className="page-enter min-h-screen pb-28" style={{ background: 'var(--bg-base)' }}>

      {/* ── HEADER ── */}
      <header style={{
        background: 'var(--header-bg)',
        transition: 'background 0.3s ease',
      }} className="text-white px-6 pt-12 pb-8 rounded-b-[32px] shadow-lg">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-sm">
              <span className="font-black text-lg text-white">D</span>
            </div>
            <div>
              <p className="text-xs text-white/60">Selamat Datang,</p>
              <p className="font-bold text-sm text-white">Dompet Keluarga</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AnimatePresence>
              {searchOpen && (
                <motion.div initial={{ width:0,opacity:0 }} animate={{ width:150,opacity:1 }} exit={{ width:0,opacity:0 }} className="relative">
                  <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari..."
                    className="w-full pl-3 pr-8 py-2 bg-white/15 rounded-full text-white text-sm placeholder-white/50 focus:outline-none border border-white/20" />
                  <button onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60">
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            {!searchOpen && (
              <button onClick={() => setSearchOpen(true)} className="p-2 bg-white/15 rounded-full border border-white/10">
                <Search size={17} className="text-white" />
              </button>
            )}
            <ThemeSwitch />
          </div>
        </div>

        {/* Balance */}
        <div className="mb-6">
          <p className="text-sm text-white/60 mb-1">Total Saldo</p>
          <h2 className="text-3xl font-black tracking-tight text-white">{formatRupiah(totalBalance)}</h2>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-yellow-300'}`} />
            <span className="text-xs text-white/50">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Income / Expense */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-green-500/20 rounded-md">
                <ArrowDownLeft size={13} className="text-green-400" />
              </div>
              <span className="text-xs text-white/70">Pemasukan</span>
            </div>
            <p className="font-semibold text-sm text-white">{formatRupiah(income, true)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-red-500/20 rounded-md">
                <ArrowUpRight size={13} className="text-red-400" />
              </div>
              <span className="text-xs text-white/70">Pengeluaran</span>
            </div>
            <p className="font-semibold text-sm text-white">{formatRupiah(expense, true)}</p>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="px-5 pt-5">
        <ContextSwitcher className="mb-5" />

        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color:'var(--text-muted)' }}>
            Transaksi Terbaru
          </p>
          <button onClick={() => navigate('/transactions')}
            className="text-xs font-semibold flex items-center gap-0.5"
            style={{ color:'var(--blu-primary)' }}>
            Lihat Semua <ChevronRight size={14} />
          </button>
        </div>

        <AnimatePresence>
          {displayTxs.length === 0 ? (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="py-16 text-center">
              <p className="text-sm font-medium" style={{ color:'var(--text-muted)' }}>Belum ada catatan bulan ini</p>
              <button onClick={() => navigate('/add')}
                className="mt-4 text-white text-sm font-black px-6 py-3 rounded-2xl active:scale-95 transition-all"
                style={{ background:'var(--blu-primary)', boxShadow:'0 4px 16px rgba(0,174,239,0.3)' }}>
                Catat Sekarang
              </button>
            </motion.div>
          ) : (
            displayTxs.map(tx => (
              <TransactionItem key={tx.id} tx={tx}
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

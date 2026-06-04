import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { formatRupiah, monthYear } from '../../lib/utils'
import ContextSwitcher from '../Layout/ContextSwitcher'
import TransactionItem from '../Transaction/TransactionItem'

export default function Dashboard() {
  const { transactions, wallets, categories, activeContext, isOnline, isSyncing, fullSync } = useStore()
  const navigate = useNavigate()
  const now = new Date()

  const filtered = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00')
      return t.context === activeContext
        && d.getMonth() === now.getMonth()
        && d.getFullYear() === now.getFullYear()
    }), [transactions, activeContext])

  const income  = useMemo(() => filtered.filter(t => t.type === 'income').reduce((s,t)  => s + Number(t.amount), 0), [filtered])
  const expense = useMemo(() => filtered.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0), [filtered])
  const totalBalance = useMemo(() => wallets.reduce((s,w) => s + Number(w.balance), 0), [wallets])
  const net = income - expense

  const getCategoryName = id => categories.find(c => c.id === id)?.name || '—'

  return (
    <div className="page-enter min-h-screen bg-white pb-24">

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-5 pt-14 pb-2">
        <div>
          <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">Saldo</p>
          <h1 className="text-3xl font-bold tracking-tighter text-gray-900 leading-none mt-0.5">
            {formatRupiah(totalBalance)}
          </h1>
        </div>
        <button
          onClick={fullSync}
          disabled={isSyncing}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-90 transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className={isSyncing ? 'animate-spin' : ''}>
            <path d="M1 4v6h6M23 20v-6h-6" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"
              stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Wallet pills */}
      {wallets.length > 0 && (
        <div className="flex gap-2 px-5 mt-3 overflow-x-auto scrollbar-hide">
          {wallets.map(w => (
            <div key={w.id} className="flex-shrink-0 border border-gray-100 rounded-full px-3.5 py-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600 flex-shrink-0" />
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{w.name}</span>
              <span className="text-xs font-semibold text-gray-800">{formatRupiah(w.balance, true)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="mx-5 my-5 h-px bg-gray-100" />

      {/* ── CONTEXT + MONTH ── */}
      <div className="px-5">
        <ContextSwitcher className="mb-5" />

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-2">Masuk</p>
            <p className="text-sm font-bold text-brand-600 leading-tight">{formatRupiah(income, true)}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-2">Keluar</p>
            <p className="text-sm font-bold text-gray-900 leading-tight">{formatRupiah(expense, true)}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-2">Selisih</p>
            <p className={`text-sm font-bold leading-tight ${net >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
              {net >= 0 ? '+' : ''}{formatRupiah(net, true)}
            </p>
          </div>
        </div>

        {/* ── RECENT TRANSACTIONS ── */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Terbaru · {monthYear(now)}</p>
          <button onClick={() => navigate('/transactions')} className="text-xs text-gray-900 font-semibold underline underline-offset-2">
            Semua
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-300 text-sm">Belum ada catatan bulan ini</p>
            <button
              onClick={() => navigate('/add')}
              className="mt-4 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full active:scale-95 transition-all"
            >
              Catat sekarang
            </button>
          </div>
        ) : (
          <div>
            {filtered.slice(0, 6).map((tx, i) => (
              <TransactionItem
                key={tx.id}
                tx={tx}
                categoryName={getCategoryName(tx.category_id)}
                last={i === Math.min(filtered.length, 6) - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

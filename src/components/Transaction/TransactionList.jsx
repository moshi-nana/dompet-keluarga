import { useState, useMemo, useEffect } from 'react'
import { useStore } from '../../store'
import { formatRupiah, MONTH_NAMES } from '../../lib/utils'
import TransactionItem from './TransactionItem'
import ContextSwitcher from '../Layout/ContextSwitcher'

export default function TransactionList() {
  const { transactions, categories, loadTransactions, activeContext } = useStore()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year,  setYear]  = useState(now.getFullYear())

  useEffect(() => { loadTransactions({ month, year }) }, [month, year])

  const getCategoryName = id => categories.find(c => c.id === id)?.name || '—'

  const filtered = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00')
      return t.context === activeContext && d.getMonth() === month && d.getFullYear() === year
    }), [transactions, activeContext, month, year])

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
    return new Intl.DateTimeFormat('id-ID', { weekday:'short', day:'numeric', month:'short' }).format(d)
  }

  return (
    <div className="page-enter min-h-screen bg-white pb-24">

      {/* ── HEADER ── */}
      <div className="px-5 pt-14 pb-4 sticky top-0 bg-white z-40">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Transaksi</h1>
          {/* Month nav */}
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center active:scale-90 transition-all">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-700 w-28 text-center">
              {MONTH_NAMES[month]} {year}
            </span>
            <button onClick={nextMonth} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center active:scale-90 transition-all">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <ContextSwitcher className="mb-4" />

        {/* Summary strip */}
        <div className="flex gap-4 py-3 border-y border-gray-50">
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Masuk</p>
            <p className="text-sm font-bold text-brand-600 mt-0.5">{formatRupiah(totalIncome, true)}</p>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Keluar</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{formatRupiah(totalExpense, true)}</p>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Selisih</p>
            <p className={`text-sm font-bold mt-0.5 ${totalIncome-totalExpense >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
              {formatRupiah(totalIncome-totalExpense, true)}
            </p>
          </div>
        </div>
      </div>

      {/* ── LIST ── */}
      <div className="px-5">
        {grouped.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-300 text-sm">Tidak ada transaksi</p>
          </div>
        ) : (
          grouped.map(([date, txs]) => (
            <div key={date} className="mb-6">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {formatGroupDate(date)}
              </p>
              {txs.map((tx, i) => (
                <TransactionItem
                  key={tx.id}
                  tx={tx}
                  categoryName={getCategoryName(tx.category_id)}
                  last={i === txs.length - 1}
                  showDelete
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

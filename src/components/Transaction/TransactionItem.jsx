import { formatRupiah, formatDateShort } from '../../lib/utils'
import { useStore } from '../../store'

// Category initial avatar - clean, no emoji
function CategoryDot({ name, type }) {
  const initial = name ? name[0].toUpperCase() : '?'
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
      type === 'income' ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-500'
    }`}>
      {initial}
    </div>
  )
}

export default function TransactionItem({ tx, categoryName, last, showDelete = false }) {
  const deleteTransaction = useStore(s => s.deleteTransaction)
  const isIncome = tx.type === 'income'

  return (
    <div className={`flex items-center gap-3 py-3 ${!last ? 'border-b border-gray-50' : ''}`}>
      <CategoryDot name={categoryName} type={tx.type} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {tx.note || categoryName}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {categoryName}{tx.note ? '' : ''} · {formatDateShort(tx.date)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-semibold tabular-nums ${isIncome ? 'text-brand-600' : 'text-gray-900'}`}>
          {isIncome ? '+' : '−'}{formatRupiah(tx.amount, true)}
        </span>
        {showDelete && (
          <button
            onClick={() => confirm('Hapus?') && deleteTransaction(tx.id)}
            className="text-gray-300 hover:text-red-400 active:scale-90 transition-all p-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

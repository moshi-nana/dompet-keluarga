import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft, Edit2, Trash2, RotateCcw } from 'lucide-react'
import { formatRupiah } from '../../lib/utils'
import { useStore } from '../../store'

export default function TransactionItem({ tx, categoryName, isRevealed, onReveal, onEdit, onDelete, last }) {
  const isIncome  = tx.type === 'income'
  const isContext = tx.context === 'business'

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -60) onReveal(true)
    else if (info.offset.x > 30) onReveal(false)
    else onReveal(isRevealed)
  }

  return (
    <div className={`relative mb-3 rounded-2xl overflow-hidden isolate shadow-sm border border-gray-100 dark:border-gray-800`}>
      {/* Action buttons behind */}
      <div className="absolute inset-[5px] bg-gray-100 dark:bg-gray-800 flex justify-end items-center rounded-[11px] overflow-hidden">
        <div className="flex h-full">
          <div
            className="w-[72px] h-full flex flex-col items-center justify-center bg-blu-primary text-white cursor-pointer active:brightness-90"
            onClick={e => { e.stopPropagation(); onEdit?.(); onReveal(false) }}
          >
            <Edit2 size={16} />
            <span className="text-[8px] font-black uppercase mt-1">Edit</span>
          </div>
          <div
            className="w-[72px] h-full flex flex-col items-center justify-center bg-red-600 text-white cursor-pointer active:brightness-90"
            onClick={e => { e.stopPropagation(); onDelete?.(); onReveal(false) }}
          >
            <Trash2 size={16} />
            <span className="text-[8px] font-black uppercase mt-1">Hapus</span>
          </div>
        </div>
      </div>

      {/* Draggable foreground */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -144, right: 0 }}
        dragElastic={0.15}
        dragTransition={{ bounceStiffness: 500, bounceDamping: 35 }}
        animate={{ x: isRevealed ? -144 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 40, mass: 0.6 }}
        onDragEnd={handleDragEnd}
        onClick={() => { if (isRevealed) onReveal(false) }}
        className="p-4 flex items-center justify-between bg-white dark:bg-gray-900 relative z-10 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 leading-tight">
                {tx.note || categoryName}
              </p>
              <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                isContext
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-purple-100 text-purple-600'
              }`}>
                {isContext ? 'Usaha' : 'RT'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{categoryName} · {tx.date}</p>
          </div>
        </div>
        <p className={`font-bold text-sm ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
          {isIncome ? '+' : '-'}{formatRupiah(tx.amount, true)}
        </p>
      </motion.div>
    </div>
  )
}

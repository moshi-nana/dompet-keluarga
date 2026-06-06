import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft, Edit2, Trash2 } from 'lucide-react'
import { formatRupiah } from '../../lib/utils'

export default function TransactionItem({ tx, categoryName, isRevealed, onReveal, onEdit, onDelete }) {
  const isIncome = tx.type === 'income'

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -60) onReveal(true)
    else if (info.offset.x > 30) onReveal(false)
    else onReveal(isRevealed)
  }

  return (
    <div className="relative mb-3 rounded-2xl overflow-hidden isolate"
      style={{ border:'1px solid var(--border-subtle)', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
      {/* Action buttons behind */}
      <div style={{
        position:'absolute', inset:5,
        background:'var(--bg-muted)',
        borderRadius:11, display:'flex', justifyContent:'flex-end', alignItems:'center', overflow:'hidden',
      }}>
        <div style={{ display:'flex', height:'100%' }}>
          <div onClick={() => { onEdit?.(); onReveal(false) }}
            style={{ width:72, display:'flex', flexDirection:'column', alignItems:'center',
                     justifyContent:'center', background:'var(--blu-primary)',
                     color:'#fff', cursor:'pointer', gap:4 }}>
            <Edit2 size={16}/>
            <span style={{ fontSize:8, fontWeight:900, textTransform:'uppercase' }}>Edit</span>
          </div>
          <div onClick={() => { onDelete?.(); onReveal(false) }}
            style={{ width:72, display:'flex', flexDirection:'column', alignItems:'center',
                     justifyContent:'center', background:'#dc2626',
                     color:'#fff', cursor:'pointer', gap:4 }}>
            <Trash2 size={16}/>
            <span style={{ fontSize:8, fontWeight:900, textTransform:'uppercase' }}>Hapus</span>
          </div>
        </div>
      </div>

      {/* Draggable card */}
      <motion.div
        drag="x"
        dragConstraints={{ left:-144, right:0 }}
        dragElastic={0.12}
        dragTransition={{ bounceStiffness:500, bounceDamping:35 }}
        animate={{ x: isRevealed ? -144 : 0 }}
        transition={{ type:'spring', stiffness:400, damping:40, mass:0.6 }}
        onDragEnd={handleDragEnd}
        onClick={() => { if (isRevealed) onReveal(false) }}
        style={{
          padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between',
          background:'var(--bg-card)', position:'relative', zIndex:1,
          cursor:'grab', transition:'background 0.3s ease',
        }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:40, height:40, borderRadius:12, flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'center',
            background: isIncome ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
          }}>
            {isIncome
              ? <ArrowDownLeft size={18} color="#16a34a"/>
              : <ArrowUpRight  size={18} color="#dc2626"/>
            }
          </div>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
              <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', lineHeight:1.2 }}>
                {tx.note || categoryName}
              </p>
              <span style={{
                fontSize:8, padding:'2px 6px', borderRadius:999, fontWeight:900,
                textTransform:'uppercase', letterSpacing:'0.05em',
                background: tx.context === 'business' ? 'rgba(59,130,246,0.12)' : 'rgba(139,92,246,0.12)',
                color: tx.context === 'business' ? '#3b82f6' : '#8b5cf6',
              }}>
                {tx.context === 'business' ? 'Usaha' : 'RT'}
              </span>
            </div>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
              {categoryName} · {tx.date}
            </p>
          </div>
        </div>
        <p style={{
          fontSize:14, fontWeight:700,
          color: isIncome ? '#16a34a' : '#dc2626',
          flexShrink:0,
        }}>
          {isIncome ? '+' : '-'}{formatRupiah(tx.amount, true)}
        </p>
      </motion.div>
    </div>
  )
}

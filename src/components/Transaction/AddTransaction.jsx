import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { useStore } from '../../store'
import { todayISO } from '../../lib/utils'
import ContextSwitcher from '../Layout/ContextSwitcher'

export default function AddTransaction() {
  const navigate = useNavigate()
  const { addTransaction, wallets, categories, activeContext } = useStore()

  const [type,       setType]       = useState('expense')
  const [amount,     setAmount]     = useState('')
  const [note,       setNote]       = useState('')
  const [date,       setDate]       = useState(todayISO())
  const [categoryId, setCategoryId] = useState('')
  const [walletId,   setWalletId]   = useState(wallets[0]?.id || '')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  const filteredCats = useMemo(() =>
    categories.filter(c => c.context === activeContext && c.type === type),
    [categories, activeContext, type])

  const displayAmount = val => val ? new Intl.NumberFormat('id-ID').format(Number(val)) : ''
  const handleAmountInput = val => setAmount(val.replace(/\D/g,''))

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return setError('Isi nominal dulu')
    if (!categoryId) return setError('Pilih kategori')
    setError(''); setLoading(true)
    try {
      await addTransaction({ type, context: activeContext, amount: Number(amount), category_id: categoryId, wallet_id: walletId, note: note.trim(), date })
      navigate(-1)
    } catch { setError('Gagal menyimpan.') }
    finally { setLoading(false) }
  }

  return (
    <div className="page-enter fixed inset-0 bg-gray-50 z-[60] flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className={`px-6 pt-12 pb-6 rounded-b-[32px] shadow-lg ${type === 'income' ? 'bg-green-500' : 'bg-blu-primary'} transition-colors duration-300`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-white">
            {type === 'expense' ? 'Catat Pengeluaran' : 'Catat Pemasukan'}
          </h3>
          <button onClick={() => navigate(-1)} className="p-2 bg-white/20 rounded-full">
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex p-1.5 bg-white/20 rounded-2xl mb-4">
          {[['expense','Pengeluaran'],['income','Pemasukan']].map(([t,label]) => (
            <button key={t} type="button" onClick={() => { setType(t); setCategoryId('') }}
              className={`flex-1 py-2 text-[11px] font-black rounded-xl transition-all ${
                type === t ? 'bg-white text-gray-800 shadow-sm' : 'text-white/80'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <p className="text-xs text-white/70 font-bold uppercase tracking-widest mb-1">Nominal</p>
          <div className="flex items-baseline gap-2">
            <span className="text-white/70 text-xl font-bold">Rp</span>
            <input
              type="tel" inputMode="numeric"
              value={displayAmount(amount)}
              onChange={e => handleAmountInput(e.target.value.replace(/\./g,'').replace(/,/g,''))}
              placeholder="0"
              className="flex-1 text-4xl font-black text-white bg-transparent border-none outline-none placeholder-white/30 tracking-tight"
            />
          </div>
        </div>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 pb-32">
        <ContextSwitcher />

        {/* Category */}
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Kategori</p>
          {filteredCats.length === 0 ? (
            <p className="text-sm text-gray-300">Belum ada kategori.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filteredCats.map(cat => (
                <button key={cat.id} onClick={() => setCategoryId(cat.id)}
                  className={`px-3 py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 text-center ${
                    categoryId === cat.id
                      ? 'bg-blu-primary text-white shadow-md shadow-blu-primary/25'
                      : 'bg-white text-gray-600 border border-gray-100 shadow-sm'
                  }`}>
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Wallet */}
        {wallets.length > 1 && (
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Dompet</p>
            <div className="flex gap-2 flex-wrap">
              {wallets.map(w => (
                <button key={w.id} onClick={() => setWalletId(w.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                    walletId === w.id
                      ? 'bg-blu-primary text-white shadow-md shadow-blu-primary/25'
                      : 'bg-white text-gray-600 border border-gray-100 shadow-sm'
                  }`}>
                  {w.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date */}
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Tanggal</p>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="blu-input" />
        </div>

        {/* Note */}
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Keterangan (Opsional)</p>
          <input type="text" value={note} onChange={e => setNote(e.target.value)}
            placeholder="Misal: beli bahan baku untuk jualan..." className="blu-input" />
        </div>

        {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
      </div>

      {/* Submit */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-gray-50 via-gray-50">
        <button onClick={handleSubmit} disabled={loading || !amount || !categoryId}
          className="w-full bg-blu-primary text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest
                     disabled:opacity-30 active:scale-[0.98] transition-all shadow-lg shadow-blu-primary/30 flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : 'Simpan Transaksi'}
        </button>
      </div>
    </div>
  )
}

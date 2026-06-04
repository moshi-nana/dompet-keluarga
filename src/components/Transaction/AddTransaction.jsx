import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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

  const handleAmountInput = val => {
    setAmount(val.replace(/\D/g, ''))
  }

  const displayAmount = val =>
    val ? new Intl.NumberFormat('id-ID').format(Number(val)) : ''

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return setError('Isi nominal dulu')
    if (!categoryId) return setError('Pilih kategori')
    if (!walletId) return setError('Pilih dompet')
    setError(''); setLoading(true)
    try {
      await addTransaction({ type, context: activeContext, amount: Number(amount), category_id: categoryId, wallet_id: walletId, note: note.trim(), date })
      navigate(-1)
    } catch { setError('Gagal menyimpan.') }
    finally { setLoading(false) }
  }

  return (
    <div className="page-enter min-h-screen bg-white pb-10">

      {/* ── TOP ── */}
      <div className="flex items-center justify-between px-5 pt-14 pb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-90 transition-all">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <p className="text-sm font-semibold text-gray-900">Catat Transaksi</p>
        <div className="w-9" />
      </div>

      {/* ── TYPE TOGGLE ── */}
      <div className="flex gap-2 px-5 mb-8">
        {[['expense','Pengeluaran'],['income','Pemasukan']].map(([t, label]) => (
          <button
            key={t}
            onClick={() => { setType(t); setCategoryId('') }}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
              type === t
                ? t === 'expense' ? 'bg-gray-900 text-white' : 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── AMOUNT ── */}
      <div className="px-5 mb-8">
        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-2">Nominal</p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-semibold text-gray-400">Rp</span>
          <input
            type="tel"
            inputMode="numeric"
            value={displayAmount(amount)}
            onChange={e => handleAmountInput(e.target.value.replace(/\./g,'').replace(/,/g,''))}
            placeholder="0"
            className="flex-1 text-4xl font-bold text-gray-900 bg-transparent border-none outline-none placeholder-gray-200 tracking-tighter"
          />
        </div>
        <div className="h-px bg-gray-100 mt-3" />
      </div>

      <div className="px-5 space-y-6">
        {/* ── CONTEXT ── */}
        <div>
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-2">Kelompok</p>
          <ContextSwitcher />
        </div>

        {/* ── CATEGORY ── */}
        <div>
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-3">Kategori</p>
          {filteredCats.length === 0 ? (
            <p className="text-sm text-gray-300">Belum ada kategori untuk tipe ini.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredCats.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                    categoryId === cat.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── WALLET ── */}
        {wallets.length > 1 && (
          <div>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-2">Dompet</p>
            <div className="flex gap-2 flex-wrap">
              {wallets.map(w => (
                <button
                  key={w.id}
                  onClick={() => setWalletId(w.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                    walletId === w.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── DATE ── */}
        <div>
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-2">Tanggal</p>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
        </div>

        {/* ── NOTE ── */}
        <div>
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-2">Keterangan</p>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Opsional — misal: beli tepung 2kg"
            className="input"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading || !amount || !categoryId}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl text-sm font-semibold
                     disabled:opacity-30 active:scale-[0.98] transition-all"
        >
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </div>
  )
}

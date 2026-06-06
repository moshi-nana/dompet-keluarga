import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Camera, Mic } from 'lucide-react'
import { useStore } from '../../store'
import { todayISO } from '../../lib/utils'
import { geminiJSON, geminiVision } from '../../lib/gemini'
import ContextSwitcher from '../Layout/ContextSwitcher'
import ScannerModal from './ScannerModal'
import VoiceInput from './VoiceInput'

// Local keyword rules — instant, no AI needed
const LOCAL_RULES = {
  'susu':       { category: 'Belanja Dapur',    context: 'household', type: 'expense' },
  'beras':      { category: 'Belanja Dapur',    context: 'household', type: 'expense' },
  'sayur':      { category: 'Belanja Dapur',    context: 'household', type: 'expense' },
  'makan':      { category: 'Makan & Minum',    context: 'household', type: 'expense' },
  'minum':      { category: 'Makan & Minum',    context: 'household', type: 'expense' },
  'kopi':       { category: 'Makan & Minum',    context: 'household', type: 'expense' },
  'bensin':     { category: 'Transport',         context: 'household', type: 'expense' },
  'parkir':     { category: 'Transport',         context: 'household', type: 'expense' },
  'gojek':      { category: 'Transport',         context: 'household', type: 'expense' },
  'grab':       { category: 'Transport',         context: 'household', type: 'expense' },
  'listrik':    { category: 'Tagihan & Utilitas',context: 'household', type: 'expense' },
  'air':        { category: 'Tagihan & Utilitas',context: 'household', type: 'expense' },
  'internet':   { category: 'Tagihan & Utilitas',context: 'household', type: 'expense' },
  'obat':       { category: 'Kesehatan',         context: 'household', type: 'expense' },
  'dokter':     { category: 'Kesehatan',         context: 'household', type: 'expense' },
  'sekolah':    { category: 'Pendidikan',        context: 'household', type: 'expense' },
  'buku':       { category: 'Pendidikan',        context: 'household', type: 'expense' },
  'gaji':       { category: 'Gaji / Pemasukan', context: 'household', type: 'income'  },
  'bahan':      { category: 'Modal / Bahan Baku',context: 'business',  type: 'expense' },
  'modal':      { category: 'Modal / Bahan Baku',context: 'business',  type: 'expense' },
  'jualan':     { category: 'Omzet / Penjualan', context: 'business',  type: 'income'  },
  'omzet':      { category: 'Omzet / Penjualan', context: 'business',  type: 'income'  },
  'laku':       { category: 'Omzet / Penjualan', context: 'business',  type: 'income'  },
  'terjual':    { category: 'Omzet / Penjualan', context: 'business',  type: 'income'  },
  'operasional':{ category: 'Operasional Usaha', context: 'business',  type: 'expense' },
}

function matchLocalRule(text) {
  const lower = text.toLowerCase()
  for (const [key, val] of Object.entries(LOCAL_RULES)) {
    if (lower.includes(key)) return val
  }
  return null
}

async function parseWithAI(text, categories) {
  const catNames = categories.map(c => `"${c.name}" (${c.context}, ${c.type})`).join(', ')
  return geminiJSON(
    `Pengguna berkata: "${text}"
Kategori tersedia: ${catNames}

Ekstrak data transaksi dari kalimat di atas. Kembalikan JSON dengan format:
{
  "note": "deskripsi singkat",
  "amount": angka nominal (hanya angka, tanpa titik/koma),
  "type": "expense" atau "income",
  "context": "household" atau "business",
  "category": "nama kategori yang paling sesuai dari daftar di atas"
}

Aturan:
- Kata seperti "beli", "bayar", "beli" → expense
- Kata seperti "dapat", "terima", "gaji", "jualan", "laku" → income
- Kalau ada kata usaha/bisnis/jualan → context business, selain itu household
- Ambil angka pertama yang muncul sebagai amount
- Kalau tidak ada angka, amount = 0`
  )
}

async function parseReceiptWithAI(base64Image, categories) {
  const catNames = categories.map(c => c.name).join(', ')
  return geminiVision(
    base64Image,
    `Baca nota/struk belanja ini. Ekstrak data transaksi utama dan kembalikan JSON:
{
  "note": "nama toko atau deskripsi",
  "amount": total nominal (angka saja),
  "type": "expense",
  "context": "household",
  "category": "pilih yang paling sesuai dari: ${catNames}"
}
Fokus pada TOTAL akhir / grand total.`
  )
}

export default function AddTransaction() {
  const navigate = useNavigate()
  const { addTransaction, wallets, categories, activeContext, setContext } = useStore()

  const [type,        setType]       = useState('expense')
  const [amount,      setAmount]     = useState('')
  const [note,        setNote]       = useState('')
  const [date,        setDate]       = useState(todayISO())
  const [categoryId,  setCategoryId] = useState('')
  const [walletId,    setWalletId]   = useState(wallets[0]?.id || '')
  const [loading,     setLoading]    = useState(false)
  const [aiLoading,   setAiLoading]  = useState(false)
  const [error,       setError]      = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [scanLoading, setScanLoading] = useState(false)
  const [showVoice,   setShowVoice]   = useState(false)

  const filteredCats = useMemo(() =>
    categories.filter(c => c.context === activeContext && c.type === type),
    [categories, activeContext, type])

  const displayAmount = val => val ? new Intl.NumberFormat('id-ID').format(Number(val)) : ''
  const handleAmountInput = val => setAmount(val.replace(/\D/g, ''))

  // Apply parsed result to form
  const applyParsed = (parsed) => {
    if (parsed.note)    setNote(parsed.note)
    if (parsed.amount && Number(parsed.amount) > 0) setAmount(String(parsed.amount))
    if (parsed.type)    setType(parsed.type)
    if (parsed.context) setContext(parsed.context)

    // Match category name to id
    if (parsed.category) {
      const match = categories.find(c =>
        c.name.toLowerCase() === parsed.category.toLowerCase() ||
        c.name.toLowerCase().includes(parsed.category.toLowerCase())
      )
      if (match) setCategoryId(match.id)
    }
  }

  // Voice result handler
  const handleVoiceResult = async (text) => {
    setShowVoice(false)
    setAiLoading(true)
    try {
      // Try local rules first (instant)
      const local = matchLocalRule(text)
      if (local) {
        setNote(text)
        setType(local.type)
        setContext(local.context)
        // Extract number from text
        const nums = text.match(/\d[\d.,]*/g)
        if (nums) {
          const clean = nums[nums.length - 1].replace(/\./g,'').replace(/,/g,'')
          setAmount(clean)
        }
        const match = categories.find(c => c.name === local.category)
        if (match) setCategoryId(match.id)
      } else {
        // Fallback to AI
        const parsed = await parseWithAI(text, categories)
        applyParsed(parsed)
      }
    } catch (e) {
      setError('Gagal proses suara. Isi manual.')
    } finally {
      setAiLoading(false)
    }
  }

  // Scan receipt handler
  const handleScan = async (base64) => {
    setScanLoading(true)
    try {
      const parsed = await parseReceiptWithAI(base64, categories)
      setShowScanner(false)
      applyParsed(parsed)
    } catch (e) {
      setError('Gagal baca nota. Coba foto lebih jelas.')
      setShowScanner(false)
    } finally {
      setScanLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return setError('Isi nominal dulu')
    if (!categoryId) return setError('Pilih kategori')
    setError(''); setLoading(true)
    try {
      await addTransaction({
        type, context: activeContext,
        amount: Number(amount),
        category_id: categoryId,
        wallet_id: walletId,
        note: note.trim(),
        date,
      })
      navigate(-1)
    } catch { setError('Gagal menyimpan.') }
    finally { setLoading(false) }
  }

  return (
    <>
      <div className="page-enter fixed inset-0 bg-gray-50 z-[60] flex flex-col" style={{ maxWidth:448, margin:'0 auto' }}>

        {/* ── HEADER ── */}
        <div className={`px-6 pt-12 pb-6 rounded-b-[32px] shadow-lg ${
          type === 'income' ? 'bg-green-500' : 'bg-blu-primary'
        } transition-colors duration-300`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-black text-white">
              {type === 'expense' ? 'Catat Pengeluaran' : 'Catat Pemasukan'}
            </h3>
            <div className="flex items-center gap-2">
              {/* Voice button */}
              <button onClick={() => setShowVoice(true)}
                className="p-2.5 bg-white/20 rounded-2xl active:scale-90 transition-all"
                title="Input Suara"
              >
                <Mic size={18} className="text-white" />
              </button>
              {/* Scan button */}
              <button onClick={() => setShowScanner(true)}
                className="p-2.5 bg-white/20 rounded-2xl active:scale-90 transition-all"
                title="Scan Nota"
              >
                <Camera size={18} className="text-white" />
              </button>
              <button onClick={() => navigate(-1)} className="p-2.5 bg-white/20 rounded-2xl">
                <X size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* AI loading indicator */}
          {aiLoading && (
            <div className="flex items-center gap-2 mb-3 bg-white/20 rounded-2xl px-3 py-2">
              <Loader2 size={14} className="text-white animate-spin" />
              <p className="text-white text-xs font-bold">AI memproses...</p>
            </div>
          )}

          {/* Type toggle */}
          <div className="flex p-1.5 bg-white/20 rounded-2xl mb-4">
            {[['expense','Pengeluaran'],['income','Pemasukan']].map(([t,label]) => (
              <button key={t} type="button"
                onClick={() => { setType(t); setCategoryId('') }}
                className={`flex-1 py-2 text-[11px] font-black rounded-xl transition-all ${
                  type === t ? 'bg-white text-gray-800 shadow-sm' : 'text-white/80'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <p className="text-xs text-white/70 font-black uppercase tracking-widest mb-1">Nominal</p>
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

        {/* ── SCROLLABLE FORM ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 pb-32">
          <ContextSwitcher />

          {/* Category grid */}
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
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Keterangan</p>
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              placeholder="Misal: beli bahan baku untuk jualan..." className="blu-input" />
          </div>

          {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
        </div>

        {/* ── SUBMIT ── */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-gray-50 via-gray-50/95">
          <button onClick={handleSubmit}
            disabled={loading || !amount || !categoryId}
            className="w-full bg-blu-primary text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest
                       disabled:opacity-30 active:scale-[0.98] transition-all shadow-lg shadow-blu-primary/30
                       flex items-center justify-center gap-2">
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
              : 'Simpan Transaksi'
            }
          </button>
        </div>
      </div>

      {/* Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <ScannerModal
            onClose={() => setShowScanner(false)}
            onScan={handleScan}
            isScanning={scanLoading}
          />
        )}
      </AnimatePresence>

      {/* Voice Modal */}
      <AnimatePresence>
        {showVoice && (
          <VoiceInput
            onResult={handleVoiceResult}
            onClose={() => setShowVoice(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

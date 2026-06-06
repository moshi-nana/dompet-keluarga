import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, RefreshCw, LogOut, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '../../store'
import { formatRupiah } from '../../lib/utils'
import { signOut } from '../../hooks/useAuth'
import { useTheme } from '../../lib/theme.jsx'

function SectionHeader({ children }) {
  return <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">{children}</p>
}

function Pill({ children, active, onClick, variant='default' }) {
  const base = 'px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer'
  const styles = {
    default: active ? 'bg-blu-primary text-white shadow-md shadow-blu-primary/25' : 'bg-gray-100 text-gray-500',
    dark:    active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500',
  }
  return <button className={`${base} ${styles[variant]}`} onClick={onClick}>{children}</button>
}

export default function Settings() {
  const { wallets, categories, addWallet, addCategory, fullSync, isSyncing, lastSync, session } = useStore()
  const { theme, toggleTheme } = useTheme()

  const [showAddWallet, setShowAddWallet] = useState(false)
  const [showAddCat,    setShowAddCat]    = useState(false)
  const [openCtx,       setOpenCtx]       = useState(null)

  const [wName, setWName] = useState('')
  const [wType, setWType] = useState('cash')
  const [cName, setCName] = useState('')
  const [cCtx,  setCCtx]  = useState('household')
  const [cType, setCType] = useState('expense')

  const handleAddWallet = async () => {
    if (!wName.trim()) return
    await addWallet({ name: wName.trim(), type: wType, icon: '💵', color: '#00AEEF' })
    setWName(''); setShowAddWallet(false)
  }
  const handleAddCategory = async () => {
    if (!cName.trim()) return
    await addCategory({ name: cName.trim(), context: cCtx, type: cType, icon: '📦', color: '#00AEEF' })
    setCName(''); setShowAddCat(false)
  }

  const walletTypeLabel = t => ({ cash:'Tunai', bank:'Bank', ewallet:'E-Wallet' }[t] || t)
  const householdCats = categories.filter(c => c.context === 'household')
  const businessCats  = categories.filter(c => c.context === 'business')

  return (
    <div className="page-enter min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="bg-blu-primary px-6 pt-12 pb-8 rounded-b-[32px] shadow-lg">
        <h1 className="text-2xl font-black text-white mb-1">Pengaturan</h1>
        <p className="text-white/70 text-sm">Kelola dompet, kategori, dan akun</p>
      </div>

      <div className="px-5 pt-6 space-y-7">

        {/* ── SINKRONISASI ── */}
        <div>
          <SectionHeader>Sinkronisasi</SectionHeader>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-bold text-gray-800">Sinkron ke Server</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {lastSync
                    ? `Terakhir ${new Intl.DateTimeFormat('id-ID',{hour:'2-digit',minute:'2-digit'}).format(lastSync)}`
                    : 'Belum pernah sinkron'}
                </p>
              </div>
              <button onClick={fullSync} disabled={isSyncing}
                className="flex items-center gap-1.5 px-4 py-2 bg-blu-primary/10 text-blu-primary rounded-2xl text-xs font-black uppercase tracking-widest disabled:opacity-40">
                <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Sinkron...' : 'Sync'}
              </button>
            </div>
          </div>
        </div>

        {/* ── TAMPILAN ── */}
        <div>
          <SectionHeader>Tampilan</SectionHeader>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <p className="text-sm font-bold text-gray-800">Mode Gelap</p>
              <button onClick={toggleTheme}
                className={`w-12 h-6 rounded-full transition-colors duration-300 relative ${theme === 'dark' ? 'bg-blu-primary' : 'bg-gray-200'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-300 shadow-sm ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── DOMPET ── */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <SectionHeader>Dompet / Akun</SectionHeader>
            <button onClick={() => setShowAddWallet(v => !v)}
              className="flex items-center gap-1 text-blu-primary text-xs font-black uppercase tracking-widest">
              <Plus size={13} /> Tambah
            </button>
          </div>

          <AnimatePresence>
            {showAddWallet && (
              <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }} exit={{ opacity:0,height:0 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-3 space-y-3 overflow-hidden">
                <input value={wName} onChange={e => setWName(e.target.value)} autoFocus
                  placeholder="Nama dompet — misal: BCA, Dana..." className="blu-input" />
                <div className="flex gap-2">
                  {['cash','bank','ewallet'].map(t => (
                    <Pill key={t} active={wType===t} onClick={() => setWType(t)}>{walletTypeLabel(t)}</Pill>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddWallet(false)}
                    className="flex-1 py-3 rounded-2xl text-sm font-black text-gray-500 bg-gray-100 uppercase tracking-widest">Batal</button>
                  <button onClick={handleAddWallet}
                    className="flex-1 py-3 rounded-2xl text-sm font-black text-white bg-blu-primary uppercase tracking-widest shadow-md shadow-blu-primary/25">Simpan</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {wallets.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-300 font-medium">Belum ada dompet</p>
            ) : wallets.map((w, i) => (
              <div key={w.id} className={`flex items-center justify-between px-5 py-4 ${i < wallets.length-1 ? 'border-b border-gray-50' : ''}`}>
                <div>
                  <p className="text-sm font-bold text-gray-800">{w.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{walletTypeLabel(w.type)}</p>
                </div>
                <p className={`text-sm font-black tabular-nums ${Number(w.balance)>=0?'text-blu-primary':'text-red-500'}`}>
                  {formatRupiah(w.balance)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── KATEGORI ── */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <SectionHeader>Kategori</SectionHeader>
            <button onClick={() => setShowAddCat(v => !v)}
              className="flex items-center gap-1 text-blu-primary text-xs font-black uppercase tracking-widest">
              <Plus size={13} /> Tambah
            </button>
          </div>

          <AnimatePresence>
            {showAddCat && (
              <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }} exit={{ opacity:0,height:0 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-3 space-y-4 overflow-hidden">
                <input value={cName} onChange={e => setCName(e.target.value)} autoFocus
                  placeholder="Nama kategori..." className="blu-input" />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kelompok</p>
                  <div className="flex gap-2">
                    <Pill active={cCtx==='household'} onClick={() => setCCtx('household')}>Rumah Tangga</Pill>
                    <Pill active={cCtx==='business'}  onClick={() => setCCtx('business')}>Usaha</Pill>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Jenis</p>
                  <div className="flex gap-2">
                    <Pill active={cType==='expense'} onClick={() => setCType('expense')}>Pengeluaran</Pill>
                    <Pill active={cType==='income'}  onClick={() => setCType('income')}>Pemasukan</Pill>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddCat(false)}
                    className="flex-1 py-3 rounded-2xl text-sm font-black text-gray-500 bg-gray-100 uppercase tracking-widest">Batal</button>
                  <button onClick={handleAddCategory}
                    className="flex-1 py-3 rounded-2xl text-sm font-black text-white bg-blu-primary uppercase tracking-widest shadow-md shadow-blu-primary/25">Simpan</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Accordion groups */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {[
              { key: 'household', label: 'Rumah Tangga', cats: householdCats },
              { key: 'business',  label: 'Usaha',        cats: businessCats  },
            ].map(({ key, label, cats }, gi) => (
              <div key={key} className={gi === 0 ? 'border-b border-gray-50' : ''}>
                <button onClick={() => setOpenCtx(openCtx === key ? null : key)}
                  className="w-full flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-bold text-gray-800 text-left">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{cats.length} kategori</p>
                  </div>
                  {openCtx === key ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                <AnimatePresence>
                  {openCtx === key && (
                    <motion.div initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }}
                      className="overflow-hidden border-t border-gray-50">
                      <div className="grid grid-cols-2 gap-6 px-5 py-4">
                        {['expense','income'].map(tp => (
                          <div key={tp}>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">
                              {tp === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                            </p>
                            <div className="space-y-2">
                              {cats.filter(c => c.type === tp).map(cat => (
                                <div key={cat.id} className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tp==='income'?'bg-blu-primary':'bg-gray-300'}`} />
                                  <p className="text-sm text-gray-700 font-medium">{cat.name}</p>
                                </div>
                              ))}
                              {cats.filter(c => c.type === tp).length === 0 && (
                                <p className="text-xs text-gray-300">—</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* ── AKUN ── */}
        {session && (
          <div>
            <SectionHeader>Akun</SectionHeader>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <p className="text-sm font-bold text-gray-800">{session.user.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">Akun aktif</p>
              </div>
              <button onClick={() => confirm('Keluar?') && signOut()}
                className="flex items-center gap-2 px-5 py-4 text-red-500 text-sm font-black uppercase tracking-widest w-full">
                <LogOut size={15} /> Keluar
              </button>
            </div>
          </div>
        )}

        <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest text-center pb-2">
          Dompet Keluarga v1.0
        </p>
      </div>
    </div>
  )
}

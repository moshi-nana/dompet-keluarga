import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, RefreshCw, LogOut, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '../../store'
import { formatRupiah } from '../../lib/utils'
import { signOut } from '../../hooks/useAuth'
import ThemeSwitch from '../Layout/ThemeSwitch'

function SectionHeader({ children }) {
  return <p className="text-[10px] font-black uppercase tracking-widest mb-3 px-1"
    style={{ color:'var(--text-muted)' }}>{children}</p>
}

function Pill({ children, active, onClick }) {
  return (
    <button onClick={onClick}
      className="px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
      style={{
        background: active ? 'var(--blu-primary)' : 'var(--bg-muted)',
        color: active ? '#fff' : 'var(--text-muted)',
        boxShadow: active ? '0 4px 12px rgba(0,174,239,0.25)' : 'none',
      }}>
      {children}
    </button>
  )
}

function Card({ children }) {
  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
      {children}
    </div>
  )
}

function Row({ label, sub, right, borderBottom=true }) {
  return (
    <div className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: borderBottom ? '1px solid var(--border-subtle)' : 'none' }}>
      <div>
        <p className="text-sm font-bold" style={{ color:'var(--text-primary)' }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{sub}</p>}
      </div>
      {right}
    </div>
  )
}

export default function Settings() {
  const { wallets, categories, addWallet, addCategory, fullSync, isSyncing, lastSync, session } = useStore()

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
    await addWallet({ name:wName.trim(), type:wType, icon:'💵', color:'#00AEEF' })
    setWName(''); setShowAddWallet(false)
  }
  const handleAddCategory = async () => {
    if (!cName.trim()) return
    await addCategory({ name:cName.trim(), context:cCtx, type:cType, icon:'📦', color:'#00AEEF' })
    setCName(''); setShowAddCat(false)
  }

  const walletTypeLabel = t => ({ cash:'Tunai', bank:'Bank', ewallet:'E-Wallet' }[t]||t)
  const householdCats = categories.filter(c => c.context==='household')
  const businessCats  = categories.filter(c => c.context==='business')

  return (
    <div className="page-enter min-h-screen pb-28" style={{ background:'var(--bg-base)' }}>

      {/* Header */}
      <div className="px-6 pt-12 pb-8 rounded-b-[32px] shadow-lg"
        style={{ background:'var(--header-bg)', transition:'background 0.3s' }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-black text-white">Pengaturan</h1>
          <ThemeSwitch />
        </div>
        <p className="text-sm" style={{ color:'rgba(255,255,255,0.55)' }}>Kelola dompet, kategori, dan akun</p>
      </div>

      <div className="px-5 pt-6 space-y-7">

        {/* ── TAMPILAN ── */}
        <div>
          <SectionHeader>Tampilan</SectionHeader>
          <Card>
            <Row label="Mode Gelap" sub="Ganti tampilan terang / gelap"
              right={<ThemeSwitch />} borderBottom={false}/>
          </Card>
        </div>

        {/* ── SINKRONISASI ── */}
        <div>
          <SectionHeader>Sinkronisasi</SectionHeader>
          <Card>
            <Row borderBottom={false}
              label="Sinkron ke Server"
              sub={lastSync
                ? `Terakhir ${new Intl.DateTimeFormat('id-ID',{hour:'2-digit',minute:'2-digit'}).format(lastSync)}`
                : 'Belum sinkron'}
              right={
                <button onClick={fullSync} disabled={isSyncing}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest disabled:opacity-40"
                  style={{ background:'rgba(0,174,239,0.1)', color:'var(--blu-primary)' }}>
                  <RefreshCw size={13} className={isSyncing?'animate-spin':''}/>
                  {isSyncing?'Sinkron...':'Sync'}
                </button>
              }
            />
          </Card>
        </div>

        {/* ── DOMPET ── */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <SectionHeader>Dompet / Akun</SectionHeader>
            <button onClick={()=>setShowAddWallet(v=>!v)}
              className="flex items-center gap-1 text-xs font-black uppercase tracking-widest"
              style={{ color:'var(--blu-primary)' }}>
              <Plus size={13}/> Tambah
            </button>
          </div>

          <AnimatePresence>
            {showAddWallet && (
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                className="rounded-3xl p-5 mb-3 space-y-3 overflow-hidden"
                style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
                <input value={wName} onChange={e=>setWName(e.target.value)} autoFocus
                  placeholder="Nama — misal: BCA, Dana..." className="blu-input"/>
                <div className="flex gap-2 flex-wrap">
                  {['cash','bank','ewallet'].map(t=>(
                    <Pill key={t} active={wType===t} onClick={()=>setWType(t)}>{walletTypeLabel(t)}</Pill>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>setShowAddWallet(false)}
                    className="flex-1 py-3 rounded-2xl text-sm font-black uppercase tracking-widest"
                    style={{ background:'var(--bg-muted)', color:'var(--text-muted)' }}>Batal</button>
                  <button onClick={handleAddWallet}
                    className="flex-1 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-white"
                    style={{ background:'var(--blu-primary)', boxShadow:'0 4px 12px rgba(0,174,239,0.25)' }}>Simpan</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Card>
            {wallets.length===0 ? (
              <div className="px-5 py-4">
                <p className="text-sm" style={{ color:'var(--text-muted)' }}>Belum ada dompet</p>
              </div>
            ) : wallets.map((w,i) => (
              <Row key={w.id} label={w.name} sub={walletTypeLabel(w.type)}
                borderBottom={i < wallets.length-1}
                right={
                  <p className="text-sm font-black tabular-nums"
                    style={{ color: Number(w.balance)>=0 ? 'var(--blu-primary)' : '#dc2626' }}>
                    {formatRupiah(w.balance)}
                  </p>
                }
              />
            ))}
          </Card>
        </div>

        {/* ── KATEGORI ── */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <SectionHeader>Kategori</SectionHeader>
            <button onClick={()=>setShowAddCat(v=>!v)}
              className="flex items-center gap-1 text-xs font-black uppercase tracking-widest"
              style={{ color:'var(--blu-primary)' }}>
              <Plus size={13}/> Tambah
            </button>
          </div>

          <AnimatePresence>
            {showAddCat && (
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                className="rounded-3xl p-5 mb-3 space-y-4 overflow-hidden"
                style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
                <input value={cName} onChange={e=>setCName(e.target.value)} autoFocus
                  placeholder="Nama kategori..." className="blu-input"/>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-2"
                    style={{ color:'var(--text-muted)' }}>Kelompok</p>
                  <div className="flex gap-2">
                    <Pill active={cCtx==='household'} onClick={()=>setCCtx('household')}>Rumah Tangga</Pill>
                    <Pill active={cCtx==='business'}  onClick={()=>setCCtx('business')}>Usaha</Pill>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-2"
                    style={{ color:'var(--text-muted)' }}>Jenis</p>
                  <div className="flex gap-2">
                    <Pill active={cType==='expense'} onClick={()=>setCType('expense')}>Pengeluaran</Pill>
                    <Pill active={cType==='income'}  onClick={()=>setCType('income')}>Pemasukan</Pill>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>setShowAddCat(false)}
                    className="flex-1 py-3 rounded-2xl text-sm font-black uppercase tracking-widest"
                    style={{ background:'var(--bg-muted)', color:'var(--text-muted)' }}>Batal</button>
                  <button onClick={handleAddCategory}
                    className="flex-1 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-white"
                    style={{ background:'var(--blu-primary)', boxShadow:'0 4px 12px rgba(0,174,239,0.25)' }}>Simpan</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Card>
            {[
              { key:'household', label:'Rumah Tangga', cats:householdCats },
              { key:'business',  label:'Usaha',        cats:businessCats  },
            ].map(({ key, label, cats }, gi) => (
              <div key={key} style={{ borderBottom: gi===0 ? '1px solid var(--border-subtle)' : 'none' }}>
                <button onClick={()=>setOpenCtx(openCtx===key?null:key)}
                  className="w-full flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-bold text-left" style={{ color:'var(--text-primary)' }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{cats.length} kategori</p>
                  </div>
                  {openCtx===key
                    ? <ChevronUp   size={16} style={{ color:'var(--text-muted)' }}/>
                    : <ChevronDown size={16} style={{ color:'var(--text-muted)' }}/>
                  }
                </button>

                <AnimatePresence>
                  {openCtx===key && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                      className="overflow-hidden"
                      style={{ borderTop:'1px solid var(--border-subtle)' }}>
                      <div className="grid grid-cols-2 gap-6 px-5 py-4">
                        {['expense','income'].map(tp => (
                          <div key={tp}>
                            <p className="text-[9px] font-black uppercase tracking-widest mb-3"
                              style={{ color:'var(--text-muted)' }}>
                              {tp==='expense'?'Pengeluaran':'Pemasukan'}
                            </p>
                            <div className="space-y-2.5">
                              {cats.filter(c=>c.type===tp).map(cat => (
                                <div key={cat.id} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ background: tp==='income'?'var(--blu-primary)':'var(--text-muted)' }}/>
                                  <p className="text-sm font-medium" style={{ color:'var(--text-secondary)' }}>{cat.name}</p>
                                </div>
                              ))}
                              {cats.filter(c=>c.type===tp).length===0 && (
                                <p className="text-xs" style={{ color:'var(--text-muted)' }}>—</p>
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
          </Card>
        </div>

        {/* ── AKUN ── */}
        {session && (
          <div>
            <SectionHeader>Akun</SectionHeader>
            <Card>
              <Row label={session.user.email} sub="Akun aktif" borderBottom/>
              <div className="px-5 py-4">
                <button onClick={()=>confirm('Keluar?')&&signOut()}
                  className="flex items-center gap-2 text-sm font-black uppercase tracking-widest"
                  style={{ color:'#ef4444' }}>
                  <LogOut size={15}/> Keluar
                </button>
              </div>
            </Card>
          </div>
        )}

        <p className="text-[10px] font-black uppercase tracking-widest text-center pb-2"
          style={{ color:'var(--text-muted)' }}>
          Dompet Keluarga v1.0
        </p>
      </div>
    </div>
  )
}

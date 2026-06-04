import { useState } from 'react'
import { useStore } from '../../store'
import { formatRupiah } from '../../lib/utils'
import { signOut } from '../../hooks/useAuth'

function Label({ children }) {
  return <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">{children}</p>
}

function Pill({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 ${
        active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {children}
    </button>
  )
}

export default function Settings() {
  const { wallets, categories, addWallet, addCategory, fullSync, isSyncing, lastSync, session } = useStore()

  const [showAddWallet, setShowAddWallet] = useState(false)
  const [showAddCat,    setShowAddCat]    = useState(false)
  const [openCtx,       setOpenCtx]       = useState(null) // 'household' | 'business' | null

  const [wName, setWName] = useState('')
  const [wType, setWType] = useState('cash')
  const [cName, setCName] = useState('')
  const [cCtx,  setCCtx]  = useState('household')
  const [cType, setCType] = useState('expense')

  const handleAddWallet = async () => {
    if (!wName.trim()) return
    await addWallet({ name: wName.trim(), type: wType, icon: '💵', color: '#16a34a' })
    setWName(''); setShowAddWallet(false)
  }

  const handleAddCategory = async () => {
    if (!cName.trim()) return
    await addCategory({ name: cName.trim(), context: cCtx, type: cType, icon: '📦', color: '#16a34a' })
    setCName(''); setShowAddCat(false)
  }

  const householdCats = categories.filter(c => c.context === 'household')
  const businessCats  = categories.filter(c => c.context === 'business')

  const walletTypeLabel = t => ({ cash:'Tunai', bank:'Bank', ewallet:'E-Wallet' }[t] || t)

  return (
    <div className="page-enter min-h-screen bg-white pb-24">

      {/* ── HEADER ── */}
      <div className="px-5 pt-14 pb-6">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Lainnya</h1>
      </div>

      <div className="px-5 space-y-8">

        {/* ── SINKRONISASI ── */}
        <div>
          <Label>Sinkronisasi</Label>
          <div className="flex items-center justify-between py-3.5 border-b border-gray-50">
            <div>
              <p className="text-sm text-gray-900 font-medium">Sinkron data</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {lastSync
                  ? `Terakhir ${new Intl.DateTimeFormat('id-ID',{hour:'2-digit',minute:'2-digit'}).format(lastSync)}`
                  : 'Belum pernah sinkron'}
              </p>
            </div>
            <button
              onClick={fullSync}
              disabled={isSyncing}
              className="text-xs font-semibold text-brand-600 disabled:opacity-40 flex items-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isSyncing ? 'animate-spin' : ''}>
                <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isSyncing ? 'Sinkron...' : 'Sync'}
            </button>
          </div>
        </div>

        {/* ── DOMPET ── */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <Label>Dompet</Label>
            <button onClick={() => setShowAddWallet(v => !v)} className="text-[11px] font-semibold text-gray-900 underline underline-offset-2">
              + Tambah
            </button>
          </div>

          {showAddWallet && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-3">
              <input
                value={wName} onChange={e => setWName(e.target.value)}
                placeholder="Nama dompet — misal: BCA, Dana..."
                className="input" autoFocus
              />
              <div className="flex gap-2">
                {['cash','bank','ewallet'].map(t => (
                  <Pill key={t} active={wType===t} onClick={() => setWType(t)}>
                    {walletTypeLabel(t)}
                  </Pill>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowAddWallet(false)} className="flex-1 py-2.5 rounded-xl text-sm text-gray-500 bg-white border border-gray-200 font-semibold">Batal</button>
                <button onClick={handleAddWallet} className="flex-1 py-2.5 rounded-xl text-sm text-white bg-gray-900 font-semibold">Simpan</button>
              </div>
            </div>
          )}

          {wallets.length === 0 ? (
            <p className="text-sm text-gray-300 px-1 py-3">Belum ada dompet</p>
          ) : (
            wallets.map((w, i) => (
              <div key={w.id} className={`flex items-center justify-between py-3.5 ${i < wallets.length-1 ? 'border-b border-gray-50' : ''}`}>
                <div>
                  <p className="text-sm font-medium text-gray-900">{w.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{walletTypeLabel(w.type)}</p>
                </div>
                <p className={`text-sm font-semibold tabular-nums ${Number(w.balance) >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
                  {formatRupiah(w.balance)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* ── KATEGORI ── */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <Label>Kategori</Label>
            <button onClick={() => setShowAddCat(v => !v)} className="text-[11px] font-semibold text-gray-900 underline underline-offset-2">
              + Tambah
            </button>
          </div>

          {showAddCat && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-3">
              <input
                value={cName} onChange={e => setCName(e.target.value)}
                placeholder="Nama kategori"
                className="input" autoFocus
              />
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-2">Kelompok</p>
                <div className="flex gap-2">
                  <Pill active={cCtx==='household'} onClick={() => setCCtx('household')}>Rumah Tangga</Pill>
                  <Pill active={cCtx==='business'}  onClick={() => setCCtx('business')}>Usaha</Pill>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-2">Jenis</p>
                <div className="flex gap-2">
                  <Pill active={cType==='expense'} onClick={() => setCType('expense')}>Pengeluaran</Pill>
                  <Pill active={cType==='income'}  onClick={() => setCType('income')}>Pemasukan</Pill>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowAddCat(false)} className="flex-1 py-2.5 rounded-xl text-sm text-gray-500 bg-white border border-gray-200 font-semibold">Batal</button>
                <button onClick={handleAddCategory} className="flex-1 py-2.5 rounded-xl text-sm text-white bg-gray-900 font-semibold">Simpan</button>
              </div>
            </div>
          )}

          {/* Category groups — accordion */}
          {[
            { key: 'household', label: 'Rumah Tangga', cats: householdCats },
            { key: 'business',  label: 'Usaha',        cats: businessCats  },
          ].map(({ key, label, cats }) => (
            <div key={key} className="mb-1">
              <button
                onClick={() => setOpenCtx(openCtx === key ? null : key)}
                className="w-full flex items-center justify-between py-3 border-b border-gray-50"
              >
                <p className="text-sm font-semibold text-gray-700">{label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{cats.length} kategori</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={`transition-transform duration-200 ${openCtx === key ? 'rotate-180' : ''}`}>
                    <path d="M6 9l6 6 6-6" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>

              {openCtx === key && cats.length > 0 && (
                <div className="pt-2 pb-3">
                  {/* Two columns: expense | income */}
                  <div className="grid grid-cols-2 gap-x-8">
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-2">Pengeluaran</p>
                      <div className="space-y-2">
                        {cats.filter(c => c.type === 'expense').map(cat => (
                          <p key={cat.id} className="text-sm text-gray-700">{cat.name}</p>
                        ))}
                        {cats.filter(c => c.type === 'expense').length === 0 && (
                          <p className="text-xs text-gray-300">—</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-2">Pemasukan</p>
                      <div className="space-y-2">
                        {cats.filter(c => c.type === 'income').map(cat => (
                          <p key={cat.id} className="text-sm text-gray-700">{cat.name}</p>
                        ))}
                        {cats.filter(c => c.type === 'income').length === 0 && (
                          <p className="text-xs text-gray-300">—</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── AKUN ── */}
        {session && (
          <div>
            <Label>Akun</Label>
            <div className="py-3.5 border-b border-gray-50">
              <p className="text-sm font-medium text-gray-900">{session.user.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">Akun aktif</p>
            </div>
            <button
              onClick={() => confirm('Keluar?') && signOut()}
              className="py-3.5 text-sm font-semibold text-red-500 flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Keluar
            </button>
          </div>
        )}

        <p className="text-[11px] text-gray-300 text-center pb-2">Dompet Keluarga v1.0</p>
      </div>
    </div>
  )
}

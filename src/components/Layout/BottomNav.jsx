import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Camera } from 'lucide-react'

function WalletIcon({ active }) {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <rect x="2" y="7" width="20" height="14" rx="3" stroke={active ? '#00AEEF' : '#9ca3af'} strokeWidth={active ? 2.2 : 1.5}/>
      <path d="M16 3H5a3 3 0 00-3 3v1" stroke={active ? '#00AEEF' : '#9ca3af'} strokeWidth={active ? 2.2 : 1.5} strokeLinecap="round"/>
      <circle cx="16" cy="14" r="1.5" fill={active ? '#00AEEF' : '#9ca3af'}/>
    </svg>
  )
}
function HistoryIcon({ active }) {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke={active ? '#00AEEF' : '#9ca3af'} strokeWidth={active ? 2.2 : 1.5}/>
      <path d="M12 7v5l3 3" stroke={active ? '#00AEEF' : '#9ca3af'} strokeWidth={active ? 2.2 : 1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function ChartIcon({ active }) {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <rect x="3"  y="12" width="4" height="9" rx="1.5" stroke={active ? '#00AEEF' : '#9ca3af'} strokeWidth={active ? 2.2 : 1.5}/>
      <rect x="10" y="7"  width="4" height="14" rx="1.5" stroke={active ? '#00AEEF' : '#9ca3af'} strokeWidth={active ? 2.2 : 1.5}/>
      <rect x="17" y="3"  width="4" height="18" rx="1.5" stroke={active ? '#00AEEF' : '#9ca3af'} strokeWidth={active ? 2.2 : 1.5}/>
    </svg>
  )
}
function PersonIcon({ active }) {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="7.5" r="3.5" stroke={active ? '#00AEEF' : '#9ca3af'} strokeWidth={active ? 2.2 : 1.5}/>
      <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke={active ? '#00AEEF' : '#9ca3af'} strokeWidth={active ? 2.2 : 1.5} strokeLinecap="round"/>
    </svg>
  )
}

const NAV = [
  { to: '/',             label: 'Beranda',   Icon: WalletIcon  },
  { to: '/transactions', label: 'Riwayat',   Icon: HistoryIcon },
  { to: '/report',       label: 'Laporan',   Icon: ChartIcon   },
  { to: '/settings',     label: 'Profil',    Icon: PersonIcon  },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [fabOpen, setFabOpen] = useState(false)
  const [fabScale, setFabScale] = useState(1)
  const timeout = useRef(null)

  if (location.pathname === '/add') return null

  const handleFabPress = () => {
    setFabScale(0.88)
    clearTimeout(timeout.current)
    timeout.current = setTimeout(() => {
      setFabScale(1)
      setFabOpen(v => !v)
    }, 100)
  }

  const goAdd = () => { setFabOpen(false); navigate('/add') }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFabOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)', zIndex: 90 }}
          />
        )}
      </AnimatePresence>

      {/* FAB expand menu */}
      <div style={{ position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom,0px) + 84px)', right: 20, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
        <AnimatePresence>
          {fabOpen && (
            <>
              {/* Manual add */}
              <motion.button
                key="add"
                initial={{ opacity: 0, y: 20, scale: 0.4 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.4 }}
                transition={{ type: 'spring', stiffness: 600, damping: 25, delay: 0.05 }}
                onClick={goAdd}
                style={{
                  width: 48, height: 48, borderRadius: '50%', background: '#FFD700',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(255,215,0,0.4)', border: 'none', cursor: 'pointer',
                }}
              >
                <Plus size={22} color="#005696" strokeWidth={3} />
              </motion.button>
            </>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <button
          onPointerDown={handleFabPress}
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: fabOpen ? '#1f2937' : '#00AEEF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 24px rgba(0,174,239,0.35), 0 2px 6px rgba(0,0,0,0.12)',
            transform: `scale(${fabScale}) rotate(${fabOpen ? '45deg' : '0deg'})`,
            transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease, box-shadow 0.15s ease',
            border: 'none', cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Shine */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
            background: 'linear-gradient(180deg,rgba(255,255,255,0.18) 0%,transparent 100%)',
            borderRadius: '50% 50% 0 0', pointerEvents: 'none',
          }} />
          <Plus size={26} color="#fff" strokeWidth={2.5} />
        </button>
      </div>

      {/* Bottom Nav Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0"
        style={{
          maxWidth: 448, margin: '0 auto', left: '50%', transform: 'translateX(-50%)',
          background: '#fff',
          borderTop: '1px solid #e5e7eb',
          paddingBottom: 'env(safe-area-inset-bottom, 6px)',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.06)',
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', padding: '8px 4px 2px' }}>
          {NAV.map(({ to, label, Icon }) => {
            const active = location.pathname === to
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 4, padding: '6px 0', background: 'none', border: 'none',
                  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{
                  padding: '8px 12px', borderRadius: 16,
                  background: active ? 'rgba(0,174,239,0.08)' : 'transparent',
                  transition: 'background 0.2s',
                }}>
                  <Icon active={active} />
                </div>
                <span style={{
                  fontSize: 10, fontWeight: active ? 800 : 500,
                  color: active ? '#00AEEF' : '#9ca3af',
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: active ? '0.05em' : 0,
                  lineHeight: 1, textTransform: active ? 'uppercase' : 'none',
                }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}

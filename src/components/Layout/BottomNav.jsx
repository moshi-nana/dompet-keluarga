import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'

function WalletIcon({ active }) {
  const c = active ? 'var(--blu-primary)' : 'var(--text-muted)', w = active ? 2.2 : 1.5
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <rect x="2" y="7" width="20" height="14" rx="3" stroke={c} strokeWidth={w}/>
      <path d="M16 3H5a3 3 0 00-3 3v1" stroke={c} strokeWidth={w} strokeLinecap="round"/>
      <circle cx="16" cy="14" r="1.5" fill={c}/>
    </svg>
  )
}
function HistoryIcon({ active }) {
  const c = active ? 'var(--blu-primary)' : 'var(--text-muted)', w = active ? 2.2 : 1.5
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth={w}/>
      <path d="M12 7v5l3 3" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function ChartIcon({ active }) {
  const c = active ? 'var(--blu-primary)' : 'var(--text-muted)', w = active ? 2.2 : 1.5
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <rect x="3"  y="12" width="4" height="9" rx="1.5" stroke={c} strokeWidth={w}/>
      <rect x="10" y="7"  width="4" height="14" rx="1.5" stroke={c} strokeWidth={w}/>
      <rect x="17" y="3"  width="4" height="18" rx="1.5" stroke={c} strokeWidth={w}/>
    </svg>
  )
}
function PersonIcon({ active }) {
  const c = active ? 'var(--blu-primary)' : 'var(--text-muted)', w = active ? 2.2 : 1.5
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="7.5" r="3.5" stroke={c} strokeWidth={w}/>
      <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke={c} strokeWidth={w} strokeLinecap="round"/>
    </svg>
  )
}

const NAV = [
  { to: '/',             label: 'Beranda',  Icon: WalletIcon  },
  { to: '/transactions', label: 'Riwayat',  Icon: HistoryIcon },
  { to: '/report',       label: 'Laporan',  Icon: ChartIcon   },
  { to: '/settings',     label: 'Profil',   Icon: PersonIcon  },
]

function FAB() {
  const navigate = useNavigate()
  const location = useLocation()
  const [open,  setOpen]  = useState(false)
  const [scale, setScale] = useState(1)
  const timeout = useRef(null)

  if (location.pathname === '/add') return null

  const toggle = () => {
    setScale(0.88)
    clearTimeout(timeout.current)
    timeout.current = setTimeout(() => { setScale(1); setOpen(v => !v) }, 100)
  }
  const goAdd = () => { setOpen(false); navigate('/add') }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div key="bd"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setOpen(false)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)',
                     backdropFilter:'blur(3px)', zIndex:89 }} />
        )}
      </AnimatePresence>

      <div style={{
        position:'fixed', right:20,
        bottom:'calc(env(safe-area-inset-bottom,0px) + 88px)',
        zIndex:100, display:'flex', flexDirection:'column', alignItems:'center', gap:12,
      }}>
        <AnimatePresence>
          {open && (
            <motion.button key="add"
              initial={{ opacity:0, y:16, scale:0.3 }}
              animate={{ opacity:1, y:0,  scale:1   }}
              exit={{    opacity:0, y:16, scale:0.3 }}
              transition={{ type:'spring', stiffness:600, damping:22 }}
              onClick={goAdd}
              style={{
                width:48, height:48, borderRadius:'50%', background:'#FFD700',
                border:'none', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 20px rgba(255,215,0,0.5)',
                WebkitTapHighlightColor:'transparent',
              }}>
              <Plus size={22} color="#005696" strokeWidth={3}/>
            </motion.button>
          )}
        </AnimatePresence>

        <button onPointerDown={toggle} style={{
          width:56, height:56, borderRadius:'50%',
          background: open ? 'var(--bg-card)' : 'var(--blu-primary)',
          border: open ? '2px solid var(--border-color)' : 'none',
          cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow: open ? '0 4px 16px rgba(0,0,0,0.15)' : '0 6px 24px rgba(0,174,239,0.35)',
          transform:`scale(${scale}) rotate(${open?'45deg':'0deg'})`,
          transition:'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), background 0.25s, box-shadow 0.2s',
          WebkitTapHighlightColor:'transparent', position:'relative', overflow:'hidden',
        }}>
          <div style={{
            position:'absolute', top:0, left:0, right:0, height:'50%',
            background:'linear-gradient(180deg,rgba(255,255,255,0.15) 0%,transparent 100%)',
            borderRadius:'50% 50% 0 0', pointerEvents:'none',
          }}/>
          <Plus size={26} color={open ? 'var(--text-primary)' : '#fff'} strokeWidth={2.5}/>
        </button>
      </div>
    </>
  )
}

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  if (location.pathname === '/add') return null

  return (
    <>
      <FAB />
      <nav style={{
        position:'fixed', bottom:0, left:0, right:0,
        background:'var(--nav-bg)',
        borderTop:'1px solid var(--border-subtle)',
        borderRadius:'24px 24px 0 0',
        boxShadow:'0 -8px 32px rgba(0,0,0,0.08)',
        paddingBottom:'env(safe-area-inset-bottom, 8px)',
        zIndex:50,
        transition:'background 0.3s ease',
      }}>
        <div style={{ display:'flex', maxWidth:448, margin:'0 auto', padding:'8px 0 4px' }}>
          {NAV.map(({ to, label, Icon }) => {
            const active = location.pathname === to
            return (
              <button key={to} onClick={() => navigate(to)} style={{
                flex:1, display:'flex', flexDirection:'column', alignItems:'center',
                gap:4, padding:'6px 0',
                background:'none', border:'none', cursor:'pointer',
                WebkitTapHighlightColor:'transparent', minWidth:0,
              }}>
                <div style={{
                  padding:'6px 14px', borderRadius:14,
                  background: active ? 'rgba(0,174,239,0.1)' : 'transparent',
                  transition:'background 0.2s',
                }}>
                  <Icon active={active} />
                </div>
                <span style={{
                  fontSize:10, display:'block', width:'100%', textAlign:'center',
                  fontWeight: active ? 800 : 500,
                  color: active ? 'var(--blu-primary)' : 'var(--text-muted)',
                  fontFamily:'Inter, sans-serif',
                  letterSpacing: active ? '0.04em' : 0,
                  lineHeight:1,
                  textTransform: active ? 'uppercase' : 'none',
                  whiteSpace:'nowrap', overflow:'hidden',
                  transition:'color 0.2s',
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

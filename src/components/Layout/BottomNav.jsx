import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

// ── SVG Icons ─────────────────────────────────────────────────────────────────
function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
        stroke={active ? '#111' : '#c0c0c0'} strokeWidth={active ? 2.2 : 1.5} strokeLinejoin="round"/>
      <path d="M9 21V12h6v9"
        stroke={active ? '#111' : '#c0c0c0'} strokeWidth={active ? 2.2 : 1.5} strokeLinejoin="round"/>
    </svg>
  )
}

function ListIcon({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M8 6h13M8 12h13M8 18h13"
        stroke={active ? '#111' : '#c0c0c0'} strokeWidth={active ? 2.2 : 1.5} strokeLinecap="round"/>
      <circle cx="4" cy="6"  r="1" fill={active ? '#111' : '#c0c0c0'}/>
      <circle cx="4" cy="12" r="1" fill={active ? '#111' : '#c0c0c0'}/>
      <circle cx="4" cy="18" r="1" fill={active ? '#111' : '#c0c0c0'}/>
    </svg>
  )
}

function ChartIcon({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <rect x="3"  y="12" width="4" height="9" rx="1.5"
        stroke={active ? '#111' : '#c0c0c0'} strokeWidth={active ? 2.2 : 1.5}/>
      <rect x="10" y="7"  width="4" height="14" rx="1.5"
        stroke={active ? '#111' : '#c0c0c0'} strokeWidth={active ? 2.2 : 1.5}/>
      <rect x="17" y="3"  width="4" height="18" rx="1.5"
        stroke={active ? '#111' : '#c0c0c0'} strokeWidth={active ? 2.2 : 1.5}/>
    </svg>
  )
}

function PersonIcon({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="7.5" r="3.5"
        stroke={active ? '#111' : '#c0c0c0'} strokeWidth={active ? 2.2 : 1.5}/>
      <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
        stroke={active ? '#111' : '#c0c0c0'} strokeWidth={active ? 2.2 : 1.5} strokeLinecap="round"/>
    </svg>
  )
}

// ── FAB ───────────────────────────────────────────────────────────────────────
function FAB() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const isAddPage = location.pathname === '/add'
  const [scale, setScale] = useState(1)
  const [ripple, setRipple] = useState(false)
  const timeout = useRef(null)

  // Don't show FAB on the add page itself
  if (isAddPage) return null

  const handlePress = () => {
    setScale(0.88)
    setRipple(true)
    clearTimeout(timeout.current)
    timeout.current = setTimeout(() => {
      setScale(1)
      setRipple(false)
      navigate('/add')
    }, 130)
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
        right: 20,
        zIndex: 60,
      }}
    >
      {/* Ripple ring */}
      <div style={{
        position: 'absolute',
        inset: -6,
        borderRadius: 22,
        background: 'rgba(0,0,0,0.08)',
        transform: `scale(${ripple ? 1.35 : 0.8})`,
        opacity: ripple ? 0 : 0,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        pointerEvents: 'none',
      }} />

      <button
        onPointerDown={handlePress}
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: '#111',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          boxShadow: scale < 1
            ? '0 2px 8px rgba(0,0,0,0.18)'
            : '0 6px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.12)',
          transform: `scale(${scale})`,
          transition: 'transform 0.12s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.12s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Inner shine */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
          borderRadius: '16px 16px 0 0',
          pointerEvents: 'none',
        }} />
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}

// ── NAV ITEMS ─────────────────────────────────────────────────────────────────
const NAV = [
  { to: '/',             label: 'Beranda',   Icon: HomeIcon   },
  { to: '/transactions', label: 'Transaksi', Icon: ListIcon   },
  { to: '/report',       label: 'Laporan',   Icon: ChartIcon  },
  { to: '/settings',     label: 'Profil',    Icon: PersonIcon },
]

// ── BOTTOM NAV ────────────────────────────────────────────────────────────────
export default function BottomNav() {
  const location = useLocation()
  if (location.pathname === '/add') return null

  return (
    <>
      <FAB />
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
        paddingBottom: 'env(safe-area-inset-bottom, 6px)',
        zIndex: 50,
      }}>
        <div style={{
          display: 'flex',
          maxWidth: 448,
          margin: '0 auto',
          padding: '6px 0 2px',
        }}>
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '6px 0',
                textDecoration: 'none',
                WebkitTapHighlightColor: 'transparent',
                // Fixed width prevents layout shift on active
                minWidth: 0,
              }}
            >
              {({ isActive }) => (
                <>
                  <div style={{ width: 22, height: 22, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon active={isActive} />
                  </div>
                  <span style={{
                    fontSize: 10,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#111' : '#bbb',
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '-0.1px',
                    lineHeight: 1,
                    // Fixed width prevents label from shifting layout
                    display: 'block',
                    textAlign: 'center',
                  }}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}

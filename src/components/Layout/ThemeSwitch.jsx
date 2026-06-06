import { useTheme } from '../../lib/theme.jsx'

// Sun icon
function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" fill="#f59e0b" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

// Moon icon
function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
        fill="#a78bfa" stroke="#a78bfa" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function ThemeSwitch({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className={`theme-switch ${isDark ? 'is-dark' : ''} ${className}`}
      aria-label="Toggle dark mode"
    >
      <div className="theme-switch-thumb">
        {isDark ? <MoonIcon /> : <SunIcon />}
      </div>
    </button>
  )
}

// Theme context — mirrors Blued's ThemeContext
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} })

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('dk_theme') || 'light')

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('dk_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

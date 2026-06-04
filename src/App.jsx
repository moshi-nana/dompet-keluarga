import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useStore } from './store'

import BottomNav from './components/Layout/BottomNav'
import Login from './components/Auth/Login'
import Dashboard from './components/Dashboard/Dashboard'
import TransactionList from './components/Transaction/TransactionList'
import AddTransaction from './components/Transaction/AddTransaction'
import Report from './components/Report/Report'
import Settings from './components/Settings/Settings'

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40,
          background: '#111',
          borderRadius: 12,
          margin: '0 auto 12px',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
        <p style={{ fontSize: 13, color: '#bbb', fontFamily: 'Inter, sans-serif' }}>Memuat...</p>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </div>
  )
}

function AppContent() {
  const { session } = useAuth()
  const { loadingAuth, loadAll } = useStore()
  useOnlineStatus()

  useEffect(() => { loadAll() }, [])

  if (loadingAuth) return <LoadingScreen />
  if (!session)    return <Login />

  return (
    <div style={{ maxWidth: 448, margin: '0 auto', position: 'relative', minHeight: '100vh' }}>
      <Routes>
        <Route path="/"             element={<Dashboard />} />
        <Route path="/transactions" element={<TransactionList />} />
        <Route path="/add"          element={<AddTransaction />} />
        <Route path="/report"       element={<Report />} />
        <Route path="/settings"     element={<Settings />} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppContent />
    </BrowserRouter>
  )
}

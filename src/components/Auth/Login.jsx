import { useState } from 'react'
import { signIn, signUp } from '../../hooks/useAuth'

export default function Login() {
  const [mode,     setMode]     = useState('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  const handle = async () => {
    setError(''); setSuccess('')
    if (!email || !password) return setError('Email dan password wajib diisi')
    if (password.length < 6) return setError('Password minimal 6 karakter')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) setError('Email atau password salah')
      } else {
        const { error } = await signUp(email, password)
        if (error) setError(error.message)
        else setSuccess('Akun dibuat. Cek email untuk konfirmasi, lalu login.')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-24 max-w-sm mx-auto">
      {/* Mark */}
      <div className="mb-10">
        <div className="w-10 h-10 bg-gray-900 rounded-2xl mb-6 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="white" fillOpacity=".15"/>
            <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dompet Keluarga</h1>
        <p className="text-sm text-gray-400 mt-1">Catat keuangan rumah & usaha</p>
      </div>

      {/* Tab */}
      <div className="flex bg-gray-100 rounded-full p-1 mb-6">
        {[['login','Masuk'],['register','Daftar']].map(([m,l]) => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
            }`}>
            {l}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1.5">Email</p>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="nama@email.com" className="input" autoComplete="email"
          />
        </div>
        <div>
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1.5">Password</p>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" className="input"
            onKeyDown={e => e.key === 'Enter' && handle()}
          />
        </div>
      </div>

      {error   && <p className="text-sm text-red-500 mt-4">{error}</p>}
      {success && <p className="text-sm text-brand-600 mt-4">{success}</p>}

      <button
        onClick={handle} disabled={loading}
        className="mt-6 w-full bg-gray-900 text-white py-4 rounded-2xl text-sm font-semibold
                   disabled:opacity-30 active:scale-[0.98] transition-all"
      >
        {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Buat Akun'}
      </button>

      <p className="text-xs text-gray-400 text-center mt-5">
        Gunakan 1 akun yang sama untuk berdua
      </p>
    </div>
  )
}

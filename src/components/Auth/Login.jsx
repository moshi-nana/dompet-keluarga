import { useState } from 'react'
import { AlertCircle, Loader2, Mail, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn, signUp } from '../../hooks/useAuth'

export default function Login() {
  const [mode,     setMode]     = useState('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  const handle = async (e) => {
    e?.preventDefault()
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
        else setSuccess('Akun dibuat! Cek email untuk konfirmasi, lalu login.')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Blue header */}
      <div className="bg-blu-primary px-6 pt-20 pb-12 rounded-b-[40px] shadow-xl shadow-blu-primary/20">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <span className="text-3xl font-black text-blu-primary">D</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Dompet Keluarga</h1>
        <p className="text-white/70 text-sm mt-1">Catat keuangan rumah & usaha berdua</p>
      </div>

      {/* Form card */}
      <div className="px-5 mt-6">
        {/* Tab */}
        <div className="flex bg-gray-100 rounded-2xl p-1.5 mb-6">
          {[['login','Masuk'],['register','Daftar']].map(([m,l]) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-black tracking-widest uppercase transition-all ${
                mode === m ? 'bg-white text-blu-primary shadow-sm' : 'text-gray-400'
              }`}>
              {l}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
              className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4 text-sm text-red-600">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }}
              className="p-3 bg-green-50 border border-green-100 rounded-xl mb-4 text-sm text-green-700">
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail size={16} />
              </div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blu-primary/20 focus:border-blu-primary text-sm shadow-sm transition-all" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={16} />
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blu-primary/20 focus:border-blu-primary text-sm shadow-sm transition-all"
                onKeyDown={e => e.key === 'Enter' && handle()} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-blu-primary text-white font-black text-sm uppercase tracking-widest rounded-2xl
                       shadow-lg shadow-blu-primary/25 hover:opacity-90 active:scale-[0.98] transition-all
                       disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Memproses...</>
              : mode === 'login' ? 'Masuk' : 'Buat Akun'
            }
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Gunakan 1 akun yang sama untuk berdua
        </p>
      </div>
    </div>
  )
}

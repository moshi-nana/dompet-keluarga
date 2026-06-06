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
    if (!email||!password) return setError('Email dan password wajib diisi')
    if (password.length<6) return setError('Password minimal 6 karakter')
    setLoading(true)
    try {
      if (mode==='login') {
        const { error } = await signIn(email,password)
        if (error) setError('Email atau password salah')
      } else {
        const { error } = await signUp(email,password)
        if (error) setError(error.message)
        else setSuccess('Akun dibuat! Cek email untuk konfirmasi.')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto" style={{ background:'var(--bg-base)' }}>
      {/* Header */}
      <div className="px-6 pt-20 pb-12 rounded-b-[40px] shadow-xl"
        style={{ background:'var(--header-bg)', transition:'background 0.3s' }}>
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <span className="text-3xl font-black text-white">D</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Dompet Keluarga</h1>
        <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.55)' }}>
          Catat keuangan rumah & usaha berdua
        </p>
      </div>

      <div className="px-5 mt-6">
        {/* Tab */}
        <div className="flex p-1.5 rounded-2xl mb-6" style={{ background:'var(--bg-muted)' }}>
          {[['login','Masuk'],['register','Daftar']].map(([m,l])=>(
            <button key={m} onClick={()=>setMode(m)}
              className="flex-1 py-2.5 rounded-xl text-sm font-black tracking-widest uppercase transition-all"
              style={{
                background: mode===m ? 'var(--bg-card)' : 'transparent',
                color: mode===m ? 'var(--blu-primary)' : 'var(--text-muted)',
                boxShadow: mode===m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
              {l}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}}
              className="flex items-start gap-2 p-3 rounded-xl mb-4 text-sm"
              style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444' }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5"/>{error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}}
              className="p-3 rounded-xl mb-4 text-sm"
              style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)', color:'#16a34a' }}>
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
              style={{ color:'var(--text-muted)' }}>Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                style={{ color:'var(--text-muted)' }}>
                <Mail size={16}/>
              </div>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="nama@email.com" className="blu-input pl-10"/>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
              style={{ color:'var(--text-muted)' }}>Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                style={{ color:'var(--text-muted)' }}>
                <Lock size={16}/>
              </div>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••" className="blu-input pl-10"
                onKeyDown={e=>e.key==='Enter'&&handle()}/>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 text-white font-black text-sm uppercase tracking-widest rounded-2xl
                       active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            style={{ background:'var(--blu-primary)', boxShadow:'0 4px 16px rgba(0,174,239,0.3)' }}>
            {loading
              ? <><Loader2 size={16} className="animate-spin"/>Memproses...</>
              : mode==='login' ? 'Masuk' : 'Buat Akun'
            }
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color:'var(--text-muted)' }}>
          Gunakan 1 akun yang sama untuk berdua
        </p>
      </div>
    </div>
  )
}

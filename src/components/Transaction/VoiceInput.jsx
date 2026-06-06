import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Loader2, X } from 'lucide-react'

export default function VoiceInput({ onResult, onClose }) {
  const [state,      setState]     = useState('idle')  // idle | listening | processing | done
  const [transcript, setTranscript] = useState('')
  const [error,      setError]      = useState('')
  const recognitionRef = useRef(null)

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Browser tidak mendukung speech recognition. Coba Chrome.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'id-ID'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition

    recognition.onstart = () => setState('listening')
    recognition.onerror = (e) => {
      setError('Gagal mendengar. Coba lagi.')
      setState('idle')
    }
    recognition.onresult = (e) => {
      const text = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('')
      setTranscript(text)
      if (e.results[e.results.length - 1].isFinal) {
        setState('processing')
        recognition.stop()
        onResult(text)
      }
    }
    recognition.onend = () => {
      if (state === 'listening') setState('idle')
    }

    recognition.start()
  }

  const stop = () => {
    recognitionRef.current?.stop()
    setState('idle')
  }

  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 32,
      }}
    >
      <button onClick={onClose} style={{
        position: 'absolute', top: 48, right: 24,
        background: 'rgba(255,255,255,0.1)', border: 'none',
        borderRadius: '50%', width: 40, height: 40, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <X size={18} color="#fff" />
      </button>

      {/* Mic visual */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Pulse rings when listening */}
        {state === 'listening' && [1,2,3].map(i => (
          <motion.div key={i}
            animate={{ scale: [1, 1.8 + i*0.3], opacity: [0.4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(0,174,239,0.3)',
            }}
          />
        ))}

        <button
          onClick={state === 'idle' ? startListening : stop}
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: state === 'listening' ? '#ef4444' : '#00AEEF',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: state === 'listening'
              ? '0 0 32px rgba(239,68,68,0.5)'
              : '0 0 32px rgba(0,174,239,0.4)',
            transition: 'background 0.3s',
            position: 'relative', zIndex: 1,
          }}
        >
          {state === 'processing'
            ? <Loader2 size={32} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
            : state === 'listening'
              ? <MicOff size={32} color="#fff" />
              : <Mic size={32} color="#fff" />
          }
        </button>
      </div>

      {/* Instructions / transcript */}
      <div style={{ textAlign: 'center', maxWidth: 280, padding: '0 24px' }}>
        {state === 'idle' && !transcript && (
          <>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>
              Ucapkan Transaksi
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.6 }}>
              Contoh:{'\n'}"beli susu anak 98000"{'\n'}"makan siang 35000"{'\n'}"dapat gaji 5000000"
            </p>
          </>
        )}
        {state === 'listening' && (
          <p style={{ color: '#00AEEF', fontWeight: 800, fontSize: 16 }}>
            Mendengarkan...
          </p>
        )}
        {state === 'processing' && (
          <p style={{ color: '#FFD700', fontWeight: 800, fontSize: 16 }}>
            Memproses dengan AI...
          </p>
        )}
        {transcript && (
          <div style={{
            background: 'rgba(255,255,255,0.08)', borderRadius: 16,
            padding: '12px 16px', marginTop: 8,
          }}>
            <p style={{ color: '#fff', fontSize: 14, fontStyle: 'italic' }}>"{transcript}"</p>
          </div>
        )}
        {error && (
          <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>{error}</p>
        )}
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </motion.div>
  )
}

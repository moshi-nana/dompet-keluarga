import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { X, RotateCcw, Check, Loader2 } from 'lucide-react'

export default function ScannerModal({ onClose, onScan, isScanning }) {
  const videoRef   = useRef(null)
  const canvasRef  = useRef(null)
  const streamRef  = useRef(null)
  const [captured, setCaptured] = useState(null)
  const [camError, setCamError] = useState('')

  useEffect(() => {
    async function startCam() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        streamRef.current = s
        if (videoRef.current) videoRef.current.srcObject = s
      } catch (err) {
        setCamError('Akses kamera ditolak. Berikan izin kamera dan coba lagi.')
      }
    }
    startCam()
    return () => streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return
    const v = videoRef.current, c = canvasRef.current
    c.width = v.videoWidth; c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    setCaptured(c.toDataURL('image/jpeg', 0.85))
  }

  const retake = () => setCaptured(null)

  const confirm = () => {
    if (!captured) return
    // Strip data:image/jpeg;base64, prefix
    const base64 = captured.split(',')[1]
    onScan(base64)
  }

  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      style={{ position:'fixed', inset:0, background:'#000', zIndex:200, display:'flex', flexDirection:'column' }}
    >
      {/* Viewfinder */}
      <div style={{ flex:1, position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {camError ? (
          <div style={{ color:'#fff', textAlign:'center', padding:32 }}>
            <p style={{ fontSize:14, opacity:0.8 }}>{camError}</p>
          </div>
        ) : !captured ? (
          <>
            <video ref={videoRef} autoPlay playsInline
              style={{ width:'100%', height:'100%', objectFit:'cover' }} />

            {/* Guide box */}
            <div style={{
              position:'absolute', inset:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              pointerEvents:'none',
            }}>
              <div style={{
                width:'78%', aspectRatio:'3/4',
                border:'2px solid rgba(255,255,255,0.35)',
                borderRadius:16, position:'relative',
              }}>
                {/* Corner marks */}
                {[
                  { top:-2, left:-2, borderTop:'3px solid #00AEEF', borderLeft:'3px solid #00AEEF', borderRadius:'12px 0 0 0' },
                  { top:-2, right:-2, borderTop:'3px solid #00AEEF', borderRight:'3px solid #00AEEF', borderRadius:'0 12px 0 0' },
                  { bottom:-2, left:-2, borderBottom:'3px solid #00AEEF', borderLeft:'3px solid #00AEEF', borderRadius:'0 0 0 12px' },
                  { bottom:-2, right:-2, borderBottom:'3px solid #00AEEF', borderRight:'3px solid #00AEEF', borderRadius:'0 0 12px 0' },
                ].map((s, i) => (
                  <div key={i} style={{ position:'absolute', width:28, height:28, ...s }} />
                ))}
                {/* Scan line */}
                <div style={{
                  position:'absolute', left:0, right:0, height:2,
                  background:'rgba(0,174,239,0.8)',
                  boxShadow:'0 0 12px rgba(0,174,239,0.8)',
                  animation:'scan 2s ease-in-out infinite',
                }}/>
              </div>
            </div>

            <div style={{
              position:'absolute', top:48, left:0, right:0, textAlign:'center',
            }}>
              <span style={{
                background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)',
                color:'#fff', fontSize:12, padding:'6px 16px', borderRadius:999,
              }}>
                Arahkan kamera ke nota belanja
              </span>
            </div>
          </>
        ) : (
          <img src={captured} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt="captured" />
        )}

        {/* AI processing overlay */}
        {isScanning && (
          <div style={{
            position:'absolute', inset:0,
            background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            gap:16,
          }}>
            <Loader2 size={48} color="#00AEEF" style={{ animation:'spin 1s linear infinite' }} />
            <div style={{ textAlign:'center' }}>
              <p style={{ color:'#fff', fontWeight:800, fontSize:16 }}>Memproses Nota...</p>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, marginTop:4 }}>AI sedang membaca data transaksi</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        background:'#000', padding:'24px 32px 40px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <button onClick={onClose} style={{
          width:48, height:48, borderRadius:'50%', background:'rgba(255,255,255,0.1)',
          border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <X size={22} color="#fff" />
        </button>

        {!captured ? (
          <button onClick={capture} style={{
            width:72, height:72, borderRadius:'50%', background:'#fff',
            border:'none', cursor:'pointer', padding:4,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <div style={{
              width:'100%', height:'100%', borderRadius:'50%',
              border:'3px solid rgba(0,0,0,0.1)',
              display:'flex', alignItems:'center', justifyContent:'center',
              background:'#00AEEF',
            }}/>
          </button>
        ) : (
          <div style={{ display:'flex', gap:16 }}>
            <button onClick={retake} style={{
              width:56, height:56, borderRadius:'50%', background:'rgba(255,255,255,0.15)',
              border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <RotateCcw size={22} color="#fff" />
            </button>
            <button onClick={confirm} style={{
              width:56, height:56, borderRadius:'50%', background:'#00AEEF',
              border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 16px rgba(0,174,239,0.5)',
            }}>
              <Check size={26} color="#fff" />
            </button>
          </div>
        )}

        <div style={{ width:48 }} />
      </div>

      <canvas ref={canvasRef} style={{ display:'none' }} />

      <style>{`
        @keyframes scan { 0%{top:0%} 50%{top:calc(100% - 2px)} 100%{top:0%} }
        @keyframes spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </motion.div>
  )
}

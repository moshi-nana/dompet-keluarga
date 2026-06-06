import { useStore } from '../../store'

export default function ContextSwitcher({ className = '' }) {
  const { activeContext, setContext } = useStore()
  return (
    <div className={`flex items-center p-1.5 rounded-2xl ${className}`}
      style={{ background: 'var(--bg-muted)' }}>
      {[['household','Rumah Tangga'],['business','Usaha']].map(([ctx, label]) => (
        <button key={ctx} onClick={() => setContext(ctx)}
          className="flex-1 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-200"
          style={{
            background: activeContext === ctx ? 'var(--bg-card)' : 'transparent',
            color: activeContext === ctx ? 'var(--blu-primary)' : 'var(--text-muted)',
            boxShadow: activeContext === ctx ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}>
          {label}
        </button>
      ))}
    </div>
  )
}

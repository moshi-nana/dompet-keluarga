import { useStore } from '../../store'

export default function ContextSwitcher({ className = '' }) {
  const { activeContext, setContext } = useStore()
  return (
    <div className={`flex items-center bg-gray-100 rounded-2xl p-1.5 ${className}`}>
      {[['household','Rumah Tangga'],['business','Usaha']].map(([ctx, label]) => (
        <button
          key={ctx}
          onClick={() => setContext(ctx)}
          className={`flex-1 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-200 ${
            activeContext === ctx
              ? 'bg-white text-blu-primary shadow-sm'
              : 'text-gray-400'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

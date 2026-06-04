import { useStore } from '../../store'

export default function ContextSwitcher({ className = '' }) {
  const { activeContext, setContext } = useStore()
  return (
    <div className={`flex items-center bg-gray-100 rounded-full p-1 ${className}`}>
      {[['household','Rumah Tangga'],['business','Usaha']].map(([ctx, label]) => (
        <button
          key={ctx}
          onClick={() => setContext(ctx)}
          className={`flex-1 py-2 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 ${
            activeContext === ctx
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-400'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

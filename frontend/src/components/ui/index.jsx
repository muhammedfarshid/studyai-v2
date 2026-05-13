// Spinner
export function Spinner({ size = 'md', className = '' }) {
  const s = size === 'sm' ? 'w-4 h-4 border-2' : size === 'lg' ? 'w-10 h-10 border-4' : 'w-6 h-6 border-[3px]'
  return <div className={`${s} border-slate-200 border-t-indigo-600 rounded-full animate-spin ${className}`} />
}

// Page header
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

// Stat card
export function StatCard({ label, value, icon: Icon, color = 'indigo', sub }) {
  const colors = {
    indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  val: 'text-indigo-700' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', val: 'text-emerald-700' },
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   val: 'text-amber-700' },
    blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',    val: 'text-blue-700' },
    purple:  { bg: 'bg-purple-50',  icon: 'text-purple-600',  val: 'text-purple-700' },
  }
  const c = colors[color] || colors.indigo
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={20} className={c.icon} />
        </div>
      </div>
      <p className={`text-2xl font-bold font-display ${c.val}`}>{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

// Empty state
export function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon size={26} className="text-slate-400" />
      </div>
      <p className="font-semibold text-slate-700 mb-1">{title}</p>
      <p className="text-sm text-slate-400 mb-4 max-w-xs">{desc}</p>
      {action}
    </div>
  )
}

// Alert / toast inline
export function Alert({ type = 'error', message }) {
  if (!message) return null
  const styles = {
    error:   'bg-red-50 border-red-100 text-red-700',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    info:    'bg-indigo-50 border-indigo-100 text-indigo-700',
  }
  return <div className={`rounded-xl border px-4 py-3 text-sm mb-4 ${styles[type]}`}>{message}</div>
}

// Modal wrapper
export function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${width} animate-slide-up`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="font-display font-bold text-slate-800 text-lg">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

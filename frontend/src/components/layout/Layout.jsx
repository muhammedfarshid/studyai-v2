import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, FolderOpen, BookOpen, LogOut, Sparkles, ChevronRight
} from 'lucide-react'

const nav = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/documents', icon: FolderOpen,      label: 'My Documents' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U'

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 min-w-[240px] bg-slate-900 flex flex-col h-full">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-[15px] leading-none">StudyAI</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Learning Assistant</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-2">Menu</p>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all duration-150 group
                ${isActive ? 'bg-indigo-600/20 text-white border-l-2 border-indigo-500' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-2 border-transparent'}`
              }
            >
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={12} className="opacity-30 group-hover:opacity-60" />
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <button onClick={() => { logout(); navigate('/login') }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
              title="Logout">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-slate-50">
        <Outlet />
      </main>
    </div>
  )
}

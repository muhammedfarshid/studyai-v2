import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { StatCard, Spinner, EmptyState } from '../components/ui/index.jsx'
import { FileText, Layers, CheckSquare, MessageSquare, TrendingUp, Clock, Upload, ArrowRight, Sparkles } from 'lucide-react'

const activityIcons = { upload:'📄', chat:'💬', flashcard:'🃏', quiz:'📝', summary:'📋' }

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/stats').then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (loading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Hero greeting */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-800">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Here's your study progress at a glance.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Documents"     value={stats?.docs          ?? 0} icon={FileText}     color="indigo" />
        <StatCard label="Flashcards"    value={stats?.flashcards    ?? 0} icon={Layers}       color="purple" />
        <StatCard label="Quizzes Taken" value={stats?.quizzesTaken  ?? 0} icon={CheckSquare}  color="emerald" />
        <StatCard label="Avg Quiz Score" value={stats?.quizzesTaken ? `${stats.avgScore}%` : '—'} icon={TrendingUp} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="lg:col-span-1">
          <div className="card p-5 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-0 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} />
              <p className="font-semibold text-sm">Ready to study?</p>
            </div>
            <p className="text-indigo-200 text-xs leading-relaxed mb-4">Upload a document and let AI generate flashcards and quizzes for you instantly.</p>
            <div className="flex flex-col gap-2">
              <Link to="/documents" className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors">
                <Upload size={14} /> Upload Document
              </Link>
              <Link to="/documents" className="flex items-center justify-center gap-2 bg-white rounded-xl px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors">
                <FileText size={14} /> View Documents
              </Link>
            </div>
          </div>

          {/* Tips */}
          <div className="card p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Tips</p>
            {[
              { icon: '📄', tip: 'Upload a PDF to get started' },
              { icon: '💬', tip: 'Ask questions in the Chat tab' },
              { icon: '🃏', tip: 'Generate flashcards instantly' },
              { icon: '📝', tip: 'Take a quiz to test yourself' },
            ].map(({ icon, tip }) => (
              <div key={tip} className="flex items-center gap-2.5 py-2 border-b border-slate-50 last:border-0">
                <span className="text-base">{icon}</span>
                <span className="text-xs text-slate-600">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-slate-800">Recent Activity</p>
            <Link to="/documents" className="text-xs text-indigo-600 flex items-center gap-1 hover:underline">
              View docs <ArrowRight size={11} />
            </Link>
          </div>
          {!stats?.activities?.length ? (
            <EmptyState icon={Clock} title="No activity yet" desc="Start by uploading a document" />
          ) : (
            <div className="space-y-1">
              {stats.activities.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0 animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-sm flex-shrink-0">
                    {activityIcons[a.type] || '📌'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">{a.label}</p>
                    {a.docName && <p className="text-xs text-slate-400 truncate">{a.docName}</p>}
                  </div>
                  <p className="text-xs text-slate-400 flex-shrink-0">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

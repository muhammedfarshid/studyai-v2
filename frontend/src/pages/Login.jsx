import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Alert } from '../components/ui/index.jsx'

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const r = await axios.post('/api/auth/login', form)
      login({ _id: r.data._id, name: r.data.name, email: r.data.email }, r.data.token)
      navigate('/')
    } catch(err) { setError(err.response?.data?.message || 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex flex-1 bg-slate-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-600/10 rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="relative z-10 max-w-sm text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles size={30} className="text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-3">StudyAI</h1>
          <p className="text-slate-400 text-base leading-relaxed mb-8">Your AI-powered learning assistant. Upload documents and get instant answers, flashcards, and quizzes.</p>
          {['📄 Upload PDF & Word documents','🤖 Context-aware AI answers','🃏 Auto-generated flashcards','📝 AI quiz generation'].map(f => (
            <div key={f} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 mb-2 text-left">
              <span className="text-sm text-slate-300">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm">Sign in to continue studying</p>
          </div>
          <Alert type="error" message={error} />
          <form onSubmit={submit} className="space-y-4">
            <Field icon={Mail} label="Email" name="email" type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="you@example.com" />
            <Field icon={Lock} label="Password" name="password" type={showPw?'text':'password'} value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••"
              suffix={<button type="button" onClick={()=>setShowPw(s=>!s)} className="text-slate-400 hover:text-slate-600 flex">{showPw?<EyeOff size={15}/>:<Eye size={15}/>}</button>} />
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? 'Signing in…' : <><span>Sign in</span><ArrowRight size={16}/></>}
            </button>
          </form>
          <p className="text-center mt-6 text-sm text-slate-500">
            No account?{' '}<Link to="/register" className="text-indigo-600 font-medium hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ icon: Icon, label, suffix, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className={`flex items-center gap-2 border rounded-xl px-3 bg-white transition-all ${focused ? 'border-indigo-400 ring-2 ring-indigo-500/15' : 'border-slate-200'}`}>
        <Icon size={15} className={focused ? 'text-indigo-500' : 'text-slate-400'} />
        <input {...props} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          className="flex-1 py-2.5 text-sm outline-none bg-transparent text-slate-800 placeholder:text-slate-300" />
        {suffix}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Spinner, EmptyState, Modal } from '../components/ui/index.jsx'
import { ClipboardList, Sparkles, ArrowLeft, CheckCircle, Clock, ChevronRight, ChevronLeft } from 'lucide-react'

export default function QuizPage() {
  const { id: docId } = useParams()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [qCount, setQCount] = useState(5)
  const [active, setActive] = useState(null)   // quiz being taken
  const [answers, setAnswers] = useState([])   // chosen option index per question
  const [current, setCurrent] = useState(0)    // current question index
  const [submitting, setSubmitting] = useState(false)
  const [docName, setDocName] = useState('')

  useEffect(() => {
    axios.get(`/api/documents/${docId}`).then(r => setDocName(r.data.originalName)).catch(()=>{})
    fetchQuizzes()
  }, [docId])

  const fetchQuizzes = async () => {
    setLoading(true)
    try { const r = await axios.get(`/api/quiz/document/${docId}`); setQuizzes(r.data) }
    catch { console.error() }
    finally { setLoading(false) }
  }

  const generate = async () => {
    setGenerating(true); setShowModal(false)
    try {
      const r = await axios.post(`/api/quiz/generate/${docId}`, { questionCount: qCount })
      setQuizzes(q => [r.data, ...q])
    } catch(e) { alert(e.response?.data?.message || 'Generation failed') }
    finally { setGenerating(false) }
  }

  const startQuiz = quiz => {
    setActive(quiz)
    setAnswers(new Array(quiz.questions.length).fill(-1))
    setCurrent(0)
  }

  const choose = optIdx => {
    setAnswers(a => { const n=[...a]; n[current]=optIdx; return n })
  }

  const submit = async () => {
    setSubmitting(true)
    try {
      await axios.post(`/api/quiz/${active._id}/submit`, { answers })
      navigate(`/documents/${docId}/quiz/${active._id}/result`)
    } catch(e) { alert('Submit failed') }
    finally { setSubmitting(false) }
  }

  /* ── Taking quiz ────────────────────────────────────────────── */
  if (active) {
    const q = active.questions[current]
    const chosen = answers[current]
    const progress = ((current + 1) / active.questions.length) * 100
    const allAnswered = answers.every(a => a !== -1)

    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setActive(null)} className="btn-secondary text-xs py-2">
            <ArrowLeft size={13}/> Back
          </button>
          <p className="text-sm font-semibold text-slate-600">Question {current+1} / {active.questions.length}</p>
        </div>

        {/* Progress */}
        <div className="w-full bg-slate-100 rounded-full h-2 mb-8">
          <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{width:`${progress}%`}} />
        </div>

        {/* Question */}
        <div className="card p-6 mb-5 animate-fade-in">
          <p className="font-semibold text-slate-800 text-base leading-relaxed mb-6">{q.question}</p>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => choose(i)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all ${
                  chosen === i
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 text-slate-700'
                }`}>
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 ${chosen===i?'bg-indigo-600 text-white':'bg-slate-100 text-slate-500'}`}>
                  {['A','B','C','D'][i]}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrent(i => Math.max(0,i-1))} disabled={current===0} className="btn-secondary disabled:opacity-30">
            <ChevronLeft size={16}/> Previous
          </button>
          {current < active.questions.length-1 ? (
            <button onClick={() => setCurrent(i => i+1)} className="btn-primary">
              Next <ChevronRight size={16}/>
            </button>
          ) : (
            <button onClick={submit} disabled={!allAnswered||submitting} className="btn-primary">
              {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Submitting…</> : <><CheckCircle size={16}/>Submit Quiz</>}
            </button>
          )}
        </div>

        {/* Answer dots */}
        <div className="flex justify-center gap-1.5 mt-6 flex-wrap">
          {active.questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i===current?'bg-indigo-600 w-4':answers[i]!==-1?'bg-emerald-400':'bg-slate-200'}`} />
          ))}
        </div>
      </div>
    )
  }

  /* ── Quiz list ─────────────────────────────────────────────── */
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/documents/${docId}`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><ArrowLeft size={16}/></Link>
          <div>
            <h1 className="font-display text-xl font-bold text-slate-800">Quizzes</h1>
            <p className="text-xs text-slate-400 truncate max-w-xs">{docName}</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} disabled={generating} className="btn-primary text-xs py-2">
          {generating ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Generating…</> : <><Sparkles size={13}/> New Quiz</>}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg"/></div>
      ) : quizzes.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No quizzes yet" desc="Generate an AI quiz from this document"
          action={<button onClick={() => setShowModal(true)} className="btn-primary text-sm"><Sparkles size={14}/>Generate Quiz</button>} />
      ) : (
        <div className="space-y-3">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${quiz.completed ? 'bg-emerald-50' : 'bg-indigo-50'}`}>
                {quiz.completed ? <CheckCircle size={20} className="text-emerald-600"/> : <ClipboardList size={20} className="text-indigo-600"/>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{quiz.totalQ}-Question Quiz</p>
                <p className="text-xs text-slate-400">{new Date(quiz.createdAt).toLocaleDateString()}</p>
                {quiz.completed && (
                  <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                    Score: {quiz.score}/{quiz.totalQ} ({Math.round((quiz.score/quiz.totalQ)*100)}%)
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {quiz.completed ? (
                  <Link to={`/documents/${docId}/quiz/${quiz._id}/result`} className="btn-secondary text-xs py-2 px-3">
                    View Results
                  </Link>
                ) : (
                  <button onClick={() => startQuiz(quiz)} className="btn-primary text-xs py-2 px-3">
                    Start <ChevronRight size={12}/>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Generate AI Quiz">
        <p className="text-sm text-slate-500 mb-5">Choose how many questions you want in this quiz.</p>
        <label className="block text-sm font-medium text-slate-700 mb-2">Questions: <span className="text-indigo-600 font-bold">{qCount}</span></label>
        <input type="range" min={3} max={15} value={qCount} onChange={e=>setQCount(+e.target.value)} className="w-full accent-indigo-600 mb-6" />
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={generate} className="btn-primary"><Sparkles size={14}/>Generate {qCount} Questions</button>
        </div>
      </Modal>
    </div>
  )
}

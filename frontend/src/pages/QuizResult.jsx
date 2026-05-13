import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { Spinner } from '../components/ui/index.jsx'
import { CheckCircle, XCircle, ArrowLeft, Trophy, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'

export default function QuizResult() {
  const { id: docId, quizId } = useParams()
  const [quiz, setQuiz]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    axios.get(`/api/quiz/${quizId}`).then(r => setQuiz(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [quizId])

  if (loading) return <div className="flex items-center justify-center h-full"><Spinner size="lg"/></div>
  if (!quiz)   return <div className="p-8 text-slate-500">Quiz not found.</div>

  const pct    = Math.round((quiz.score / quiz.totalQ) * 100)
  const grade  = pct >= 90 ? { label:'Excellent! 🏆', color:'text-emerald-600', bg:'bg-emerald-50' }
               : pct >= 70 ? { label:'Good job! 👍',  color:'text-blue-600',    bg:'bg-blue-50' }
               : pct >= 50 ? { label:'Keep studying 📚', color:'text-amber-600', bg:'bg-amber-50' }
               :              { label:'Needs work 💪',  color:'text-red-600',    bg:'bg-red-50' }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to={`/documents/${docId}/quiz`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
          <ArrowLeft size={16}/>
        </Link>
        <h1 className="font-display text-xl font-bold text-slate-800">Quiz Results</h1>
      </div>

      {/* Score card */}
      <div className={`card p-8 mb-8 text-center ${grade.bg} border-0`}>
        <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-4">
          <span className="font-display text-3xl font-bold text-slate-800">{pct}%</span>
        </div>
        <p className={`font-display text-xl font-bold ${grade.color} mb-1`}>{grade.label}</p>
        <p className="text-sm text-slate-600">{quiz.score} out of {quiz.totalQ} correct</p>

        {/* Mini bar */}
        <div className="w-48 mx-auto mt-4 bg-white/60 rounded-full h-2">
          <div className={`h-2 rounded-full transition-all ${pct>=70?'bg-emerald-500':pct>=50?'bg-amber-500':'bg-red-500'}`} style={{width:`${pct}%`}} />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold font-display text-emerald-600">{quiz.score}</p>
          <p className="text-xs text-slate-500 mt-0.5">Correct</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold font-display text-red-500">{quiz.totalQ - quiz.score}</p>
          <p className="text-xs text-slate-500 mt-0.5">Incorrect</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold font-display text-indigo-600">{quiz.totalQ}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total</p>
        </div>
      </div>

      {/* Question breakdown */}
      <p className="font-semibold text-slate-800 mb-4">Detailed Breakdown</p>
      <div className="space-y-3">
        {quiz.questions.map((q, i) => {
          const userAns    = quiz.answers?.[i] ?? -1
          const correct    = q.correctAnswer
          const isCorrect  = userAns === correct
          const isExpanded = expanded[i]

          return (
            <div key={i} className={`card overflow-hidden border-l-4 ${isCorrect ? 'border-l-emerald-500' : 'border-l-red-400'}`}>
              <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isCorrect ? 'bg-emerald-100' : 'bg-red-50'}`}>
                  {isCorrect ? <CheckCircle size={15} className="text-emerald-600"/> : <XCircle size={15} className="text-red-500"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 leading-snug">Q{i+1}. {q.question}</p>
                  <p className={`text-xs mt-1 font-medium ${isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isCorrect ? '✓ Correct' : `✗ You chose: ${q.options[userAns] || 'Not answered'}`}
                  </p>
                </div>
                {isExpanded ? <ChevronUp size={15} className="text-slate-400 flex-shrink-0 mt-1"/> : <ChevronDown size={15} className="text-slate-400 flex-shrink-0 mt-1"/>}
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-50 pt-3 animate-fade-in">
                  <div className="space-y-2 mb-3">
                    {q.options.map((opt, j) => (
                      <div key={j} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${
                        j === correct ? 'bg-emerald-50 text-emerald-700 font-medium' :
                        j === userAns && !isCorrect ? 'bg-red-50 text-red-600' : 'text-slate-600'
                      }`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${j===correct?'bg-emerald-500 text-white':j===userAns&&!isCorrect?'bg-red-400 text-white':'bg-slate-100 text-slate-500'}`}>
                          {['A','B','C','D'][j]}
                        </span>
                        {opt}
                        {j === correct && <span className="ml-auto text-emerald-600">✓</span>}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="bg-indigo-50 rounded-xl p-3 text-xs text-indigo-800">
                      <p className="font-semibold mb-1">💡 Explanation</p>
                      <ReactMarkdown>{q.explanation}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-8 justify-center">
        <Link to={`/documents/${docId}/quiz`} className="btn-secondary">
          <RotateCcw size={14}/> Take Another Quiz
        </Link>
        <Link to={`/documents/${docId}`} className="btn-primary">
          Back to Document
        </Link>
      </div>
    </div>
  )
}

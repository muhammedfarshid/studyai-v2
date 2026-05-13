import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { Spinner } from '../components/ui/index.jsx'
import {
  FileText, MessageSquare, Layers, ClipboardList, Sparkles,
  Send, Plus, Trash2, BookOpen, Lightbulb, ArrowLeft, RefreshCw, X
} from 'lucide-react'

const TABS = [
  { id: 'chat',       label: 'AI Chat',    icon: MessageSquare },
  { id: 'summary',    label: 'Summary',    icon: BookOpen },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'quiz',       label: 'Quiz',       icon: ClipboardList },
]

export default function DocDetail() {
  const { id } = useParams()
  const [doc, setDoc]         = useState(null)
  const [tab, setTab]         = useState('chat')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`/api/documents/${id}`).then(r => setDoc(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (!doc)    return <div className="p-8 text-slate-500">Document not found.</div>

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center gap-4 flex-shrink-0">
        <Link to="/documents" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${doc.fileType==='pdf'?'bg-red-50':'bg-blue-50'}`}>
          <FileText size={15} className={doc.fileType==='pdf'?'text-red-500':'text-blue-500'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{doc.originalName}</p>
          <p className="text-xs text-slate-400">{doc.pageCount} pages · {doc.status}</p>
        </div>
        <span className={doc.status==='indexed'?'badge-green':doc.status==='error'?'badge-red':'badge-yellow'}>
          {doc.status}
        </span>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF Viewer */}
        <div className="w-2/5 border-r border-slate-100 flex flex-col bg-slate-100 overflow-hidden">
          <div className="bg-white border-b border-slate-100 px-4 py-2 flex items-center gap-2 flex-shrink-0">
            <FileText size={14} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-600">Document Viewer</span>
          </div>
          {doc.fileType === 'pdf' ? (
            <iframe
              src={`/api/documents/${id}/file`}
              className="flex-1 w-full"
              title="PDF Viewer"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col gap-3 text-slate-400">
              <FileText size={40} />
              <p className="text-sm">Preview not available for DOCX</p>
              <p className="text-xs">Use the AI tools on the right →</p>
            </div>
          )}
        </div>

        {/* AI Tools panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="bg-white border-b border-slate-100 px-4 flex gap-1 flex-shrink-0 overflow-x-auto">
            {TABS.map(({ id: tid, label, icon: Icon }) => (
              <button key={tid} onClick={() => setTab(tid)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap
                  ${tab===tid ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <Icon size={13} />{label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {tab === 'chat'       && <ChatTab docId={id} />}
            {tab === 'summary'    && <SummaryTab docId={id} />}
            {tab === 'flashcards' && <Link to={`/documents/${id}/flashcards`} className="flex items-center justify-center h-full"><div className="btn-primary"><Layers size={15}/>Open Flashcards</div></Link>}
            {tab === 'quiz'       && <Link to={`/documents/${id}/quiz`} className="flex items-center justify-center h-full"><div className="btn-primary"><ClipboardList size={15}/>Open Quiz</div></Link>}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Chat Tab ─────────────────────────────────────────────────────────── */
function ChatTab({ docId }) {
  const [chats, setChats]     = useState([])
  const [active, setActive]   = useState(null)
  const [messages, setMsgs]   = useState([])
  const [input, setInput]     = useState('')
  const [sending, setSending] = useState(false)
  const [concept, setConcept] = useState('')
  const [explaining, setExplaining] = useState(false)
  const [explanation, setExplanation] = useState('')
  const endRef = useRef()

  useEffect(() => {
    axios.get(`/api/chat/document/${docId}`).then(r => setChats(r.data)).catch(console.error)
  }, [docId])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, sending])

  const newChat = async () => {
    const r = await axios.post(`/api/chat/document/${docId}`)
    setChats(c => [r.data, ...c]); loadChat(r.data._id)
  }

  const loadChat = async chatId => {
    const r = await axios.get(`/api/chat/${chatId}`)
    setActive(r.data); setMsgs(r.data.messages || [])
  }

  const send = async () => {
    if (!input.trim() || sending || !active) return
    const q = input.trim(); setInput(''); setSending(true)
    setMsgs(m => [...m, { role:'user', content:q, timestamp: new Date() }])
    try {
      const r = await axios.post(`/api/chat/${active._id}/ask`, { question: q })
      setMsgs(m => [...m, { role:'assistant', content: r.data.answer, timestamp: new Date() }])
    } catch { setMsgs(m => [...m, { role:'assistant', content:'❌ Error getting answer. Please try again.', timestamp: new Date() }]) }
    finally { setSending(false) }
  }

  const explain = async () => {
    if (!concept.trim()) return
    setExplaining(true); setExplanation('')
    try {
      const r = await axios.post(`/api/documents/${docId}/explain`, { concept })
      setExplanation(r.data.explanation)
    } catch { setExplanation('Failed to explain concept.') }
    finally { setExplaining(false) }
  }

  return (
    <div className="flex h-full">
      {/* Chat history sidebar */}
      <div className="w-44 border-r border-slate-100 flex flex-col bg-slate-50 flex-shrink-0">
        <div className="p-2">
          <button onClick={newChat} className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg px-3 py-2 transition-colors">
            <Plus size={12}/> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {chats.map(c => (
            <button key={c._id} onClick={() => loadChat(c._id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors truncate ${active?._id===c._id ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}>
              {c.title}
            </button>
          ))}
          {chats.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No chats yet</p>}
        </div>
      </div>

      {/* Chat main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!active ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <Sparkles size={22} className="text-indigo-600" />
            </div>
            <p className="font-semibold text-slate-700">Start a conversation</p>
            <p className="text-xs text-slate-400 max-w-xs">Create a new chat and ask questions about this document.</p>

            {/* Explain concept */}
            <div className="w-full max-w-xs mt-4">
              <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1"><Lightbulb size={12}/> Explain a Concept</p>
              <div className="flex gap-2">
                <input value={concept} onChange={e=>setConcept(e.target.value)} placeholder="e.g. photosynthesis" className="input text-xs py-2 flex-1" onKeyDown={e=>e.key==='Enter'&&explain()} />
                <button onClick={explain} disabled={explaining||!concept.trim()} className="btn-primary py-2 px-3 text-xs">
                  {explaining ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Go'}
                </button>
              </div>
              {explanation && (
                <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-slate-700 max-h-40 overflow-y-auto">
                  <ReactMarkdown>{explanation}</ReactMarkdown>
                </div>
              )}
            </div>
            <button onClick={newChat} className="btn-primary text-xs">
              <Plus size={13}/> New Chat
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">Ask a question about this document</div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2.5 ${m.role==='user'?'flex-row-reverse':''} animate-fade-in`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${m.role==='user'?'bg-indigo-600 text-white':'bg-gradient-to-br from-indigo-500 to-emerald-500 text-white'}`}>
                    {m.role==='user' ? 'U' : <Sparkles size={12}/>}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${m.role==='user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm'}`}>
                    {m.role==='user' ? m.content : <ReactMarkdown>{m.content}</ReactMarkdown>}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center"><Sparkles size={12} className="text-white"/></div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5 items-center">
                      {[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:`${i*150}ms`}}/>)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef}/>
            </div>
            <div className="p-3 border-t border-slate-100 bg-white">
              <div className="flex gap-2 items-end bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                <textarea value={input} onChange={e=>{setInput(e.target.value);e.target.style.height='20px';e.target.style.height=Math.min(e.target.scrollHeight,100)+'px'}}
                  onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}
                  placeholder="Ask a question…" rows={1}
                  className="flex-1 text-xs outline-none bg-transparent resize-none text-slate-700 placeholder:text-slate-400 leading-relaxed" style={{height:20}} />
                <button onClick={send} disabled={sending||!input.trim()}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${sending||!input.trim() ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                  <Send size={12}/>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Summary Tab ──────────────────────────────────────────────────────── */
function SummaryTab({ docId }) {
  const [summary, setSummary]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [generated, setGenerated] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const r = await axios.post(`/api/documents/${docId}/summary`)
      setSummary(r.data.summary); setGenerated(true)
    } catch { setSummary('Failed to generate summary.') }
    finally { setLoading(false) }
  }

  useEffect(() => { generate() }, [docId])

  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-indigo-600" />
          <p className="font-semibold text-sm text-slate-800">Document Summary</p>
        </div>
        <button onClick={generate} disabled={loading} className="btn-secondary py-1.5 px-3 text-xs">
          <RefreshCw size={12} className={loading?'animate-spin':''}/> Regenerate
        </button>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner /><p className="text-xs text-slate-400">Generating summary with AI…</p>
        </div>
      ) : summary ? (
        <div className="prose prose-sm max-w-none text-slate-700 bg-white rounded-xl border border-slate-100 p-5 text-xs leading-relaxed">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      ) : null}
    </div>
  )
}

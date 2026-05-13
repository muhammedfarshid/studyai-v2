import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Spinner, EmptyState, Modal } from '../components/ui/index.jsx'
import { Layers, Star, Trash2, RefreshCw, ArrowLeft, ChevronLeft, ChevronRight, Sparkles, RotateCcw } from 'lucide-react'

export default function Flashcards() {
  const { id: docId } = useParams()
  const [cards, setCards]   = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [count, setCount]   = useState(10)
  const [filter, setFilter] = useState('all') // all | favorites
  const [mode, setMode]     = useState('grid') // grid | study
  const [studyIdx, setStudyIdx] = useState(0)
  const [flipped, setFlipped] = useState({})
  const [docName, setDocName] = useState('')

  useEffect(() => {
    axios.get(`/api/documents/${docId}`).then(r => setDocName(r.data.originalName)).catch(()=>{})
    fetchCards()
  }, [docId])

  const fetchCards = async () => {
    setLoading(true)
    try { const r = await axios.get(`/api/flashcards/document/${docId}`); setCards(r.data) }
    catch { console.error('fetch cards failed') }
    finally { setLoading(false) }
  }

  const generate = async () => {
    setGenerating(true); setShowModal(false)
    try {
      const r = await axios.post(`/api/flashcards/generate/${docId}`, { count })
      setCards(c => [...r.data, ...c])
    } catch(e) { alert(e.response?.data?.message || 'Generation failed') }
    finally { setGenerating(false) }
  }

  const toggleFav = async id => {
    const r = await axios.patch(`/api/flashcards/${id}/favorite`)
    setCards(c => c.map(x => x._id===id ? r.data : x))
  }

  const deleteCard = async id => {
    await axios.delete(`/api/flashcards/${id}`)
    setCards(c => c.filter(x => x._id!==id))
  }

  const toggleFlip = id => setFlipped(f => ({ ...f, [id]: !f[id] }))

  const displayed = filter==='favorites' ? cards.filter(c=>c.isFavorite) : cards

  // Study mode helpers
  const studyCards = displayed
  const prev = () => { setStudyIdx(i => Math.max(0,i-1)); setFlipped({}) }
  const next = () => { setStudyIdx(i => Math.min(studyCards.length-1,i+1)); setFlipped({}) }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/documents/${docId}`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><ArrowLeft size={16}/></Link>
          <div>
            <h1 className="font-display text-xl font-bold text-slate-800">Flashcards</h1>
            <p className="text-xs text-slate-400 truncate max-w-xs">{docName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMode(m => m==='grid'?'study':'grid')}
            className="btn-secondary text-xs py-2">
            {mode==='grid' ? <><RotateCcw size={13}/> Study Mode</> : <><Layers size={13}/> Grid View</>}
          </button>
          <button onClick={() => setShowModal(true)} disabled={generating}
            className="btn-primary text-xs py-2">
            {generating ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Generating…</span></> : <><Sparkles size={13}/> Generate</>}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5">
        {[['all','All Cards'],['favorites','⭐ Favorites']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-colors ${filter===v ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {l} {v==='all' ? `(${cards.length})` : `(${cards.filter(c=>c.isFavorite).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg"/></div>
      ) : displayed.length === 0 ? (
        <EmptyState icon={Layers} title="No flashcards yet" desc="Click Generate to create flashcards from this document"
          action={<button onClick={()=>setShowModal(true)} className="btn-primary text-sm"><Sparkles size={14}/>Generate Flashcards</button>} />
      ) : mode === 'study' ? (
        /* Study Mode */
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-xs text-slate-400 mb-6">{studyIdx+1} / {studyCards.length} — click card to flip</p>
          <div className="flip-card w-full max-w-lg" style={{height:240}} onClick={() => toggleFlip('study')}>
            <div className={`flip-card-inner ${flipped['study']?'flipped':''}`} style={{height:240}}>
              <div className="flip-card-front bg-white border-2 border-indigo-100 shadow-lg flex flex-col items-center justify-center p-8">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Term</p>
                <p className="text-xl font-bold text-slate-800 text-center">{studyCards[studyIdx]?.term}</p>
                <p className="text-xs text-slate-400 mt-6">Click to reveal definition</p>
              </div>
              <div className="flip-card-back bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-lg flex flex-col items-center justify-center p-8">
                <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-4">Definition</p>
                <p className="text-sm text-white text-center leading-relaxed">{studyCards[studyIdx]?.definition}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-8">
            <button onClick={prev} disabled={studyIdx===0} className="btn-secondary disabled:opacity-30"><ChevronLeft size={16}/></button>
            <button onClick={() => toggleFav(studyCards[studyIdx]?._id)}
              className={`p-2 rounded-xl border transition-colors ${studyCards[studyIdx]?.isFavorite ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500'}`}>
              <Star size={18} fill={studyCards[studyIdx]?.isFavorite?'currentColor':'none'}/>
            </button>
            <button onClick={next} disabled={studyIdx===studyCards.length-1} className="btn-secondary disabled:opacity-30"><ChevronRight size={16}/></button>
          </div>
        </div>
      ) : (
        /* Grid Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map(card => (
            <div key={card._id} className="flip-card" style={{height:180}} onClick={() => toggleFlip(card._id)}>
              <div className={`flip-card-inner ${flipped[card._id]?'flipped':''}`} style={{height:180}}>
                {/* Front */}
                <div className="flip-card-front bg-white border border-slate-100 shadow-sm p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Term</span>
                    <div className="flex gap-1" onClick={e=>e.stopPropagation()}>
                      <button onClick={() => toggleFav(card._id)}
                        className={`p-1 rounded-lg transition-colors ${card.isFavorite?'text-amber-500':'text-slate-300 hover:text-amber-400'}`}>
                        <Star size={13} fill={card.isFavorite?'currentColor':'none'}/>
                      </button>
                      <button onClick={() => deleteCard(card._id)} className="p-1 rounded-lg text-slate-300 hover:text-red-400 transition-colors">
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </div>
                  <p className="font-bold text-slate-800 flex-1 flex items-center text-sm leading-snug">{card.term}</p>
                  <p className="text-[10px] text-slate-400 mt-2">Click to flip</p>
                </div>
                {/* Back */}
                <div className="flip-card-back bg-indigo-600 p-5 flex flex-col">
                  <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-3">Definition</span>
                  <p className="text-white text-xs leading-relaxed flex-1 overflow-y-auto">{card.definition}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Generate Flashcards">
        <p className="text-sm text-slate-500 mb-5">How many flashcards should the AI generate from this document?</p>
        <label className="block text-sm font-medium text-slate-700 mb-2">Number of flashcards: <span className="text-indigo-600 font-bold">{count}</span></label>
        <input type="range" min={5} max={20} value={count} onChange={e=>setCount(+e.target.value)} className="w-full accent-indigo-600 mb-6" />
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={generate} className="btn-primary"><Sparkles size={14}/>Generate {count} Cards</button>
        </div>
      </Modal>
    </div>
  )
}

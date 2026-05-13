import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { PageHeader, Spinner, EmptyState, Alert } from '../components/ui/index.jsx'
import { FileText, Upload, Trash2, ArrowRight, RefreshCw, Search } from 'lucide-react'

export default function Documents() {
  const [docs, setDocs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch]   = useState('')
  const [error, setError]     = useState('')
  const [deleting, setDeleting] = useState(null)
  const fileRef = useRef()

  const fetchDocs = async () => {
    setLoading(true)
    try { const r = await axios.get('/api/documents'); setDocs(r.data) }
    catch { setError('Failed to load documents') }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchDocs() }, [])

  const handleUpload = async file => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf','docx'].includes(ext)) return setError('Only PDF and DOCX files are supported')
    setError(''); setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    try {
      const r = await axios.post('/api/documents', fd)
      setDocs(d => [r.data, ...d])
    } catch(err) { setError(err.response?.data?.message || 'Upload failed') }
    finally { setUploading(false) }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this document? All related data will be lost.')) return
    setDeleting(id)
    try { await axios.delete(`/api/documents/${id}`); setDocs(d => d.filter(x => x._id !== id)) }
    catch { setError('Delete failed') }
    finally { setDeleting(null) }
  }

  const filtered = docs.filter(d => d.originalName.toLowerCase().includes(search.toLowerCase()))
  const fmt = b => b < 1048576 ? (b/1024).toFixed(1)+' KB' : (b/1048576).toFixed(1)+' MB'

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <PageHeader title="My Documents" subtitle={`${docs.length} document${docs.length!==1?'s':''} uploaded`}>
        <button onClick={() => fileRef.current.click()} disabled={uploading}
          className="btn-primary">
          {uploading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Uploading…</span></> : <><Upload size={15}/><span>Upload</span></>}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.docx" hidden onChange={e => handleUpload(e.target.files[0])} />
        <button onClick={fetchDocs} className="btn-secondary"><RefreshCw size={15}/></button>
      </PageHeader>

      <Alert type="error" message={error} />

      {/* Drag-and-drop zone */}
      <div
        className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center mb-6 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group"
        onClick={() => fileRef.current.click()}
        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-400','bg-indigo-50') }}
        onDragLeave={e => e.currentTarget.classList.remove('border-indigo-400','bg-indigo-50')}
        onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('border-indigo-400','bg-indigo-50'); handleUpload(e.dataTransfer.files[0]) }}
      >
        <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center mx-auto mb-3 transition-colors">
          <Upload size={22} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
        </div>
        <p className="text-sm font-semibold text-slate-600 mb-1">Drop PDF or DOCX here</p>
        <p className="text-xs text-slate-400">or click to browse · Max 25MB</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search documents…"
          className="input pl-10" />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No documents yet" desc="Upload your first PDF or Word document to get started" />
      ) : (
        <div className="card overflow-hidden">
          {filtered.map((doc, i) => (
            <div key={doc._id} className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors ${i < filtered.length-1 ? 'border-b border-slate-100' : ''}`}>
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${doc.fileType==='pdf' ? 'bg-red-50' : 'bg-blue-50'}`}>
                <FileText size={18} className={doc.fileType==='pdf' ? 'text-red-500' : 'text-blue-500'} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{doc.originalName}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {fmt(doc.fileSize)} · {doc.pageCount||0} pages · {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Status */}
              <span className={doc.status==='indexed'?'badge-green':doc.status==='error'?'badge-red':'badge-yellow'}>
                {doc.status==='indexed'?'Indexed':doc.status==='error'?'Error':'Processing'}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {doc.status === 'indexed' && (
                  <Link to={`/documents/${doc._id}`} className="btn-secondary py-1.5 px-3 text-xs">
                    Open <ArrowRight size={12} />
                  </Link>
                )}
                <button onClick={() => handleDelete(doc._id)} disabled={deleting===doc._id}
                  className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors">
                  {deleting===doc._id ? <div className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin"/> : <Trash2 size={14}/>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

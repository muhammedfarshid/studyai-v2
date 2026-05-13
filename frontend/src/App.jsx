import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout    from './components/layout/Layout'
import Login     from './pages/Login'
import Register  from './pages/Register'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import DocDetail from './pages/DocDetail'
import Flashcards from './pages/Flashcards'
import QuizPage  from './pages/QuizPage'
import QuizResult from './pages/QuizResult'

function Spinner() {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )
}

function Private({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user ? children : <Navigate to="/login" replace />
}

function Public({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return !user ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Public><Login /></Public>} />
          <Route path="/register" element={<Public><Register /></Public>} />
          <Route path="/" element={<Private><Layout /></Private>}>
            <Route index element={<Dashboard />} />
            <Route path="documents"              element={<Documents />} />
            <Route path="documents/:id"          element={<DocDetail />} />
            <Route path="documents/:id/flashcards" element={<Flashcards />} />
            <Route path="documents/:id/quiz"     element={<QuizPage />} />
            <Route path="documents/:id/quiz/:quizId/result" element={<QuizResult />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

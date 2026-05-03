import { Routes, Route } from 'react-router-dom'
import SupportPage from './pages/SupportPage'

// SAD §6: single Web/API gateway serving the operator workspace
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <span className="text-lg font-semibold">Support Crew</span>
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
          AI-assisted — Demo
        </span>
      </header>
      <main className="px-4 py-8">
        <Routes>
          <Route path="/" element={<SupportPage />} />
        </Routes>
      </main>
    </div>
  )
}

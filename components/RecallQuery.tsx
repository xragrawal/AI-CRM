'use client'

import { useState } from 'react'
import { Search, MessageSquare, AlertCircle, Loader2, Quote } from 'lucide-react'

interface RecallResponse {
  answer: string
  sources: Array<{
    dealName: string
    snippet: string
  }>
}

export default function RecallQuery() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<RecallResponse | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    setError(null)
    setResponse(null)
    setLoading(true)

    try {
      const res = await fetch('/api/recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Query failed')
        return
      }
      setResponse(data)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const exampleQueries = [
    'What did we agree on with Acme?',
    'Who do I need to follow up with?',
    'Last week summary',
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
        <form onSubmit={handleSubmit} className="flex items-center px-6 sm:px-8 py-3 sm:py-4">
          <Search className="text-[#5551FF] mr-4 sm:mr-6" size={28} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search deals, decisions, or ask a question..."
            className="flex-1 py-4 sm:py-5 text-gray-900 placeholder-gray-400 focus:outline-none text-lg sm:text-xl font-bold bg-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="ml-4 p-3 sm:p-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 disabled:opacity-30 transition-all active:scale-95 shadow-lg"
          >
            {loading ? (
              <Loader2 size={28} className="animate-spin" />
            ) : (
              <MessageSquare size={28} />
            )}
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3">
        {exampleQueries.map((eq) => (
          <button
            key={eq}
            type="button"
            onClick={() => setQuery(eq)}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-gray-50 text-gray-500 rounded-xl border border-gray-100 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            {eq}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 sm:p-4 bg-red-50 border border-red-100 rounded-xl text-xs sm:text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span>{error}</span>
        </div>
      )}

      {response && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="px-6 sm:px-8 py-4 sm:py-6 border-b border-gray-50 flex items-center gap-3">
            <div className="p-2 bg-[#5551FF]/10 text-[#5551FF] rounded-xl border border-[#5551FF]/10 shadow-sm">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-widest">AI Insights</h3>
          </div>
          
          <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
            <p className="text-base sm:text-lg text-gray-800 leading-relaxed font-medium">
              {response.answer}
            </p>

            {response.sources?.length > 0 && (
              <div className="pt-6 sm:pt-8 border-t border-gray-50">
                <h4 className="text-sm sm:text-base font-black text-gray-400 uppercase tracking-widest mb-6 sm:mb-8 flex items-center gap-3">
                  <Quote size={18} className="text-[#5551FF]/40" />
                  Sources & Evidence
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {response.sources.map((s, i) => (
                    <div key={i} className="group p-4 sm:p-6 bg-gray-50/50 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-white transition-all">
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                          <Quote size={18} className="text-[#5551FF]/60" />
                        </div>
                        <span className="text-sm sm:text-base font-black text-gray-900 truncate tracking-tight">{s.dealName}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 italic leading-relaxed line-clamp-3">
                        "{s.snippet}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

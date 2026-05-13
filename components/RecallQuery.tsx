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
    <div className="h-full flex flex-col gap-3">
      {/* Search input */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-[#5551FF]/10 focus-within:border-[#5551FF]/30 transition-all shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center px-5 py-2.5">
          <Search className="text-[#5551FF] mr-4 shrink-0" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search deals, decisions, or ask a question..."
            className="flex-1 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none font-medium bg-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="ml-3 p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-30 transition-all active:scale-95 shadow-md shrink-0"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <MessageSquare size={18} />
            )}
          </button>
        </form>
      </div>

      {/* Example query chips */}
      <div className="flex flex-wrap gap-2 shrink-0">
        {exampleQueries.map((eq) => (
          <button
            key={eq}
            type="button"
            onClick={() => setQuery(eq)}
            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-white text-gray-500 rounded-lg border border-gray-100 hover:border-[#5551FF]/20 hover:text-[#5551FF] hover:bg-[#5551FF]/5 transition-all shadow-sm"
          >
            {eq}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium animate-in fade-in slide-in-from-top-2 shrink-0">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Response card — scrollable if long */}
      {response && (
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 flex flex-col min-h-0">
          <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2.5 shrink-0">
            <div className="p-1.5 bg-[#5551FF]/10 text-[#5551FF] rounded-lg border border-[#5551FF]/10">
              <MessageSquare size={16} />
            </div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">AI Insights</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <p className="text-sm text-gray-800 leading-relaxed font-medium">
              {response.answer}
            </p>

            {response.sources?.length > 0 && (
              <div className="pt-5 border-t border-gray-50">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Quote size={14} className="text-[#5551FF]/40" />
                  Sources & Evidence
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {response.sources.map((s, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#5551FF]/15 hover:bg-white transition-all">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="p-1 bg-white rounded-lg shadow-sm border border-gray-100 shrink-0">
                          <Quote size={14} className="text-[#5551FF]/60" />
                        </div>
                        <span className="text-xs font-black text-gray-900 truncate tracking-tight">{s.dealName}</span>
                      </div>
                      <p className="text-xs text-gray-500 italic leading-relaxed line-clamp-3">
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

      {/* Empty state when no response yet */}
      {!response && !error && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-100 p-8 text-center">
          <div className="p-3 bg-[#5551FF]/8 rounded-2xl">
            <Search size={22} className="text-[#5551FF]/60" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Ask anything about your deals</p>
            <p className="text-[10px] text-gray-300 font-medium mt-1">Decisions, contacts, statuses, next steps</p>
          </div>
        </div>
      )}
    </div>
  )
}

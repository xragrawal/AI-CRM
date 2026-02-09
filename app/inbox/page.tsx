'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Inbox, 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  ArrowUpRight
} from 'lucide-react'

interface InboxItem {
  id: string
  rawText: string
  status: string
  createdAt: string
}

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('/api/items?status=inbox')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load')
        return res.json()
      })
      .then((data) => setItems(data.items ?? []))
      .catch(() => setError('Failed to load inbox'))
      .finally(() => setLoading(false))
  }, [])

  const filteredItems = items.filter(item => 
    item.rawText.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#5551FF]/10 text-[#5551FF] rounded-lg">
              <Inbox size={24} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Inbox</h2>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            {filteredItems.length} deferred items awaiting processing
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#5551FF] transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search inbox..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#5551FF]/5 focus:border-[#5551FF] transition-all shadow-sm"
          />
        </div>
        <button className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-500 uppercase tracking-widest hover:border-gray-200 transition-all shadow-sm">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white border border-gray-100 rounded-[32px]">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white border border-red-100 rounded-[32px]">
             <p className="text-xs font-black text-red-500 uppercase tracking-widest">{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white border border-dashed border-gray-200 rounded-[32px]">
             <Inbox size={24} className="text-gray-200 mb-2" />
             <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Inbox is clear</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="group flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-blue-100 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-6 flex-1 min-w-0">
                  <div className="mt-1 p-3 bg-white border border-gray-100 text-[#5551FF]/60 rounded-2xl group-hover:bg-[#5551FF] group-hover:text-white transition-all shadow-sm">
                    <MessageSquare size={22} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-[11px] font-black text-[#5551FF] uppercase tracking-widest bg-[#5551FF]/5 px-2 py-0.5 rounded border border-[#5551FF]/10">
                        Deferred Entry
                      </span>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        <Clock size={12} />
                        <span>{formatShortDate(item.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 font-bold leading-relaxed line-clamp-2 pr-10">
                      {item.rawText}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 text-gray-300 group-hover:text-[#5551FF] transition-all">
                    <ArrowUpRight size={22} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

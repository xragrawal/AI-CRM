'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Inbox, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronDown,
  MessageSquare,
  Clock,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react'

interface InboxItem {
  id: string
  rawText: string
  status: string
  createdAt: string
}

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
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
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl text-base font-bold text-gray-600 hover:bg-gray-50 cursor-pointer">
            <Inbox size={20} className="text-gray-400" />
            <span>Deferred Items</span>
            <ChevronDown size={18} className="text-gray-300" />
          </div>

          <div className="flex items-center gap-8">
            <button className="flex items-center gap-3 text-base font-bold text-gray-500 hover:text-gray-900 px-3 py-2">
              <Filter size={20} className="text-gray-400" />
              <span>Filter</span>
            </button>
            <button className="flex items-center gap-3 text-base font-bold text-gray-500 hover:text-gray-900 px-3 py-2">
              <ArrowUpDown size={20} className="text-gray-400" />
              <span>Sort</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Search inbox..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-80"
              />
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
             <p className="text-red-500 font-bold">{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
             <div className="p-4 bg-gray-50 rounded-full mb-4">
                <Inbox size={32} className="text-gray-300" />
             </div>
             <p className="text-gray-500 font-bold">Inbox is empty</p>
             <p className="text-sm text-gray-400 mt-1">Deferred items will appear here.</p>
          </div>
        ) : (
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 gap-4">
              {filteredItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/items/${item.id}`}
                  className="group flex items-center justify-between p-6 bg-white border border-gray-100 rounded-[24px] hover:border-blue-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-6 flex-1 min-w-0">
                    <div className="mt-1 p-4 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <MessageSquare size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded">
                          Inbox Item
                        </span>
                        <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                          <Clock size={14} />
                          <span>{formatShortDate(item.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-base text-gray-600 font-medium leading-relaxed line-clamp-2">
                        {item.rawText}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 ml-8">
                    <div className="p-2 text-gray-300 group-hover:text-blue-500 transition-colors">
                      <ChevronRight size={24} />
                    </div>
                    <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                      <MoreHorizontal size={24} />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

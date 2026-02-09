'use client'

import Link from 'next/link'
import { Sparkles, Command } from 'lucide-react'

export default function ChatHomePage() {
  return (
    <div className="flex flex-col h-full space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-widest">
          <span className="p-1.5 bg-[#5551FF]/10 text-[#5551FF] rounded-lg">
            <Sparkles size={16} />
          </span>
          <span>Intelligence</span>
          <span>/</span>
          <span className="text-gray-900">Command Center</span>
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Command Center</h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Search, capture, and sync updates using the spotlight overlay.</p>
      </div>

      <div className="flex-1 min-h-0">
        <div className="sleek-card p-16 flex flex-col items-center justify-center text-center shadow-2xl shadow-black/5">
          <div className="w-24 h-24 rounded-[36px] bg-[#5551FF]/10 text-[#5551FF] flex items-center justify-center mb-10 border border-[#5551FF]/10 shadow-inner">
            <Sparkles size={48} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest mb-4">Use Spotlight</h2>
          <p className="text-base text-gray-400 font-bold leading-relaxed max-w-lg mb-10">
            Open the Command Center with the top search button or press <span className="text-[#5551FF] font-black">⌘ K</span> to start capturing information instantly.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-500 uppercase tracking-widest shadow-sm">
              <Command size={18} />
              <span>⌘ K</span>
            </div>
            <Link href="/" className="px-8 py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { Sparkles, Command } from 'lucide-react'

export default function ChatHomePage() {
  return (
    <div className="flex flex-col h-full space-y-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <span>Intelligence</span>
          <span>/</span>
          <span className="text-gray-900">Command Center</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Command Center</h1>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Search, capture, and sync updates using the spotlight overlay.</p>
      </div>

      <div className="flex-1 min-h-0">
        <div className="sleek-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-[30px] bg-[#5551FF]/10 text-[#5551FF] flex items-center justify-center mb-8 border border-[#5551FF]/10">
            <Sparkles size={32} />
          </div>
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-3">Use Spotlight</h2>
          <p className="text-xs text-gray-400 font-bold leading-relaxed max-w-md">
            Open the Command Center with the top search button or press <span className="text-gray-900">⌘ K</span>.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest shadow-sm">
              <Command size={14} />
              <span>⌘ K</span>
            </div>
            <Link href="/" className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

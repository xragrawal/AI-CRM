'use client'

import { Sparkles, Zap, Search } from 'lucide-react'
import CaptureForm from '@/components/CaptureForm'
import RecallQuery from '@/components/RecallQuery'

export default function AssistantPage() {
  return (
    <div className="h-full flex flex-col gap-4 py-4">
      {/* Page Header — compact, no wasted space */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-1.5 bg-[#5551FF]/10 text-[#5551FF] rounded-xl border border-[#5551FF]/10">
            <Sparkles size={14} />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">AI Intelligence</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1.5">
          Capture & <span className="text-[#5551FF]">Recall</span>
        </h1>
        <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-3xl">
          Paste unstructured notes, emails, or meeting transcripts. AI extracts deals, contacts, and next steps automatically.
        </p>
      </div>

      {/* Two-column layout — no scrolling on large screens */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-0">
        <section className="flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-gray-900 text-white rounded-lg shadow-sm">
              <Zap size={14} />
            </div>
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest">Capture New Information</h2>
          </div>
          <div className="flex-1 min-h-0">
            <CaptureForm />
          </div>
        </section>

        <section className="flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-[#5551FF] text-white rounded-lg shadow-sm shadow-[#5551FF]/20">
              <Search size={14} />
            </div>
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest">AI Recall</h2>
          </div>
          <div className="flex-1 min-h-0">
            <RecallQuery />
          </div>
        </section>
      </div>
    </div>
  )
}

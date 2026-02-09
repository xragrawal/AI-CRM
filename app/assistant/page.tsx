'use client'

import { Sparkles, Zap, Search } from 'lucide-react'
import CaptureForm from '@/components/CaptureForm'
import RecallQuery from '@/components/RecallQuery'

export default function AssistantPage() {
  return (
    <div className="h-full space-y-8 py-4">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-[#5551FF]/10 text-[#5551FF] rounded-2xl shadow-sm border border-[#5551FF]/10">
            <Sparkles size={20} className="sm:w-6 sm:h-6" />
          </div>
          <span className="text-sm sm:text-base font-black text-gray-900 uppercase tracking-[0.2em]">AI Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4 sm:mb-6 leading-tight">
          Capture & <span className="text-[#5551FF]">Recall</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-400 max-w-4xl leading-relaxed font-medium">
          Paste unstructured notes, chat messages, or emails. Our AI will automatically extract deals, 
          contacts, and next steps while maintaining your CRM's integrity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:gap-12">
        <section>
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="p-2 bg-gray-900 text-white rounded-xl shadow-lg">
              <Zap size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-tight">Capture New Information</h2>
          </div>
          <CaptureForm />
        </section>

        <section className="pt-8 sm:pt-12 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="p-2 bg-[#5551FF] text-white rounded-xl shadow-lg shadow-[#5551FF]/20">
              <Search size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-tight">AI Recall</h2>
          </div>
          <RecallQuery />
        </section>
      </div>
    </div>
  )
}

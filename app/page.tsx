import CaptureForm from '@/components/CaptureForm'
import RecallQuery from '@/components/RecallQuery'
import { Sparkles } from 'lucide-react'

export default function Chat() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Sparkles size={22} className="sm:w-6 sm:h-6" />
          </div>
          <span className="text-sm sm:text-base font-bold text-blue-600 uppercase tracking-widest">AI Intelligence</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4 sm:mb-6">
          Capture & Recall
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 max-w-3xl leading-relaxed">
          Paste unstructured notes, chat messages, or emails. Our AI will automatically extract deals, 
          contacts, and next steps while maintaining your CRM's integrity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:gap-12">
        <section>
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Capture New Information</h2>
          </div>
          <CaptureForm />
        </section>

        <section className="pt-10 sm:pt-16 border-t border-gray-100">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">AI Recall</h2>
          </div>
          <RecallQuery />
        </section>
      </div>
    </div>
  )
}

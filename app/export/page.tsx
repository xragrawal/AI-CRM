'use client'

import { useState } from 'react'
import { 
  Download, 
  FileJson, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
} from 'lucide-react'

type ExportFormat = 'json' | 'markdown'

export default function ExportPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleExport(format: ExportFormat) {
    setError(null)
    setSuccess(false)
    setLoading(true)
    try {
      const res = await fetch(`/api/export?format=${format}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Export failed')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `personal-crm-export.${format === 'json' ? 'json' : 'md'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const exportItems = [
    { name: 'Organizations', description: 'All company records including aliases and AI summaries.' },
    { name: 'People', description: 'Contact details with organization links and social handles.' },
    { name: 'Deals', description: 'Project history, decisions, next steps, and stakeholders.' },
    { name: 'Conversations', description: 'Original raw text, AI proposals, and decision logs.' },
  ]

  return (
    <div className="flex flex-col h-full space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-widest">
          <span className="p-1.5 bg-[#5551FF]/10 text-[#5551FF] rounded-lg">
            <Download size={16} />
          </span>
          <span>Settings</span>
          <span>/</span>
          <span className="text-gray-900">Export</span>
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Data Portability</h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Export your CRM data anytime in structured formats.</p>
      </div>

      <div className="flex-1 min-h-0">
        <div className="space-y-8">
          {/* Main Export Card */}
          <div className="sleek-card">
            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-6">Choose Format</h2>
                  <p className="text-gray-500 text-base font-medium leading-relaxed mb-10">
                    Select your preferred format. JSON is best for developers and importing into other systems. Markdown is best for human-readable notes.
                  </p>

                  <div className="space-y-6">
                    <button
                      onClick={() => handleExport('json')}
                      disabled={loading}
                      className="w-full flex items-center justify-between p-6 rounded-[32px] border-2 border-gray-50 bg-gray-50 hover:bg-white hover:border-[#5551FF] transition-all group shadow-sm hover:shadow-xl"
                    >
                      <div className="flex items-center gap-5 text-left">
                        <div className="p-4 bg-white rounded-2xl shadow-sm text-[#5551FF] group-hover:scale-110 transition-transform">
                          <FileJson size={28} />
                        </div>
                        <div>
                          <p className="text-lg font-black text-gray-900">Export as JSON</p>
                          <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Developer Friendly</p>
                        </div>
                      </div>
                      <Download size={24} className="text-gray-300 group-hover:text-[#5551FF] transition-colors" />
                    </button>

                    <button
                      onClick={() => handleExport('markdown')}
                      disabled={loading}
                      className="w-full flex items-center justify-between p-6 rounded-[32px] border-2 border-gray-50 bg-gray-50 hover:bg-white hover:border-[#FF6B6B] transition-all group shadow-sm hover:shadow-xl"
                    >
                      <div className="flex items-center gap-5 text-left">
                        <div className="p-4 bg-white rounded-2xl shadow-sm text-[#FF6B6B] group-hover:scale-110 transition-transform">
                          <FileText size={28} />
                        </div>
                        <div>
                          <p className="text-lg font-black text-gray-900">Export as Markdown</p>
                          <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Human Readable</p>
                        </div>
                      </div>
                      <Download size={24} className="text-gray-300 group-hover:text-[#FF6B6B] transition-colors" />
                    </button>
                  </div>

                  {error && (
                    <div className="mt-6 flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium animate-in fade-in">
                      <AlertCircle size={18} />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="mt-6 flex items-center gap-2 p-4 bg-green-50 border border-green-100 rounded-xl text-sm text-green-600 font-medium animate-in fade-in">
                      <CheckCircle2 size={18} />
                      <span>Export started successfully!</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50/50 p-8 rounded-[24px] border border-gray-100">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Included in Export</h3>
                  <div className="space-y-6">
                    {exportItems.map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 mb-1">{item.name}</p>
                          <p className="text-xs text-gray-500 font-medium leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="sleek-card rounded-[32px] flex items-center gap-6 px-10 py-8 shadow-xl shadow-black/5">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shadow-sm">
              <ShieldCheck size={28} />
            </div>
            <div>
              <p className="text-base font-black text-gray-900 uppercase tracking-tight">Your data is safe</p>
              <p className="text-sm text-gray-500 font-bold leading-relaxed">Exports are processed locally and securely. No data leaves your control.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Send,
  AlertCircle,
  Loader2,
  FileText,
  Link2,
  Upload,
  X,
  FileIcon,
  CheckCircle2,
  Sparkles
} from 'lucide-react'

type InputMode = 'text' | 'file' | 'url'

const SUPPORTED_EXTENSIONS = '.txt, .md, .csv, .json, .html, .xml'

const SAMPLE_TEXT = `Meeting notes — Acme Corp integration pilot
Date: May 13, 2026
Attendees: Sneha Patel (Head of Partnerships, Acme Corp), Rahul (our side)

Sneha confirmed compliance team has signed off and they're ready to proceed.
Q3 go-live is confirmed. Pilot kicks off June 1. Budget approved at $8k/month for the duration.

Sneha needs our API docs by Friday to start the internal integration review.
We need their sandbox environment credentials before the kickoff call.

MoU status: routing to our legal today, targeting sign-off by May 23.
Sneha flagged that if MoU slips past May 23 the Q3 date is at risk.

Next steps:
- Send API docs to Sneha by EOD Thursday
- Request sandbox env access from Acme Corp
- Get MoU legal sign-off by May 23
- Lock kickoff call for week of May 26 (cc: Alex from our side)

Contact: sneha.patel@acmecorp.com`

export default function CaptureForm() {
  const [mode, setMode] = useState<InputMode>('text')
  const [rawText, setRawText] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const clearError = useCallback(() => {
    if (error) setError(null)
  }, [error])

  async function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = rawText.trim()
    if (!trimmed) {
      setError('Enter or paste some text.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to create item')
        return
      }
      if (data.item?.id) {
        router.push(`/items/${data.item.id}`)
        return
      }
      setError('Unexpected response')
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function handleFileSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Please select a file to upload.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/items/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to upload file')
        return
      }
      if (data.item?.id) {
        router.push(`/items/${data.item.id}`)
        return
      }
      setError('Unexpected response')
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedUrl = url.trim()
    if (!trimmedUrl) {
      setError('Please enter a URL.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/items/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmedUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to fetch URL')
        return
      }
      if (data.item?.id) {
        router.push(`/items/${data.item.id}`)
        return
      }
      setError('Unexpected response')
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true)
  }
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) { setFile(droppedFile); setMode('file'); clearError() }
  }
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) { setFile(selectedFile); clearError() }
  }
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const tabs = [
    { id: 'text' as const, label: 'Paste Text', icon: FileText },
    { id: 'file' as const, label: 'Upload File', icon: Upload },
    { id: 'url' as const, label: 'From URL', icon: Link2 },
  ]

  return (
    <div
      className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all focus-within:ring-2 focus-within:ring-[#5551FF]/10 focus-within:border-[#5551FF]/30"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Mode Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50/60 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setMode(tab.id); clearError() }}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
              mode === tab.id
                ? 'text-[#5551FF] bg-white border-b-2 border-[#5551FF] -mb-px shadow-[0_-3px_8px_rgba(85,81,255,0.06)]'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={18} className={mode === tab.id ? 'text-[#5551FF]' : 'text-gray-400'} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Text Input Mode */}
      {mode === 'text' && (
        <form onSubmit={handleTextSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 relative min-h-0">
            <textarea
              value={rawText}
              onChange={(e) => { setRawText(e.target.value); clearError() }}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault()
                  handleTextSubmit(e as unknown as React.FormEvent)
                }
              }}
              placeholder="Paste a meeting transcript, email thread, or any unstructured notes..."
              className="w-full h-full min-h-[140px] px-6 py-5 bg-transparent text-sm text-gray-900 placeholder-gray-300 resize-none focus:outline-none leading-relaxed"
              disabled={loading}
            />
            {/* Sample CTA — shown only when textarea is empty */}
            {!rawText && (
              <button
                type="button"
                onClick={() => setRawText(SAMPLE_TEXT)}
                className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-[#5551FF]/8 hover:bg-[#5551FF]/15 text-[#5551FF] text-[10px] font-black uppercase tracking-widest rounded-lg border border-[#5551FF]/15 transition-all"
              >
                <Sparkles size={11} />
                Load Sample
              </button>
            )}
          </div>

          <div className="flex items-center justify-between px-6 py-3 bg-gray-50/60 border-t border-gray-100 shrink-0 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {error ? (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium animate-in fade-in slide-in-from-left-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span className="truncate">{error}</span>
                </div>
              ) : (
                <p className="text-[10px] text-gray-400 font-medium hidden sm:block">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-bold">⌘</kbd>
                  {' + '}
                  <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-bold">Enter</kbd>
                  {' to submit'}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !rawText.trim()}
              className="shrink-0 flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              <span>{loading ? 'Processing...' : 'Submit to AI'}</span>
            </button>
          </div>
        </form>
      )}

      {/* File Upload Mode */}
      {mode === 'file' && (
        <form onSubmit={handleFileSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 p-6 min-h-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.csv,.json,.html,.htm,.xml,.log,.yaml,.yml"
              onChange={handleFileSelect}
              className="hidden"
            />
            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`h-full min-h-[120px] border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-[#5551FF] bg-[#5551FF]/5'
                    : 'border-gray-200 hover:border-[#5551FF]/30 hover:bg-gray-50'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  isDragging ? 'bg-[#5551FF] text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Upload size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 uppercase tracking-tight">
                    {isDragging ? 'Drop file here' : 'Drop a file or click to upload'}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    {SUPPORTED_EXTENSIONS} · Max 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <div className="p-3 bg-white rounded-xl text-emerald-600 shadow-sm shrink-0">
                  <FileIcon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900 truncate">{file.name}</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{formatFileSize(file.size)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  <button
                    type="button"
                    onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-6 py-3 bg-gray-50/60 border-t border-gray-100 shrink-0">
            <div>
              {error && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium animate-in fade-in slide-in-from-left-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !file}
              className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              <span>{loading ? 'Processing...' : 'Upload & Process'}</span>
            </button>
          </div>
        </form>
      )}

      {/* URL Input Mode */}
      {mode === 'url' && (
        <form onSubmit={handleUrlSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 p-6 flex flex-col justify-center min-h-0">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5551FF] transition-colors">
                <Link2 size={18} />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); clearError() }}
                placeholder="https://example.com/meeting-notes or article URL..."
                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-900 placeholder-gray-300 outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:border-[#5551FF]/30 focus:bg-white transition-all font-medium"
                disabled={loading}
              />
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-3 px-1">
              Paste a URL to fetch and parse its content. Works best with articles and docs.
            </p>
          </div>

          <div className="flex items-center justify-between px-6 py-3 bg-gray-50/60 border-t border-gray-100 shrink-0">
            <div>
              {error && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium animate-in fade-in slide-in-from-left-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
              <span>{loading ? 'Fetching...' : 'Fetch & Process'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

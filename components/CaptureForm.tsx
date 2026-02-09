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
  CheckCircle2
} from 'lucide-react'

type InputMode = 'text' | 'file' | 'url'

const SUPPORTED_EXTENSIONS = '.txt, .md, .csv, .json, .html, .xml, .log'

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
      
      const res = await fetch('/api/items/upload', {
        method: 'POST',
        body: formData,
      })
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
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      setMode('file')
      clearError()
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      clearError()
    }
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
      className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Mode Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setMode(tab.id)
              clearError()
            }}
            className={`flex-1 flex flex-col items-center justify-center gap-2 px-6 py-5 text-sm font-black uppercase tracking-widest transition-all ${
              mode === tab.id
                ? 'text-[#5551FF] bg-white border-b-2 border-[#5551FF] -mb-px shadow-[0_-4px_10px_rgba(85,81,255,0.05)]'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={24} className={mode === tab.id ? 'text-[#5551FF]' : 'text-gray-400'} />
            <span className="">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Text Input Mode */}
      {mode === 'text' && (
        <form onSubmit={handleTextSubmit} className="relative">
          <textarea
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value)
              clearError()
            }}
            placeholder="Paste a meeting transcript, email thread, chat messages, or any unstructured notes..."
            className="w-full min-h-[180px] sm:min-h-[220px] px-6 sm:px-8 py-6 sm:py-8 bg-transparent text-gray-900 placeholder-gray-400 resize-none focus:outline-none leading-relaxed text-base sm:text-lg"
            disabled={loading}
          />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 sm:px-8 py-4 sm:py-6 bg-gray-50/50 border-t border-gray-100 gap-4 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-6 order-2 sm:order-1">
              {error && (
                <div className="flex items-center gap-2 text-sm sm:text-base text-red-600 font-medium animate-in fade-in slide-in-from-left-2">
                  <AlertCircle size={18} className="sm:w-5 sm:h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {!error && (
                <p className="text-sm text-gray-400 font-medium hidden sm:block">
                  Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-bold">⌘</kbd> + <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-bold">Enter</kbd> to submit
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading || !rawText.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-4 px-10 py-4 rounded-2xl bg-gray-900 text-white font-black text-sm uppercase tracking-widest hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl active:scale-95 order-1 sm:order-2"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <Send size={24} />
              )}
              <span>{loading ? 'Processing...' : 'Submit to AI'}</span>
            </button>
          </div>
        </form>
      )}

      {/* File Upload Mode */}
      {mode === 'file' && (
        <form onSubmit={handleFileSubmit} className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.csv,.json,.html,.htm,.xml,.log,.yaml,.yml"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="p-8 sm:p-10">
            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[32px] p-12 sm:p-16 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#5551FF] bg-[#5551FF]/5'
                    : 'border-gray-200 hover:border-[#5551FF]/30 hover:bg-gray-50'
                }`}
              >
                <div className={`mx-auto w-20 h-20 rounded-[28px] flex items-center justify-center mb-6 shadow-sm transition-all ${
                  isDragging ? 'bg-[#5551FF] text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Upload size={32} />
                </div>
                <p className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">
                  {isDragging ? 'Drop file here' : 'Drop a file or click to upload'}
                </p>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
                  Supports: {SUPPORTED_EXTENSIONS}
                </p>
                <p className="text-xs text-gray-400 mt-4 font-bold uppercase tracking-[0.1em]">Maximum file size: 10MB</p>
              </div>
            ) : (
              <div className="flex items-center gap-6 p-6 bg-emerald-50 border border-emerald-100 rounded-[32px] shadow-sm">
                <div className="p-4 bg-white rounded-2xl text-emerald-600 shadow-sm">
                  <FileIcon size={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black text-gray-900 truncate uppercase tracking-tight">{file.name}</p>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{formatFileSize(file.size)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={24} className="text-emerald-600" />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="p-3 text-gray-400 hover:text-red-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 sm:px-8 py-4 sm:py-6 bg-gray-50/50 border-t border-gray-100 gap-4 sm:gap-0">
            <div className="flex items-center gap-3 order-2 sm:order-1">
              {error && (
                <div className="flex items-center gap-2 text-sm sm:text-base text-red-600 font-medium animate-in fade-in slide-in-from-left-2">
                  <AlertCircle size={18} className="sm:w-5 sm:h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading || !file}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl bg-gray-900 text-white font-bold text-base hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 order-1 sm:order-2"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin sm:w-6 sm:h-6" />
              ) : (
                <Upload size={20} className="sm:w-6 sm:h-6" />
              )}
              <span>{loading ? 'Processing...' : 'Upload & Process'}</span>
            </button>
          </div>
        </form>
      )}

      {/* URL Input Mode */}
      {mode === 'url' && (
        <form onSubmit={handleUrlSubmit} className="relative">
          <div className="p-8 sm:p-10">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5551FF] transition-colors">
                <Link2 size={24} />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  clearError()
                }}
                placeholder="https://example.com/meeting-notes or article URL..."
                className="w-full pl-16 pr-6 py-6 bg-gray-50/50 border-none rounded-[28px] text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:bg-white transition-all text-lg font-bold shadow-inner"
                disabled={loading}
              />
            </div>
            <p className="text-sm text-gray-400 mt-4 font-bold uppercase tracking-widest px-2">
              Paste a URL to fetch and parse its content. Works best with articles and documentation.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 sm:px-8 py-4 sm:py-6 bg-gray-50/50 border-t border-gray-100 gap-4 sm:gap-0">
            <div className="flex items-center gap-3 order-2 sm:order-1">
              {error && (
                <div className="flex items-center gap-2 text-sm sm:text-base text-red-600 font-medium animate-in fade-in slide-in-from-left-2">
                  <AlertCircle size={18} className="sm:w-5 sm:h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl bg-gray-900 text-white font-bold text-base hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 order-1 sm:order-2"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin sm:w-6 sm:h-6" />
              ) : (
                <Link2 size={20} className="sm:w-6 sm:h-6" />
              )}
              <span>{loading ? 'Fetching...' : 'Fetch & Process'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

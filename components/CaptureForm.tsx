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
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setMode(tab.id)
              clearError()
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all ${
              mode === tab.id
                ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600 -mb-px'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={18} />
            <span className="hidden sm:inline">{tab.label}</span>
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
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl bg-gray-900 text-white font-bold text-base hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 order-1 sm:order-2"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin sm:w-6 sm:h-6" />
              ) : (
                <Send size={20} className="sm:w-6 sm:h-6" />
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
          
          <div className="p-6 sm:p-8">
            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Upload size={28} />
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  {isDragging ? 'Drop file here' : 'Drop a file or click to upload'}
                </p>
                <p className="text-sm text-gray-500">
                  Supports: {SUPPORTED_EXTENSIONS}
                </p>
                <p className="text-xs text-gray-400 mt-2">Maximum file size: 10MB</p>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="p-3 bg-green-100 rounded-xl text-green-600">
                  <FileIcon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-green-600" />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={18} />
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
          <div className="p-6 sm:p-8">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Link2 size={20} />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  clearError()
                }}
                placeholder="https://example.com/meeting-notes or article URL..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-base"
                disabled={loading}
              />
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Paste a URL to fetch and parse its content. Works best with articles, documentation, and text-based pages.
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

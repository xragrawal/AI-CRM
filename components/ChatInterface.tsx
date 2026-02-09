'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Loader2, 
  Upload, 
  Link2, 
  X, 
  FileIcon,
  Bot,
  User as UserIcon,
  Plus,
  ArrowRight,
  Settings,
  Sparkles
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  intent?: 'chat' | 'capture' | 'recall'
}

interface ChatInterfaceProps {
  aiProvider: 'gemini' | 'openai'
}

export default function ChatInterface({ aiProvider }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [showInputOptions, setShowInputOptions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    let messageContent = input.trim()
    if (!messageContent && !file && !url) return

    setError(null)
    setLoading(true)

    const userMessage: Message = {
      role: 'user',
      content: messageContent || (file ? `📎 ${file.name}` : `🔗 ${url}`),
      timestamp: new Date(),
    }
    
    setMessages((prev: Message[]) => [...prev, userMessage])
    setInput('')
    
    try {
      const formData = new FormData()
      
      if (file) {
        formData.append('file', file)
        formData.append('message', messageContent || 'Please analyze this file')
        setFile(null)
      } else if (url) {
        formData.append('url', url)
        formData.append('message', messageContent || 'Please analyze this URL')
        setUrl('')
      } else {
        formData.append('message', messageContent)
      }
      
      formData.append('provider', aiProvider)
      formData.append('history', JSON.stringify(messages.map(m => ({ role: m.role, content: m.content }))))

      const res = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        intent: data.intent
      }

      if (data.intent === 'capture' && data.itemId) {
        assistantMessage.content += `\n\n[Review proposed record →](/items/${data.itemId})`
        setMessages((prev: Message[]) => [...prev, assistantMessage])
        setTimeout(() => router.push(`/items/${data.itemId}`), 2000)
      } else {
        setMessages((prev: Message[]) => [...prev, assistantMessage])
      }
      
      setShowInputOptions(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#111111] rounded-[40px] overflow-hidden shadow-2xl relative border border-white/5">
      {/* Dark background pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_#5551FF_0%,_transparent_40%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,_#FF6B6B_0%,_transparent_40%)]" />
      </div>

      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1">AI Assistant</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{aiProvider} Active</span>
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-500 hover:text-white transition-colors">
          <Settings size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10 scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-60">
            <div className="w-20 h-20 bg-white/5 rounded-[30px] flex items-center justify-center border border-white/10">
              <Sparkles size={40} className="text-gray-400" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-black text-white uppercase tracking-[0.2em]">Neural Link Established</p>
              <p className="text-sm font-medium text-gray-500 max-w-[240px] leading-relaxed">
                Capture insights, analyze trends, or verify CRM records with AI assistance.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-3`}
          >
            <div className={`flex items-center gap-3 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-sm ${
                msg.role === 'assistant' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white border border-white/10'
              }`}>
                {msg.role === 'assistant' ? <Bot size={14} /> : <UserIcon size={14} />}
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                {msg.role === 'assistant' ? 'Assistant' : 'Operator'}
              </span>
            </div>
            
            <div
              className={`max-w-[85%] rounded-[24px] px-6 py-4 text-sm leading-relaxed shadow-xl transition-all ${
                msg.role === 'user'
                  ? 'bg-[#5551FF] text-white font-bold'
                  : 'bg-white/5 border border-white/10 text-white backdrop-blur-md'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.intent && msg.intent !== 'chat' && (
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    msg.intent === 'capture' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {msg.intent}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex flex-col items-start space-y-3 animate-pulse">
            <div className="flex items-center gap-3 px-1">
              <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <Loader2 size={14} className="text-gray-400 animate-spin" />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Thinking</span>
            </div>
            <div className="w-2/3 h-16 bg-white/5 border border-white/10 rounded-[24px] backdrop-blur-sm" />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-black/40 backdrop-blur-xl border-t border-white/5 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-2 bg-red-500/10 text-[10px] text-red-400 font-bold border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-2">
              {error}
            </div>
          )}

          {(file || url) && (
            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl animate-in fade-in zoom-in duration-200">
              <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                {file ? <FileIcon size={14} /> : <Link2 size={14} />}
              </div>
              <span className="text-[11px] font-bold text-gray-300 truncate flex-1">
                {file ? file.name : url}
              </span>
              <button onClick={() => { setFile(null); setUrl(''); }} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit(e)
                }
              }}
              placeholder="Ask anything..."
              className="w-full pl-6 pr-24 py-5 bg-white/5 border border-white/10 rounded-[30px] text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#5551FF]/50 focus:bg-white/10 transition-all resize-none min-h-[64px] placeholder:text-gray-600"
              rows={1}
              disabled={loading}
            />
            
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowInputOptions(!showInputOptions)}
                className={`p-2.5 rounded-2xl transition-all ${
                  showInputOptions ? 'bg-[#5551FF] text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-gray-500 hover:text-white border border-white/10'
                }`}
              >
                <Plus size={18} />
              </button>
              
              <button
                type="submit"
                disabled={loading || (!input.trim() && !file && !url)}
                className="p-2.5 bg-white text-black rounded-2xl hover:bg-gray-200 disabled:opacity-20 transition-all shadow-xl"
              >
                <ArrowRight size={18} />
              </button>
            </div>

            {showInputOptions && (
              <div className="absolute bottom-full right-0 mb-4 w-48 bg-[#1A1A1A] border border-white/10 rounded-[24px] shadow-2xl p-2 animate-in slide-in-from-bottom-2 duration-200">
                <button
                  type="button"
                  onClick={() => { fileInputRef.current?.click(); setShowInputOptions(false); }}
                  className="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/5 rounded-2xl transition-colors text-gray-400 hover:text-white group"
                >
                  <Upload size={16} className="group-hover:text-blue-400" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">File</span>
                </button>
                <button
                  type="button"
                  onClick={() => { const newUrl = prompt('Endpoint URL:'); if (newUrl) setUrl(newUrl); setShowInputOptions(false); }}
                  className="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/5 rounded-2xl transition-colors text-gray-400 hover:text-white group"
                >
                  <Link2 size={16} className="group-hover:text-blue-400" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">URL</span>
                </button>
              </div>
            )}
          </div>
          
          <input ref={fileInputRef} type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} className="hidden" />
          
          <div className="flex items-center justify-between px-2">
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Neural Processor Online</span>
            <div className="flex gap-1.5">
              <div className="w-1 h-1 rounded-full bg-[#5551FF] shadow-[0_0_8px_rgba(85,81,255,0.6)]" />
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <div className="w-1 h-1 rounded-full bg-white/10" />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

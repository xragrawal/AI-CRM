"use client"
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Zap, 
  Building2, 
  Users2, 
  LayoutDashboard,
  Search,
  Bell,
  Settings,
  Activity,
  Sparkles,
  LogOut,
  Inbox,
  X,
  Command,
  Clock,
  Loader2,
  Bot,
  User as UserIcon,
  TrendingUp
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  intent?: 'chat' | 'capture' | 'recall'
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [aiProvider] = useState<'gemini' | 'openai'>('gemini')
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: searchQuery.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setSearchQuery('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('message', userMessage.content)
      formData.append('provider', aiProvider)
      formData.append('history', JSON.stringify(messages.map(m => ({ role: m.role, content: m.content }))))

      const res = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to get response')

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.intent === 'capture' && data.itemId
          ? `${data.response}\n\nReview proposed record → /items/${data.itemId}`
          : data.response,
        timestamp: new Date(),
        intent: data.intent
      }

      setMessages(prev => [...prev, assistantMessage])

      if (data.intent === 'capture' && data.itemId) {
        setIsSearchOpen(false)
        router.push(`/items/${data.itemId}`)
      }
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const mainLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/deals', label: 'Deals', icon: Zap },
    { href: '/organizations', label: 'Companies', icon: Building2 },
    { href: '/contacts', label: 'People', icon: Users2 },
    { href: '/inbox', label: 'Inbox', icon: Inbox },
    { href: '/analytics', label: 'Analytics', icon: Activity },
    { href: '/assistant', label: 'Intelligence', icon: Sparkles },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  const NavLink = ({ href, label, icon: Icon }: any) => {
    const isActive = pathname === href
    return (
      <Link
        href={href}
        className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 group ${
          isActive 
            ? 'bg-[#5551FF] text-white shadow-lg shadow-[#5551FF]/20' 
            : 'text-gray-400 hover:text-[#5551FF] hover:bg-white'
        }`}
        title={label}
      >
        <Icon size={20} />
      </Link>
    )
  }

  const date = new Date()
  const dateString = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div className="flex h-screen bg-[#ECEFF3] font-sans antialiased text-gray-900 overflow-hidden">
      {/* Search Overlay (Unified AI Command Center) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
          <div 
            className="absolute inset-0 bg-[#0B0C10]/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative w-full max-w-3xl bg-[#111111] rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            {/* Header / Input Area */}
            <div className="flex flex-col border-b border-white/5 bg-black/20">
              <form onSubmit={handleSearch} className="flex items-center px-8 py-6">
                <Search className="text-[#5551FF] shrink-0" size={24} />
                <input 
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search deals, contacts, or ask to capture info..."
                  className="flex-1 bg-transparent border-none outline-none px-6 text-xl font-bold text-white placeholder:text-gray-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={loading}
                />
                <div className="flex items-center gap-3">
                  {loading ? (
                    <Loader2 size={20} className="text-[#5551FF] animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-white/5 text-[10px] font-black text-gray-500 rounded-md border border-white/10 uppercase tracking-widest">ESC</span>
                    </div>
                  )}
                  <button 
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 text-gray-500 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </form>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide min-h-[300px]">
              {messages.length === 0 ? (
                <div className="space-y-10">
                  {/* Suggestions when empty */}
                  <div>
                    <h3 className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setSearchQuery("Show me my active deals")}
                        className="flex flex-col items-start p-6 bg-white/5 hover:bg-[#5551FF] group rounded-[28px] transition-all text-left border border-white/5"
                      >
                        <TrendingUp size={18} className="text-[#5551FF] group-hover:text-white mb-3" />
                        <span className="text-sm font-black text-white uppercase tracking-tight">Pipeline Overview</span>
                        <span className="text-[11px] text-gray-500 group-hover:text-white/80 mt-1">Get an overview of current deals</span>
                      </button>
                      <button 
                        onClick={() => setSearchQuery("Capture new contact: John Doe from Tesla")}
                        className="flex flex-col items-start p-6 bg-white/5 hover:bg-[#FF6B6B] group rounded-[28px] transition-all text-left border border-white/5"
                      >
                        <Users2 size={18} className="text-[#FF6B6B] group-hover:text-white mb-3" />
                        <span className="text-sm font-black text-white uppercase tracking-tight">Smart Capture</span>
                        <span className="text-[11px] text-gray-500 group-hover:text-white/80 mt-1">Add new records via natural language</span>
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity Mini-View */}
                  <div className="opacity-50">
                    <h3 className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Recent Searches</h3>
                    <div className="space-y-2 px-2">
                      {['Quarterly Growth Analysis', 'Tesla Q4 Proposal', 'New York Network'].map((item) => (
                        <div key={item} className="flex items-center gap-3 py-2 text-sm font-bold text-gray-400">
                          <Clock size={14} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Chat Messages */
                <div className="space-y-8">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-3`}>
                      <div className={`flex items-center gap-3 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          msg.role === 'assistant' ? 'bg-[#5551FF] text-white' : 'bg-white/10 text-white'
                        }`}>
                          {msg.role === 'assistant' ? <Bot size={14} /> : <UserIcon size={14} />}
                        </div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          {msg.role === 'assistant' ? 'Command Center' : 'Operator'}
                        </span>
                      </div>
                      <div className={`max-w-[90%] rounded-[24px] px-6 py-4 text-sm leading-relaxed shadow-xl ${
                        msg.role === 'user' ? 'bg-[#5551FF] text-white font-bold' : 'bg-white/5 border border-white/10 text-white'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {msg.intent && msg.intent !== 'chat' && (
                          <div className="mt-4 pt-3 border-t border-white/5">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#5551FF]/20 text-[#5551FF]">
                              {msg.intent} action triggered
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex flex-col items-start space-y-3 animate-pulse">
                      <div className="flex items-center gap-3 px-1">
                        <Loader2 size={14} className="text-[#5551FF] animate-spin" />
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Analyzing Request...</span>
                      </div>
                      <div className="w-2/3 h-12 bg-white/5 border border-white/10 rounded-[20px]" />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Footer / Controls */}
            <div className="px-8 py-5 bg-black/40 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-white/5 rounded border border-white/10 text-[9px] font-bold text-gray-500 shadow-sm">Enter</span>
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">to ask</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-white/5 rounded border border-white/10 text-[9px] font-bold text-gray-500 shadow-sm">⌘ K</span>
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">to open</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#5551FF]">
                <Zap size={14} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Intelligence Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Compact Vertical Style */}
      <aside className="w-20 bg-[#F8F9FB] border-r border-gray-100 flex flex-col items-center py-8 gap-8 z-50 shrink-0">
        <div className="w-10 h-10 flex items-center justify-center text-[#5551FF]">
          <Zap size={24} fill="currentColor" />
        </div>
        
        <nav className="flex-1 flex flex-col gap-4">
          {mainLinks.map((link) => <NavLink key={link.href} {...link} />)}
        </nav>

        <div className="flex flex-col gap-4 mb-4">
          <button className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-20 flex items-center px-10 bg-transparent shrink-0 relative">
          <div className="flex-1 flex justify-center">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="w-full max-w-xl flex items-center gap-4 px-6 py-3 bg-white hover:bg-gray-50 rounded-full text-sm font-medium shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-transparent hover:border-gray-100 transition-all text-gray-400 group"
            >
              <Search size={18} className="text-gray-400 group-hover:text-[#5551FF] transition-colors" />
              <span className="flex-1 text-left">Start searching here...</span>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded border border-gray-100">
                <Command size={10} />
                <span className="text-[10px] font-bold">K</span>
              </div>
            </button>
          </div>

          <div className="absolute right-10 flex items-center gap-6">
            <div className="flex items-center gap-4 px-4 py-2 bg-white rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6B6B] text-[8px] font-black text-white flex items-center justify-center rounded-full border-2 border-white shadow-sm">12</span>
              </button>
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold text-gray-900 leading-none">{dateString}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600 overflow-hidden border-2 border-white shadow-sm shrink-0 flex items-center justify-center text-[10px] font-black text-white">
                AS
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto px-10 pb-10 scroll-smooth">
          <div className="max-w-[1600px] mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}



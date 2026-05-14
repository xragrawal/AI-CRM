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

function NavLink({ href, label, icon: Icon, pathname }: { href: string; label: string; icon: React.ElementType; pathname: string }) {
  const isActive = pathname === href
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center w-full py-1.5 transition-all duration-200 group ${
        isActive
          ? 'text-[#5551FF]'
          : 'text-gray-600 hover:text-[#5551FF]'
      }`}
    >
      <div className={`w-9 h-9 flex items-center justify-center rounded-xl mb-0.5 transition-all duration-200 ${
        isActive
          ? 'bg-[#5551FF] text-white shadow-md shadow-[#5551FF]/20'
          : 'group-hover:bg-white'
      }`}>
        <Icon size={18} />
      </div>
      <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-85 group-hover:opacity-100'}`}>
        {label}
      </span>
    </Link>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [aiProvider] = useState<'gemini' | 'openai'>('gemini')
  const [dateString, setDateString] = useState<string>('')
  
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

  useEffect(() => {
    const date = new Date()
    setDateString(date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }))
  }, [])

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
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err?.message ?? 'Something went wrong. Please try again.'}`,
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const mainLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/deals', label: 'Deals', icon: Zap },
    { href: '/companies', label: 'Companies', icon: Building2 },
    { href: '/people', label: 'People', icon: Users2 },
    { href: '/inbox', label: 'Inbox', icon: Inbox },
    { href: '/analytics', label: 'Analytics', icon: Activity },
    { href: '/intelligence', label: 'Intelligence', icon: Sparkles },
    { href: '/agent-hub', label: 'Agent Hub', icon: Bot },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]


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
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#5551FF] text-white flex items-center justify-center shadow-lg">
                  <Bot size={18} />
                </div>
                <span className="text-sm font-black text-white uppercase tracking-widest">Command Center</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              {messages.length === 0 ? (
                <div className="space-y-10">
                  {/* Suggestions when empty */}
                  <div>
                    <h3 className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setSearchQuery("Show me my active deals")}
                        className="flex flex-col items-start p-8 bg-white/5 hover:bg-[#5551FF] group rounded-[32px] transition-all text-left border border-white/5 shadow-xl"
                      >
                        <TrendingUp size={24} className="text-[#5551FF] group-hover:text-white mb-4" />
                        <span className="text-base font-black text-white uppercase tracking-tight">Pipeline Overview</span>
                        <span className="text-xs text-gray-500 group-hover:text-white/80 mt-2 font-bold uppercase tracking-widest">Get an overview of current deals</span>
                      </button>
                      <button 
                        onClick={() => setSearchQuery("Capture new contact: John Doe from Tesla")}
                        className="flex flex-col items-start p-8 bg-white/5 hover:bg-[#FF6B6B] group rounded-[32px] transition-all text-left border border-white/5 shadow-xl"
                      >
                        <Users2 size={24} className="text-[#FF6B6B] group-hover:text-white mb-4" />
                        <span className="text-base font-black text-white uppercase tracking-tight">Smart Capture</span>
                        <span className="text-xs text-gray-500 group-hover:text-white/80 mt-2 font-bold uppercase tracking-widest">Add new records via natural language</span>
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity Mini-View */}
                  <div className="opacity-50">
                    <h3 className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Recent Searches</h3>
                    <div className="space-y-2 px-2">
                      {['Quarterly Growth Analysis', 'Tesla Q4 Proposal', 'New York Network'].map((item) => (
                        <div key={item} className="flex items-center gap-4 py-3 text-base font-bold text-gray-400 hover:text-white transition-colors cursor-pointer">
                          <Clock size={18} />
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
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-4`}>
                      <div className={`flex items-center gap-4 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          msg.role === 'assistant' ? 'bg-[#5551FF] text-white shadow-lg' : 'bg-white/10 text-white'
                        }`}>
                          {msg.role === 'assistant' ? <Bot size={18} /> : <UserIcon size={18} />}
                        </div>
                        <span className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">
                          {msg.role === 'assistant' ? 'Command Center' : 'Operator'}
                        </span>
                      </div>
                      <div className={`max-w-[90%] rounded-[32px] px-8 py-6 text-base leading-relaxed shadow-2xl ${
                        msg.role === 'user' ? 'bg-[#5551FF] text-white font-bold' : 'bg-white/5 border border-white/10 text-white'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {msg.intent && msg.intent !== 'chat' && (
                          <div className="mt-6 pt-4 border-t border-white/5">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#5551FF]/20 text-[#5551FF] border border-[#5551FF]/20">
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

            {/* Input Area - Fixed at Bottom */}
            <div className="px-8 py-6 bg-black/40 border-t border-white/5 shrink-0">
              <form onSubmit={handleSearch} className="flex items-center gap-4">
                <Search className="text-[#5551FF] shrink-0" size={24} />
                <input 
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search deals, contacts, or ask to capture info..."
                  className="flex-1 bg-transparent border-none outline-none text-base font-bold text-white placeholder:text-gray-600 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={loading}
                />
                <div className="flex items-center gap-3">
                  {loading ? (
                    <Loader2 size={20} className="text-[#5551FF] animate-spin" />
                  ) : (
                    <span className="px-2 py-1 bg-white/5 text-[10px] font-black text-gray-500 rounded-md border border-white/10 uppercase tracking-widest">ESC</span>
                  )}
                </div>
              </form>
              <div className="flex items-center justify-between mt-4 px-2">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-black text-gray-500 shadow-sm uppercase">Enter</span>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">to ask</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-black text-gray-500 shadow-sm uppercase">ESC</span>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">to close</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[#5551FF]">
                  <Zap size={14} fill="currentColor" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Intelligence Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-24 bg-[#F8F9FB] border-r border-gray-100 flex flex-col items-center py-5 gap-6 z-50 shrink-0">
        <div className="w-12 h-12 flex items-center justify-center text-[#5551FF]">
          <Zap size={30} fill="currentColor" />
        </div>

        <nav className="flex-1 flex flex-col gap-0.5 w-full px-1">
          {mainLinks.map((link) => <NavLink key={link.href} {...link} pathname={pathname} />)}
        </nav>

        <div className="flex flex-col items-center gap-1 mb-2">
          <button className="flex flex-col items-center group text-gray-600 hover:text-[#5551FF] transition-all py-1.5">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl group-hover:bg-white transition-all">
              <LogOut size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider opacity-85 group-hover:opacity-100">Exit</span>
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
              className="w-full max-w-xl flex items-center gap-5 px-8 py-4 bg-white hover:bg-gray-50 rounded-[24px] text-base font-bold shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-transparent hover:border-[#5551FF]/20 transition-all text-gray-400 group"
            >
              <Search size={22} className="text-gray-400 group-hover:text-[#5551FF] transition-colors" />
              <span className="flex-1 text-left">Start searching or capture...</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-xl border border-gray-100">
                <Command size={14} />
                <span className="text-xs font-black">K</span>
              </div>
            </button>
          </div>

          <div className="absolute right-10 flex items-center gap-8">
            <div className="flex items-center gap-6 px-6 py-3 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
              <button className="p-1.5 text-gray-400 hover:text-[#5551FF] transition-colors relative">
                <Bell size={24} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6B6B] text-[10px] font-black text-white flex items-center justify-center rounded-full border-2 border-white shadow-sm">12</span>
              </button>
              <div className="text-right hidden sm:block">
                <p suppressHydrationWarning className="text-xs font-black text-gray-900 uppercase tracking-widest leading-none">{dateString}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#5551FF] overflow-hidden border-2 border-white shadow-lg shrink-0 flex items-center justify-center text-xs font-black text-white uppercase tracking-tighter">
                AS
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto px-8 pb-4 scroll-smooth flex flex-col">
          <div className="max-w-[1600px] mx-auto flex-1 min-h-0 w-full">
            {children}
          </div>
          <footer className="max-w-[1600px] mx-auto w-full pt-3 pb-2 border-t border-gray-100 mt-4">
            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest text-center">
              © 2026 Ravi Agrawal · All Rights Reserved · Personal AI CRM
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}



'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Inbox, 
  Zap, 
  Building2, 
  Users2, 
  MessageSquareQuote,
  Menu,
  X,
  Plus,
  User
} from 'lucide-react'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Simplified navigation based on PRD core objects
  const mainLinks = [
    { href: '/', label: 'Chat', icon: MessageSquareQuote },
    { href: '/inbox', label: 'Inbox', icon: Inbox },
  ]

  const crmLinks = [
    { href: '/deals', label: 'Deals', icon: Zap },
    { href: '/organizations', label: 'Companies', icon: Building2 },
    { href: '/contacts', label: 'People', icon: Users2 },
  ]

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const NavLink = ({ href, label, icon: Icon, shortcut }: any) => {
    const isActive = pathname === href
    return (
      <Link
        href={href}
        className={`flex items-center justify-between px-3 py-3 rounded-xl text-base font-semibold transition-colors ${
          isActive 
            ? 'bg-[var(--primary-blue)] text-white shadow-md' 
            : 'text-[var(--text-secondary)] hover:text-[var(--primary-blue)] hover:bg-white/70'
        }`}
      >
        <div className="flex items-center gap-3">
          {isActive ? (
            <Icon size={20} className="text-white" />
          ) : (
            <Icon size={20} className={isActive ? 'text-white' : 'text-[var(--text-secondary)]'} />
          )}
          <span>{label}</span>
        </div>
        {shortcut && (
          <span className="text-xs bg-white/70 text-[var(--primary-blue)] px-2 py-1 rounded-md border border-[var(--border)] uppercase font-bold tracking-wider">
            {shortcut}
          </span>
        )}
      </Link>
    )
  }

  const SectionLabel = ({ label }: { label: string }) => (
    <div className="flex items-center px-3 mt-6 mb-3">
      <span className="text-xs font-bold text-[var(--primary-blue)] uppercase tracking-widest">{label}</span>
    </div>
  )

  return (
    <div className="flex h-screen bg-[var(--background-alt)]">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[280px] bg-white border-r border-[var(--border)] transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:w-64
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full px-3 sm:px-4 py-4 sm:py-6 overflow-y-auto">
          {/* Close button for mobile */}
          <div className="flex justify-between items-center mb-4 md:hidden">
            <div className="text-sm font-bold text-[var(--primary-blue)]">Billions CRM</div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* User Profile - Simplified */}
          <div className="flex items-center gap-3 px-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
               <User className="text-gray-400" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-[var(--primary-blue)] truncate">Billions CRM</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            <div className="space-y-1">
              {mainLinks.map((link) => <NavLink key={link.href} {...link} />)}
            </div>

            <SectionLabel label="CRM" />
            <div className="space-y-1 bg-white p-1 rounded-lg border border-[var(--border)] shadow-sm">
              {crmLinks.map((link) => <NavLink key={link.href} {...link} />)}
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--background)] md:rounded-tl-[32px] border-l border-t border-[var(--border)] shadow-lg">
        <header className="h-16 sm:h-20 flex items-center justify-between px-6 sm:px-8 md:px-10 border-b border-[var(--border)]">
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl"
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-4">
              {pathname === '/deals' && (
                <div className="hidden sm:flex p-2 bg-[var(--primary-blue)] rounded-xl text-white">
                  <Zap size={20} />
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--primary-black)] capitalize">
                {pathname === '/' ? 'Chat' : pathname.replace('/', '')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button className="p-2 bg-[var(--primary-blue)] text-white rounded-xl hover:bg-[var(--primary-light)] transition-colors shadow-md">
              <Plus size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[var(--background)]">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}


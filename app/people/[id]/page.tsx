'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Mail, 
  Send as Telegram, 
  Twitter as XIcon, 
  Building2, 
  Zap, 
  Clock,
  MoreHorizontal,
  Plus,
  Quote,
  Bot,
  ArrowUpRight,
  MessageSquare
} from 'lucide-react'

export default function ContactDetailPage() {
  const { id } = useParams()
  const [contact, setContact] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContact() {
      try {
        const res = await fetch(`/api/contacts/${id}`)
        const data = await res.json()
        setContact(data.contact)
      } catch (error) {
        console.error('Failed to fetch contact:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchContact()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 font-bold">Contact not found</p>
        <Link href="/people" className="text-blue-600 hover:underline mt-4 inline-block font-bold">
          Back to contacts
        </Link>
      </div>
    )
  }

  const aliases = Array.isArray(contact.aliases) ? contact.aliases : []

  return (
    <div className="flex flex-col h-full space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-widest">
          <Link href="/people" className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 shadow-sm border border-transparent hover:border-gray-100">
            <ArrowLeft size={18} />
          </Link>
          <span>People</span>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-[260px]">{contact.displayName}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pt-2">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[28px] bg-[#5551FF]/10 flex items-center justify-center text-[#5551FF] font-black text-3xl border border-[#5551FF]/10 shadow-sm">
              {contact.displayName.charAt(0)}
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-3">{contact.displayName}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                {contact.organization && (
                  <Link 
                    href={`/companies/${contact.organization.id}`}
                    className="flex items-center gap-2.5 text-sm font-bold text-gray-500 hover:text-[#5551FF] transition-colors"
                  >
                    <Building2 size={18} className="text-[#5551FF]/60" />
                    <span>{contact.organization.name}</span>
                  </Link>
                )}
                <div className="hidden sm:block h-5 w-px bg-gray-200" />
                <div className="flex items-center gap-2.5 text-sm font-bold text-gray-400 uppercase tracking-tight">
                  <Clock size={18} className="text-gray-300" />
                  <span>Last update {new Date(contact.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-500 uppercase tracking-widest hover:border-gray-200 transition-all shadow-sm">
              Edit Profile
            </button>
            <button className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md">
              <MessageSquare size={18} />
              <span>Message</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-10">
            {/* About / Intelligence */}
            <section className="sleek-card rounded-[40px]">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white border border-gray-100 rounded-xl shadow-sm text-[#5551FF]">
                    <Quote size={20} />
                  </div>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Intelligence Summary</h2>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-300 hover:text-gray-600">
                  <MoreHorizontal size={24} />
                </button>
              </div>
              <div className="p-8">
                {contact.rollingSummary ? (
                  <p className="text-gray-700 leading-relaxed text-lg font-medium">
                    {contact.rollingSummary}
                  </p>
                ) : (
                  <div className="py-12 text-center space-y-4 opacity-40">
                    <Bot size={40} className="mx-auto text-gray-300" />
                    <p className="text-sm font-black uppercase tracking-widest">Waiting for insights</p>
                  </div>
                )}

                {aliases.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-50 flex flex-wrap gap-2">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest w-full mb-2">Known Aliases</span>
                    {aliases.map((alias: any, i: number) => (
                      <span key={i} className="px-2 py-1 bg-gray-50 text-gray-500 rounded-md text-[10px] font-bold border border-gray-100 uppercase tracking-tight">
                        {String(alias)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Recent Conversations */}
            <section className="sleek-card rounded-[40px]">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-[#5551FF]/10 text-[#5551FF] rounded-xl border border-[#5551FF]/10">
                    <Zap size={20} />
                  </div>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Active Deals</h2>
                  <span className="px-2 py-1 bg-gray-50 border border-gray-100 text-gray-400 rounded-md text-[10px] font-black uppercase">{contact.dealContacts?.length || 0}</span>
                </div>
                <button className="text-[11px] font-black text-[#5551FF] uppercase tracking-widest hover:text-blue-700 transition-colors flex items-center gap-2">
                  <Plus size={18} />
                  <span>Link Deal</span>
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {contact.dealContacts?.length > 0 ? (
                  contact.dealContacts.map((dc: any) => (
                    <Link 
                      key={dc.deal.id} 
                      href={`/deals/${dc.deal.id}`}
                      className="flex items-center justify-between p-6 hover:bg-blue-50/20 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 group-hover:scale-110 transition-transform shadow-sm">
                          <Zap size={18} fill="currentColor" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{dc.deal.name}</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">{dc.role || 'Partner'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <span className="inline-block px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[9px] font-black uppercase tracking-widest border border-gray-100 mb-1">
                            Qualified
                          </span>
                          <p className="text-[9px] text-gray-300 font-bold uppercase tracking-tight">
                            Next: {dc.deal.nextStep || 'Follow up'}
                          </p>
                        </div>
                        <ArrowUpRight size={16} className="text-gray-200 group-hover:text-blue-500 transition-all" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-12 text-center opacity-30">
                    <p className="text-[10px] font-black uppercase tracking-widest">No deals linked</p>
                  </div>
                )}
              </div>
            </section>

            {/* Notes */}
            <section className="sleek-card rounded-[40px]">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-50 text-gray-400 rounded-lg border border-gray-100">
                    <MessageSquare size={14} />
                  </div>
                  <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest">Profile Notes</h2>
                </div>
                <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors text-gray-300 hover:text-gray-600">
                  <Plus size={18} />
                </button>
              </div>
              <div className="p-8">
                {contact.notes ? (
                  <div className="text-gray-600 leading-relaxed text-sm font-medium">
                    {contact.notes}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest py-4 text-center">No additional notes</p>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            {/* Contact Details */}
            <section className="sleek-card rounded-[40px] p-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-1">Connect</h3>
              <div className="space-y-4">
                <ContactRow icon={<Mail size={14} />} label="Email" value={contact.email} />
                <ContactRow icon={<Telegram size={14} />} label="Telegram" value={contact.telegramHandle ? `@${contact.telegramHandle}` : null} />
                <ContactRow icon={<XIcon size={14} />} label="X Profile" value={contact.xHandle ? `@${contact.xHandle}` : null} />
              </div>
            </section>

            {/* Information */}
            <section className="sleek-card rounded-[40px] p-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-1">Engagement Stats</h3>
              <div className="space-y-4">
                <DetailRow label="Relationships" value={String(contact.dealContacts?.length || 0)} />
                <DetailRow label="Created" value={new Date(contact.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} />
                <DetailRow label="Status" value="Active" isBadge />
              </div>
            </section>

            {/* System ID */}
            <div className="px-6 py-2">
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] text-center">System ID: {contact.id.slice(-12)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | null }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-white transition-all group">
      <div className="p-2.5 bg-white rounded-xl border border-gray-100 text-gray-400 group-hover:text-[#5551FF] transition-colors shadow-sm">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-bold text-gray-900 truncate tracking-tight">{value || 'Not listed'}</p>
      </div>
    </div>
  )
}

function DetailRow({ label, value, isBadge }: { label: string, value: string, isBadge?: boolean }) {
  return (
    <div className="flex justify-between items-center px-1">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{label}</span>
      {isBadge ? (
        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase border border-emerald-100">
          <div className="w-1 h-1 rounded-full bg-emerald-500" />
          {value}
        </span>
      ) : (
        <span className="text-[11px] font-black text-gray-900">{value}</span>
      )}
    </div>
  )
}

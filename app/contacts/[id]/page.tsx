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
  Plus
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
        <Link href="/contacts" className="text-blue-600 hover:underline mt-4 inline-block font-bold">
          Back to contacts
        </Link>
      </div>
    )
  }

  const aliases = Array.isArray(contact.aliases) ? contact.aliases : []

  return (
    <div className="flex flex-col h-full bg-[#F8F9F8]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-6 mb-6 sm:mb-8">
            <Link href="/contacts" className="p-2 sm:p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
              <ArrowLeft size={24} className="sm:w-7 sm:h-7" />
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-bold text-gray-400 uppercase tracking-widest">
              <span>People</span>
              <span>/</span>
              <span className="text-gray-900 truncate max-w-[200px] sm:max-w-none">{contact.displayName}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 sm:gap-0">
            <div className="flex items-center gap-4 sm:gap-8">
              <div className="w-16 h-16 sm:w-20 md:w-24 sm:h-20 md:h-24 rounded-2xl sm:rounded-[32px] bg-blue-50 flex items-center justify-center text-blue-600 font-black text-2xl sm:text-3xl md:text-4xl border border-blue-100 shadow-sm">
                {contact.displayName.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 sm:mb-3">{contact.displayName}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  {contact.organization && (
                    <Link 
                      href={`/organizations/${contact.organization.id}`}
                      className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-bold text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Building2 size={18} className="sm:w-5 sm:h-5" />
                      <span className="truncate max-w-[250px]">{contact.organization.name}</span>
                    </Link>
                  )}
                  <div className="hidden sm:block h-5 w-px bg-gray-200" />
                  <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-bold text-gray-400 uppercase tracking-tight">
                    <Clock size={18} className="sm:w-5 sm:h-5" />
                    <span>Updated {new Date(contact.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 mt-4 sm:mt-0">
              <button className="flex-1 sm:flex-none px-6 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                Edit Profile
              </button>
              <button className="flex-1 sm:flex-none px-6 py-2.5 sm:py-3 bg-gray-900 text-white rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold hover:bg-gray-800 transition-all shadow-md">
                Message
              </button>
            </div>
          </div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Contact Details - Moved to top on mobile */}
          <div className="lg:order-2 space-y-4 sm:space-y-6 md:space-y-8">
            {/* Contact Details */}
            <section className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[40px] border border-gray-100 shadow-sm p-6 sm:p-8 md:p-10">
              <h3 className="text-xs sm:text-sm font-black text-gray-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-6 sm:mb-8">Contact Details</h3>
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-gray-50 text-gray-400 rounded-xl sm:rounded-2xl border border-gray-100">
                    <Mail size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 truncate">{contact.email || 'None'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-gray-50 text-gray-400 rounded-xl sm:rounded-2xl border border-gray-100">
                    <Telegram size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Telegram</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 truncate">{contact.telegramHandle ? `@${contact.telegramHandle}` : 'None'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-gray-50 text-gray-400 rounded-xl sm:rounded-2xl border border-gray-100">
                    <XIcon size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mb-1">X Profile</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 truncate">{contact.xHandle ? `@${contact.xHandle}` : 'None'}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Metadata */}
            <section className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[40px] border border-gray-100 shadow-sm p-6 sm:p-8 md:p-10">
              <h3 className="text-xs sm:text-sm font-black text-gray-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-6 sm:mb-8">Information</h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base font-bold text-gray-400">Created</span>
                  <span className="text-sm sm:text-base font-bold text-gray-900">{new Date(contact.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base font-bold text-gray-400">Last Active</span>
                  <span className="text-sm sm:text-base font-bold text-gray-900">{new Date(contact.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base font-bold text-gray-400">Status</span>
                  <span className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500" />
                    <span className="text-[11px] sm:text-xs font-black text-gray-900 uppercase">Active</span>
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 lg:order-1 space-y-4 sm:space-y-6 md:space-y-8 mt-4 sm:mt-6 lg:mt-0">
            {/* About / Summary */}
            <section className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 sm:px-8 md:px-10 py-4 sm:py-6 md:py-8 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">About</h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal size={24} className="sm:w-7 sm:h-7" />
                </button>
              </div>
              <div className="p-6 sm:p-8 md:p-10">
                {contact.rollingSummary ? (
                  <p className="text-gray-600 leading-relaxed text-base sm:text-lg md:text-xl font-medium">
                    {contact.rollingSummary}
                  </p>
                ) : (
                  <p className="text-gray-400 italic text-base sm:text-lg">No summary available. AI will generate one after your next interaction.</p>
                )}

                {aliases.length > 0 && (
                  <div className="mt-6 sm:mt-8 md:mt-10 flex flex-wrap gap-2 sm:gap-3">
                    {aliases.map((alias: any, i: number) => (
                      <span key={i} className="px-3 py-1 sm:px-4 sm:py-1.5 bg-gray-50 text-gray-500 rounded-xl text-xs sm:text-sm font-bold border border-gray-100 uppercase tracking-tight">
                        {String(alias)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Linked Deals */}
            <section className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 sm:px-8 md:px-10 py-4 sm:py-6 md:py-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Active Deals</h2>
                  <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest">
                    {contact.dealContacts?.length || 0}
                  </span>
                </div>
                <button className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-bold text-blue-600 hover:text-blue-700">
                  <Plus size={18} className="sm:w-5 sm:h-5" />
                  <span>Add Deal</span>
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {contact.dealContacts?.length > 0 ? (
                  contact.dealContacts.map((dc: any) => (
                    <Link 
                      key={dc.deal.id} 
                      href={`/deals/${dc.deal.id}`}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 sm:p-8 md:p-10 hover:bg-gray-50/50 transition-all group gap-4 sm:gap-0"
                    >
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="p-3 sm:p-4 bg-green-50 text-green-600 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform">
                          <Zap size={24} className="sm:w-7 sm:h-7" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-base sm:text-lg md:text-xl">{dc.deal.name}</h3>
                          <p className="text-sm sm:text-base text-gray-500 font-medium">{dc.role || 'Partner'}</p>
                        </div>
                      </div>
                      <div className="sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-0">
                        <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-gray-50 text-gray-600 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest border border-gray-100 sm:mb-3">
                          Qualified
                        </span>
                        <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-tight">
                          Next: {dc.deal.nextStep || 'Follow up'}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-6 sm:p-8 md:p-10 text-center text-gray-400 italic text-base">No deals linked to this contact.</div>
                )}
              </div>
            </section>

            {/* Notes */}
            <section className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 sm:px-8 md:px-10 py-4 sm:py-6 md:py-8 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Notes</h2>
                <button className="p-2 sm:p-2.5 hover:bg-gray-50 rounded-xl text-gray-400">
                  <Plus size={22} className="sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="p-6 sm:p-8 md:p-10">
                {contact.notes ? (
                  <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed text-base sm:text-lg font-medium">
                    {contact.notes}
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-base sm:text-lg">No notes captured yet.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

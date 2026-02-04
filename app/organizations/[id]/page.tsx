'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Building2, 
  Zap, 
  Clock,
  MoreHorizontal,
  Plus,
  Globe
} from 'lucide-react'

export default function OrganizationDetailPage() {
  const { id } = useParams()
  const [org, setOrg] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrg() {
      try {
        const res = await fetch(`/api/organizations/${id}`)
        const data = await res.json()
        setOrg(data.organization)
      } catch (error) {
        console.error('Failed to fetch organization:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrg()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 font-bold">Organization not found</p>
        <Link href="/organizations" className="text-blue-600 hover:underline mt-4 inline-block font-bold">
          Back to companies
        </Link>
      </div>
    )
  }

  const aliases = Array.isArray(org.aliases) ? org.aliases : []

  return (
    <div className="flex flex-col h-full bg-[#F8F9F8]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6">
          <div className="flex items-center gap-3 sm:gap-6 mb-6 sm:mb-8">
            <Link href="/organizations" className="p-2 sm:p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
              <ArrowLeft size={24} className="sm:w-7 sm:h-7" />
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-bold text-gray-400 uppercase tracking-widest">
              <span>Companies</span>
              <span>/</span>
              <span className="text-gray-900">{org.name}</span>
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6 sm:gap-8">
              <div className="w-20 h-20 sm:w-24 md:w-28 sm:h-24 md:h-28 rounded-[32px] bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 shadow-sm">
                <Building2 size={48} className="sm:w-14 sm:h-14" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-2 sm:mb-3">{org.name}</h1>
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-bold text-gray-500">
                    <Globe size={20} className="text-gray-400" />
                    <span>{org.website || 'No website'}</span>
                  </div>
                  <div className="h-5 w-px bg-gray-200" />
                  <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-bold text-gray-400 uppercase tracking-tight">
                    <Clock size={20} />
                    <span>Updated {new Date(org.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-base font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                Edit Details
              </button>
              <button className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-base font-bold hover:bg-gray-800 transition-all shadow-md flex items-center gap-3">
                <Plus size={22} />
                <span>Add Deal</span>
              </button>
            </div>
          </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary */}
            <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Company Overview</h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal size={24} />
                </button>
              </div>
              <div className="p-10">
                {org.rollingSummary ? (
                  <p className="text-gray-600 leading-relaxed text-xl font-medium">
                    {org.rollingSummary}
                  </p>
                ) : (
                  <p className="text-gray-400 text-lg italic">No overview available. Capture conversations to generate one.</p>
                )}

                {aliases.length > 0 && (
                  <div className="mt-10 flex flex-wrap gap-3">
                    {aliases.map((alias: any, i: number) => (
                      <span key={i} className="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-xl text-sm font-bold border border-gray-100 uppercase tracking-tight">
                        {String(alias)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Active Deals */}
            <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">Active Deals</h2>
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-black uppercase tracking-widest">
                    {org.deals?.length || 0}
                  </span>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {org.deals?.length > 0 ? (
                  org.deals.map((deal: any) => (
                    <Link 
                      key={deal.id} 
                      href={`/deals/${deal.id}`}
                      className="flex items-center justify-between p-10 hover:bg-gray-50/50 transition-all group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:scale-110 transition-transform">
                          <Zap size={28} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-xl">{deal.name}</h3>
                          <p className="text-base text-gray-500 font-medium">{deal.lastDecision || 'In Progress'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-4 py-1.5 bg-gray-50 text-gray-600 rounded-full text-xs font-black uppercase tracking-widest border border-gray-100 mb-2">
                          {deal.nextStep ? 'Active' : 'Qualified'}
                        </span>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-tight">
                          Updated {new Date(deal.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-10 text-center text-gray-400 italic text-lg">No deals linked to this organization.</div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Team / Contacts */}
            <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Key Contacts</h3>
                <button className="text-blue-600 hover:text-blue-700">
                  <Plus size={20} />
                </button>
              </div>
              <div className="space-y-6">
                {org.contacts?.length > 0 ? (
                  org.contacts.map((contact: any) => (
                    <Link 
                      key={contact.id} 
                      href={`/contacts/${contact.id}`}
                      className="flex items-center gap-4 p-3 -mx-3 hover:bg-gray-50 rounded-2xl transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100 group-hover:scale-105 transition-transform">
                        {contact.displayName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-bold text-gray-900 truncate">{contact.displayName}</p>
                        <p className="text-sm text-gray-500 truncate">{contact.email || 'No email'}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">No contacts added.</p>
                )}
              </div>
            </section>

            {/* Information */}
            <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Company Info</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-400">Created</span>
                  <span className="text-base font-bold text-gray-900">{new Date(org.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-400">Total Deals</span>
                  <span className="text-base font-bold text-gray-900">{org.deals?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-400">Status</span>
                  <span className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-xs font-black text-gray-900 uppercase">Active</span>
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

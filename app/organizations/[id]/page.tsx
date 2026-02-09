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
  Globe,
  ArrowUpRight,
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
    <div className="flex flex-col h-full space-y-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <Link href="/organizations" className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-400 shadow-sm border border-transparent hover:border-gray-100">
            <ArrowLeft size={14} />
          </Link>
          <span>Companies</span>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-[420px]">{org.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">{org.name}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <Globe size={14} className="text-gray-300" />
                <span>{org.website || 'No website registered'}</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-gray-100" />
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-tight">
                <Clock size={14} className="text-gray-300" />
                <span>Last interaction {new Date(org.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-black text-gray-500 uppercase tracking-widest hover:border-gray-200 transition-all shadow-sm">
              Edit Details
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md">
              <Plus size={14} />
              <span>New Deal</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-10">
            {/* Overview */}
            <section className="sleek-card rounded-[40px]">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white border border-gray-100 rounded-lg shadow-sm">
                    <Building2 size={14} className="text-gray-400" />
                  </div>
                  <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest">Company Overview</h2>
                </div>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-300 hover:text-gray-600">
                  <MoreHorizontal size={18} />
                </button>
              </div>
              <div className="p-8">
                {org.rollingSummary ? (
                  <p className="text-gray-600 leading-relaxed text-base font-medium">
                    {org.rollingSummary}
                  </p>
                ) : (
                  <div className="py-10 text-center space-y-3 opacity-40">
                    <Building2 size={32} className="mx-auto text-gray-300" />
                    <p className="text-xs font-black uppercase tracking-widest">No overview generated yet</p>
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

            {/* Active Deals */}
            <section className="sleek-card rounded-[40px]">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                    <Zap size={14} />
                  </div>
                  <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest">Active Deals</h2>
                  <span className="px-1.5 py-0.5 bg-gray-50 border border-gray-100 text-gray-400 rounded-md text-[9px] font-black uppercase">{org.deals?.length || 0}</span>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {org.deals?.length > 0 ? (
                  org.deals.map((deal: any) => (
                    <Link 
                      key={deal.id} 
                      href={`/deals/${deal.id}`}
                      className="flex items-center justify-between p-6 hover:bg-blue-50/20 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 group-hover:scale-110 transition-transform shadow-sm">
                          <Zap size={18} fill="currentColor" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{deal.name}</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">{deal.lastDecision || 'Initial stage'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <span className="inline-block px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[9px] font-black uppercase tracking-widest border border-gray-100 mb-1">
                            {deal.nextStep ? 'In Progress' : 'Qualified'}
                          </span>
                          <p className="text-[9px] text-gray-300 font-bold uppercase tracking-tight">
                            Updated {new Date(deal.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
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
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            {/* Key Contacts */}
            <section className="sleek-card rounded-[40px] p-6">
              <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Team Members</h3>
                <button className="p-1 hover:bg-gray-50 rounded-lg transition-colors text-blue-600">
                  <Plus size={14} />
                </button>
              </div>
              <div className="space-y-3">
                {org.contacts?.length > 0 ? (
                  org.contacts.map((contact: any) => (
                    <Link 
                      key={contact.id} 
                      href={`/contacts/${contact.id}`}
                      className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-black text-xs border border-gray-100 group-hover:scale-105 group-hover:border-blue-200 transition-all shadow-sm">
                        {contact.displayName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate tracking-tight">{contact.displayName}</p>
                        <p className="text-[9px] font-bold text-gray-400 truncate mt-0.5">
                          {contact.email || 'No email registered'}
                        </p>
                      </div>
                      <ArrowUpRight size={14} className="text-gray-300 group-hover:text-blue-400" />
                    </Link>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest py-4 text-center">No contacts added</p>
                )}
              </div>
            </section>

            {/* Company Details */}
            <section className="sleek-card rounded-[40px] p-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-1">Organization Stats</h3>
              <div className="space-y-4">
                <DetailRow label="Member Since" value={new Date(org.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} />
                <DetailRow label="Active Deals" value={String(org.deals?.length || 0)} />
                <DetailRow label="Status" value="Active Partner" isBadge />
              </div>
            </section>

            {/* System ID */}
            <div className="px-6 py-2">
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] text-center">System ID: {org.id.slice(-12)}</p>
            </div>
          </div>
        </div>
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

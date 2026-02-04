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
  MessageSquare,
  CheckCircle2,
  Calendar,
  Quote,
  FileSignature,
  Puzzle,
  Megaphone
} from 'lucide-react'

const STAGE_CONFIG = {
  qualified: { label: 'Qualified', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50' },
  mou_signed: { label: 'MOU Signed', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  integration: { label: 'Integration', color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-50' },
  won: { label: 'Won', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50' },
  lost_on_hold: { label: 'Lost/On Hold', color: 'bg-gray-400', textColor: 'text-gray-600', bgColor: 'bg-gray-100' },
} as const

type StageKey = keyof typeof STAGE_CONFIG

function getStageInfo(stage: string) {
  return STAGE_CONFIG[stage as StageKey] || STAGE_CONFIG.qualified
}

export default function DealDetailPage() {
  const { id } = useParams()
  const [deal, setDeal] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDeal() {
      try {
        const res = await fetch(`/api/deals/${id}`)
        const data = await res.json()
        setDeal(data.deal)
      } catch (error) {
        console.error('Failed to fetch deal:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDeal()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 font-bold">Deal not found</p>
        <Link href="/deals" className="text-blue-600 hover:underline mt-4 inline-block font-bold">
          Back to deals
        </Link>
      </div>
    )
  }

  const aliases = Array.isArray(deal.aliases) ? deal.aliases : []

  return (
    <div className="flex flex-col h-full bg-[#F8F9F8]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/deals" className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
            <span>Deals</span>
            <span>/</span>
            <span className="text-gray-900">{deal.name}</span>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-[32px] bg-green-50 flex items-center justify-center text-green-600 border border-green-100 shadow-sm">
              <Zap size={48} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-3">{deal.name}</h1>
              <div className="flex items-center gap-6">
                {deal.organization && (
                  <Link 
                    href={`/organizations/${deal.organization.id}`}
                    className="flex items-center gap-3 text-base font-bold text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Building2 size={20} />
                    <span>{deal.organization.name}</span>
                  </Link>
                )}
                <div className="h-5 w-px bg-gray-200" />
                <div className="flex items-center gap-3 text-base font-bold text-gray-400 uppercase tracking-tight">
                  <Clock size={20} />
                  <span>Updated {new Date(deal.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-base font-bold text-gray-600 hover:bg-gray-50 transition-all">
              Edit Deal
            </button>
            <div className="flex items-center bg-gray-900 rounded-2xl shadow-md overflow-hidden">
              <button className="px-6 py-3 text-white text-base font-bold border-r border-gray-800 hover:bg-gray-800 transition-all">
                Won
              </button>
              <button className="p-3 text-white hover:bg-gray-800 transition-all">
                <Plus size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                  <CheckCircle2 size={18} className="text-green-500" />
                  <span>Last Decision</span>
                </div>
                <p className="text-gray-900 text-lg font-bold leading-snug">
                  {deal.lastDecision || 'No decision recorded'}
                </p>
              </div>
              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                  <Calendar size={18} className="text-blue-500" />
                  <span>Next Step</span>
                </div>
                <p className="text-gray-900 text-lg font-bold leading-snug">
                  {deal.nextStep || 'No next step defined'}
                </p>
              </div>
            </div>

            {/* Rolling Summary */}
            <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Project Summary</h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal size={24} />
                </button>
              </div>
              <div className="p-10">
                {deal.rollingSummary ? (
                  <p className="text-gray-600 leading-relaxed text-xl font-medium">
                    {deal.rollingSummary}
                  </p>
                ) : (
                  <p className="text-gray-400 text-lg italic">No summary available. AI will generate one after your next interaction.</p>
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

            {/* Recent Conversations */}
            <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">Conversation History</h2>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {deal.items?.length || 0}
                  </span>
                </div>
                <Link href="/" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Plus size={16} />
                  <span>Capture New</span>
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {deal.items?.length > 0 ? (
                  deal.items.map((item: any) => (
                    <Link 
                      key={item.id} 
                      href={`/items/${item.id}`}
                      className="block p-8 hover:bg-gray-50/50 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 text-gray-400 rounded-xl border border-gray-100 group-hover:text-blue-500 group-hover:border-blue-100 transition-colors">
                            <MessageSquare size={18} />
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            item.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-tight">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <Quote size={20} className="text-gray-200 shrink-0" />
                        <p className="text-sm text-gray-600 leading-relaxed font-medium line-clamp-3">
                          {item.rawText}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400 italic">No conversations captured for this deal yet.</div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Team / Contacts */}
            <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Stakeholders</h3>
                <button className="text-blue-600 hover:text-blue-700">
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-4">
                {deal.dealContacts?.length > 0 ? (
                  deal.dealContacts.map((dc: any) => (
                    <Link 
                      key={dc.contact.id} 
                      href={`/contacts/${dc.contact.id}`}
                      className="flex items-center gap-3 p-2 -mx-2 hover:bg-gray-50 rounded-xl transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-100 group-hover:scale-105 transition-transform">
                        {dc.contact.displayName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{dc.contact.displayName}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">
                          {dc.role || 'Partner'}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No stakeholders added.</p>
                )}
              </div>
            </section>

            {/* Information */}
            <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Deal Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-400">Created</span>
                  <span className="text-sm font-bold text-gray-900">{new Date(deal.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-400">Last Activity</span>
                  <span className="text-sm font-bold text-gray-900">{new Date(deal.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-400">Stage</span>
                  <span className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStageInfo(deal.stage).color}`} />
                    <span className={`text-[11px] font-black uppercase ${getStageInfo(deal.stage).textColor}`}>
                      {getStageInfo(deal.stage).label}
                    </span>
                  </span>
                </div>
              </div>
            </section>

            {/* Milestones */}
            <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Milestones</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${deal.mouSignedAt ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                      <FileSignature size={16} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">MOU Signed</span>
                  </div>
                  {deal.mouSignedAt ? (
                    <span className="text-xs font-bold text-green-600">{new Date(deal.mouSignedAt).toLocaleDateString()}</span>
                  ) : (
                    <span className="text-xs font-bold text-gray-400">Pending</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${deal.integrationCompletedAt ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                      <Puzzle size={16} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Integration</span>
                  </div>
                  {deal.integrationCompletedAt ? (
                    <span className="text-xs font-bold text-green-600">{new Date(deal.integrationCompletedAt).toLocaleDateString()}</span>
                  ) : (
                    <span className="text-xs font-bold text-gray-400">Pending</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${deal.coMarketingCompletedAt ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                      <Megaphone size={16} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Co-Marketing</span>
                  </div>
                  {deal.coMarketingCompletedAt ? (
                    <span className="text-xs font-bold text-green-600">{new Date(deal.coMarketingCompletedAt).toLocaleDateString()}</span>
                  ) : (
                    <span className="text-xs font-bold text-gray-400">Pending</span>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

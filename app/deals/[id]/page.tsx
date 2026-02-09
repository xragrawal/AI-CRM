'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Building2, 
  Clock,
  MoreHorizontal,
  Plus,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Quote,
  FileSignature,
  Puzzle,
  Megaphone,
  Bot,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react'

const STAGE_CONFIG = {
  qualified: { label: 'Qualified', color: 'bg-blue-500', textColor: 'text-blue-600', bgColor: 'bg-blue-50/50' },
  mou_signed: { label: 'MOU Signed', color: 'bg-indigo-500', textColor: 'text-indigo-600', bgColor: 'bg-indigo-50/50' },
  integration: { label: 'Integration', color: 'bg-amber-500', textColor: 'text-amber-600', bgColor: 'bg-amber-50/50' },
  won: { label: 'Won', color: 'bg-emerald-500', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50/50' },
  lost_on_hold: { label: 'On Hold', color: 'bg-slate-400', textColor: 'text-slate-500', bgColor: 'bg-slate-50/50' },
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
    <div className="flex flex-col h-full space-y-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <Link href="/deals" className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-400 shadow-sm border border-transparent hover:border-gray-100">
            <ArrowLeft size={14} />
          </Link>
          <span>Deals</span>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-[420px]">{deal.name}</span>
          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${getStageInfo(deal.stage).bgColor} ${getStageInfo(deal.stage).textColor}`}>
            {getStageInfo(deal.stage).label}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">{deal.name}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              {deal.organization && (
                <Link 
                  href={`/organizations/${deal.organization.id}`}
                  className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#5551FF] transition-colors"
                >
                  <Building2 size={14} className="text-gray-300" />
                  <span>{deal.organization.name}</span>
                </Link>
              )}
              <div className="hidden sm:block h-4 w-px bg-gray-100" />
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-tight">
                <Clock size={14} className="text-gray-300" />
                <span>Last update {new Date(deal.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-black text-gray-500 uppercase tracking-widest hover:border-gray-200 transition-all shadow-sm">
              Edit Details
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md">
              <CheckCircle2 size={14} />
              <span>Mark as Won</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-10">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                  <CheckCircle2 size={64} />
                </div>
                <div className="flex items-center gap-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  <div className="p-1 bg-emerald-50 rounded text-emerald-600">
                    <CheckCircle2 size={12} />
                  </div>
                  <span>Last Decision</span>
                </div>
                <p className="text-gray-900 text-sm font-bold leading-relaxed relative z-10">
                  {deal.lastDecision || 'No decision recorded yet'}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                  <Calendar size={64} />
                </div>
                <div className="flex items-center gap-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  <div className="p-1 bg-blue-50 rounded text-blue-600">
                    <Calendar size={12} />
                  </div>
                  <span>Next Milestone</span>
                </div>
                <p className="text-gray-900 text-sm font-bold leading-relaxed relative z-10">
                  {deal.nextStep || 'Next step undefined'}
                </p>
              </div>
            </div>

            {/* Rolling Summary */}
            <section className="sleek-card rounded-[40px]">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white border border-gray-100 rounded-lg shadow-sm">
                    <Quote size={14} className="text-gray-400" />
                  </div>
                  <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest">Intelligence Summary</h2>
                </div>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-300 hover:text-gray-600">
                  <MoreHorizontal size={18} />
                </button>
              </div>
              <div className="p-8">
                {deal.rollingSummary ? (
                  <p className="text-gray-600 leading-relaxed text-base font-medium">
                    {deal.rollingSummary}
                  </p>
                ) : (
                  <div className="py-10 text-center space-y-3 opacity-40">
                    <Bot size={32} className="mx-auto text-gray-300" />
                    <p className="text-xs font-black uppercase tracking-widest">Waiting for insights</p>
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
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                    <MessageSquare size={14} />
                  </div>
                  <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest tracking-widest">Interaction Logs</h2>
                  <span className="px-1.5 py-0.5 bg-gray-50 border border-gray-100 text-gray-400 rounded-md text-[9px] font-black uppercase">{deal.items?.length || 0}</span>
                </div>
                <Link href="/" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors flex items-center gap-1.5">
                  <Plus size={14} />
                  <span>Capture Update</span>
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {deal.items?.length > 0 ? (
                  deal.items.map((item: any) => (
                    <Link 
                      key={item.id} 
                      href={`/items/${item.id}`}
                      className="block p-6 hover:bg-blue-50/20 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4 px-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${
                            item.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {item.status}
                          </span>
                          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tight">
                            {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <ArrowUpRight size={14} className="text-gray-200 group-hover:text-blue-500 transition-all" />
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed font-medium line-clamp-2 px-1">
                        {item.rawText}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="p-12 text-center opacity-30">
                    <p className="text-[10px] font-black uppercase tracking-widest">No activity captured</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            {/* Stakeholders */}
            <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Stakeholders</h3>
                <button className="p-1 hover:bg-gray-50 rounded-lg transition-colors text-blue-600">
                  <Plus size={14} />
                </button>
              </div>
              <div className="space-y-3">
                {deal.dealContacts?.length > 0 ? (
                  deal.dealContacts.map((dc: any) => (
                    <Link 
                      key={dc.contact.id} 
                      href={`/contacts/${dc.contact.id}`}
                      className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-black text-xs border border-gray-100 group-hover:scale-105 group-hover:border-blue-200 transition-all shadow-sm">
                        {dc.contact.displayName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate tracking-tight">{dc.contact.displayName}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate mt-0.5">
                          {dc.role || 'Key Contact'}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-400" />
                    </Link>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest py-4 text-center">No stakeholders</p>
                )}
              </div>
            </section>

            {/* Milestones */}
            <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 overflow-hidden">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-1">Pipeline Milestones</h3>
              <div className="space-y-4">
                <MilestoneItem 
                  label="MOU Signed" 
                  date={deal.mouSignedAt} 
                  icon={<FileSignature size={14} />} 
                />
                <MilestoneItem 
                  label="Technical Integration" 
                  date={deal.integrationCompletedAt} 
                  icon={<Puzzle size={14} />} 
                />
                <MilestoneItem 
                  label="Marketing Kickoff" 
                  date={deal.coMarketingCompletedAt} 
                  icon={<Megaphone size={14} />} 
                />
              </div>
            </section>

            {/* System Metadata */}
            <div className="px-6 py-2">
              <div className="flex justify-between items-center text-[9px] font-black text-gray-300 uppercase tracking-widest">
                <span>Ref: {deal.id.slice(-8)}</span>
                <span>Captured: {new Date(deal.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MilestoneItem({ label, date, icon }: { label: string, date: string | null, icon: React.ReactNode }) {
  const isDone = !!date
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl transition-all duration-300 ${
          isDone ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-300 border border-transparent group-hover:border-gray-100'
        }`}>
          {icon}
        </div>
        <span className={`text-xs font-bold tracking-tight ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
      </div>
      {isDone ? (
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black text-emerald-600 uppercase">Complete</span>
          <span className="text-[8px] font-bold text-gray-400 mt-0.5">{new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
        </div>
      ) : (
        <span className="text-[9px] font-black text-gray-300 uppercase">Pending</span>
      )}
    </div>
  )
}

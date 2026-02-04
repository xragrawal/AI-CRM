'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Table as TableIcon, 
  LayoutGrid, 
  Filter, 
  ArrowUpDown, 
  MoreHorizontal,
  User as UserIcon,
  Search,
  Zap,
  ChevronDown,
  Building2
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

export default function DealsPage() {
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchDeals() {
      try {
        const res = await fetch('/api/deals')
        const data = await res.json()
        setDeals(data.deals || [])
      } catch (error) {
        console.error('Failed to fetch deals:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDeals()
  }, [])

  const filteredDeals = deals.filter(deal => 
    deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.organization?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const KanbanColumn = ({ title, count, deals }: any) => (
    <div className="flex flex-col w-[85vw] sm:w-80 md:w-96 shrink-0 bg-[#F8F9F8] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-gray-900 text-base sm:text-lg">{title}</h3>
          <span className="px-2 sm:px-2.5 py-1 bg-gray-200 text-gray-600 rounded-full text-[10px] sm:text-[11px] font-black">{count}</span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>
      <div className="space-y-3 sm:space-y-4 overflow-y-auto">
        {deals.map((deal: any) => (
          <Link 
            key={deal.id} 
            href={`/deals/${deal.id}`}
            className="block p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${getStageInfo(deal.stage || 'qualified').color}`} />
                <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded text-xs">
                  {deal.organization?.name || 'No Org'}
                </span>
              </div>
              <button className="text-gray-300 group-hover:text-gray-500">
                <MoreHorizontal size={16} className="sm:w-4 sm:h-4" />
              </button>
            </div>
            <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">{deal.name}</h4>
            
            <div className="flex items-center justify-between mt-4 sm:mt-5">
              <div className="flex -space-x-2 sm:-space-x-2.5">
                {(deal.dealContacts || []).slice(0, 3).map((dc: any) => (
                  <div key={dc.contact.id} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center overflow-hidden" title={dc.contact.displayName}>
                    <UserIcon size={14} className="text-gray-400 sm:w-4 sm:h-4" />
                  </div>
                ))}
                {(deal.dealContacts?.length || 0) > 3 && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-gray-400">
                    +{deal.dealContacts.length - 3}
                  </div>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase tracking-tight">
                {new Date(deal.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </Link>
        ))}
        <button className="w-full py-2 sm:py-3 border-2 border-dashed border-gray-200 rounded-xl sm:rounded-2xl text-gray-400 text-sm sm:text-base font-bold hover:border-gray-300 hover:text-gray-500 transition-all">
          + Add Deal
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar Bar */}
      <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center justify-between sm:justify-start sm:gap-10">
          <div className="flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-bold text-gray-600 hover:bg-gray-50 cursor-pointer">
            <TableIcon size={18} className="text-gray-400 sm:w-5 sm:h-5" />
            <span>Table</span>
            <ChevronDown size={16} className="text-gray-300 sm:w-4 sm:h-4" />
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
            <button className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-bold text-gray-500 hover:text-gray-900 px-3 py-2 sm:py-2.5">
              <Filter size={18} className="text-gray-400 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Filter</span>
            </button>
            <button className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-bold text-gray-500 hover:text-gray-900 px-3 py-2 sm:py-2.5">
              <ArrowUpDown size={18} className="text-gray-400 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Sort</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-80 pl-11 pr-4 py-2 sm:py-3 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />
           </div>
           <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl px-1.5 py-1.5">
            <button 
              onClick={() => setView('table')}
              className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all ${view === 'table' ? 'bg-white shadow-sm text-gray-900 border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <TableIcon size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button 
              onClick={() => setView('kanban')}
              className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all ${view === 'kanban' ? 'bg-white shadow-sm text-gray-900 border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 sm:py-12">
             <div className="p-3 sm:p-4 bg-gray-50 rounded-full mb-3 sm:mb-4">
                <Zap size={24} className="text-gray-300 sm:w-8 sm:h-8" />
             </div>
             <p className="text-gray-500 font-bold text-sm sm:text-base">No deals found</p>
             <button className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-800 transition-all">
                Create your first deal
             </button>
          </div>
        ) : view === 'table' ? (
          <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
              {filteredDeals.map((deal) => (
                <div key={deal.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStageInfo(deal.stage).color}`} />
                        <span className={`text-xs font-bold ${getStageInfo(deal.stage).textColor}`}>
                          {getStageInfo(deal.stage).label}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(deal.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <Link href={`/deals/${deal.id}`} className="font-bold text-gray-900 text-sm hover:text-blue-600 transition-colors block mb-2">
                      {deal.name}
                    </Link>
                    
                    {deal.organization?.name && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded flex items-center justify-center overflow-hidden bg-gray-100">
                          <Building2 size={10} className="text-gray-400" />
                        </div>
                        <span className="text-xs font-medium text-gray-900">{deal.organization.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1.5">
                        {deal.dealContacts.slice(0, 3).map((dc: any) => (
                          <div key={dc.contact.id} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center overflow-hidden shadow-sm" title={dc.contact.displayName}>
                            <UserIcon size={12} className="text-gray-400" />
                          </div>
                        ))}
                        {deal.dealContacts.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-400">
                            +{deal.dealContacts.length - 3}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold border border-gray-200 uppercase">
                          Editorial
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    <th className="pb-4 sm:pb-6 w-12">
                      <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-0" />
                    </th>
                    <th className="pb-4 sm:pb-6">Title</th>
                    <th className="pb-4 sm:pb-6 hidden md:table-cell">Organization</th>
                    <th className="pb-4 sm:pb-6 hidden lg:table-cell">Product</th>
                    <th className="pb-4 sm:pb-6">People</th>
                    <th className="pb-4 sm:pb-6 hidden md:table-cell">Interaction Details</th>
                    <th className="pb-4 sm:pb-6">Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDeals.map((deal) => (
                    <tr key={deal.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-5 sm:py-6">
                        <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-0 w-4 h-4" />
                      </td>
                      <td className="py-5 sm:py-6">
                        <Link href={`/deals/${deal.id}`} className="font-bold text-gray-900 text-sm sm:text-lg hover:text-blue-600 transition-colors">
                          {deal.name}
                        </Link>
                      </td>
                      <td className="py-5 sm:py-6 hidden md:table-cell">
                        <div className="flex items-center gap-3">
                          {deal.organization?.name ? (
                            <>
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100">
                                <Building2 size={16} className="text-gray-400" />
                              </div>
                              <span className="text-sm sm:text-base font-medium text-gray-900">{deal.organization.name}</span>
                            </>
                          ) : (
                            <span className="text-sm sm:text-base text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 sm:py-6 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-2">
                          {(deal.productTags || []).map((tag: string) => (
                            <span 
                              key={tag} 
                              className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold border uppercase ${
                                tag === 'KYA' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                tag === 'Id/KYC' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                tag === 'PoU' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                'bg-gray-50 text-gray-600 border-gray-100'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                          {(!deal.productTags || deal.productTags.length === 0) && (
                            <span className="text-gray-400 text-sm italic">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 sm:py-6">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2 sm:-space-x-3">
                            {(deal.dealContacts || []).slice(0, 3).map((dc: any) => (
                              <div key={dc.contact.id} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center overflow-hidden shadow-sm" title={dc.contact.displayName}>
                                <UserIcon size={16} className="text-gray-400 sm:w-5 sm:h-5" />
                              </div>
                            ))}
                          </div>
                          <span className="text-sm sm:text-base font-medium text-gray-900 truncate max-w-[100px] sm:max-w-[150px]">
                            {deal.dealContacts[0]?.contact?.displayName || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 sm:py-6 hidden md:table-cell">
                        <div className="max-w-[300px]">
                          <p className="text-sm sm:text-base text-gray-500 font-medium line-clamp-2 leading-relaxed italic">
                            {deal.lastDecision || 'No recent interactions recorded...'}
                          </p>
                        </div>
                      </td>
                      <td className="py-5 sm:py-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStageInfo(deal.stage).color}`} />
                          <span className={`text-sm sm:text-base font-bold ${getStageInfo(deal.stage).textColor}`}>
                            {getStageInfo(deal.stage).label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 md:p-8 h-full flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-8 sm:pb-12">
            <KanbanColumn 
              title="Qualified" 
              count={filteredDeals.filter(d => !d.stage || d.stage === 'qualified').length} 
              deals={filteredDeals.filter(d => !d.stage || d.stage === 'qualified')} 
            />
            <KanbanColumn 
              title="MOU Signed" 
              count={filteredDeals.filter(d => d.stage === 'mou_signed').length} 
              deals={filteredDeals.filter(d => d.stage === 'mou_signed')} 
            />
            <KanbanColumn 
              title="Integration" 
              count={filteredDeals.filter(d => d.stage === 'integration').length} 
              deals={filteredDeals.filter(d => d.stage === 'integration')} 
            />
            <KanbanColumn 
              title="Won" 
              count={filteredDeals.filter(d => d.stage === 'won').length} 
              deals={filteredDeals.filter(d => d.stage === 'won')} 
            />
            <KanbanColumn 
              title="Lost/On Hold" 
              count={filteredDeals.filter(d => d.stage === 'lost_on_hold').length} 
              deals={filteredDeals.filter(d => d.stage === 'lost_on_hold')} 
            />
          </div>
        )}
      </div>
    </div>
  )
}

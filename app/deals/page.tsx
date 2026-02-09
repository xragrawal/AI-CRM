'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Table as TableIcon, 
  LayoutGrid, 
  Filter, 
  Search, 
  Plus, 
  Building2, 
  Calendar, 
  Zap, 
  ArrowUpRight
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
    <div className="flex flex-col w-80 shrink-0 bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">{title}</h3>
          <span className="px-1.5 py-0.5 bg-white border border-gray-100 text-gray-400 rounded text-[9px] font-black">{count}</span>
        </div>
        <button className="p-1 hover:bg-white rounded-md transition-colors text-gray-300 hover:text-gray-600">
          <Plus size={14} />
        </button>
      </div>
      <div className="space-y-3 overflow-y-auto pr-1 scrollbar-hide">
        {deals.map((deal: any) => (
          <Link 
            key={deal.id} 
            href={`/deals/${deal.id}`}
            className="block p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100/50">
                {deal.organization?.name || 'Direct'}
              </span>
              <ArrowUpRight size={12} className="text-gray-200 group-hover:text-blue-400 transition-colors" />
            </div>
            <h4 className="font-bold text-gray-900 text-xs mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{deal.name}</h4>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex -space-x-1.5">
                {(deal.dealContacts || []).slice(0, 3).map((dc: any) => (
                  <div key={dc.contact.id} className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center overflow-hidden shadow-sm" title={dc.contact.displayName}>
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                      {dc.contact.displayName[0]}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 text-gray-300">
                <Calendar size={10} />
                <span className="text-[9px] font-bold uppercase tracking-tighter">
                  {new Date(deal.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Deals Pipeline</h2>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Managing {filteredDeals.length} active opportunities</p>
        </div>
        <div className="flex items-center bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
          <button 
            onClick={() => setView('table')}
            className={`p-2 rounded-lg transition-all ${view === 'table' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <TableIcon size={16} />
          </button>
          <button 
            onClick={() => setView('kanban')}
            className={`p-2 rounded-lg transition-all ${view === 'kanban' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input 
            type="text"
            placeholder="Search pipeline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:border-gray-200 transition-all shadow-sm">
            <Filter size={14} />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md">
            <Plus size={14} />
            <span>New Deal</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white border border-gray-100 rounded-[32px]">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white border border-dashed border-gray-200 rounded-[32px]">
             <Zap size={24} className="text-gray-200 mb-2" />
             <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No matching deals</p>
          </div>
        ) : view === 'table' ? (
          <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Organization</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">People</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDeals.map((deal) => (
                    <tr key={deal.id} className="group hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <Link href={`/deals/${deal.id}`} className="font-bold text-gray-900 text-sm hover:text-blue-600 transition-colors block">
                          {deal.name}
                        </Link>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                            <Building2 size={12} />
                          </div>
                          <span className="text-xs font-semibold text-gray-600">{deal.organization?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex -space-x-1.5">
                          {(deal.dealContacts || []).slice(0, 3).map((dc: any) => (
                            <div key={dc.contact.id} className="w-6 h-6 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600 shadow-sm">
                              {dc.contact.displayName[0]}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight ${getStageInfo(deal.stage).bgColor} ${getStageInfo(deal.stage).textColor}`}>
                          {getStageInfo(deal.stage).label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                        {new Date(deal.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide h-[calc(100vh-300px)]">
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
              title="On Hold" 
              count={filteredDeals.filter(d => d.stage === 'lost_on_hold').length} 
              deals={filteredDeals.filter(d => d.stage === 'lost_on_hold')} 
            />
          </div>
        )}
      </div>
    </div>
  )
}

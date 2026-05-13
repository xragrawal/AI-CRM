'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Table as TableIcon, 
  LayoutGrid, 
  Filter, 
  Search, 
  Plus, 
  Building2, 
  Calendar, 
  Zap, 
  ArrowUpRight,
  X,
  Check
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

interface KanbanColumnProps {
  title: string
  count: number
  deals: any[]
  stageKey: StageKey
  draggedDealId: string | null
  onDragStart: (dealId: string) => void
  onDragEnd: () => void
  onDrop: (dealId: string, stageKey: StageKey) => void
  onAddDeal: (stageKey: StageKey) => void
}

function KanbanColumn({ title, count, deals, stageKey, draggedDealId, onDragStart, onDragEnd, onDrop, onAddDeal }: KanbanColumnProps) {
  return (
    <div
      className="flex flex-col w-80 shrink-0 bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50 transition-all"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const dealId = e.dataTransfer.getData('dealId')
        if (dealId) onDrop(dealId, stageKey)
      }}
    >
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">{title}</h3>
          <span className="px-1.5 py-0.5 bg-white border border-gray-100 text-gray-400 rounded text-[9px] font-black">{count}</span>
        </div>
        <button
          onClick={() => onAddDeal(stageKey)}
          className="p-1 hover:bg-white rounded-md transition-colors text-gray-300 hover:text-gray-600"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="space-y-3 overflow-y-auto pr-1 scrollbar-hide">
        {deals.map((deal: any) => (
          <div
            key={deal.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('dealId', deal.id)
              onDragStart(deal.id)
            }}
            onDragEnd={onDragEnd}
            className={`transition-all ${draggedDealId === deal.id ? 'opacity-50' : 'opacity-100'}`}
          >
            <Link
              href={`/deals/${deal.id}`}
              className="block p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group cursor-grab active:cursor-grabbing"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100/50">
                  {deal.organization?.name || 'Direct'}
                </span>
                <ArrowUpRight size={12} className="text-gray-200 group-hover:text-blue-400 transition-colors" />
              </div>
              <h4 className="font-bold text-gray-900 text-xs mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{deal.name}</h4>
              <div className="flex items-center justify-between mt-4">
                <div className="flex flex-col gap-1">
                  {(deal.dealContacts || []).slice(0, 2).map((dc: any) => (
                    <div key={dc.contact.id} className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-[9px] font-black text-blue-600 shadow-sm flex-shrink-0">
                        {dc.contact.displayName[0]}
                      </div>
                      <span className="text-[10px] font-bold text-gray-700 truncate">{dc.contact.displayName}</span>
                    </div>
                  ))}
                  {(deal.dealContacts || []).length > 2 && (
                    <span className="text-[9px] text-gray-400 font-bold">+{(deal.dealContacts || []).length - 2} more</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Calendar size={14} />
                  <span className="text-[10px] font-black uppercase tracking-tight">
                    {new Date(deal.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DealsPage() {
  const router = useRouter()
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<StageKey | 'all'>('all')
  const [showFilter, setShowFilter] = useState(false)
  const [showNewDeal, setShowNewDeal] = useState(false)
  const [newDealStage, setNewDealStage] = useState<string>('qualified')
  const [newDealName, setNewDealName] = useState('')
  const [newDealOrg, setNewDealOrg] = useState('')
  const [organizations, setOrganizations] = useState<any[]>([])
  const [creating, setCreating] = useState(false)
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchDeals() {
      try {
        const res = await fetch('/api/deals')
        const contentType = res.headers.get('content-type') || ''
        if (!res.ok) {
          const bodyText = await res.text().catch(() => '')
          console.error('Failed to fetch deals:', res.status, bodyText)
          setDeals([])
          return
        }
        if (!contentType.includes('application/json')) {
          const bodyText = await res.text().catch(() => '')
          console.error('Failed to fetch deals: non-JSON response', bodyText)
          setDeals([])
          return
        }
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

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const res = await fetch('/api/organizations')
        const data = await res.json()
        setOrganizations(data.organizations || [])
      } catch { /* ignore */ }
    }
    fetchOrgs()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function openNewDeal(stage = 'qualified') {
    setNewDealStage(stage)
    setNewDealName('')
    setNewDealOrg('')
    setShowNewDeal(true)
  }

  async function handleCreateDeal() {
    if (!newDealName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDealName.trim(),
          organizationId: newDealOrg || undefined,
          stage: newDealStage,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setShowNewDeal(false)
        router.push(`/deals/${data.deal.id}`)
      }
    } catch (error) {
      console.error('Failed to create deal:', error)
    } finally {
      setCreating(false)
    }
  }

  async function handleDragEnd(dealId: string, newStage: StageKey) {
    const deal = deals.find(d => d.id === dealId)
    if (!deal || deal.stage === newStage) {
      setDraggedDealId(null)
      return
    }
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      if (res.ok) {
        const data = await res.json()
        setDeals(deals.map(d => d.id === dealId ? data.deal : d))
      }
    } catch (error) {
      console.error('Failed to update deal stage:', error)
    } finally {
      setDraggedDealId(null)
    }
  }

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.organization?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStage = stageFilter === 'all' || deal.stage === stageFilter
    return matchesSearch && matchesStage
  })

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#5551FF]/10 text-[#5551FF] rounded-lg">
              <Zap size={20} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Deals Pipeline</h2>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Managing {filteredDeals.length} active opportunities</p>
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#5551FF] transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search pipeline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#5551FF]/5 focus:border-[#5551FF] transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-3 px-5 py-3 bg-white border rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-gray-200 transition-all shadow-sm ${
                stageFilter !== 'all' ? 'border-[#5551FF]/30 text-[#5551FF]' : 'border-gray-100 text-gray-500'
              }`}
            >
              <Filter size={18} />
              <span>{stageFilter === 'all' ? 'Filter' : STAGE_CONFIG[stageFilter].label}</span>
              {stageFilter !== 'all' && (
                <span 
                  onClick={(e) => { e.stopPropagation(); setStageFilter('all'); setShowFilter(false) }}
                  className="ml-1 p-0.5 hover:bg-[#5551FF]/10 rounded-full"
                >
                  <X size={12} />
                </span>
              )}
            </button>
            {showFilter && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-lg py-2 z-50 min-w-[180px]">
                <button
                  onClick={() => { setStageFilter('all'); setShowFilter(false) }}
                  className={`w-full text-left px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors ${
                    stageFilter === 'all' ? 'text-[#5551FF] bg-[#5551FF]/5' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>All Stages</span>
                    {stageFilter === 'all' && <Check size={14} />}
                  </div>
                </button>
                {(Object.keys(STAGE_CONFIG) as StageKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setStageFilter(key); setShowFilter(false) }}
                    className={`w-full text-left px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors ${
                      stageFilter === key ? 'text-[#5551FF] bg-[#5551FF]/5' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${STAGE_CONFIG[key].color}`} />
                        <span>{STAGE_CONFIG[key].label}</span>
                      </div>
                      {stageFilter === key && <Check size={14} />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={() => openNewDeal()}
            className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md"
          >
            <Plus size={18} />
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
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-[#5551FF]/60 border border-gray-200/50">
                            <Building2 size={14} />
                          </div>
                          <span className="text-xs font-bold text-gray-700">{deal.organization?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5">
                          {(deal.dealContacts || []).slice(0, 3).map((dc: any) => (
                            <div key={dc.contact.id} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600 shadow-sm flex-shrink-0">
                                {dc.contact.displayName[0]}
                              </div>
                              <span className="text-xs font-bold text-gray-700 truncate">{dc.contact.displayName}</span>
                            </div>
                          ))}
                          {(deal.dealContacts || []).length > 3 && (
                            <span className="text-[10px] text-gray-400 font-bold">+{(deal.dealContacts || []).length - 3} more</span>
                          )}
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
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide h-[calc(100vh-300px)] select-none">
            {([
              { title: 'Qualified', stageKey: 'qualified' as StageKey, filter: (d: any) => !d.stage || d.stage === 'qualified' },
              { title: 'MOU Signed', stageKey: 'mou_signed' as StageKey, filter: (d: any) => d.stage === 'mou_signed' },
              { title: 'Integration', stageKey: 'integration' as StageKey, filter: (d: any) => d.stage === 'integration' },
              { title: 'Won', stageKey: 'won' as StageKey, filter: (d: any) => d.stage === 'won' },
              { title: 'On Hold', stageKey: 'lost_on_hold' as StageKey, filter: (d: any) => d.stage === 'lost_on_hold' },
            ]).map(col => (
              <KanbanColumn
                key={col.stageKey}
                title={col.title}
                stageKey={col.stageKey}
                count={filteredDeals.filter(col.filter).length}
                deals={filteredDeals.filter(col.filter)}
                draggedDealId={draggedDealId}
                onDragStart={setDraggedDealId}
                onDragEnd={() => setDraggedDealId(null)}
                onDrop={handleDragEnd}
                onAddDeal={openNewDeal}
              />
            ))}
          </div>
        )}
      </div>

      {/* New Deal Modal */}
      {showNewDeal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowNewDeal(false)}>
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">New Deal</h3>
              <button onClick={() => setShowNewDeal(false)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Deal Name *</label>
                <input
                  type="text"
                  value={newDealName}
                  onChange={(e) => setNewDealName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateDeal()}
                  placeholder="e.g. Acme Corp Partnership"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#5551FF]/5 focus:border-[#5551FF] transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Organization</label>
                <select
                  value={newDealOrg}
                  onChange={(e) => setNewDealOrg(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#5551FF]/5 focus:border-[#5551FF] transition-all appearance-none"
                >
                  <option value="">No organization</option>
                  {organizations.map((org: any) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stage</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(STAGE_CONFIG) as StageKey[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => setNewDealStage(key)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        newDealStage === key
                          ? `${STAGE_CONFIG[key].bgColor} ${STAGE_CONFIG[key].textColor} border-current`
                          : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {STAGE_CONFIG[key].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowNewDeal(false)}
                className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-500 uppercase tracking-widest hover:border-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDeal}
                disabled={!newDealName.trim() || creating}
                className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Deal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

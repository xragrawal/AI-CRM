'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  AlertCircle, 
  User, 
  CheckCircle2, 
  FileText, 
  Zap
} from 'lucide-react'

interface ProposedData {
  suggestedDealName?: string
  suggestedOrganizationName?: string
  productTags?: string[]
  contacts?: Array<{ name: string; role?: string }>
  lastDecision?: string
  nextStep?: string
  rollingSummary?: string
  exclusions?: {
    organization?: boolean
    deal?: boolean
    contacts?: string[]
  }
}

interface Candidate {
  dealId: string
  dealName: string
  organizationName?: string
  confidence: number
  evidenceSnippet?: string
}

const AVAILABLE_PRODUCT_TAGS = ['KYA', 'Id/KYC', 'PoU', 'Others'] as const

export default function ItemReviewUI({ 
  itemId, 
  initialProposal,
  mode = 'all',
  selectedDealId: controlledSelectedDealId,
  onSelectDealId,
  formId
}: { 
  itemId: string
  initialProposal: {
    proposed: ProposedData
    candidates: Candidate[]
  }
  mode?: 'all' | 'proposed' | 'matching'
  selectedDealId?: string | null
  onSelectDealId?: (dealId: string | null) => void
  formId?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Editable fields
  const [dealName, setDealName] = useState(initialProposal.proposed.suggestedDealName || '')
  const [orgName, setOrgName] = useState(initialProposal.proposed.suggestedOrganizationName || '')
  const [productTags, setProductTags] = useState<string[]>(initialProposal.proposed.productTags || [])
  const [lastDecision, setLastDecision] = useState(initialProposal.proposed.lastDecision || '')
  const [nextStep, setNextStep] = useState(initialProposal.proposed.nextStep || '')
  const [summary, setSummary] = useState(initialProposal.proposed.rollingSummary || '')

  const toggleTag = (tag: string) => {
    setProductTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    )
  }

  const firstContact = initialProposal.proposed.contacts?.[0]
  const [contactName, setContactName] = useState(firstContact?.name || '')
  const [contactRole, setContactRole] = useState(firstContact?.role || 'POC')
  
  // Selection state
  const [uncontrolledSelectedDealId, setUncontrolledSelectedDealId] = useState<string | null>(
    initialProposal.candidates.length > 0 ? initialProposal.candidates[0].dealId : null
  )

  const selectedDealId = controlledSelectedDealId ?? uncontrolledSelectedDealId
  const setSelectedDealId = onSelectDealId ?? setUncontrolledSelectedDealId

  const handleApprove = async (action: 'approve' | 'edit_approve') => {
    setLoading(true)
    setError(null)
    
    const payload: any = {
      dealId: selectedDealId,
      updates: {
        lastDecision,
        nextStep,
        rollingSummary: summary,
        productTags
      },
      // For learning system: track AI suggestions vs user corrections
      aiSuggestedTags: initialProposal.proposed.productTags || [],
      rawTextSnippet: summary || lastDecision || dealName || ''
    }

    if (contactName.trim()) {
      payload.contact = {
        displayName: contactName.trim(),
        role: contactRole?.trim() || 'POC',
      }
    }

    // If no deal selected, we assume creation of new entities
    if (!selectedDealId) {
      payload.newEntities = {
        organization: orgName ? { name: orgName } : undefined,
        deal: dealName ? { name: dealName, productTags } : undefined,
      }

      if (!dealName.trim()) {
        setError('Deal name is required when creating a new deal')
        setLoading(false)
        return
      }
    }

    try {
      const res = await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, action, payload }),
      })
      
      const data = await res.json().catch(() => null)
      
      if (!res.ok) {
        throw new Error(data?.error || `Server error (${res.status}): ${res.statusText}`)
      }
      
      if (!data) {
        throw new Error('Received an empty response from the server')
      }
      
      router.push('/deals')
      router.refresh()
    } catch (err: any) {
      console.error('Approval error:', err)
      setError(err.message || 'An unexpected error occurred during approval')
    } finally {
      setLoading(false)
    }
  }

  const InputLabel = ({ label }: { label: string }) => (
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
      {label}
    </label>
  )

  const SectionHeader = ({ icon: Icon, title, badge }: { icon: any, title: string, badge?: React.ReactNode }) => (
    <div className="flex items-center justify-between mb-10">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-gray-50 text-gray-400 rounded-2xl">
          <Icon size={18} />
        </div>
        <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">{title}</h2>
        {badge}
      </div>
    </div>
  )

  return (
    <div className="h-full">
      {/* Proposed Updates Section */}
      {(mode === 'all' || mode === 'proposed') && (
        <div className="flex flex-col h-full">
          <section className="sleek-card p-12 rounded-[40px] flex-1 flex flex-col overflow-hidden shadow-2xl shadow-black/5">
            <SectionHeader icon={Zap} title="Proposed Updates" />

            <form
              id={formId}
              className="space-y-8 overflow-y-auto flex-1 pr-4 scrollbar-hide"
              onSubmit={(e) => {
                e.preventDefault()
                handleApprove('edit_approve')
              }}
            >
              {loading && (
                <div className="sticky top-0 z-10 -mt-2 mb-2">
                  <div className="px-4 py-2 rounded-2xl bg-[#5551FF]/5 border border-[#5551FF]/10 text-[10px] font-black uppercase tracking-widest text-[#5551FF]">
                    Syncing to CRM...
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <InputLabel label="Organization" />
                  <div className="relative group">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#5551FF] transition-colors" size={18} />
                    <input 
                      type="text" 
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      disabled={loading}
                      className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-none rounded-[24px] text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:bg-white transition-all placeholder:text-gray-300 shadow-[0_4px_20px_rgb(0,0,0,0.02)]"
                      placeholder="Company name..."
                    />
                  </div>
                </div>

                <div>
                  <InputLabel label="Deal Name" />
                  <div className="relative group">
                    <FileText className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#5551FF] transition-colors" size={18} />
                    <input 
                      type="text" 
                      value={dealName}
                      onChange={(e) => setDealName(e.target.value)}
                      disabled={loading}
                      className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-none rounded-[24px] text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:bg-white transition-all placeholder:text-gray-300 shadow-[0_4px_20px_rgb(0,0,0,0.02)]"
                      placeholder="Project/Deal name..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <InputLabel label="Service Tags" />
                <div className="flex flex-wrap gap-3">
                  {AVAILABLE_PRODUCT_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      disabled={loading}
                      className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border-none transition-all ${
                        productTags.includes(tag)
                          ? 'bg-[#5551FF] text-white shadow-lg shadow-[#5551FF]/20 scale-[1.02]'
                          : 'bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <InputLabel label="Primary Contact" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#5551FF] transition-colors" size={18} />
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      disabled={loading}
                      className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-none rounded-[24px] text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:bg-white transition-all placeholder:text-gray-300 shadow-[0_4px_20px_rgb(0,0,0,0.02)]"
                      placeholder="Name..."
                    />
                  </div>
                  <input
                    type="text"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    disabled={loading}
                    className="w-full px-6 py-4 bg-gray-50/50 border-none rounded-[24px] text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:bg-white transition-all placeholder:text-gray-300 shadow-[0_4px_20px_rgb(0,0,0,0.02)]"
                    placeholder="Role (e.g. POC)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <InputLabel label="Key Decision" />
                  <textarea 
                    value={lastDecision}
                    onChange={(e) => setLastDecision(e.target.value)}
                    disabled={loading}
                    rows={2}
                    className="w-full px-6 py-4 bg-gray-50/50 border-none rounded-[24px] text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:bg-white transition-all resize-none placeholder:text-gray-300 shadow-[0_4px_20px_rgb(0,0,0,0.02)]"
                    placeholder="What was agreed?"
                  />
                </div>

                <div>
                  <InputLabel label="Next Milestone" />
                  <textarea 
                    value={nextStep}
                    onChange={(e) => setNextStep(e.target.value)}
                    disabled={loading}
                    rows={2}
                    className="w-full px-6 py-4 bg-gray-50/50 border-none rounded-[24px] text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:bg-white transition-all resize-none placeholder:text-gray-300 shadow-[0_4px_20px_rgb(0,0,0,0.02)]"
                    placeholder="What follows?"
                  />
                </div>
              </div>

              <div>
                <InputLabel label="Capture Summary" />
                <textarea 
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  disabled={loading}
                  rows={3}
                  className="w-full px-6 py-4 bg-gray-50/50 border-none rounded-[24px] text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:bg-white transition-all resize-none placeholder:text-gray-300 shadow-[0_4px_20px_rgb(0,0,0,0.02)]"
                  placeholder="Key takeaways..."
                />
              </div>
            </form>
          </section>

          {error && (
            <div className="flex items-center gap-4 p-5 bg-red-50 border-none rounded-[24px] text-[11px] font-black text-red-600 uppercase tracking-widest animate-in fade-in slide-in-from-top-2 mt-6 shadow-xl shadow-red-500/5">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Entity Matching Section */}
      {(mode === 'all' || mode === 'matching') && (
        <div className="flex flex-col h-full">
          <section className="sleek-card p-12 rounded-[40px] flex flex-col h-full overflow-hidden shadow-2xl shadow-black/5">
            <SectionHeader 
              icon={Zap} 
              title="Entity Matching" 
              badge={
                <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">
                  {initialProposal.candidates.length} Detected
                </span>
              }
            />
            
            <div className="flex-1 space-y-5 overflow-y-auto min-h-0 pr-4 scrollbar-hide">
              {initialProposal.candidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mb-8 border border-gray-100/50">
                    <Zap size={32} className="text-gray-200" />
                  </div>
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">No matching entities</h3>
                  <p className="text-xs text-gray-300 font-bold max-w-[240px] leading-relaxed uppercase tracking-tight">
                    A fresh CRM record will be initialized.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {initialProposal.candidates.map((c) => (
                    <div 
                      key={c.dealId}
                      onClick={() => setSelectedDealId(c.dealId)}
                      className={`group p-8 rounded-[32px] border-none transition-all cursor-pointer ${
                        selectedDealId === c.dealId 
                          ? 'bg-[#5551FF]/5 ring-2 ring-[#5551FF] shadow-2xl scale-[1.02]' 
                          : 'bg-gray-50/50 hover:bg-white hover:shadow-2xl transition-all'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-6">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="text-[10px] font-black text-[#5551FF] uppercase tracking-widest bg-[#5551FF]/5 px-3 py-1 rounded-full border border-[#5551FF]/10">
                              {c.organizationName || 'No Org'}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                              c.confidence > 0.8 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {(c.confidence * 100).toFixed(0)}% Match
                            </span>
                          </div>
                          <h3 className="font-black text-gray-900 truncate text-base tracking-tight">{c.dealName}</h3>
                        </div>
                        <div className={`p-2 rounded-full transition-all ${
                          selectedDealId === c.dealId ? 'bg-[#5551FF] text-white shadow-lg' : 'bg-white text-gray-200 border border-gray-100 shadow-sm'
                        }`}>
                          <CheckCircle2 size={16} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

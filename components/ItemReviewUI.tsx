'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  Zap, 
  User, 
  CheckCircle2, 
  Plus, 
  FileText, 
  AlertCircle,
  Loader2,
  ArrowRight
} from 'lucide-react'

interface ProposedData {
  suggestedDealName?: string
  suggestedOrganizationName?: string
  productTags?: string[]
  contacts?: Array<{ name: string; role?: string }>
  lastDecision?: string
  nextStep?: string
  rollingSummary?: string
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
  initialProposal 
}: { 
  itemId: string
  initialProposal: {
    proposed: ProposedData
    candidates: Candidate[]
  }
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
  const [selectedDealId, setSelectedDealId] = useState<string | null>(
    initialProposal.candidates.length > 0 ? initialProposal.candidates[0].dealId : null
  )

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
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
      {label}
    </label>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: AI Extraction & Editing */}
      <div className="space-y-6">
        <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Zap size={18} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">AI Proposed Updates</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <InputLabel label="Organization" />
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  placeholder="Company name..."
                />
              </div>
            </div>

            <div>
              <InputLabel label="Deal Name" />
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  placeholder="Project/Deal name..."
                />
              </div>
            </div>

            <div>
              <InputLabel label="Product Tags" />
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_PRODUCT_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      productTags.includes(tag)
                        ? 'bg-[var(--primary-blue)] text-white border-[var(--primary-blue)] shadow-md'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <InputLabel label="Primary Contact (POC)" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    placeholder="Name..."
                  />
                </div>
                <input
                  type="text"
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  placeholder="Role (e.g. POC)"
                />
              </div>
            </div>

            <div>
              <InputLabel label="Last Decision" />
              <textarea 
                value={lastDecision}
                onChange={(e) => setLastDecision(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
                placeholder="What was agreed?"
              />
            </div>

            <div>
              <InputLabel label="Next Step" />
              <input 
                type="text" 
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                placeholder="What follows?"
              />
            </div>

            <div>
              <InputLabel label="Rolling Summary" />
              <textarea 
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
                placeholder="Key takeaways..."
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 font-bold animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={() => handleApprove('edit_approve')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-4 px-6 rounded-2xl font-black text-sm hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <CheckCircle2 size={20} />
          )}
          <span>{loading ? 'Updating CRM...' : 'Approve & Update CRM'}</span>
        </button>
      </div>

      {/* Right Column: Record Matching */}
      <div className="space-y-6 h-full">
        <section className="bg-[#F8F9F8] p-8 rounded-[32px] border border-gray-100 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900">Matching Records</h2>
            <div className="px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">
              {initialProposal.candidates.length} Found
            </div>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto">
            {initialProposal.candidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                  <Zap size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-bold mb-1">No matches found</p>
                <p className="text-xs text-gray-400 max-w-[200px]">We'll create a new deal and organization for you.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {initialProposal.candidates.map((c) => (
                  <div 
                    key={c.dealId}
                    onClick={() => setSelectedDealId(c.dealId)}
                    className={`group p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedDealId === c.dealId 
                        ? 'bg-white border-gray-900 shadow-xl scale-[1.02]' 
                        : 'bg-white border-transparent hover:border-gray-200 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                            {c.organizationName || 'No Org'}
                          </span>
                          <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded">
                            {(c.confidence * 100).toFixed(0)}% Match
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 truncate">{c.dealName}</h3>
                      </div>
                      {selectedDealId === c.dealId && (
                        <div className="p-1 bg-gray-900 text-white rounded-full animate-in zoom-in">
                          <CheckCircle2 size={14} />
                        </div>
                      )}
                    </div>
                    {c.evidenceSnippet && (
                      <div className="mt-3 flex gap-2">
                        <div className="w-1 bg-gray-100 rounded-full" />
                        <p className="text-xs text-gray-500 italic leading-relaxed">
                          "{c.evidenceSnippet}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="pt-4 mt-4 border-t border-gray-200/50">
              <div 
                onClick={() => setSelectedDealId(null)}
                className={`group p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-between ${
                  selectedDealId === null 
                    ? 'bg-white border-gray-900 shadow-xl' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl transition-colors ${
                    selectedDealId === null ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                  }`}>
                    <Plus size={20} />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${selectedDealId === null ? 'text-gray-900' : 'text-gray-500'}`}>
                      Create as new deal
                    </p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                      New record
                    </p>
                  </div>
                </div>
                {selectedDealId === null && (
                  <ArrowRight size={18} className="text-gray-900 animate-in slide-in-from-left-2" />
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

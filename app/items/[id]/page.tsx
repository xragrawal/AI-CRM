'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Quote, Sparkles, AlertCircle, Zap, CheckCircle2 } from 'lucide-react'
import ItemReviewUI from '@/components/ItemReviewUI'

export default function ItemReviewPage() {
  const { id } = useParams()
  const [item, setItem] = useState<any>(null)
  const [proposalResult, setProposalResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null)
  const fetchedForIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof id !== 'string') return
    if (fetchedForIdRef.current === id) return
    fetchedForIdRef.current = id

    async function fetchData() {
      try {
        // Fetch item
        const itemRes = await fetch(`/api/items/${id}`)
        if (!itemRes.ok) throw new Error('Item not found')
        const itemData = await itemRes.json()
        setItem(itemData.item)

        // Fetch proposal
        const propRes = await fetch(`/api/items/${id}/proposal`, { cache: 'no-store' })
        const propData = await propRes.json()
        if (!propRes.ok) {
          setProposalResult({
            error: propData.error ?? 'Failed to generate proposal',
            details: propData.details ?? null,
          })
        } else {
          setProposalResult({ proposal: propData.proposal ?? null })
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!item) return notFound()

  const reviewFormId = 'item-review-proposed-form'

  return (
    <div className="flex flex-col h-full max-w-[1600px] mx-auto px-4 pb-10">
      {/* Header Info */}
      <div className="flex flex-col gap-2 mb-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 shadow-sm border border-transparent hover:border-gray-100">
            <ArrowLeft size={18} />
          </Link>
          <span className="text-xs font-black text-[#5551FF] uppercase tracking-widest bg-[#5551FF]/5 px-3 py-1 rounded-lg border border-[#5551FF]/10">
            Intelligence
          </span>
        </div>
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">
          Verify <span className="text-[#5551FF]">Extraction</span>
        </h2>
        <div className="flex items-center gap-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Captured {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
            item.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
            item.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' : 
            'bg-[#5551FF]/10 text-[#5551FF] border-[#5551FF]/20'
          }`}>
            {item.status}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch h-[650px]">
          {/* Column 1: Raw Input */}
          <div className="flex flex-col h-full">
            <section className="sleek-card rounded-[40px] overflow-hidden flex-1 flex flex-col shadow-2xl shadow-black/5">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white border border-gray-100 text-[#5551FF] rounded-xl shadow-sm">
                    <Quote size={20} />
                  </div>
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Raw Context</h3>
                </div>
              </div>
              <div className="p-8 overflow-y-auto flex-1 scrollbar-hide">
                <div className="space-y-8">
                  <div className="w-full">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Original text</p>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4">
                      <p className="text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">{item.rawText}</p>
                    </div>
                  </div>

                  {proposalResult?.proposal?.proposed?.exclusions && (
                    <div className="flex justify-start">
                      <div className="max-w-[95%] bg-amber-50 rounded-[32px] border border-amber-100 p-8">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-white rounded-xl shrink-0 border border-amber-100 shadow-sm">
                            <Zap size={20} className="text-amber-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">System Notice</p>
                            <p className="text-sm text-amber-800 font-bold leading-relaxed">System entities filtered for data integrity.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Column 2: Proposed Updates */}
          <div className="flex flex-col h-full">
            {proposalResult?.error ? (
              <div className="sleek-card rounded-[40px] p-12 flex-1 flex flex-col items-center justify-center text-center shadow-2xl shadow-black/5 border border-red-100 h-full">
                <AlertCircle size={40} className="text-red-500 mb-6" />
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-3">Extraction Failed</h3>
                <p className="text-sm text-gray-400 font-bold max-w-xs leading-relaxed">{proposalResult.error}</p>
              </div>
            ) : proposalResult?.proposal ? (
              <ItemReviewUI 
                itemId={id as string} 
                initialProposal={proposalResult.proposal} 
                mode="proposed"
                formId={reviewFormId}
                selectedDealId={selectedDealId}
                onSelectDealId={setSelectedDealId}
              />
            ) : (
              <div className="sleek-card rounded-[40px] p-12 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl shadow-black/5 h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-[#5551FF]/5 to-transparent" />
                <div className="relative flex flex-col items-center">
                  <div className="w-24 h-24 bg-white text-[#5551FF] rounded-[36px] flex items-center justify-center mb-8 shadow-xl border border-gray-100 animate-pulse">
                    <Sparkles size={40} />
                  </div>
                  <h3 className="text-base font-black text-gray-900 uppercase tracking-widest mb-3">Intelligence engine</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Processing Cluster...</p>
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Matching Records */}
          <div className="flex flex-col h-full">
            {!loading && item && proposalResult?.proposal ? (
              <ItemReviewUI 
                itemId={id as string} 
                initialProposal={proposalResult.proposal} 
                mode="matching"
                selectedDealId={selectedDealId}
                onSelectDealId={setSelectedDealId}
              />
            ) : (
              <div className="sleek-card rounded-[40px] p-12 flex-1 border border-gray-50 flex items-center justify-center text-center opacity-40 shadow-sm h-full">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
                    <Zap size={28} className="text-gray-300" />
                  </div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Syncing match engine</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {proposalResult?.proposal && !proposalResult?.error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div />
            <button
              type="submit"
              form={reviewFormId}
              className="w-full flex items-center justify-center gap-3 bg-[#5551FF] text-white py-5 px-8 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#5551FF]/20"
            >
              <CheckCircle2 size={18} />
              Verify & Sync to CRM
            </button>
            <div />
          </div>
        )}
      </div>
    </div>
  )
}

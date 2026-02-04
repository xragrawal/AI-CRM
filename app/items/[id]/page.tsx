'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, MessageSquare, Quote, Sparkles, AlertCircle } from 'lucide-react'
import ItemReviewUI from '@/components/ItemReviewUI'

export default function ItemReviewPage() {
  const { id } = useParams()
  const [item, setItem] = useState<any>(null)
  const [proposalResult, setProposalResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

  return (
    <div className="flex flex-col h-full bg-[#F8F9F8]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
            <span>Inbox</span>
            <span>/</span>
            <span className="text-gray-900">Review Capture</span>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
              <MessageSquare size={40} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-gray-900">Verify AI Extraction</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  item.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' : 
                  item.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' : 
                  'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  {item.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-tight">
                <Clock size={16} />
                <span>Captured {new Date(item.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Raw Content Section */}
            <div className="xl:col-span-1">
              <section className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm h-full max-h-[calc(100vh-250px)] flex flex-col">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Raw Input</h2>
                  <Quote size={18} className="text-gray-200" />
                </div>
                <div className="p-8 overflow-auto flex-1 bg-gray-50/30">
                  <pre className="whitespace-pre-wrap font-medium text-sm text-gray-600 leading-relaxed">
                    {item.rawText}
                  </pre>
                </div>
              </section>
            </div>

            {/* AI UI Section */}
            <div className="xl:col-span-2">
              {proposalResult?.error ? (
                <div className="bg-white border border-red-100 rounded-[32px] p-10 shadow-sm">
                  <div className="flex items-center gap-3 text-red-600 mb-4">
                    <AlertCircle size={24} />
                    <h2 className="text-xl font-bold">AI proposal failed</h2>
                  </div>
                  <p className="text-gray-600 font-medium">{proposalResult.error}</p>
                  {proposalResult.details && (
                    <div className="mt-6 p-6 bg-gray-50 border border-gray-100 rounded-2xl">
                      <pre className="text-xs text-gray-500 whitespace-pre-wrap font-mono">
                        {String(proposalResult.details)}
                      </pre>
                    </div>
                  )}
                  <p className="mt-8 text-sm text-gray-400 font-medium">
                    Please ensure <code>GEMINI_API_KEY</code> is correctly configured in your environment.
                  </p>
                </div>
              ) : proposalResult?.proposal ? (
                <ItemReviewUI itemId={id as string} initialProposal={proposalResult.proposal} />
              ) : (
                <div className="bg-white border border-gray-100 rounded-[32px] p-20 text-center shadow-sm">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 animate-pulse" />
                      <div className="relative p-6 bg-blue-50 text-blue-600 rounded-3xl">
                        <Sparkles size={48} className="animate-bounce" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing with AI</h3>
                    <p className="text-gray-500 font-medium max-w-xs">Our AI is extracting structured data from your input. This will only take a moment.</p>
                    
                    <div className="mt-10 w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full animate-progress origin-left" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


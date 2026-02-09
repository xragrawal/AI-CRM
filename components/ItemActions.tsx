'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { CheckCircle2, XCircle, Clock, ChevronDown } from 'lucide-react'

type Action = 'approve' | 'edit_approve' | 'reject' | 'defer'
const REJECT_REASONS = ['duplicate', 'invalid'] as const

const SUCCESS_MSG_DURATION = 2500

export default function ItemActions({ itemId }: { itemId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<(typeof REJECT_REASONS)[number]>('duplicate')
  const router = useRouter()

  async function handleAction(action: Action, payload: Record<string, unknown> = {}) {
    setError(null)
    setSuccessMsg(null)
    setLoading(true)
    try {
      const res = await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, action, payload }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Request failed')
        return
      }
      const msg = action === 'approve' || action === 'edit_approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Deferred'
      setSuccessMsg(msg)
      setTimeout(() => setSuccessMsg(null), SUCCESS_MSG_DURATION)
      if (action === 'defer') {
        setTimeout(() => router.push('/inbox'), 800)
        return
      }
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 mt-8 pt-8 border-t border-gray-100">
      {error && (
        <p className="text-xs font-black text-red-600 uppercase tracking-widest bg-red-50 px-4 py-2 rounded-lg border border-red-100" role="alert">
          {error}
        </p>
      )}
      {successMsg && (
        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100" role="status">
          {successMsg}
        </p>
      )}
      <div className="flex flex-wrap gap-4 items-center">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction('approve', {})}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/10"
        >
          <CheckCircle2 size={18} />
          Approve
        </button>
        <div className="flex items-center gap-0">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleAction('reject', { reason: rejectReason })}
            className="flex items-center gap-2 px-6 py-3 rounded-l-2xl bg-red-600 text-white font-black text-[11px] uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-600/10 border-r border-red-500/30"
          >
            <XCircle size={18} />
            Reject
          </button>
          <div className="relative group">
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value as (typeof REJECT_REASONS)[number])}
              className="appearance-none pl-4 pr-10 py-3 bg-red-600 text-white font-black text-[11px] uppercase tracking-widest rounded-r-2xl border-none outline-none cursor-pointer hover:bg-red-700 transition-all shadow-lg shadow-red-600/10"
              disabled={loading}
            >
              {REJECT_REASONS.map((r) => (
                <option key={r} value={r} className="bg-white text-gray-900">
                  {r}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
          </div>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction('defer', {})}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-500 font-black text-[11px] uppercase tracking-widest hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <Clock size={18} />
          Defer to Inbox
        </button>
      </div>
    </div>
  )
}

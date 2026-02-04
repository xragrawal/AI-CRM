'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-200">
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {successMsg && (
        <p className="text-sm text-green-600 font-medium" role="status">
          {successMsg}
        </p>
      )}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction('approve', {})}
          className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Approve
        </button>
        <span className="flex items-center gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleAction('reject', { reason: rejectReason })}
            className="px-4 py-2 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reject
          </button>
          <select
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value as (typeof REJECT_REASONS)[number])}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
            disabled={loading}
          >
            {REJECT_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </span>
        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction('defer', {})}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Defer
        </button>
      </div>
    </div>
  )
}

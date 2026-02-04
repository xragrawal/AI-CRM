'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, Loader2, AlertCircle } from 'lucide-react'

export default function LinkDealButton({
  itemId,
  dealId,
}: {
  itemId: string
  dealId: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleClick() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          action: 'edit_approve',
          payload: { dealId },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to link')
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
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={loading}
        onClick={handleClick}
        className={`
          flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all
          ${loading 
            ? 'bg-gray-100 text-gray-400' 
            : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm border border-blue-100 hover:border-blue-600'
          }
        `}
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Link2 size={12} />
        )}
        <span>{loading ? 'Linking' : 'Link Deal'}</span>
      </button>
      {error && (
        <span className="flex items-center gap-1 text-[10px] text-red-600 font-bold animate-in fade-in" role="alert">
          <AlertCircle size={10} />
          {error}
        </span>
      )}
    </div>
  )
}

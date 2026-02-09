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
          flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
          ${loading 
            ? 'bg-gray-100 text-gray-400' 
            : 'bg-[#5551FF]/10 text-[#5551FF] hover:bg-[#5551FF] hover:text-white shadow-sm border border-[#5551FF]/20 hover:border-[#5551FF]'
          }
        `}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Link2 size={16} />
        )}
        <span>{loading ? 'Linking' : 'Link Deal'}</span>
      </button>
      {error && (
        <span className="flex items-center gap-1.5 text-[11px] text-red-600 font-black uppercase tracking-widest animate-in fade-in" role="alert">
          <AlertCircle size={14} />
          {error}
        </span>
      )}
    </div>
  )
}

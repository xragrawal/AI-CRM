'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  Search, 
  Plus, 
  Filter, 
  Zap, 
  Users2,
  ArrowUpRight
} from 'lucide-react'

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const res = await fetch('/api/organizations')
        const data = await res.json()
        setOrganizations(data.organizations || [])
      } catch (error) {
        console.error('Failed to fetch organizations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrgs()
  }, [])

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.rollingSummary?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#5551FF]/10 text-[#5551FF] rounded-lg">
              <Building2 size={24} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Companies</h2>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Managing {filteredOrgs.length} partner organizations</p>
        </div>
        <button className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md">
          <Plus size={18} />
          <span>New Company</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#5551FF] transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#5551FF]/5 focus:border-[#5551FF] transition-all shadow-sm"
          />
        </div>
        <button className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-500 uppercase tracking-widest hover:border-gray-200 transition-all shadow-sm">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white border border-gray-100 rounded-[32px]">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white border border-dashed border-gray-200 rounded-[32px]">
             <Building2 size={24} className="text-gray-200 mb-2" />
             <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No companies found</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Company</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Summary</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Activity</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrgs.map((org) => (
                    <tr key={org.id} className="group hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <Link href={`/organizations/${org.id}`} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[#5551FF]/60 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-100">
                            <Building2 size={20} />
                          </div>
                          <span className="font-bold text-gray-900 text-sm group-hover:text-[#5551FF] transition-colors">
                            {org.name}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs text-gray-500 font-bold truncate max-w-xs uppercase tracking-tight">
                          {org.rollingSummary || 'No summary available'}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100/50">
                            <Zap size={14} className="text-emerald-600" />
                            <span className="text-xs font-black text-emerald-700">{org._count?.deals || 0}</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100/50">
                            <Users2 size={14} className="text-blue-600" />
                            <span className="text-xs font-black text-blue-700">{org._count?.contacts || 0}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                            {new Date(org.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                          <ArrowUpRight size={14} className="text-gray-200 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

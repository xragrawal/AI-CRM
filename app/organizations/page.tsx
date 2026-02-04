'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  Search, 
  Plus, 
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  ChevronDown,
  Zap,
  Users2
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
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl text-base font-bold text-gray-600 hover:bg-gray-50 cursor-pointer">
            <Building2 size={20} className="text-gray-400" />
            <span>All Companies</span>
            <ChevronDown size={18} className="text-gray-300" />
          </div>

          <div className="flex items-center gap-8">
            <button className="flex items-center gap-3 text-base font-bold text-gray-500 hover:text-gray-900 px-3 py-2">
              <Filter size={20} className="text-gray-400" />
              <span>Filter</span>
            </button>
            <button className="flex items-center gap-3 text-base font-bold text-gray-500 hover:text-gray-900 px-3 py-2">
              <ArrowUpDown size={20} className="text-gray-400" />
              <span>Sort</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-80"
              />
           </div>
           <button className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all shadow-md">
              <Plus size={24} />
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
             <div className="p-4 bg-gray-50 rounded-full mb-4">
                <Building2 size={32} className="text-gray-300" />
             </div>
             <p className="text-gray-500 font-bold">No organizations found</p>
          </div>
        ) : (
          <div className="px-8 py-6">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="pb-6 w-12">
                    <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-0" />
                  </th>
                  <th className="pb-6">Company</th>
                  <th className="pb-6">Summary</th>
                  <th className="pb-6">Stats</th>
                  <th className="pb-6">Last Update</th>
                  <th className="pb-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrgs.map((org) => (
                  <tr key={org.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-5">
                      <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-0" />
                    </td>
                    <td className="py-6">
                      <Link href={`/organizations/${org.id}`} className="flex items-center gap-4 group/link">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm border border-gray-200 shadow-sm">
                          <Building2 size={20} className="text-gray-400" />
                        </div>
                        <span className="font-bold text-gray-900 text-lg group-hover/link:text-blue-600 transition-colors">
                          {org.name}
                        </span>
                      </Link>
                    </td>
                    <td className="py-6">
                      <p className="text-base text-gray-500 font-medium truncate max-w-[400px]">
                        {org.rollingSummary || 'No summary available'}
                      </p>
                    </td>
                    <td className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                          <Zap size={18} className="text-green-500" />
                          <span>{org._count?.deals || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                          <Users2 size={18} className="text-blue-500" />
                          <span>{org._count?.contacts || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-6">
                       <span className="text-base text-gray-400 font-medium">
                         {new Date(org.updatedAt).toLocaleDateString()}
                       </span>
                    </td>
                    <td className="py-6 text-right">
                      <button className="text-gray-300 hover:text-gray-600 p-2 rounded-xl transition-colors">
                        <MoreHorizontal size={24} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

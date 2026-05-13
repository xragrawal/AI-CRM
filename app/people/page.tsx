'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users2, 
  Search, 
  Plus, 
  Mail, 
  Send as Telegram, 
  Building2, 
  Filter, 
  ArrowUpRight
} from 'lucide-react'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch('/api/contacts')
        const data = await res.json()
        setContacts(data.contacts || [])
      } catch (error) {
        console.error('Failed to fetch contacts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchContacts()
  }, [])

  const filteredContacts = contacts.filter(contact => 
    contact.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.organization?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.telegramHandle?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#5551FF]/10 text-[#5551FF] rounded-lg">
              <Users2 size={20} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">People</h2>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Managing {filteredContacts.length} key contacts</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#5551FF] transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#5551FF]/5 focus:border-[#5551FF] transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-500 uppercase tracking-widest hover:border-gray-200 transition-all shadow-sm">
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md">
            <Plus size={18} />
            <span>New Contact</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white border border-gray-100 rounded-[32px]">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white border border-dashed border-gray-200 rounded-[32px]">
             <Users2 size={24} className="text-gray-200 mb-2" />
             <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No contacts found</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Organization</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Info</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Deals</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="group hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <Link href={`/people/${contact.id}`} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[10px] border border-blue-100 shadow-sm group-hover:bg-white transition-all">
                            {contact.displayName.charAt(0)}
                          </div>
                          <span className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                            {contact.displayName}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-[#5551FF]/60 border border-gray-200/50">
                            <Building2 size={14} />
                          </div>
                          <span className="text-xs font-bold text-gray-700">{contact.organization?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5">
                          {contact.email && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                              <Mail size={12} className="text-gray-300" />
                              <span className="truncate max-w-[150px]">{contact.email}</span>
                            </div>
                          )}
                          {contact.telegramHandle && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                              <Telegram size={12} className="text-gray-300" />
                              <span>@{contact.telegramHandle}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-black uppercase tracking-tight">
                          {contact._count?.dealContacts || 0} Deals
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                            {new Date(contact.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
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

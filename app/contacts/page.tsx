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
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  ChevronDown
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
        // API returns { contacts: [...] }
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
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center justify-between sm:justify-start sm:gap-10">
          <div className="flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-bold text-gray-600 hover:bg-gray-50 cursor-pointer">
            <Users2 size={18} className="text-gray-400 sm:w-5 sm:h-5" />
            <span>All People</span>
            <ChevronDown size={16} className="text-gray-300 sm:w-4 sm:h-4" />
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
            <button className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-bold text-gray-500 hover:text-gray-900 px-3 py-2 sm:py-2.5">
              <Filter size={18} className="text-gray-400 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Filter</span>
            </button>
            <button className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-bold text-gray-500 hover:text-gray-900 px-3 py-2 sm:py-2.5">
              <ArrowUpDown size={18} className="text-gray-400 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Sort</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-80 pl-11 pr-4 py-2 sm:py-3 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />
           </div>
           <button className="p-2 sm:p-2.5 bg-gray-900 text-white rounded-xl sm:rounded-2xl hover:bg-gray-800 transition-all shadow-md flex-shrink-0">
              <Plus size={20} className="sm:w-6 sm:h-6" />
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 sm:py-12">
             <div className="p-3 sm:p-4 bg-gray-50 rounded-full mb-3 sm:mb-4">
                <Users2 size={24} className="text-gray-300 sm:w-8 sm:h-8" />
             </div>
             <p className="text-gray-500 font-bold text-sm sm:text-base">No contacts found</p>
          </div>
        ) : (
          <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
              {filteredContacts.map((contact) => (
                <div key={contact.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4">
                    <Link href={`/contacts/${contact.id}`} className="flex items-center gap-2 mb-3 group/link">
                      <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-100 shadow-sm">
                        {contact.displayName.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-900 text-sm group-hover/link:text-blue-600 transition-colors">
                        {contact.displayName}
                      </span>
                    </Link>
                    
                    {contact.organization?.name && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="w-5 h-5 rounded flex items-center justify-center overflow-hidden bg-gray-50">
                          <Building2 size={10} className="text-gray-400" />
                        </div>
                        <span className="text-xs font-medium text-gray-900">{contact.organization.name}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-1 mb-3">
                      {contact.email && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                          <Mail size={10} className="text-gray-400" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                      )}
                      {contact.telegramHandle && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                          <Telegram size={10} className="text-gray-400" />
                          <span>@{contact.telegramHandle}</span>
                        </div>
                      )}
                      {!contact.email && !contact.telegramHandle && (
                        <span className="text-xs text-gray-400 font-medium italic">No identifier</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black border border-gray-200 uppercase">
                        {contact._count?.dealContacts || 0} Deals
                      </span>
                      <button className="text-gray-300 hover:text-gray-600 p-1 rounded-lg transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    <th className="pb-4 sm:pb-6 w-12">
                      <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-0" />
                    </th>
                    <th className="pb-4 sm:pb-6">Name</th>
                    <th className="pb-4 sm:pb-6 hidden md:table-cell">Organization</th>
                    <th className="pb-4 sm:pb-6">Unique ID (Email/TG)</th>
                    <th className="pb-4 sm:pb-6 hidden md:table-cell">Deals</th>
                    <th className="pb-4 sm:pb-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-5 sm:py-6">
                        <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-0 w-4 h-4" />
                      </td>
                      <td className="py-5 sm:py-6">
                        <Link href={`/contacts/${contact.id}`} className="flex items-center gap-3 group/link">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-100 shadow-sm">
                            {contact.displayName.charAt(0)}
                          </div>
                          <span className="font-bold text-gray-900 text-sm sm:text-lg group-hover/link:text-blue-600 transition-colors">
                            {contact.displayName}
                          </span>
                        </Link>
                      </td>
                      <td className="py-5 sm:py-6 hidden md:table-cell">
                        <div className="flex items-center gap-3">
                          {contact.organization?.name ? (
                            <>
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                                <Building2 size={16} className="text-gray-400" />
                              </div>
                              <span className="text-sm sm:text-base font-medium text-gray-900">{contact.organization.name}</span>
                            </>
                          ) : (
                            <span className="text-sm sm:text-base text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 sm:py-6">
                        <div className="flex flex-col gap-1.5">
                          {contact.email && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 font-medium">
                              <Mail size={14} className="text-gray-400 sm:w-4 sm:h-4" />
                              <span className="truncate max-w-[150px] sm:max-w-[220px]">{contact.email}</span>
                            </div>
                          )}
                          {contact.telegramHandle && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 font-medium">
                              <Telegram size={14} className="text-gray-400 sm:w-4 sm:h-4" />
                              <span>@{contact.telegramHandle}</span>
                            </div>
                          )}
                          {!contact.email && !contact.telegramHandle && (
                            <span className="text-xs sm:text-sm text-gray-400 font-medium italic">No identifier</span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 sm:py-6 hidden md:table-cell">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs sm:text-sm font-black border border-gray-200 uppercase">
                          {contact._count?.dealContacts || 0} Deals
                        </span>
                      </td>
                      <td className="py-5 sm:py-6 text-right">
                        <button className="text-gray-300 hover:text-gray-600 p-2 rounded-xl transition-colors">
                          <MoreHorizontal size={20} className="sm:w-6 sm:h-6" />
                        </button>
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

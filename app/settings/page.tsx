'use client'

import { Settings, Shield, Bell, Zap, Database } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="h-full py-8 space-y-12">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gray-900 text-white rounded-2xl shadow-lg">
            <Settings size={28} />
          </div>
          <span className="text-base font-black text-gray-400 uppercase tracking-[0.2em]">Configuration</span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
          System <span className="text-gray-400">Settings</span>
        </h1>
      </div>

      <div className="max-w-4xl space-y-6">
        {[
          { label: 'Neural Provider', desc: 'Select your preferred AI intelligence engine', icon: <Zap size={22} />, value: 'Gemini 1.5 Pro' },
          { label: 'Data Privacy', desc: 'Manage how your CRM data is processed and stored', icon: <Shield size={22} />, value: 'Enterprise Encryption' },
          { label: 'Notifications', desc: 'Configure system alerts and intelligence briefs', icon: <Bell size={22} />, value: 'Active' },
          { label: 'Database', desc: 'Connection status and synchronization settings', icon: <Database size={22} />, value: 'Synchronized' },
        ].map((item, i) => (
          <div key={i} className="group bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-gray-900 group-hover:text-white transition-all border border-gray-100 shadow-sm">
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-1">{item.label}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.desc}</p>
              </div>
            </div>
            <div className="text-right px-6 py-2 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

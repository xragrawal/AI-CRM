'use client'

import { Settings, Shield, Bell, Zap, Database } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="h-full flex flex-col gap-5 py-4">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-1.5 bg-gray-900 text-white rounded-xl border border-gray-800">
            <Settings size={14} />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Configuration</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">
          System <span className="text-gray-400">Settings</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Neural Provider', desc: 'Select your preferred AI intelligence engine', icon: <Zap size={18} />, value: 'Gemini 1.5 Pro' },
          { label: 'Data Privacy', desc: 'Manage how your CRM data is processed and stored', icon: <Shield size={18} />, value: 'Enterprise Encryption' },
          { label: 'Notifications', desc: 'Configure system alerts and intelligence briefs', icon: <Bell size={18} />, value: 'Active' },
          { label: 'Database', desc: 'Connection status and synchronization settings', icon: <Database size={18} />, value: 'Synchronized' },
        ].map((item, i) => (
          <div key={i} className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-gray-900 group-hover:text-white transition-all border border-gray-100 shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-tight mb-1">{item.label}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.desc}</p>
              </div>
            </div>
            <div className="shrink-0 px-4 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

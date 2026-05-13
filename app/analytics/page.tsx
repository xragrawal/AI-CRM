'use client'

import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="h-full flex flex-col gap-5 py-4">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-1.5 bg-[#5551FF]/10 text-[#5551FF] rounded-xl border border-[#5551FF]/10">
            <BarChart3 size={14} />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Intelligence</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1.5">
          Performance <span className="text-[#5551FF]">Analytics</span>
        </h1>
        <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-2xl">
          Deep dive into your partnership pipeline, conversion rates, and ecosystem growth metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        {[
          { label: 'Pipeline Velocity', value: '12.4 days', icon: <TrendingUp size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Conversion Rate', value: '64%', icon: <PieChart size={18} />, color: 'text-[#5551FF]', bg: 'bg-[#5551FF]/5' },
          { label: 'Active Engagements', value: '28', icon: <Activity size={18} />, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className={`w-9 h-9 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center min-h-0 p-8">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-5 border border-gray-100">
          <BarChart3 size={28} className="text-gray-300" />
        </div>
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-2">Analytics Engine Offline</h3>
        <p className="text-gray-400 font-medium max-w-xs uppercase tracking-widest text-[10px] leading-relaxed">
          The advanced analytics module is under development. Real-time data visualization coming in the next release.
        </p>
      </div>
    </div>
  )
}

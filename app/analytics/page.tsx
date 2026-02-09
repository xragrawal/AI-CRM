'use client'

import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="h-full py-8 space-y-12">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-[#5551FF]/10 text-[#5551FF] rounded-2xl shadow-sm border border-[#5551FF]/10">
            <BarChart3 size={28} />
          </div>
          <span className="text-base font-black text-[#5551FF] uppercase tracking-[0.2em]">Intelligence</span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
          Performance <span className="text-[#5551FF]">Analytics</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl leading-relaxed font-medium">
          Deep dive into your partnership pipeline, conversion rates, and ecosystem growth metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Pipeline Velocity', value: '12.4 days', icon: <TrendingUp size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Conversion Rate', value: '64%', icon: <PieChart size={24} />, color: 'text-[#5551FF]', bg: 'bg-[#5551FF]/5' },
          { label: 'Active Engagements', value: '28', icon: <Activity size={24} />, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
              {stat.icon}
            </div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-20 h-20 bg-gray-50 rounded-[30px] flex items-center justify-center mb-8 border border-gray-100">
          <BarChart3 size={40} className="text-gray-300" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">Analytics Engine Offline</h3>
        <p className="text-gray-500 font-medium max-w-sm uppercase tracking-widest text-xs leading-relaxed">
          The advanced analytics module is currently under development. Real-time data visualization will be available in the next release.
        </p>
      </div>
    </div>
  )
}

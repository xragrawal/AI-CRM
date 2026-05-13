'use client'

import { useEffect, useState } from 'react'
import { 
  ArrowUpRight, 
  Clock, 
  Activity, 
  MoreVertical, 
  TrendingUp, 
  Plus,
  Filter,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts'

interface DashboardData {
  stats: {
    deals: number
    contacts: number
    organizations: number
  }
  recentActivity: Array<{
    id: string
    dealName: string | null
    rawText: string
    status: string
    createdAt: string
  }>
  topTags: Array<{
    name: string
    count: number
  }>
  growthRate: number
  velocityData: Array<{
    name: string
    value: number
  }>
  stageDistribution: Array<{
    stage: string | null
    count: number
  }>
}

const COLORS = ['#5551FF', '#E5E7EB']

export default function DashboardSummary() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard')
        if (res.ok) {
          const dashboardData = await res.json()
          setData(dashboardData)
        } else {
          setFetchError('Dashboard data unavailable')
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error)
        setFetchError('Network error loading dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-white rounded-[40px]"></div>
        ))}
      </div>
    )
  }

  if (fetchError) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
      <p className="text-sm font-bold text-red-500">{fetchError}</p>
      <button
        onClick={() => { setFetchError(null); setLoading(true); window.location.reload() }}
        className="text-[10px] font-black uppercase tracking-widest text-[#5551FF] hover:underline"
      >
        Retry
      </button>
    </div>
  )

  if (!data) return null

  // Use real velocity data from API or fallbacks
  const salesData = data.velocityData?.length > 0 ? data.velocityData : [
    { name: 'Sun', value: 0 },
    { name: 'Mon', value: 0 },
    { name: 'Tue', value: 0 },
    { name: 'Wed', value: 0 },
    { name: 'Thu', value: 0 },
    { name: 'Fri', value: 0 },
    { name: 'Sat', value: 0 },
  ]

  // Create revenue-like visualization from actual stats
  const revenueData = [
    { name: '1', value: data.stats.deals * 5 },
    { name: '2', value: data.stats.contacts * 2 },
    { name: '3', value: data.stats.organizations * 8 },
    { name: '4', value: data.stats.deals * 12 },
    { name: '5', value: data.stats.contacts * 4 },
    { name: '6', value: data.stats.deals * 15 },
    { name: '7', value: data.stats.organizations * 10 },
  ]

  const growthData = [
    { name: 'Growth', value: data.growthRate || 0 },
    { name: 'Remaining', value: Math.max(0, 100 - (data.growthRate || 0)) },
  ]

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[8px] font-black text-blue-600 shadow-sm">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span className="text-[10px] font-black text-[#5551FF] uppercase tracking-widest bg-[#5551FF]/5 px-2 py-0.5 rounded-lg border border-[#5551FF]/10">
              AI Agent Active
            </span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Command <span className="text-[#5551FF]">Center</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#5551FF] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-[#5551FF]/20 hover:scale-[1.02] transition-all">
            <Plus size={14} />
            <span>Add Widget</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-gray-100 hover:border-gray-200 transition-all">
            <Filter size={14} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style={{ gridTemplateRows: '1fr 1fr' }}>
        {/* Deal Stage Distribution Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-[#111111] group shadow-xl min-h-0">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
               <div className="w-[200%] h-[200%] rotate-12 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent blur-3xl animate-pulse" />
            </div>
          </div>
          
          <div className="relative h-full flex flex-col p-6">
            <div className="mb-4 shrink-0">
              <h2 className="text-lg font-black text-white mb-1">Intelligence</h2>
              <p className="text-gray-400 font-bold text-xs leading-relaxed">
                Pipeline across {data.stats.deals} active deal stages.
              </p>
            </div>
            
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-5">
                {data.stageDistribution.map(stage => {
                  const getStageLabel = (s: string | null) => {
                    if (s === 'qualified') return 'Qualified'
                    if (s === 'mou_signed') return 'MOU Signed'
                    if (s === 'integration') return 'Integration'
                    if (s === 'won') return 'Won'
                    if (s === 'lost_on_hold') return 'On Hold'
                    return 'Other'
                  }
                  const getStageColor = (s: string | null) => {
                    if (s === 'won') return '#10B981'
                    if (s === 'integration') return '#F59E0B'
                    if (s === 'mou_signed') return '#3B82F6'
                    if (s === 'lost_on_hold') return '#EF4444'
                    return '#5551FF'
                  }
                  const maxCount = Math.max(...data.stageDistribution.map(s => s.count), 1)
                  const percentage = (stage.count / maxCount) * 100
                  
                  return (
                    <div key={stage.stage || 'other'} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] group-hover:text-white transition-colors">
                          {getStageLabel(stage.stage)}
                        </span>
                        <span className="text-[10px] font-black text-white bg-white/10 px-2 py-0.5 rounded-md">
                          {stage.count}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,0,0,0.5)]" 
                          style={{ 
                            backgroundColor: getStageColor(stage.stage), 
                            width: `${percentage}%`,
                            boxShadow: `0 0 10px ${getStageColor(stage.stage)}40`
                          }} 
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Total Sales Card - Weekly Velocity */}
        <div className="lg:col-span-1 sleek-card p-5 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-[#5551FF] rounded-lg">
                <TrendingUp size={16} />
              </div>
              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Velocity</h3>
            </div>
            <button className="p-1 text-gray-300"><MoreVertical size={14} /></button>
          </div>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 8, 8]} 
                  fill="#F3F4F6"
                >
                  {salesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#FF6B6B' : '#F3F4F6'} />
                  ))}
                </Bar>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#9CA3AF' }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-900 text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-xl border border-white/10">
                          {payload[0].value} New
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement stats */}
        <div className="lg:col-span-1 sleek-card p-5 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-[#5551FF] rounded-lg">
                <Activity size={16} />
              </div>
              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Activity</h3>
            </div>
            <button className="p-1 text-gray-300"><MoreVertical size={14} /></button>
          </div>

          <div className="flex gap-4 mb-3 shrink-0">
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{data.stats.deals}</p>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Deals</span>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{data.stats.contacts}</p>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Contacts</span>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <Line type="monotone" dataKey="value" stroke="#5551FF" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity List - items from schema */}
        <div className="lg:col-span-2 sleek-card p-5 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-[#5551FF] rounded-lg">
                <Clock size={16} />
              </div>
              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Recent Activity</h3>
            </div>
            <button className="text-[10px] font-black text-[#5551FF] hover:underline uppercase tracking-widest transition-colors">View All</button>
          </div>

          <div className="space-y-3 flex-1 min-h-0 overflow-hidden">
            {data.recentActivity.length > 0 ? data.recentActivity.slice(0, 3).map((activity) => (
              <Link key={activity.id} href={`/items/${activity.id}`} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-[#5551FF] group-hover:text-white transition-all">
                    <Zap size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 leading-none mb-1 group-hover:text-[#5551FF] transition-colors">{activity.dealName || 'Record'}</h4>
                    <p className="text-[10px] font-medium text-gray-400 line-clamp-1 max-w-[150px]">{activity.rawText}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    activity.status === 'approved' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-gray-50 text-gray-400 border-gray-100'
                  }`}>
                    {activity.status === 'approved' ? 'Live' : 'Draft'}
                  </span>
                  <ArrowUpRight size={14} className="text-gray-300 group-hover:text-gray-900 transition-colors" />
                </div>
              </Link>
            )) : (
              <div className="py-6 text-center">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Growth Card - calculated win rate */}
        <div className="lg:col-span-1 sleek-card p-5 flex flex-col min-h-0">
          <div className="w-full flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-50 text-gray-400 rounded-lg">
                <TrendingUp size={14} />
              </div>
              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Win Rate</h3>
            </div>
            <button className="p-1 text-gray-300"><MoreVertical size={14} /></button>
          </div>

          <div className="relative flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={growthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={70}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {growthData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-black text-gray-900 leading-none">{data.growthRate}%</p>
            </div>
          </div>
        </div>

        {/* Tag Distribution Card */}
        <div className="lg:col-span-1 sleek-card p-5 flex flex-col min-h-0">
          <div className="w-full flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-50 text-gray-400 rounded-lg">
                <Filter size={14} />
              </div>
              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Tags</h3>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            {data.topTags && data.topTags.slice(0, 3).map((tag) => (
              <div key={tag.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-900">{tag.name}</span>
                  <span className="text-[10px] font-black text-[#5551FF]">{Math.round((tag.count / (data.stats.deals || 1)) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                  <div className="h-full bg-[#5551FF] rounded-full" style={{ width: `${(tag.count / (data.stats.deals || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

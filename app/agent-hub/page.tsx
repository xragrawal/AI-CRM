'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bot, FileText, DollarSign, TrendingUp, BarChart3,
  ArrowUpRight, Zap, Database, Upload, Users2, Building2,
  MessageSquare, Brain, Layers, ChevronDown
} from 'lucide-react'

const agents = [
  {
    id: 'mou',
    label: 'Create MoU Agent',
    desc: 'Generate a Memorandum of Understanding for any deal. Pulls party names, key contacts, scope, and commercial terms from the DB — or fill a custom template you upload.',
    icon: FileText,
    color: 'text-[#5551FF]',
    bg: 'bg-[#5551FF]/8',
    border: 'border-[#5551FF]/15',
    status: 'live',
    href: '/agent-hub/mou',
    dataSources: ['Deals DB', 'Contacts DB', 'Custom Template'],
  },
  {
    id: 'pricing',
    label: 'Pricing Proposal Agent',
    desc: 'Draft a structured pricing proposal with tiers, pilot terms, and volume caps based on deal stage, product tags, and historical decisions.',
    icon: DollarSign,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    status: 'coming_soon',
    href: '#',
    dataSources: ['Deals DB', 'Product Tags', 'Decision History'],
  },
  {
    id: 'deal-analysis',
    label: 'Deal Analysis Agent',
    desc: 'Analyse a deal\'s health — signals, blockers, stakeholder coverage, and the recommended next action based on full conversation history.',
    icon: TrendingUp,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    status: 'coming_soon',
    href: '#',
    dataSources: ['Deals DB', 'Contacts DB', 'Activity Items'],
  },
  {
    id: 'forecast',
    label: 'Forecast Agent',
    desc: 'Project pipeline close probability and expected revenue based on stage distribution, deal velocity, and win-rate patterns.',
    icon: BarChart3,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    status: 'coming_soon',
    href: '#',
    dataSources: ['All Deals', 'Stage History', 'Velocity Data'],
  },
]

const dataSources = [
  {
    icon: Zap,
    label: 'Deals',
    desc: 'Name, stage, rolling summary, last decision, next steps, product tags, and milestone dates.',
    color: 'text-[#5551FF]',
    bg: 'bg-[#5551FF]/8',
  },
  {
    icon: Users2,
    label: 'Contacts',
    desc: 'Display name, email, Telegram handle, org affiliation, and their role in each deal.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Building2,
    label: 'Organizations',
    desc: 'Company name, aliases, and the full set of associated deals and contacts.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: MessageSquare,
    label: 'Activity Items',
    desc: 'Approved conversation captures — meeting notes, emails, transcripts — with source type and deal linkage.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Upload,
    label: 'Collaterals',
    desc: 'User-uploaded documents and templates (MoU template, pricing deck, etc.) provided at agent runtime.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    icon: Brain,
    label: 'Learning Memory',
    desc: 'Past tag corrections and classification decisions that tune AI output for your specific vocabulary.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
]

export default function AgentHubPage() {
  const [howOpen, setHowOpen] = useState(false)

  return (
    <div className="h-full flex flex-col gap-6 py-4">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-1.5 bg-gray-900 text-white rounded-xl border border-gray-800">
            <Bot size={14} />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Automation</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1.5">
          Agent <span className="text-[#5551FF]">Hub</span>
        </h1>
        <p className="text-xs text-gray-400 font-medium max-w-2xl leading-relaxed">
          Purpose-built AI agents that read your live CRM data — deals, contacts, conversation history — and produce
          structured outputs like MoUs, proposals, and forecasts. Upload your own collaterals to override any default template.
        </p>
      </div>

      {/* How agents work — collapsible */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setHowOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-900 rounded-lg">
              <Layers size={13} className="text-white" />
            </div>
            <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">How Agents Work</h2>
          </div>
          <ChevronDown size={15} className={`text-gray-400 transition-transform duration-200 ${howOpen ? 'rotate-180' : ''}`} />
        </button>

        {howOpen && (
          <div className="px-5 pb-5 border-t border-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-5">
              {[
                {
                  step: '01',
                  title: 'Read Live DB Data',
                  desc: 'Each agent queries your CRM — fetching the selected deal, its org, linked contacts, rolling summary, and decision history in real time.',
                  color: 'text-[#5551FF]',
                  bg: 'bg-[#5551FF]/5',
                },
                {
                  step: '02',
                  title: 'Merge with Collaterals',
                  desc: 'You can upload documents — an MoU template, a pricing deck structure, a brand brief — that the agent uses as the output scaffold.',
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50',
                },
                {
                  step: '03',
                  title: 'Generate & Export',
                  desc: 'Gemini fills in the structure with deal-specific data. Preview the result, copy to clipboard, or download as a file.',
                  color: 'text-amber-600',
                  bg: 'bg-amber-50',
                },
              ].map(({ step, title, desc, color, bg }) => (
                <div key={step} className={`p-4 rounded-xl ${bg} border border-gray-100`}>
                  <span className={`text-[10px] font-black ${color} uppercase tracking-widest`}>{step}</span>
                  <p className="text-sm font-black text-gray-900 mt-1 mb-1.5">{title}</p>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Database size={11} />
                Available Data Sources
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {dataSources.map(({ icon: Icon, label, desc, color, bg }) => (
                  <div key={label} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className={`p-1.5 rounded-lg ${bg} shrink-0 mt-0.5`}>
                      <Icon size={12} className={color} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-gray-900 uppercase tracking-wide">{label}</p>
                      <p className="text-[9px] text-gray-400 font-medium leading-relaxed mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agent cards */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Available Agents</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => {
            const Icon = agent.icon
            const isLive = agent.status === 'live'
            const card = (
              <div className={`group bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col gap-4 ${
                isLive
                  ? 'border-gray-100 hover:shadow-md hover:border-[#5551FF]/20 cursor-pointer'
                  : 'border-gray-100 opacity-60 cursor-not-allowed'
              }`}>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${agent.bg} border ${agent.border}`}>
                    <Icon size={20} className={agent.color} />
                  </div>
                  <div className="flex items-center gap-2">
                    {isLive ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                        <Zap size={9} fill="currentColor" />
                        Live
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        Coming Soon
                      </span>
                    )}
                    {isLive && (
                      <ArrowUpRight size={16} className="text-gray-200 group-hover:text-[#5551FF] transition-colors" />
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-gray-900 tracking-tight mb-1">{agent.label}</h3>
                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed">{agent.desc}</p>
                </div>

                {/* Data source chips */}
                <div className="flex flex-wrap gap-1.5">
                  {agent.dataSources.map(src => (
                    <span key={src} className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-md text-[9px] font-black text-gray-500 uppercase tracking-wider">
                      <Database size={8} className="text-gray-400" />
                      {src}
                    </span>
                  ))}
                </div>
              </div>
            )

            return isLive ? (
              <Link key={agent.id} href={agent.href}>{card}</Link>
            ) : (
              <div key={agent.id}>{card}</div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

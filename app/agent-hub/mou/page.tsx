'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText, ChevronLeft, Columns2, ListOrdered,
  Loader2, Copy, Download, RefreshCw, Check,
  Building2, User, Zap, Sparkles, ChevronDown, Upload, Pencil
} from 'lucide-react'

type ViewMode = 'wizard' | 'split'
type Step = 1 | 2 | 3

interface Deal {
  id: string
  name: string
  stage: string
  rollingSummary: string | null
  lastDecision: string | null
  nextStep: string | null
  organization: { id: string; name: string } | null
  dealContacts: Array<{ role: string | null; contact: { id: string; displayName: string; email: string | null } }>
}

const STAGE_LABELS: Record<string, string> = {
  qualified: 'Qualified',
  mou_signed: 'MOU Signed',
  integration: 'Integration',
  won: 'Won',
  lost_on_hold: 'On Hold',
}

const GOVERNING_LAW_SUGGESTIONS = [
  'Delaware, USA', 'California, USA', 'New York, USA',
  'England & Wales', 'Singapore', 'India', 'Germany', 'France', 'UAE',
]

export default function MouAgentPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('wizard')
  const [step, setStep] = useState<Step>(1)

  // Data
  const [deals, setDeals] = useState<Deal[]>([])
  const [dealsLoading, setDealsLoading] = useState(true)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [dealOpen, setDealOpen] = useState(false)

  // Form fields
  const [scope, setScope] = useState('')
  const [duration, setDuration] = useState('60 days')
  const [startDate, setStartDate] = useState('')
  const [pricing, setPricing] = useState('')
  const [governingLaw, setGoverningLaw] = useState('Delaware, USA')
  const [contacts, setContacts] = useState('')

  // Generation
  const [generating, setGenerating] = useState(false)
  const [mou, setMou] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Template
  const [template, setTemplate] = useState<string>('')
  const [templateName, setTemplateName] = useState('Default Template')
  const [defaultTemplate, setDefaultTemplate] = useState('')

  // Inline editing (split view)
  const [editingField, setEditingField] = useState<string | null>(null)

  // Toast
  const [toast, setToast] = useState<string | null>(null)
  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  useEffect(() => {
    fetch('/api/deals')
      .then(r => r.json())
      .then(d => setDeals(d.deals || []))
      .catch(() => {})
      .finally(() => setDealsLoading(false))

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setStartDate(tomorrow.toISOString().split('T')[0])

    fetch('/templates/default-mou-template.txt')
      .then(r => r.text())
      .then(t => { setDefaultTemplate(t); setTemplate(t) })
      .catch(() => {})
  }, [])

  function selectDeal(deal: Deal) {
    setSelectedDeal(deal)
    setDealOpen(false)
    setScope(deal.rollingSummary || '')
    setPricing(deal.lastDecision || '')
    setContacts(
      deal.dealContacts
        .map(dc => `${dc.contact.displayName}${dc.role ? ` (${dc.role})` : ''}${dc.contact.email ? ` <${dc.contact.email}>` : ''}`)
        .join('\n')
    )
    setMou(null)
    setError(null)
  }

  function handleTemplateUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target?.result as string
      setTemplate(content)
      setTemplateName(file.name)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function generateMou() {
    if (!selectedDeal) return
    setGenerating(true)
    setError(null)
    setMou(null)
    try {
      const res = await fetch('/api/agent-hub/mou', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: selectedDeal.id,
          scope,
          duration,
          startDate,
          pricing,
          governingLaw,
          partyBContacts: contacts || undefined,
          template: template || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setMou(data.mou)
      if (viewMode === 'wizard') setStep(3)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  async function copyMou() {
    if (!mou) return
    await navigator.clipboard.writeText(mou)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadMou() {
    if (!mou) return
    const blob = new Blob([mou], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `MoU-${(selectedDeal?.name ?? 'draft').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Shared components ──────────────────────────────────────────────────────
  const DealSelector = () => (
    <div className="relative">
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Deal *</label>
      <button
        type="button"
        onClick={() => setDealOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-left focus:outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:border-[#5551FF]/30 transition-all"
      >
        {dealsLoading ? (
          <span className="text-gray-300 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading deals...</span>
        ) : selectedDeal ? (
          <div className="flex items-center gap-3 min-w-0">
            <Zap size={14} className="text-[#5551FF] shrink-0" />
            <span className="truncate text-gray-900">{selectedDeal.name}</span>
            <span className="shrink-0 px-2 py-0.5 bg-[#5551FF]/8 text-[#5551FF] rounded text-[9px] font-black uppercase tracking-wider">
              {STAGE_LABELS[selectedDeal.stage] ?? selectedDeal.stage}
            </span>
          </div>
        ) : (
          <span className="text-gray-300">Select a deal from your pipeline...</span>
        )}
        <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${dealOpen ? 'rotate-180' : ''}`} />
      </button>
      {dealOpen && (
        <div className="absolute z-20 top-full mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {deals.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-400 font-medium">No deals found</div>
          ) : deals.map(deal => (
            <button
              key={deal.id}
              type="button"
              onClick={() => selectDeal(deal)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-[#5551FF]/5 transition-colors ${selectedDeal?.id === deal.id ? 'bg-[#5551FF]/5' : ''}`}
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{deal.name}</p>
                {deal.organization && <p className="text-[10px] text-gray-400 font-medium">{deal.organization.name}</p>}
              </div>
              <span className="shrink-0 px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[9px] font-black text-gray-500 uppercase tracking-wider">
                {STAGE_LABELS[deal.stage] ?? deal.stage}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  const PartyInfo = () => selectedDeal ? (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Party A (You)</p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gray-900 flex items-center justify-center">
            <Zap size={12} className="text-white" fill="currentColor" />
          </div>
          <span className="text-xs font-black text-gray-900">Your Organization</span>
        </div>
      </div>
      <div className="p-3 bg-[#5551FF]/5 rounded-xl border border-[#5551FF]/10">
        <p className="text-[9px] font-black text-[#5551FF]/60 uppercase tracking-widest mb-2">Party B (From DB)</p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#5551FF]/10 flex items-center justify-center">
            <Building2 size={12} className="text-[#5551FF]" />
          </div>
          <span className="text-xs font-black text-gray-900 truncate">{selectedDeal.organization?.name ?? 'TBD'}</span>
        </div>
      </div>
      {selectedDeal.dealContacts.length > 0 && (
        <div className="col-span-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Key Contacts</p>
          <div className="flex flex-wrap gap-2">
            {selectedDeal.dealContacts.map(dc => (
              <div key={dc.contact.id} className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-blue-100 shadow-sm">
                <User size={10} className="text-blue-400" />
                <span className="text-[10px] font-bold text-gray-900">{dc.contact.displayName}</span>
                {dc.role && <span className="text-[9px] text-gray-400">· {dc.role}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  ) : null

  const TemplateSection = () => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">MoU Template</label>
        {templateName !== 'Default Template' && (
          <button
            type="button"
            onClick={() => { setTemplate(defaultTemplate); setTemplateName('Default Template') }}
            className="text-[9px] font-black text-[#5551FF] uppercase tracking-widest hover:underline"
          >
            Reset to default
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl min-w-0">
          <FileText size={12} className="text-[#5551FF] shrink-0" />
          <span className="text-[11px] font-bold text-gray-700 truncate">{templateName}</span>
          <span className="shrink-0 ml-auto text-[9px] text-gray-400 font-medium">{template ? `${template.split('\n').length} lines` : '—'}</span>
        </div>
        <label className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-600 uppercase tracking-widest hover:border-[#5551FF]/30 cursor-pointer transition-all">
          <Upload size={12} />
          Upload
          <input type="file" accept=".txt,.md" className="hidden" onChange={handleTemplateUpload} />
        </label>
      </div>
      <p className="text-[9px] text-gray-400 font-medium">
        Upload a .txt template with <code className="bg-gray-50 px-1 rounded">{'{{PLACEHOLDER}}'}</code> markers — AI fills them in.
      </p>
    </div>
  )

  // Wizard-mode form (always-open inputs)
  const FormFields = () => (
    <div className="space-y-3">
      {TemplateSection()}
      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
          Scope of Work
          {selectedDeal?.rollingSummary && <span className="ml-2 text-[#5551FF] normal-case font-medium tracking-normal">auto-filled</span>}
        </label>
        <textarea
          value={scope}
          onChange={e => setScope(e.target.value)}
          rows={3}
          placeholder="Describe the purpose and scope of this partnership..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:border-[#5551FF]/30 transition-all resize-none"
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Key Contacts (Party B)</label>
        <textarea
          value={contacts}
          onChange={e => setContacts(e.target.value)}
          rows={2}
          placeholder="One contact per line, e.g. Jane Smith (CTO) <jane@acme.com>"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:border-[#5551FF]/30 transition-all resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Pilot Duration</label>
          <input
            type="text"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="e.g. 60 days, 3 months"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:border-[#5551FF]/30 transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:border-[#5551FF]/30 transition-all"
          />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
          Pricing / Commercial Terms
          {selectedDeal?.lastDecision && <span className="ml-2 text-[#5551FF] normal-case font-medium tracking-normal">auto-filled</span>}
        </label>
        <input
          type="text"
          value={pricing}
          onChange={e => setPricing(e.target.value)}
          placeholder="e.g. $0.10/call, capped at $6K/month during pilot"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:border-[#5551FF]/30 transition-all"
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Governing Law</label>
        <input
          type="text"
          list="governing-law-list"
          value={governingLaw}
          onChange={e => setGoverningLaw(e.target.value)}
          placeholder="e.g. Delaware, USA"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:border-[#5551FF]/30 transition-all"
        />
        <datalist id="governing-law-list">
          {GOVERNING_LAW_SUGGESTIONS.map(l => <option key={l} value={l} />)}
        </datalist>
      </div>
    </div>
  )

  const MouOutput = () => mou ? (
    <div className="h-full flex flex-col min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#5551FF]/10 text-[#5551FF] rounded-lg"><FileText size={14} /></div>
          <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">MoU Draft</span>
          <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-black rounded-md uppercase tracking-wider">Generated</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setMou(null); if (viewMode === 'wizard') setStep(2) }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-gray-500 hover:text-gray-900 uppercase tracking-widest transition-colors"
          >
            <RefreshCw size={12} />Regenerate
          </button>
          <button
            onClick={copyMou}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black text-gray-700 hover:border-gray-200 transition-all uppercase tracking-widest"
          >
            {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={downloadMou}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-[10px] font-black hover:bg-gray-800 transition-all uppercase tracking-widest"
          >
            <Download size={12} />Download
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-mono">{mou}</pre>
      </div>
    </div>
  ) : generating ? (
    <div className="h-full flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-gray-100">
      <div className="p-3 bg-[#5551FF]/10 rounded-2xl">
        <Sparkles size={20} className="text-[#5551FF] animate-pulse" />
      </div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Generating MoU draft...</p>
    </div>
  ) : (
    <div className="h-full flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border-2 border-dashed border-gray-100">
      <div className="p-3 bg-gray-50 rounded-2xl"><FileText size={20} className="text-gray-300" /></div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">MoU preview will appear here</p>
    </div>
  )

  // ── WIZARD MODE ────────────────────────────────────────────────────────────
  const WizardView = () => (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center gap-0 mb-5 shrink-0">
        {(['Select Deal', 'Review & Edit', 'MoU Draft'] as const).map((label, i) => {
          const s = (i + 1) as Step
          const active = step === s
          const done = step > s
          return (
            <div key={label} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-[#5551FF] text-white shadow-md' : done ? 'text-emerald-600' : 'text-gray-300'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${active ? 'bg-white/20' : done ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                  {done ? <Check size={9} /> : s}
                </span>
                {label}
              </div>
              {i < 2 && <div className="w-6 h-px bg-gray-200 mx-1" />}
            </div>
          )
        })}
      </div>

      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          {DealSelector()}
          {selectedDeal && PartyInfo()}
          <div className="flex justify-end pt-2">
            <button onClick={() => setStep(2)} disabled={!selectedDeal}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 disabled:opacity-30 transition-all shadow-md">
              Select & Continue →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between shrink-0">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deal</p>
              <p className="text-sm font-black text-gray-900">{selectedDeal?.name}</p>
            </div>
            <button onClick={() => setStep(1)} className="text-[10px] font-black text-gray-400 hover:text-gray-700 uppercase tracking-widest transition-colors">← Change</button>
          </div>
          {selectedDeal && PartyInfo()}
          {FormFields()}
          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
          <div className="flex justify-end pt-2">
            <button onClick={generateMou} disabled={generating || !scope.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#5551FF] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#4440ee] disabled:opacity-30 transition-all shadow-md shadow-[#5551FF]/20">
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {generating ? 'Generating...' : 'Generate MoU'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex-1 min-h-0 flex flex-col">{MouOutput()}</div>
      )}
    </div>
  )

  // ── INLINE-EDIT ROW (split view) ───────────────────────────────────────────
  const InlineRow = ({
    fieldKey, label, value, placeholder, children,
  }: {
    fieldKey: string
    label: string
    value: string
    placeholder?: string
    children: React.ReactNode
  }) => {
    const editing = editingField === fieldKey
    return (
      <div className="flex flex-col gap-1 py-2 border-b border-gray-50 last:border-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
          {editing ? (
            <button type="button"
              onClick={() => { setEditingField(null); showToast('Saved') }}
              className="p-1 text-emerald-500 hover:text-emerald-700 transition-colors shrink-0" title="Save">
              <Check size={12} />
            </button>
          ) : (
            <button type="button"
              onClick={() => setEditingField(fieldKey)}
              className="p-1 text-gray-300 hover:text-gray-600 transition-colors shrink-0" title="Edit">
              <Pencil size={11} />
            </button>
          )}
        </div>
        {editing ? children : (
          <p className="text-xs font-medium text-gray-700 leading-relaxed line-clamp-2">
            {value || <span className="text-gray-300 italic">{placeholder ?? '—'}</span>}
          </p>
        )}
      </div>
    )
  }

  const SplitFormFields = () => (
    <div className="flex flex-col">
      {/* Template row */}
      <div className="flex flex-col gap-1 py-2 border-b border-gray-50">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Template</span>
          <div className="flex items-center gap-2">
            {templateName !== 'Default Template' && (
              <button type="button"
                onClick={() => { setTemplate(defaultTemplate); setTemplateName('Default Template') }}
                className="text-[9px] font-black text-[#5551FF] uppercase tracking-widest hover:underline">Reset</button>
            )}
            <label className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-700 transition-colors">
              <Upload size={10} />Upload
              <input type="file" accept=".txt,.md" className="hidden" onChange={handleTemplateUpload} />
            </label>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText size={10} className="text-[#5551FF] shrink-0" />
          <span className="text-xs font-medium text-gray-700 truncate">{templateName}</span>
          {template && <span className="ml-auto text-[9px] text-gray-400 shrink-0">{template.split('\n').length} lines</span>}
        </div>
      </div>

      <InlineRow fieldKey="scope" label="Scope of Work" value={scope} placeholder="Describe the scope...">
        <textarea value={scope} onChange={e => setScope(e.target.value)} rows={3} autoFocus
          className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:border-[#5551FF]/30 resize-none transition-all" />
      </InlineRow>

      <InlineRow fieldKey="contacts" label="Key Contacts (Party B)" value={contacts} placeholder="No contacts on deal">
        <textarea value={contacts} onChange={e => setContacts(e.target.value)} rows={2} autoFocus
          placeholder="One per line: Name (Role) <email>"
          className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:border-[#5551FF]/30 resize-none transition-all" />
      </InlineRow>

      <InlineRow fieldKey="duration" label="Pilot Duration" value={duration}>
        <input type="text" value={duration} onChange={e => setDuration(e.target.value)} autoFocus
          placeholder="e.g. 60 days, 3 months"
          className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:border-[#5551FF]/30 transition-all" />
      </InlineRow>

      <InlineRow fieldKey="startDate" label="Start Date" value={startDate}>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} autoFocus
          className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:border-[#5551FF]/30 transition-all" />
      </InlineRow>

      <InlineRow fieldKey="pricing" label="Pricing / Commercial Terms" value={pricing} placeholder="e.g. $0.10/call">
        <input type="text" value={pricing} onChange={e => setPricing(e.target.value)} autoFocus
          placeholder="e.g. $0.10/call, capped at $6K/month"
          className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:border-[#5551FF]/30 transition-all" />
      </InlineRow>

      <InlineRow fieldKey="governingLaw" label="Governing Law" value={governingLaw}>
        <>
          <input type="text" list="governing-law-split-list" value={governingLaw} onChange={e => setGoverningLaw(e.target.value)} autoFocus
            placeholder="e.g. Delaware, USA"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5551FF]/10 focus:border-[#5551FF]/30 transition-all" />
          <datalist id="governing-law-split-list">
            {GOVERNING_LAW_SUGGESTIONS.map(l => <option key={l} value={l} />)}
          </datalist>
        </>
      </InlineRow>
    </div>
  )

  // ── SPLIT MODE ─────────────────────────────────────────────────────────────
  const SplitView = () => (
    <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
      {/* Left panel — fixed width, scrolls independently, Generate button pinned at bottom */}
      <div className="w-[360px] shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-3">
          {DealSelector()}
          {selectedDeal && PartyInfo()}
          {selectedDeal && <SplitFormFields />}
          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        </div>
        <div className="shrink-0 p-4 border-t border-gray-100 bg-white">
          <button onClick={generateMou} disabled={!selectedDeal || generating || !scope.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#5551FF] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#4440ee] disabled:opacity-30 transition-all shadow-md shadow-[#5551FF]/20">
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {generating ? 'Generating...' : 'Generate MoU'}
          </button>
        </div>
      </div>
      {/* Right panel — fills remaining width, scrolls internally */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {MouOutput()}
      </div>
    </div>
  )

  return (
    <div className="h-full min-h-0 flex flex-col gap-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/agent-hub" className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="p-1.5 bg-[#5551FF]/10 text-[#5551FF] rounded-xl border border-[#5551FF]/10">
                <FileText size={13} />
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Agent Hub</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">
              Create <span className="text-[#5551FF]">MoU</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center bg-white border border-gray-100 rounded-xl p-1 shadow-sm gap-0.5">
          <button onClick={() => setViewMode('wizard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'wizard' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
            <ListOrdered size={13} />Wizard
          </button>
          <button onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'split' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
            <Columns2 size={13} />Split
          </button>
        </div>
      </div>

      {viewMode === 'wizard' ? WizardView() : SplitView()}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-[11px] font-bold shadow-xl pointer-events-none">
          <Check size={12} className="text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  )
}

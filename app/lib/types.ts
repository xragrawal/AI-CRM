/**
 * Core domain types for PersonalCRM
 * No DB, no logic — just data shapes
 *
 * CRM Hierarchy (per PRD):
 * - Organization (Company / Account)
 * - Contact (Person) — optionally linked to Organization
 * - Deal (Opportunity / Partnership / Project) — optionally linked to Organization + Contacts
 * - Conversation/Item — must link to a Deal
 *
 * Design Decisions:
 * - MVP always requires explicit user approval for any CRM state change
 * - No silent creation or updates
 * - Aliases are never auto-added
 */

export type SourceType = 'paste'

export type ItemStatus = 'proposed' | 'approved' | 'rejected' | 'inbox'

export interface Organization {
  id: string
  name: string
  aliases: string[]
  rollingSummary: string | null
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: string
  displayName: string
  aliases: string[]
  email?: string
  telegramHandle?: string
  xHandle?: string
  notes?: string
  rollingSummary?: string | null
  organizationId?: string | null
  createdAt: string
  updatedAt: string
}

export type DealStage = 'qualified' | 'mou_signed' | 'integration' | 'won' | 'lost_on_hold'

export interface Deal {
  id: string
  name: string
  aliases: string[]
  stage: DealStage
  lastDecision: string | null
  nextStep: string | null
  rollingSummary: string | null
  organizationId: string | null
  mouSignedAt: string | null
  integrationCompletedAt: string | null
  coMarketingCompletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DealContact {
  dealId: string
  contactId: string
  role?: string
}

export type ContactPreview = Pick<Contact, 'displayName' | 'email' | 'telegramHandle' | 'xHandle'>

export interface Item {
  id: string
  rawText: string
  sourceType: SourceType
  dealId: string | null
  status: ItemStatus
  reason?: string
  createdAt: string
}

export interface Candidate {
  dealId: string
  confidence: number
  evidenceSnippet: string
  dealSummary: string
  organizationName?: string
  contact?: ContactPreview
}

export interface Proposal {
  id: string
  itemId: string
  candidates: Candidate[]
  proposed: {
    lastDecision?: string
    nextStep?: string
    rollingSummary?: string
  }
}

export type DecisionAction =
  | 'approve'
  | 'edit_approve'
  | 'reject'
  | 'defer'
  | 'create_deal'
  | 'create_organization'
  | 'create_contact'
  | 'add_alias'

export interface DecisionLog {
  id: string
  itemId: string
  action: DecisionAction
  payload: Record<string, unknown>
  ts: string
}

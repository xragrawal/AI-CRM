# Project Context — Personal AI CRM

> **For AI assistants**: This file is the authoritative context document. Read this before scanning code.  
> Last updated: May 2026

---

## What This Is

A personal, single-user AI-powered CRM for capturing business conversations, emails, meeting notes, and files — and automatically extracting structured CRM records (deals, contacts, organizations) from unstructured text.

The core loop:
1. User pastes text / uploads file / fetches URL → raw input stored as an **Item**
2. AI (Gemini) extracts: deal, organization, contacts, product tags, decisions, next steps → stored as a **Proposal**
3. User reviews the proposal, edits if needed, and approves → entities created/linked in DB
4. System learns from corrections (ProductTagFeedback) to improve future extractions

Built for: Ravikant Agrawal (Billions / privado.id) to track partnership deals, integrations, and relationship intelligence.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) + TypeScript |
| UI | React 19, Tailwind CSS v4, Lucide React, Recharts |
| Database | SQLite (local dev) / Neon PostgreSQL (prod) via Prisma ORM |
| AI Primary | Google Gemini (`gemini-2.0-flash`) via `@google/generative-ai` |
| AI Fallback | OpenAI (`gpt-4o-mini`) via raw fetch |
| Intent routing | LangChain + `@langchain/google-genai` |
| Validation | Zod (config only) |
| Rate limiting | In-memory middleware (60 req/min per IP) |

---

## Project Structure

```
personal-crm/
├── src/app/
│   ├── api/                   # All REST endpoints (see API section)
│   ├── (pages)/               # Next.js page components
│   │   ├── page.tsx           # Dashboard (home)
│   │   ├── deals/             # Deals list + detail
│   │   ├── contacts/          # Contacts list + detail
│   │   ├── organizations/     # Orgs list + detail
│   │   ├── inbox/             # Deferred items
│   │   ├── items/[id]/        # Item detail + proposal review
│   │   ├── chat/              # Command center landing
│   │   ├── assistant/         # AI assistant page
│   │   ├── analytics/         # Analytics charts
│   │   ├── export/            # Export UI
│   │   └── settings/          # Settings
│   ├── components/            # React components
│   │   ├── AppShell.tsx       # Layout, sidebar, ⌘K overlay, search
│   │   ├── CaptureForm.tsx    # Paste / upload / URL tabs
│   │   ├── ItemReviewUI.tsx   # Proposal review & approval UI
│   │   ├── ChatInterface.tsx
│   │   ├── DashboardSummary.tsx
│   │   └── RecallQuery.tsx
│   └── lib/
│       ├── prisma.ts          # Singleton PrismaClient
│       ├── gemini.ts          # Gemini: extract, match deals, recall, chat
│       ├── openai.ts          # OpenAI: mirrors gemini.ts
│       ├── langchain.ts       # Intent detection (capture / recall / chat)
│       ├── config.ts          # Team member + own company exclusions
│       ├── learning.ts        # ProductTagFeedback context builder
│       ├── fileParser.ts      # File → text (csv, json, html, xml, md, txt)
│       ├── urlParser.ts       # URL → text (fetch + HTML strip)
│       ├── cache.ts           # In-memory GET cache (SHORT 30s, MEDIUM 5min)
│       └── types.ts           # TypeScript domain types
├── prisma/
│   ├── schema.prisma          # All 8 models
│   └── migrations/
├── middleware.ts              # Rate limiting
└── .env.example               # Required env vars
```

---

## Data Model

### Organization
```
id, name, aliases (JSON[]), rollingSummary, createdAt, updatedAt
→ has many: deals, contacts
```

### Contact
```
id, displayName, aliases (JSON[]), email, telegramHandle, xHandle,
notes, rollingSummary, organizationId (FK optional), createdAt, updatedAt
→ belongs to: organization
→ linked to deals via: DealContact
```

### Deal
```
id, name, aliases (JSON[]),
stage: 'qualified' | 'mou_signed' | 'integration' | 'won' | 'lost_on_hold',
productTags (JSON[]), lastDecision, nextStep, rollingSummary,
organizationId (FK optional),
mouSignedAt, integrationCompletedAt, coMarketingCompletedAt,
createdAt, updatedAt
→ has many: items, dealContacts
```

### DealContact (junction)
```
id, dealId (FK cascade), contactId (FK cascade), role, createdAt
unique: (dealId, contactId)
```

### Item (raw input record)
```
id, rawText, sourceType: 'paste'|'file_upload'|'url'|'chat',
dealId (FK, NO cascade — orphaning intentional),
status: 'proposed'|'approved'|'rejected'|'inbox',
reason, createdAt
→ has one: proposal
→ has many: decisionLogs
```

### Proposal (AI extraction — 1:1 with Item)
```
id, itemId (FK cascade unique), candidatesJson (JSON), proposedJson (JSON), createdAt
```

### DecisionLog (audit trail)
```
id, itemId (FK cascade), action: 'approve'|'edit_approve'|'reject'|'defer',
payload (JSON), ts
```

### ProductTagFeedback (learning system)
```
id, rawTextSnippet (≤500 chars), aiSuggestedTags (JSON[]), userFinalTags (JSON[]),
dealId, organizationId (optional FKs), createdAt
```

**Key schema invariants:**
- `Item.dealId` has **no cascade delete** — orphaned items are intentional, do not change this
- `Proposal` and `DealContact` cascade-delete with their parent
- `aliases`, `productTags`, `candidatesJson`, `proposedJson`, `payload` are JSON columns (SQLite has no array type) — always `JSON.parse()` before use
- Proposals are upserted — calling `/api/items/[id]/proposal` again regenerates with a fresh AI call

---

## API Routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/items` | Create item from pasted text |
| GET | `/api/items?status=...` | List items, optional status filter |
| GET | `/api/items/[id]` | Fetch single item + linked deal |
| POST | `/api/items/upload` | Upload file → parse → create item |
| POST | `/api/items/url` | Fetch URL → parse → create item |
| GET | `/api/items/[id]/proposal` | Generate/regenerate AI proposal |
| POST | `/api/deals` | Create deal |
| GET | `/api/deals?q=...` | Search/list deals |
| GET | `/api/deals/[id]` | Deal detail with org, contacts, last 10 items |
| PATCH | `/api/deals/[id]` | Update stage, summary, decisions, milestones |
| POST | `/api/contacts` | Create contact |
| GET | `/api/contacts?q=...` | Search contacts |
| GET | `/api/contacts/[id]` | Contact detail with deals |
| POST | `/api/organizations` | Create org |
| GET | `/api/organizations?q=...` | Search orgs |
| GET | `/api/organizations/[id]` | Org detail with deals + contacts |
| POST | `/api/decisions` | Approve/reject/defer item; create/link entities |
| POST | `/api/chat` | Unified AI command (capture / recall / chat) |
| GET | `/api/dashboard` | Stats, charts, active deals |
| POST | `/api/recall` | Natural-language CRM query |
| GET | `/api/export?format=json\|markdown` | Full data export |

### Key shapes

**GET /api/items/[id]/proposal** response:
```json
{
  "proposal": {
    "candidates": [{ "dealId", "dealName", "confidence", "evidence" }],
    "proposed": {
      "dealName", "organizationName",
      "contacts": [{ "name", "email", "role" }],
      "productTags", "lastDecision", "nextStep", "rollingSummary"
    }
  }
}
```

**POST /api/decisions** body:
```json
{
  "itemId": "...",
  "action": "approve | edit_approve | reject | defer",
  "dealId": "existing-id or null",
  "newDeal": { "name", "organizationId", "stage", "productTags", "lastDecision", "nextStep" },
  "newOrganization": { "name", "aliases" },
  "newContacts": [{ "displayName", "email", "organizationId" }],
  "reason": "only for reject/defer"
}
```

**POST /api/chat** (multipart FormData): `message, history, provider, action, file?, url?`  
→ `{ intent: 'capture'|'recall'|'chat', response: string, itemId?: string, proposal?: object }`

---

## Core User Flows

### 1. Capture → Review → Approve
1. Paste notes / upload file / provide URL in CaptureForm or ⌘K chat
2. `POST /api/items` → Item created (status: `proposed`)
3. `GET /api/items/[id]/proposal` → Gemini extracts entities; existing deals matched
4. `ItemReviewUI` shows candidates + editable proposed fields
5. `POST /api/decisions` with `approve` or `edit_approve` → Prisma transaction creates org → deal → contacts → DealContact links

### 2. Chat Command Center (⌘K)
- Global ⌘K opens overlay (AppShell listener)
- LangChain detects intent:
  - **capture** → creates Item + Proposal inline, returns itemId for review
  - **recall** → queries deals/items, Gemini answers in natural language
  - **chat** → general assistant, no side effects

### 3. Deal Lifecycle
Stages: `qualified → mou_signed → integration → won` (or `lost_on_hold`)  
Two views: Table (sortable) and Kanban (drag-to-update stage)  
Milestones: MOU date, integration complete, co-marketing complete

### 4. Inbox (Deferred Items)
Items with status `inbox` — deferred for later review without blocking the capture flow.

### 5. Natural Language Recall
POST `/api/recall` with `{ query: string }` → fetches top 50 deals + 30 items as context → Gemini returns plain-text answer + source deal names.

---

## AI Architecture

### Gemini — `src/lib/gemini.ts`
- `extractProposalFromText()` — JSON mode; truncates to 30k chars; applies exclusions + learning context
- `findCandidateDeals()` — confidence scores ≥ 0.3, top 5 matches; errors suppressed (returns `[]`)
- `answerRecallQuery()` — RAG-style answer with source citations
- `chatWithAssistant()` — general assistant with conversation history
- `safeJsonParse()` — balanced-scan JSON extractor for malformed Gemini output; **do not remove**

### LangChain — `src/lib/langchain.ts`
- `CRMChain` singleton; two tools: `capture_info`, `recall_info`
- `processIntent(message)` → `{ intent, content?, query?, response? }`
- Defaults to `'chat'` if no tool is called

### Learning System — `src/lib/learning.ts`
- Every approval logs `aiSuggestedTags` vs `userFinalTags` to `ProductTagFeedback`
- `getRelevantClassificationContext()` finds top 5 past corrections by keyword overlap (≥ 2 keywords)
- Context injected into Gemini prompt as few-shot examples

### Exclusion System — `src/lib/config.ts`
- `TEAM_MEMBERS`: Ravikant Agrawal + aliases — never persisted to Contacts
- `OWN_COMPANY`: Billions, privado.id, billions.network + aliases — never persisted to Orgs
- Still shown in UI for transparency; exclusion enforced at persist time in `/api/decisions`

---

## Environment Variables

```bash
# Database (defaults to SQLite if not set)
DATABASE_URL="file:./dev.db"
# Neon PostgreSQL for prod:
# DATABASE_URL="postgresql://USER:PWD@ep-xxx-pooler.REGION.aws.neon.tech/DB?sslmode=require"
# DIRECT_URL="postgresql://USER:PWD@ep-xxx.REGION.aws.neon.tech/DB?sslmode=require"

# AI — at least one required
GEMINI_API_KEY="..."
GEMINI_MODEL="gemini-2.0-flash"        # default if omitted

OPENAI_API_KEY="..."                   # optional fallback
OPENAI_MODEL="gpt-4o-mini"
OPENAI_BASE_URL="https://api.openai.com/v1"  # supports custom/local endpoints
```

---

## Product Tags

Four categories defined in `src/lib/learning.ts → PRODUCT_TAG_DEFINITIONS`:

| Tag | Meaning |
|-----|---------|
| KYA | Know Your Asset |
| Id/KYC | Identity / Know Your Customer |
| PoU | Proof of Usage |
| Others | Catch-all |

---

## Non-Obvious Patterns & Invariants

| Pattern | Detail |
|---------|--------|
| **Proposal upsert** | Re-calling the proposal endpoint regenerates with a fresh Gemini call |
| **No cascade on Item.dealId** | Orphaned items are intentional — do not add cascade |
| **Deal name fallback** | `generateFallbackDealName()` creates `"{org} - {topic}"` if Gemini returns no name |
| **JSON columns** | `aliases`, `productTags`, `candidatesJson` etc. are serialized JSON — always parse before use |
| **Candidate errors suppressed** | If deal matching fails, proposal still returns with empty `candidates` |
| **30k char truncation** | Hard limit in proposal endpoint to avoid Gemini timeouts |
| **In-memory cache & rate limit** | Both reset on server restart; fine for personal use |
| **No auth** | Single-user app — no login, no sessions |
| **No soft deletes** | Hard deletes everywhere; no `isDeleted` field |
| **`safeJsonParse`** | Gemini occasionally returns markdown-wrapped or truncated JSON; do not remove this |

---

## What Not To Do

- Do not add cascade delete to `Item.dealId`
- Do not persist contacts/orgs that match `isTeamMember()` or `isOwnCompany()` exclusion rules
- Do not remove `safeJsonParse` in `gemini.ts`
- Do not remove the 30k char text truncation in the proposal endpoint
- Do not add multi-user auth without adding row-level security to all Prisma queries
- Do not refactor Gemini/OpenAI into a single interface unless the fallback logic is fully preserved

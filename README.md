# Personal AI CRM

An AI-powered personal CRM that turns unstructured notes, emails, and meeting transcripts into structured deal, contact, and organization records — with human-in-the-loop review before anything is saved.

https://github.com/xragrawal/AI-CRM/blob/main/demo/personal-crm-demo.mp4

---

## What It Does

Most CRM pain isn't retrieval — it's data entry. This tool eliminates that:

1. **Capture** — paste text, upload a file, or drop in a URL
2. **Extract** — Gemini reads the content and proposes: deal name, organization, contacts, product tags, last decision, and next steps
3. **Review** — see the AI's proposal side-by-side with existing deal matches; edit any field before approving
4. **Learn** — when you correct a tag or rename something, the system remembers and applies it to future similar inputs
5. **Act** — run AI agents against your live deals to generate MoUs, pricing proposals, and analysis documents

Everything else (deal stages, contact relationships, rolling summaries, analytics, agent automation) flows from that loop.

---

## Key Features

### Core CRM
- **Multi-source capture** — paste text, upload `.txt/.md/.csv/.json/.html/.xml`, or fetch any URL
- **AI proposal review** — editable extraction with confidence-scored matches to existing deals
- **Deal pipeline** — Kanban and table views; stages: Qualified → MOU Signed → Integration → Won / On Hold
- **Natural language recall** — ask *"What did we decide with Acme last month?"* and get a cited plain-text answer
- **⌘K command center** — global overlay for capture, recall, or chat from any page
- **Learning system** — product tag corrections are stored and fed back as few-shot context on future extractions
- **Analytics dashboard** — stage distribution, tag breakdown, deal velocity, win rate

### Agent Hub
- **Create MoU Agent** *(Live)* — generates a complete Memorandum of Understanding for any deal by pulling party names, contacts, scope, and commercial terms from the DB. Supports:
  - **Default template** — a 13-section professional MoU template shipped with the app (`public/templates/default-mou-template.txt`)
  - **Custom template upload** — upload any `.txt` template with `{{PLACEHOLDER}}` markers; Gemini fills them in with live deal data
  - **Wizard mode** — 3-step guided flow (select deal → review & edit → preview MoU)
  - **Split view** — form on left, live preview on right
  - **Copy + Download** — copy to clipboard or download as `.txt`
- **Pricing Proposal Agent** *(Coming Soon)* — draft pricing proposals from deal history and product tags
- **Deal Analysis Agent** *(Coming Soon)* — health analysis, blockers, and recommended next actions
- **Forecast Agent** *(Coming Soon)* — pipeline close probability and revenue projections

### Agent Data Sources
Every agent in the hub has access to:

| Source | Contents |
|--------|----------|
| Deals | Name, stage, rolling summary, last decision, next steps, product tags, milestone dates |
| Contacts | Display name, email, Telegram/X handles, org, deal role |
| Organizations | Name, aliases, linked deals and contacts |
| Activity Items | Approved conversation captures (meeting notes, emails, transcripts) |
| Collaterals | User-uploaded documents provided at agent runtime (templates, decks) |
| Learning Memory | Past tag corrections that tune AI output to your vocabulary |

### Data & Export
- **Full data export** — JSON or Markdown
- **Prisma Studio** — visual DB browser for power users

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Database | SQLite (dev) / PostgreSQL (prod) via Prisma |
| AI | Google Gemini (configurable model) via `@google/generative-ai` |
| AI Fallback | OpenAI via raw fetch |
| Intent routing | LangChain + `@langchain/google-genai` |
| UI | React 19, Tailwind CSS v4, Lucide React, Recharts |

---

## Quick Start

### Prerequisites
- Node.js 20+
- A Google Gemini API key ([get one free](https://aistudio.google.com/app/apikey))

### Setup

```bash
git clone https://github.com/xragrawal/AI-CRM.git
cd personal-crm
npm install
```

Copy and configure environment variables:

```bash
cp .env.example .env
```

Minimum required in `.env`:

```env
GEMINI_API_KEY="your-gemini-key-here"
GEMINI_MODEL="gemini-2.0-flash"

# Database (defaults to SQLite):
DATABASE_URL="file:./dev.db"
```

Run migrations and start:

```bash
npm run prisma:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Yes* | — | Google AI Studio API key |
| `GEMINI_MODEL` | No | `gemini-2.0-flash` | Gemini model ID (e.g. `gemini-2.0-flash`, `gemini-2.5-pro`) |
| `OPENAI_API_KEY` | No | — | OpenAI key (fallback / chat) |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | OpenAI model |
| `OPENAI_BASE_URL` | No | OpenAI default | Custom endpoint for local models |
| `DATABASE_URL` | No | `file:./dev.db` | Prisma connection string |
| `DIRECT_URL` | No | — | Direct URL for migrations (Neon PostgreSQL) |
| `AI_DEBUG_LOG` | No | — | Set to `1` to log raw AI responses |

*At least `GEMINI_API_KEY` is required.

**Production (Neon PostgreSQL):**
```env
DATABASE_URL="postgresql://USER:PWD@ep-xxx-pooler.REGION.aws.neon.tech/DB?sslmode=require"
DIRECT_URL="postgresql://USER:PWD@ep-xxx.REGION.aws.neon.tech/DB?sslmode=require"
```

---

## npm Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server at :3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run prisma:migrate` | Run DB migrations |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:studio` | Open DB browser UI |

---

## User Flows

### Capturing a conversation

1. Press **⌘K** anywhere (or go to Intelligence page)
2. Paste meeting notes, upload a transcript, or enter a URL
3. Gemini proposes: deal name, org, contacts, tags, last decision, next steps
4. Review the proposal side-by-side with existing deal matches; edit any field
5. Click **Approve** — all entities created and linked in a single transaction

### Recalling information

- Press **⌘K** and type: *"What's the status of the Acme deal?"*
- Or use the **Intelligence** page Recall panel for standalone queries
- Gemini searches your deals and recent activity and answers with source citations

### Managing deals

- **Dashboard** — live KPIs, active deals, upcoming actions, weekly velocity chart
- **Deals** — Kanban (drag cards to update stage) or Table view
- **Deal detail** — full item history, linked contacts, milestone dates, editable summary

### Creating an MoU (Agent Hub)

1. Go to **Agent Hub → Create MoU**
2. Select a deal — party, contacts, scope, and pricing auto-fill from DB
3. *(Optional)* Upload your company's MoU template (`.txt` with `{{PLACEHOLDER}}` markers)
4. Review and edit all fields (scope, duration, dates, governing law)
5. Click **Generate MoU** — Gemini fills the template with deal data
6. Preview, copy to clipboard, or download as `.txt`

### MoU Template Format

The default template lives at `public/templates/default-mou-template.txt`. To use a custom template, upload any `.txt` file that contains these placeholder markers:

| Placeholder | Filled with |
|-------------|-------------|
| `{{DEAL_NAME}}` | Deal name from DB |
| `{{PARTY_A_NAME}}` | Your organization name |
| `{{PARTY_B_NAME}}` | Partner organization from DB |
| `{{PARTY_A_CONTACT}}` | Your representative (form field) |
| `{{PARTY_B_CONTACTS}}` | Contacts linked to the deal in DB |
| `{{START_DATE}}` | Start date from form |
| `{{PILOT_DURATION}}` | Duration from form |
| `{{SCOPE_OF_WORK}}` | Scope field (auto-filled from rolling summary) |
| `{{COMMERCIAL_TERMS}}` | Pricing/commercial terms (auto-filled from last decision) |
| `{{GOVERNING_LAW_AND_DISPUTE}}` | Governing law from form |
| `{{RECITALS}}` | AI-generated context paragraph |
| `{{PURPOSE}}` | AI-generated purpose paragraph |
| `{{PARTY_A_OBLIGATIONS}}` | AI-generated obligations |
| `{{PARTY_B_OBLIGATIONS}}` | AI-generated obligations |

---

## Data Model

```
Organization  ──< Deal >──< DealContact >── Contact
                   │
                  Item ──── Proposal
                   │
              DecisionLog

ProductTagFeedback  (learning — append-only)
```

**Deal stages:** `qualified` → `mou_signed` → `integration` → `won` / `lost_on_hold`

**Item statuses:** `proposed` → `approved` / `rejected` / `inbox`

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/items` | Create item from text |
| POST | `/api/items/upload` | Upload file → item |
| POST | `/api/items/url` | Fetch URL → item |
| GET | `/api/items/[id]/proposal` | Generate/regenerate AI proposal |
| POST | `/api/decisions` | Approve / reject / defer item |
| GET | `/api/deals` | List or search deals |
| PATCH | `/api/deals/[id]` | Update stage, summary, milestones |
| GET | `/api/contacts` | List or search contacts |
| GET | `/api/organizations` | List or search organizations |
| POST | `/api/chat` | Unified AI command (capture / recall / chat) |
| POST | `/api/recall` | Natural language CRM query |
| GET | `/api/dashboard` | Analytics + active deal summary |
| GET | `/api/export?format=json\|markdown` | Full data export |
| POST | `/api/agent-hub/mou` | Generate MoU from deal data + optional template |

---

## Architecture

### AI pipeline (Capture)

```
User input
    │
    ▼
/api/items ──────────────── Item saved (status: proposed)
    │
    ▼
/api/items/[id]/proposal
    ├── Gemini: extract entities (JSON mode)
    ├── Gemini: match existing deals (confidence scored, top 5)
    └── Learning context from past tag corrections (few-shot)
    │
    ▼
User reviews + approves
    │
    ▼
/api/decisions ─── Prisma transaction
    ├── Create organization (if new)
    ├── Create deal (if new) + link to org
    ├── Create contacts (if new) + link to org
    ├── Create DealContact links
    ├── Write DecisionLog
    └── Write ProductTagFeedback (for learning)
```

### Agent Hub pipeline (MoU example)

```
User selects deal + fills form + (optional) uploads template
    │
    ▼
/api/agent-hub/mou (POST)
    ├── Prisma: fetch deal with org + dealContacts
    ├── Build prompt:
    │     ├── Template mode: "fill {{PLACEHOLDERS}} with deal data"
    │     └── Free-form mode: "generate 11-section MoU"
    └── Gemini: generate MoU text
    │
    ▼
Frontend: preview → copy or download
```

### ⌘K intent routing

LangChain classifies each chat message before routing:

| Intent | What happens |
|--------|-------------|
| `capture` | Creates Item + Proposal; returns `itemId` for review |
| `recall` | Queries deals/items; Gemini answers in natural language |
| `chat` | General assistant — no DB side effects |

---

## Project Structure

```
personal-crm/
├── app/
│   ├── agent-hub/
│   │   ├── page.tsx               # Agent Hub landing — agent cards + data source docs
│   │   └── mou/
│   │       └── page.tsx           # Create MoU agent (wizard + split view)
│   ├── api/
│   │   ├── agent-hub/mou/         # POST: generate MoU (template or free-form)
│   │   ├── chat/                  # POST: ⌘K intent routing
│   │   ├── contacts/              # GET/POST/[id]
│   │   ├── dashboard/             # GET: analytics + deal summary
│   │   ├── deals/                 # GET/POST/[id] PATCH
│   │   ├── decisions/             # POST: approve/reject/defer items
│   │   ├── export/                # GET: JSON or Markdown export
│   │   ├── items/                 # GET/POST + /upload + /url
│   │   ├── organizations/         # GET/POST/[id]
│   │   └── recall/                # POST: natural language query
│   ├── analytics/page.tsx         # Analytics page
│   ├── companies/page.tsx         # Organizations list
│   ├── deals/page.tsx             # Kanban + table pipeline view
│   ├── intelligence/page.tsx      # Capture + Recall panels
│   ├── people/page.tsx            # Contacts list
│   ├── settings/page.tsx          # Settings
│   └── lib/
│       ├── cache.ts               # In-memory response cache
│       ├── config.ts              # Team members + own company config
│       ├── fileParser.ts          # File content extraction
│       ├── gemini.ts              # Gemini AI helpers (extract, match, recall, chat)
│       ├── learning.ts            # Product tag correction context builder
│       ├── prisma.ts              # Prisma client singleton
│       └── urlParser.ts           # URL content fetching
├── components/
│   ├── AppShell.tsx               # Sidebar, top bar, ⌘K command center
│   ├── CaptureForm.tsx            # Text / file / URL capture form
│   ├── DashboardSummary.tsx       # Command Center charts and activity feed
│   └── RecallQuery.tsx            # Natural language recall UI
├── prisma/
│   ├── schema.prisma              # 7-model schema
│   └── migrations/
├── public/
│   └── templates/
│       └── default-mou-template.txt   # Default 13-section MoU template with placeholders
├── .env.example
├── project-context.md             # Full technical context (for AI assistants)
└── package.json
```

---

## Deployment

**Vercel (recommended):**

```bash
vercel --prod
```

Set all env vars in the Vercel dashboard. Use [Neon](https://neon.tech) for PostgreSQL (free tier available).

**Self-hosted:**

```bash
npm run build
npm run start
```

---

## Limitations

- **Single-user** — no authentication or multi-tenant access control
- **In-memory cache & rate limit** — reset on server restart; fine for personal use
- **SQLite in dev only** — use PostgreSQL for production to avoid write concurrency issues
- **No real-time updates** — REST-based; refresh to see changes made elsewhere
- **Agent Hub is early** — only MoU agent is live; Pricing, Deal Analysis, and Forecast agents are planned

---

## License

Private repository — all rights reserved.

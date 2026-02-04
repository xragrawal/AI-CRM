# PersonalCRM — MVP PRD

> **Project:** PersonalCRM  
> **Audience:** Engineers / collaborators  
> **Purpose:** Scope lock + build-ready specification  
> **Principle:** Capture unstructured inputs → maintain correct CRM state → enable fast recall

---

## 1. Product Goal & MVP Wedge

### Goal
Enable a single operator to consume unstructured inputs (chat text, pasted messages) and maintain an accurate, recallable state of projects/partnerships with AI assistance — **without incorrect updates**.

### MVP Wedge
- Replace manual CRM updates coming from Telegram-like sources
- Desktop-first, chat-style interaction
- Optimize for **capture → recall → correctness**

---

## 2. Primary User & Core Jobs

### Primary User (MVP)
- Single operator (solo usage)
- Team usage deferred post-MVP

### Core Jobs (Ranked)
1. Capture updates from unstructured inputs
2. Recall latest state instantly
3. Maintain correctness (no wrong record updates)

---

## 3. Objects & Data Model (Minimal)

### Objects (MVP only)
- **Organization (Company / Account)**
- **Contact (Person)**
- **Deal (Opportunity / Partnership / Project)**
- **Conversation / Thread** (must link to a deal)

### Organization — Minimal Fields
- Canonical organization name
- Aliases (user-approved only)
- Rolling summary (AI-generated, user-editable)

### Contact — Minimal Fields
- Full name
- Aliases (user-approved only)
- Primary organization (optional)
- Rolling summary (AI-generated, user-editable)

### Deal — Minimal Fields
- Canonical deal name
- Aliases (user-approved only)
- Linked organization (optional)
- Linked contacts (0..N)
- Last decision
- Next step
- Rolling summary (AI-generated, user-editable)

### Conversation
- Full raw text (source of truth)
- Source metadata (timestamp, input type)
- Linked deal (required)
- Derived summaries (non-authoritative)

---

## 4. CRM Record Resolution Rules (Critical)

### Default Behavior
- Prefer appending updates to an existing deal
- New organization/contact/deal creation requires explicit user confirmation

### Resolution Order (MVP)
- Resolve organization and contacts only as supporting context
- Resolve (or ask to resolve) the target deal as the primary record

### Deal Linking Constraint (MVP)
- Every conversation must link to exactly one deal
- A deal may optionally link to an organization and contacts

### Aliases
- Organizations/contacts/deals may have multiple aliases
- Aliases are **never auto-added**
- User must explicitly approve adding an alias

### Ambiguity Handling
- If multiple candidate organizations/contacts/deals exist:
  - Show confidence-ranked list
  - Display evidence
  - Ask user to select or create new
- No silent creation or updates

### Explicit Constraint
- Basic CRM hierarchy only (org/contact/deal). No deeper nesting beyond these relationships in MVP.

---

## 5. Core Workflow

### Capture → Proposal → Approval → Recall

1. User captures input into chat UI via one of the supported input modes:
   - Paste text
   - Upload file
   - Import from URL
2. System immediately generates a structured proposal
3. UI shows side-by-side:
   - Raw content
   - Proposed structured update
4. User actions:
   - Approve
   - Edit & approve
   - Reject (archive)
   - Defer to Inbox
5. Approved updates modify CRM state (org/contact/deal)
6. All steps are logged

---

## 6. Inbox & Proposal Handling

### Processing Mode
- Default: Immediate proposal per item
- Optional: User may defer an item to Inbox for later processing

### Rejection Behavior
- Primary: Reject → Archive
- Optional: Mark as Duplicate / Invalid (stored as metadata only)

---

## 7. Candidate Matching UX

### Candidate List
- Confidence-ranked (Top N)

### Evidence Displayed (MVP)
- Last interaction snippet
- Deal summary
- Linked organization + linked contacts (if present)

---

## 8. UX & Interaction Model

### Primary Surface
- Web-based, ChatGPT-like chat UI
- Desktop-first

### Input Methods (MVP)
- Paste text / chat messages
- Upload a file (drag-drop or click-to-upload)
- Import from URL

*(Telegram forwarding deferred post-MVP)*

### Capture Modes (UI)
- The Chat capture surface provides a mode switch (tabs) for:
  - Paste Text
  - Upload File
  - From URL
- Each mode produces a single captured Item and routes to the Item review page for AI verification.

### File Upload Constraints (MVP)
- Max file size: 10MB
- Supported extensions (text-first):
  - .txt
  - .md
  - .csv
  - .json
  - .html
  - .xml
  - .log
  - .yaml / .yml
- The system extracts text from the uploaded file and stores the extracted text as the Item’s raw content.

### URL Import Constraints (MVP)
- User provides a URL
- The system fetches the URL, attempts to extract readable text + basic metadata (title/description), and stores extracted text as the Item’s raw content

### Deal View — Above the Fold
- Last decision
- Next step

### Editing Model
- AI-suggested fields
- Always user-editable

---

## 9. Recall & Summaries

### Supported Queries (MVP)
- Queries may target an organization, contact, or deal
- "What did we agree on with X?"
- "Who do I need to follow up with this week?"
- "Weekly activity summary"

### Output Formats
- Decisions: last decision + next step (by deal)
- Weekly summary: auto-generated, auto-saved, user-editable

### Trigger
- Primary: Generate summary button
- Secondary: natural language query

---

## 10. Evidence & Provenance

- Full raw content stored for every captured item
- Raw data is the source of truth
- Structured fields are derived
- No redaction or deletion flows in MVP

### Source Metadata (MVP)
- Every captured Item stores a `sourceType` to reflect where it came from:
  - paste
  - file_upload
  - url

---

## 11. Export & Portability

### MVP Requirement
- Full export support including:
  - Raw items
  - Proposals
  - Approval decisions
  - Organizations
  - Contacts
  - Deals
- Export formats: Markdown and/or JSON

---

## 12. Explicit Non-Goals (MVP)

Out of scope:
- Email integration
- Calendar sync
- Telegram bot / message forwarding
- Support for binary / scanned document parsing (OCR)
- Auto-write without approval
- Analytics dashboards
- On-chain identity or attestations

---

## 13. Post-MVP (Parked)

### MVP Phase 1
- Meeting transcript ingestion (richer formats, better extraction)
- Contact / company enrichment
  - founders
  - website
  - fundraise
  - social presence

---

## 14. Implementation Notes (Engineering)

### New API Routes
- `POST /api/items/upload`
  - Accepts multipart form upload
  - Extracts text from supported file types
  - Creates an Item with `sourceType=file_upload`
- `POST /api/items/url`
  - Accepts JSON payload `{ url }`
  - Fetches and extracts readable text
  - Creates an Item with `sourceType=url`

### Parsing Utilities
- File parsing lives in `app/lib/fileParser.ts`
- URL fetching/parsing lives in `app/lib/urlParser.ts`

### AI Provider Configuration
- Gemini is used for extraction/matching.
- The model must be configurable via environment:
  - `GEMINI_API_KEY` (required)
  - `GEMINI_MODEL` (required/override)
- Model availability varies by key; engineering should treat model selection as a runtime configuration.

### Proposal Generation Robustness
- Proposal generation depends on:
  - Fetching candidate deals for matching
  - LLM extraction into JSON
- If candidate deal lookup fails due to DB data inconsistencies, proposal generation should continue without deal matching (matching is non-critical).
- Proposal JSON stored in SQLite/Prisma `Json` columns must not contain `undefined` values.

### Operational Debugging Notes
- A valid LLM key can still fail at runtime if the configured model name is not supported for the API/method. Ensure `GEMINI_MODEL` is set to a model that supports `generateContent` for your key.
- If proposal generation returns HTTP 500, check for:
  - Prisma JSON parsing errors when reading `Json` columns
  - LLM returning an empty/invalid JSON response

---

## 15. Later

- Telegram agent
- Team collaboration
- Follow-up reminders
- External integrations

---

**End of PRD**
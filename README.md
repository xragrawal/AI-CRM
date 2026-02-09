# AI-CRM

Capture unstructured inputs (chat, emails, files, URLs) and let AI extract and maintain your CRM state.

## Features

- **Multi-mode capture**: Paste text, upload files, or import from URLs
- **AI extraction**: Gemini-powered extraction of deals, contacts, product tags, decisions, and next steps
- **Proposal workflow**: Review and approve AI-suggested updates before they’re applied
- **Recall**: Query your CRM with natural language

## Supported file types

- `.txt`, `.md`, `.csv`, `.json`, `.html`, `.xml`, `.log`, `.yaml`, `.yml`
- Max file size: 10MB

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### 1) Clone and install

```bash
git clone https://github.com/xragrawal/AI-CRM.git
cd AI-CRM
npm install
```

### 2) Set up environment

Copy the example and configure your Gemini API:

```bash
cp .env.example .env
# Edit .env with your GEMINI_API_KEY and GEMINI_MODEL
```

### 3) Set up the database

```bash
npx prisma migrate dev
```

### 4) Run the development server

```bash
npm run dev
```

Open http://localhost:3000

## Environment Variables

Create `.env` from `.env.example` and set:

- `DATABASE_URL`: SQLite database path (default: `file:./dev.db`)
- `GEMINI_API_KEY`: Your Gemini API key
- `GEMINI_MODEL`: Gemini model to use (e.g., `gemini-3-flash-preview`)

## Usage

1. **Capture**: Use the Chat page to paste text, upload a file, or import from a URL
2. **Review**: AI generates a structured proposal for your review
3. **Approve**: Approve, edit, or reject the proposal
4. **Recall**: Use the Recall section to query your CRM

## API Endpoints

- `POST /api/items` - Create item from text
- `POST /api/items/upload` - Upload file
- `POST /api/items/url` - Import from URL
- `GET /api/items/{id}/proposal` - Get AI proposal for an item

## Project Structure

```
app/
├── api/           # Next.js API routes
├── lib/           # Utilities (Gemini, file parsing, URL parsing)
└── ...
components/       # React components
prisma/           # Database schema and migrations
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: SQLite with Prisma ORM
- **AI**: Google Gemini API
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Development

```bash
# Install dependencies
npm install

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Private repository – all rights reserved.

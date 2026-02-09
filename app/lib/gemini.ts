import { GoogleGenerativeAI } from '@google/generative-ai'
import { TEAM_MEMBERS, OWN_COMPANY } from './config'
import { buildProductTagContext, getRelevantClassificationContext } from './learning'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash'

export const gemini = genAI.getGenerativeModel({ model: GEMINI_MODEL })
export const geminiJson = genAI.getGenerativeModel({
  model: GEMINI_MODEL,
  generationConfig: {
    responseMimeType: 'application/json',
  },
})

export interface ExtractedProposal {
  suggestedDealName: string | null
  suggestedOrganizationName: string | null
  productTags: string[]
  contacts: Array<{
    name: string
    role?: string
  }>
  lastDecision: string | null
  nextStep: string | null
  summary: string | null
}

export interface CandidateMatch {
  dealId: string
  dealName: string
  organizationName: string | null
  confidence: number
  evidenceSnippet: string
}

export interface RecallResponse {
  answer: string
  sources: Array<{
    dealName: string
    snippet: string
  }>
}

function assertGeminiConfigured() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables')
  }
  if (process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
    throw new Error('GEMINI_API_KEY is still set to placeholder value. Please set a valid API key.')
  }
}

function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
}

function extractFirstJson(text: string): string | null {
  const cleaned = stripCodeFences(text)

  // Fast-path: if it already looks like JSON.
  if (cleaned.startsWith('{') || cleaned.startsWith('[')) return cleaned

  // Balanced scan to find the first JSON object/array.
  const startIdx = cleaned.search(/[\[{]/)
  if (startIdx === -1) return null

  const stack: string[] = []
  for (let i = startIdx; i < cleaned.length; i++) {
    const ch = cleaned[i]
    if (ch === '{' || ch === '[') stack.push(ch)
    if (ch === '}' || ch === ']') {
      const open = stack.pop()
      if (!open) continue
      if ((open === '{' && ch !== '}') || (open === '[' && ch !== ']')) continue
      if (stack.length === 0) {
        return cleaned.slice(startIdx, i + 1)
      }
    }
  }

  return null
}

function safeJsonParse<T>(text: string): T {
  const extracted = extractFirstJson(text)
  if (!extracted) {
    throw new Error('No JSON found in model response')
  }
  return JSON.parse(extracted) as T
}

function debugLog(label: string, value: unknown) {
  if (process.env.AI_DEBUG_LOG !== '1') return
  const MAX = 4000
  const str = typeof value === 'string' ? value : JSON.stringify(value)
  const out = str.length > MAX ? str.slice(0, MAX) + '\n...[truncated]...' : str
  console.log(label, out)
}

export async function extractProposalFromText(rawText: string): Promise<ExtractedProposal> {
  assertGeminiConfigured()
  
  // Build exclusion lists from config
  const excludedContactNames = TEAM_MEMBERS.flatMap(m => [m.name, ...m.aliases]).join(', ')
  const excludedOrgNames = [OWN_COMPANY.name, ...OWN_COMPANY.aliases].join(', ')
  
  // Get learning context from past corrections
  const learningContext = await getRelevantClassificationContext(rawText)
  const productTagContext = buildProductTagContext()
  
  const prompt = `You are analyzing a conversation or message to extract CRM-relevant information.

IMPORTANT CONTEXT (internal entities):
- These people may be internal team members: ${excludedContactNames}
- These org/deal names may refer to our own company: ${excludedOrgNames}

RULE:
- You MAY still extract these names if they are explicitly mentioned in the text so the user can see them in the UI.
- Downstream code will decide whether to create/update CRM records for them.

CRITICAL DISAMBIGUATION RULES:
- The user writing the note is NOT a contact. If the text says "I am X" or "I'm X" or "This is X" or otherwise introduces the speaker, do NOT extract the speaker as a contact.
- Prefer extracting the OTHER party in phrases like:
  - "I spoke with Y from ORG"
  - "Had a chat with Y at ORG"
  - "Call with Y (ORG)"
  - "Met Y from ORG"
- If multiple people are mentioned, the primary contact should be the counterparty you interacted with (often the one after "with").
- If the counterparty is associated with an org/company (e.g., "Y from ORG"), ALWAYS set suggestedOrganizationName to that ORG.
- If the only org mentioned is our own company and there is no external counterparty org, you may leave suggestedOrganizationName null.

DEAL/PROJECT NAMING RULES:
- If the text does not explicitly mention a deal/project name, you MUST still generate a short suggestedDealName.
- Use this format: "<Organization> - <short topic>".
- The short topic should be 2-5 words derived from the text (e.g., "Dubai client", "KYC integration", "Pilot", "Partnership").
- If organization is unknown, use the primary contact name instead of organization.

EXAMPLES (few-shot):
Input: "I am Aswin from KRNL. Had a chat with Ravi from Billions network for a Dubai based client."
Output:
{
  "suggestedDealName": "Billions network - Dubai client",
  "suggestedOrganizationName": "Billions network",
  "productTags": ["Others"],
  "contacts": [{"name": "Ravi", "role": "counterparty"}],
  "lastDecision": null,
  "nextStep": null,
  "summary": "Aswin (KRNL) spoke with Ravi (Billions network) regarding a Dubai-based client."
}

Input: "Chatted with Neha at Acme about KYC. I (Ravi) will send them our docs tomorrow."
Output:
{
  "suggestedDealName": null,
  "suggestedOrganizationName": "Acme",
  "productTags": ["Id/KYC"],
  "contacts": [{"name": "Neha", "role": "counterparty"}],
  "lastDecision": null,
  "nextStep": "Send docs tomorrow",
  "summary": "Discussion with Neha at Acme about KYC; next step is to send docs."
}
${productTagContext}
${learningContext}
Extract the following from this text:
1. Deal/Project name (if mentioned or can be inferred) - NOT our own company
2. Organization/Company name of the counterparty (if mentioned or can be inferred). If the text explicitly says "X from ORG", return "ORG".
3. Product Tags: Based on the definitions above, identify which Billions products are EXPLICITLY mentioned or clearly relevant. Be conservative - only tag if there's clear evidence.
4. People mentioned (names and roles if clear) - NOT our team members
5. Last decision or agreement made
6. Next step or action item
7. Brief summary of the conversation (ALWAYS provide a short summary even if no deal/org/contact should be created)

IMPORTANT:
- Exclusions only affect whether you create contacts/deals/orgs. Even if everything is excluded, still return a helpful summary, and set productTags to ["Others"] if unsure.

Text to analyze:
"""
${rawText}
"""

Respond ONLY with valid JSON in this exact format:
{
  "suggestedDealName": "string or null",
  "suggestedOrganizationName": "string or null",
  "productTags": [],
  "contacts": [{"name": "string", "role": "string or null"}],
  "lastDecision": "string or null",
  "nextStep": "string or null",
  "summary": "string or null"
}

CRITICAL: For productTags, only include tags if the text CLEARLY relates to that product. Do NOT guess or assume. If unsure, use ["Others"]. Learn from the past corrections shown above.`

  try {
    console.log('[Gemini] Starting extraction, text length:', prompt.length)
    const result = await geminiJson.generateContent(prompt)
    const text = result.response.text()
    console.log('[Gemini] Response received, length:', text?.length ?? 0)
    debugLog('[Gemini] Raw response:', text)
    if (!text || text.trim() === '') {
      throw new Error('Gemini returned empty response - check if API key is valid')
    }
    const parsed = safeJsonParse<ExtractedProposal>(text)
    return {
      ...parsed,
      productTags:
        Array.isArray(parsed.productTags) && parsed.productTags.length > 0
          ? parsed.productTags
          : ['Others'],
      summary:
        parsed.summary && parsed.summary.trim() !== ''
          ? parsed.summary
          : rawText.trim().slice(0, 240),
    }
  } catch (error: unknown) {
    console.error('[Gemini] Extraction error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    if (error instanceof Error) {
      // Check for common API errors
      if (error.message.includes('API_KEY')) {
        throw new Error('Gemini API key error: ' + error.message)
      }
      if (error.message.includes('not found') || error.message.includes('404')) {
        throw new Error(`Gemini model "${GEMINI_MODEL}" not found. Try setting GEMINI_MODEL in .env to a valid model.`)
      }
      throw new Error(`AI extraction failed: ${error.message}`)
    }
    throw new Error('AI extraction failed: Unknown error')
  }
}

export async function findCandidateDeals(
  rawText: string,
  existingDeals: Array<{
    id: string
    name: string
    aliases: string[]
    organizationName: string | null
    rollingSummary: string | null
  }>
): Promise<CandidateMatch[]> {
  assertGeminiConfigured()
  if (existingDeals.length === 0) {
    return []
  }

  const dealsContext = existingDeals
    .map(
      (d, i) =>
        `${i + 1}. ID: ${d.id} | Name: "${d.name}" | Aliases: [${d.aliases.join(', ')}] | Org: ${d.organizationName ?? 'none'} | Summary: ${d.rollingSummary?.slice(0, 100) ?? 'none'}`
    )
    .join('\n')

  const prompt = `You are matching a new conversation to existing CRM deals.

Existing deals:
${dealsContext}

New conversation:
"""
${rawText}
"""

Which existing deals might this conversation be about? Consider:
- Direct name mentions
- Alias matches
- Organization mentions
- Context similarity

Respond ONLY with valid JSON array. For each match, provide:
- dealId: the exact ID from the list
- confidence: 0.0 to 1.0 (only include if >= 0.3)
- evidenceSnippet: brief quote or reason for the match

Format:
[
  {"dealId": "...", "confidence": 0.8, "evidenceSnippet": "mentions 'Project X' directly"}
]

If no matches found, return empty array: []`

  try {
    const result = await geminiJson.generateContent(prompt)
    const text = result.response.text()
    if (!text || text.trim() === '') {
      console.warn('Gemini returned empty response for deal matching, returning empty array')
      return []
    }
    const parsed = safeJsonParse<
      Array<{
        dealId: string
        confidence: number
        evidenceSnippet: string
      }>
    >(text)

    return parsed
      .filter((m) => m.confidence >= 0.3)
      .map((m) => {
        const deal = existingDeals.find((d) => d.id === m.dealId)
        return {
          dealId: m.dealId,
          dealName: deal?.name ?? 'Unknown',
          organizationName: deal?.organizationName ?? null,
          confidence: m.confidence,
          evidenceSnippet: m.evidenceSnippet,
        }
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
  } catch (error) {
    console.error('Gemini matching error:', error)
    // Return empty array instead of failing - deal matching is non-critical
    return []
  }
}

export async function answerRecallQuery(
  query: string,
  context: {
    deals: Array<{
      name: string
      lastDecision: string | null
      nextStep: string | null
      rollingSummary: string | null
      organizationName: string | null
    }>
    recentItems: Array<{
      dealName: string | null
      rawText: string
      createdAt: string
    }>
  }
): Promise<RecallResponse> {
  assertGeminiConfigured()
  const dealsContext = context.deals
    .map(
      (d) =>
        `Deal: ${d.name} (Org: ${d.organizationName ?? 'none'})
Last Decision: ${d.lastDecision ?? 'none'}
Next Step: ${d.nextStep ?? 'none'}
Summary: ${d.rollingSummary ?? 'none'}`
    )
    .join('\n\n')

  const itemsContext = context.recentItems
    .slice(0, 20)
    .map(
      (i) =>
        `[${i.createdAt}] ${i.dealName ?? 'Unlinked'}: ${i.rawText.slice(0, 200)}...`
    )
    .join('\n')

  const prompt = `You are a CRM assistant helping recall information about deals and partnerships.

Available context:

DEALS:
${dealsContext || 'No deals recorded yet.'}

RECENT CONVERSATIONS:
${itemsContext || 'No conversations recorded yet.'}

User question: "${query}"

Answer the question based ONLY on the context provided. Be specific and cite which deal or conversation the information comes from. If the information isn't in the context, say so clearly.

Respond with JSON:
{
  "answer": "Your answer here, citing specific deals/conversations",
  "sources": [{"dealName": "name", "snippet": "relevant quote"}]
}`

  try {
    const result = await geminiJson.generateContent(prompt)
    const text = result.response.text()
    return safeJsonParse<RecallResponse>(text)
  } catch (error) {
    console.error('Gemini recall error:', error)
    throw error
  }
}

export async function chatWithAssistant(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: {
    deals?: Array<{ name: string; stage: string; organizationName: string | null }>
    contacts?: Array<{ displayName: string; email: string | null }>
    recentActivity?: Array<{ dealName: string | null; rawText: string }>
  }
): Promise<string> {
  assertGeminiConfigured()

  let systemPrompt = `You are a helpful AI assistant for a personal CRM system. You help users:
- Track deals, contacts, and organizations
- Answer questions about their business relationships
- Extract structured data from conversations
- Provide insights and reminders

Be concise, friendly, and helpful.`

  if (context) {
    systemPrompt += '\n\nCurrent CRM Context:\n'
    if (context.deals && context.deals.length > 0) {
      systemPrompt += `\nDeals (${context.deals.length}):\n`
      systemPrompt += context.deals.slice(0, 10).map((d) => `- ${d.name} (${d.stage})`).join('\n')
    }
    if (context.contacts && context.contacts.length > 0) {
      systemPrompt += `\n\nContacts (${context.contacts.length}):\n`
      systemPrompt += context.contacts.slice(0, 10).map((c) => `- ${c.displayName}`).join('\n')
    }
  }

  const conversationText = conversationHistory
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n')

  const fullPrompt = `${systemPrompt}

${conversationText ? `Previous conversation:\n${conversationText}\n\n` : ''}User: ${userMessage}`

  try {
    const result = await gemini.generateContent(fullPrompt)
    const response = result.response.text()
    return response
  } catch (error) {
    console.error('Gemini chat error:', error)
    throw error
  }
}

/**
 * OpenAI integration module
 * Provides similar functionality to gemini.ts but using OpenAI's API
 */

import type { ExtractedProposal, CandidateMatch, RecallResponse } from './gemini'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? ''
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1'

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

function assertOpenAIConfigured() {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables')
  }
  if (OPENAI_API_KEY === 'your-openai-api-key-here') {
    throw new Error('OPENAI_API_KEY is still set to placeholder value. Please set a valid API key.')
  }
}

async function callOpenAI(
  messages: OpenAIMessage[],
  responseFormat?: { type: 'json_object' }
): Promise<string> {
  assertOpenAIConfigured()

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      temperature: 0.7,
      ...(responseFormat && { response_format: responseFormat }),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${response.status} - ${error}`)
  }

  const data: OpenAIResponse = await response.json()
  return data.choices[0]?.message?.content || ''
}

function safeJsonParse<T>(text: string): T {
  try {
    return JSON.parse(text) as T
  } catch (error) {
    throw new Error('Failed to parse JSON response from OpenAI')
  }
}

export async function extractProposalFromText(
  rawText: string,
  excludedContactNames: string,
  excludedOrgNames: string,
  productTagContext: string,
  learningContext: string
): Promise<ExtractedProposal> {
  const systemPrompt = `You are analyzing a conversation or message to extract CRM-relevant information.

IMPORTANT EXCLUSIONS:
- Do NOT extract these people as contacts (they are team members): ${excludedContactNames}
- Do NOT extract these as organizations or deals (this is our own company): ${excludedOrgNames}
${productTagContext}
${learningContext}

Extract the following:
1. Deal/Project name (if mentioned or can be inferred) - NOT our own company
2. Organization/Company name (if mentioned) - NOT our own company
3. Product Tags: Based on the definitions above, identify which products are EXPLICITLY mentioned or clearly relevant. Be conservative.
4. People mentioned (names and roles if clear) - NOT our team members
5. Last decision or agreement made
6. Next step or action item
7. Brief summary of the conversation

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

CRITICAL: For productTags, only include tags if the text CLEARLY relates to that product. Do NOT guess or assume.`

  const messages: OpenAIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: rawText },
  ]

  const response = await callOpenAI(messages, { type: 'json_object' })
  return safeJsonParse<ExtractedProposal>(response)
}

export async function findMatchingDeals(
  rawText: string,
  existingDeals: Array<{ id: string; name: string; organizationName: string | null }>
): Promise<CandidateMatch[]> {
  const dealsContext = existingDeals
    .map((d) => `- ${d.name} (${d.organizationName ?? 'No org'})`)
    .join('\n')

  const systemPrompt = `You are matching a conversation to existing CRM deals. Return the top 3 most likely matches based on the content.

Existing Deals:
${dealsContext}

Respond with JSON array of matches. Each match should have:
- dealId (exact ID from the list)
- dealName
- organizationName
- confidence (0-100)
- evidenceSnippet (quote from text showing why this matches)

Return empty array if no good matches (confidence < 30).`

  const messages: OpenAIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: rawText },
  ]

  const response = await callOpenAI(messages, { type: 'json_object' })
  const parsed = safeJsonParse<{ matches: CandidateMatch[] }>(response)
  return parsed.matches || []
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
    .map((i) => `[${i.createdAt}] ${i.dealName ?? 'Unlinked'}: ${i.rawText.slice(0, 200)}...`)
    .join('\n\n')

  const systemPrompt = `You are a helpful CRM assistant. Answer the user's query based on the provided CRM data.

Deals:
${dealsContext}

Recent Activity:
${itemsContext}

Provide a concise, helpful answer. If referencing specific deals or information, cite them clearly.

Respond with JSON:
{
  "answer": "your answer here",
  "sources": [{"dealName": "name", "snippet": "relevant quote"}]
}`

  const messages: OpenAIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query },
  ]

  const response = await callOpenAI(messages, { type: 'json_object' })
  return safeJsonParse<RecallResponse>(response)
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
  assertOpenAIConfigured()

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

  const messages: OpenAIMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ]

  return callOpenAI(messages)
}

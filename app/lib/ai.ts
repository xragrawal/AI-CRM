import * as GeminiLib from './gemini'
import * as OpenAILib from './openai'
import { gemini } from './gemini'
import { TEAM_MEMBERS, OWN_COMPANY } from './config'
import { buildProductTagContext, getRelevantClassificationContext } from './learning'

export type { ExtractedProposal, CandidateMatch, RecallResponse } from './gemini'

const provider = (process.env.AI_PROVIDER ?? 'gemini').toLowerCase()

export async function extractProposalFromText(rawText: string): Promise<GeminiLib.ExtractedProposal> {
  if (provider === 'openai') {
    const excludedContactNames = TEAM_MEMBERS.flatMap(m => [m.name, ...m.aliases]).join(', ')
    const excludedOrgNames = [OWN_COMPANY.name, ...OWN_COMPANY.aliases].join(', ')
    const learningContext = await getRelevantClassificationContext(rawText)
    const productTagContext = buildProductTagContext()
    return OpenAILib.extractProposalFromText(rawText, excludedContactNames, excludedOrgNames, productTagContext, learningContext)
  }
  return GeminiLib.extractProposalFromText(rawText)
}

export async function findCandidateDeals(
  rawText: string,
  deals: Array<{ id: string; name: string; aliases: string[]; organizationName: string | null; rollingSummary: string | null }>
): Promise<GeminiLib.CandidateMatch[]> {
  if (provider === 'openai') {
    return OpenAILib.findMatchingDeals(rawText, deals)
  }
  return GeminiLib.findCandidateDeals(rawText, deals)
}

export async function answerRecallQuery(
  query: string,
  context: Parameters<typeof GeminiLib.answerRecallQuery>[1]
): Promise<GeminiLib.RecallResponse> {
  if (provider === 'openai') {
    return OpenAILib.answerRecallQuery(query, context)
  }
  return GeminiLib.answerRecallQuery(query, context)
}

export async function chatWithAssistant(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: Parameters<typeof GeminiLib.chatWithAssistant>[2]
): Promise<string> {
  if (provider === 'openai') {
    return OpenAILib.chatWithAssistant(message, history, context)
  }
  return GeminiLib.chatWithAssistant(message, history, context)
}

export async function generateText(prompt: string): Promise<string> {
  if (provider === 'openai') {
    return OpenAILib.generateText(prompt)
  }
  const result = await gemini.generateContent(prompt)
  return result.response.text()
}

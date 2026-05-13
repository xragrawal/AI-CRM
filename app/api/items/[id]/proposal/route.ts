import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import {
  extractProposalFromText,
  findCandidateDeals,
} from '@/app/lib/ai'
import { isTeamMember, isOwnCompany } from '@/app/lib/config'

const DEALS_LIMIT = 200
const MAX_TEXT_LENGTH = 30000 // Limit text sent to Gemini to avoid timeouts

function generateFallbackDealName(params: {
  organizationName: string | null
  contactName: string | null
  summary: string | null
  rawText: string
}): string {
  const base = (params.organizationName || params.contactName || '').trim()
  const source = (params.summary || params.rawText || '').replace(/\s+/g, ' ').trim()

  const topic = source
    .replace(/^[^:]{0,40}:/, '')
    .replace(/\b(i\s*am|i\'m|this\s+is)\b[^.]{0,60}[.]/i, '')
    .trim()
    .slice(0, 80)

  const cleanedTopic = topic
    .replace(/[\[\]"']/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (base && cleanedTopic) return `${base} - ${cleanedTopic}`
  if (base) return `${base} - Follow up`
  return 'New Deal - Follow up'
}

function parseAliases(aliases: unknown): string[] {
  if (!Array.isArray(aliases)) return []
  return aliases.filter((a): a is string => typeof a === 'string')
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '\n\n[... content truncated for processing ...]'
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const item = await prisma.item.findUnique({ where: { id } })
  if (!item) {
    return Response.json({ error: 'Item not found' }, { status: 404 })
  }

  try {
    let deals: any[] = []
    try {
      deals = await prisma.deal.findMany({
        take: DEALS_LIMIT,
        orderBy: { updatedAt: 'desc' },
        include: {
          organization: { select: { name: true } },
          dealContacts: {
            select: {
              role: true,
              contact: {
                select: {
                  displayName: true,
                  email: true,
                  telegramHandle: true,
                  xHandle: true,
                },
              },
            },
          },
        },
      })
    } catch (dbError) {
      console.warn('[Proposal] Error fetching deals, continuing without deal matching:', dbError instanceof Error ? dbError.message : String(dbError))
      // Continue without deals - deal matching is non-critical
      deals = []
    }

    // Truncate text to avoid Gemini API timeouts on large files
    const processableText = truncateText(item.rawText, MAX_TEXT_LENGTH)

    const [extracted, aiCandidates] = await Promise.all([
      extractProposalFromText(processableText),
      findCandidateDeals(
        processableText,
        deals.map((d) => ({
          id: d.id,
          name: d.name,
          aliases: parseAliases(d.aliases),
          organizationName: d.organization?.name ?? null,
          rollingSummary: d.rollingSummary,
        }))
      ),
    ])

    const candidates = aiCandidates.map((c) => {
      const deal = deals.find((d) => d.id === c.dealId)
      const primaryContact = deal?.dealContacts[0]
      return {
        dealId: c.dealId,
        dealName: c.dealName,
        organizationName: c.organizationName,
        confidence: c.confidence,
        evidenceSnippet: c.evidenceSnippet,
        dealSummary: deal?.rollingSummary ?? '',
        contact: primaryContact
          ? {
              displayName: primaryContact.contact.displayName,
              email: primaryContact.contact.email ?? undefined,
              telegramHandle: primaryContact.contact.telegramHandle ?? undefined,
              xHandle: primaryContact.contact.xHandle ?? undefined,
            }
          : undefined,
        role: primaryContact?.role ?? undefined,
      }
    })

    // Filter out excluded entities as an additional safeguard for persistence,
    // but still expose what the AI extracted so the UI can show it.
    const extractedContacts = extracted.contacts || []
    const filteredContacts = extractedContacts.filter((c) => !isTeamMember(c.name))

    const extractedOrgName = extracted.suggestedOrganizationName || null
    const extractedDealName = extracted.suggestedDealName || null

    const orgExcluded = extractedOrgName ? isOwnCompany(extractedOrgName) : false
    const dealExcluded = extractedDealName ? isOwnCompany(extractedDealName) : false
    const excludedContacts = extractedContacts
      .filter((c) => isTeamMember(c.name))
      .map((c) => c.name)

    const filteredOrgName = extractedOrgName && !orgExcluded ? extractedOrgName : null
    const filteredDealName = extractedDealName && !dealExcluded ? extractedDealName : null

    const proposed: Record<string, any> = {
      productTags: extracted.productTags || [],
      contacts: extractedContacts,
      exclusions: {
        organization: orgExcluded,
        deal: dealExcluded,
        contacts: excludedContacts,
        filtered: {
          suggestedOrganizationName: filteredOrgName,
          suggestedDealName: filteredDealName,
          contacts: filteredContacts,
        },
      },
    }
    
    // Expose extracted values for UI display
    const primaryContactName = extractedContacts?.[0]?.name ? String(extractedContacts[0].name) : null
    const dealNameForUi = extractedDealName || generateFallbackDealName({
      organizationName: extractedOrgName,
      contactName: primaryContactName,
      summary: extracted.summary || null,
      rawText: processableText,
    })
    if (dealNameForUi) proposed.suggestedDealName = dealNameForUi
    if (extractedOrgName) proposed.suggestedOrganizationName = extractedOrgName
    if (extracted.lastDecision) proposed.lastDecision = extracted.lastDecision
    if (extracted.nextStep) proposed.nextStep = extracted.nextStep
    if (extracted.summary) proposed.rollingSummary = extracted.summary

    const proposalRow = await prisma.proposal.upsert({
      where: { itemId: id },
      create: {
        itemId: id,
        candidatesJson: candidates,
        proposedJson: proposed,
      },
      update: {
        candidatesJson: candidates,
        proposedJson: proposed,
      },
    })

    return Response.json({
      proposal: {
        id: proposalRow.id,
        itemId: proposalRow.itemId,
        createdAt: proposalRow.createdAt.toISOString(),
        candidates,
        proposed,
      },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    const stack = e instanceof Error ? e.stack : undefined
    console.error('[Proposal] Error details:', { message, stack })
    return Response.json(
      {
        error: 'AI proposal generation failed',
        details: message,
      },
      { status: 500 }
    )
  }
}

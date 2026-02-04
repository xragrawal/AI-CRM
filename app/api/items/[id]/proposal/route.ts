import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import {
  extractProposalFromText,
  findCandidateDeals,
} from '@/app/lib/gemini'
import { isTeamMember, isOwnCompany } from '@/app/lib/config'

const DEALS_LIMIT = 200
const MAX_TEXT_LENGTH = 30000 // Limit text sent to Gemini to avoid timeouts

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

    // Filter out excluded entities as an additional safeguard
    const filteredContacts = extracted.contacts.filter(c => !isTeamMember(c.name))
    const filteredOrgName = extracted.suggestedOrganizationName && !isOwnCompany(extracted.suggestedOrganizationName)
      ? extracted.suggestedOrganizationName
      : null
    const filteredDealName = extracted.suggestedDealName && !isOwnCompany(extracted.suggestedDealName)
      ? extracted.suggestedDealName
      : null

    const proposed: Record<string, any> = {
      productTags: extracted.productTags || [],
      contacts: filteredContacts,
    }
    
    // Only include non-null values to avoid undefined in JSON
    if (filteredDealName) proposed.suggestedDealName = filteredDealName
    if (filteredOrgName) proposed.suggestedOrganizationName = filteredOrgName
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

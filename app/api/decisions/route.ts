import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'

const VALID_ACTIONS = ['approve', 'edit_approve', 'reject', 'defer'] as const

type Action = (typeof VALID_ACTIONS)[number]

interface DecisionBody {
  itemId?: unknown
  action?: unknown
  payload?: {
    reason?: string
    dealId?: string
    contact?: { displayName?: string; role?: string }
    updates?: {
      lastDecision?: string
      nextStep?: string
      rollingSummary?: string
      productTags?: string[]
    }
    newEntities?: {
      organization?: { name: string }
      deal?: { name: string; organizationId?: string; productTags?: string[] }
    }
    // Learning system fields
    aiSuggestedTags?: string[]
    rawTextSnippet?: string
  }
}

export async function POST(request: NextRequest) {
  let body: DecisionBody
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const itemId = typeof body.itemId === 'string' ? body.itemId.trim() : ''
  const action = body.action as Action | undefined
  const payload = body.payload ?? {}

  if (!itemId) {
    return Response.json({ error: 'itemId is required' }, { status: 400 })
  }
  if (!action || !VALID_ACTIONS.includes(action)) {
    return Response.json(
      { error: 'action must be one of: approve, edit_approve, reject, defer' },
      { status: 400 }
    )
  }

  const existing = await prisma.item.findUnique({ where: { id: itemId } })
  if (!existing) {
    return Response.json({ error: 'Item not found' }, { status: 404 })
  }

  const item = await prisma.$transaction(async (tx) => {
    let finalDealId = payload.dealId
    let finalOrgId: string | undefined
    let finalContactId: string | undefined

    const contactName =
      typeof payload.contact?.displayName === 'string'
        ? payload.contact.displayName.trim()
        : ''
    const contactRole =
      typeof payload.contact?.role === 'string' && payload.contact.role.trim()
        ? payload.contact.role.trim()
        : 'POC'

    // Handle new entity creation if requested
    if (payload.newEntities) {
      if (payload.newEntities.organization) {
        const org = await tx.organization.create({
          data: {
            name: payload.newEntities.organization.name,
            aliases: [],
          },
        })
        finalOrgId = org.id
        if (payload.newEntities.deal) payload.newEntities.deal.organizationId = org.id
      }

      if (payload.newEntities.deal) {
        const deal = await tx.deal.create({
          data: {
            name: payload.newEntities.deal.name,
            organizationId: payload.newEntities.deal.organizationId,
            aliases: [],
            productTags: payload.newEntities.deal.productTags || [],
          },
        })
        finalDealId = deal.id
        if (!finalOrgId && deal.organizationId) finalOrgId = deal.organizationId
      }
    }

    // If linking to an existing deal, infer org from the deal.
    if (!finalOrgId && finalDealId) {
      const deal = await tx.deal.findUnique({
        where: { id: finalDealId },
        select: { organizationId: true },
      })
      if (deal?.organizationId) finalOrgId = deal.organizationId
    }

    // Create (or reuse) contact and link to deal as POC.
    if (contactName) {
      const existingContact = await tx.contact.findFirst({
        where: {
          displayName: contactName,
          ...(finalOrgId ? { organizationId: finalOrgId } : {}),
        },
        select: { id: true },
      })

      if (existingContact) {
        finalContactId = existingContact.id
      } else {
        const created = await tx.contact.create({
          data: {
            displayName: contactName,
            aliases: [],
            organizationId: finalOrgId ?? null,
          },
          select: { id: true },
        })
        finalContactId = created.id
      }

      if (finalDealId && finalContactId) {
        await tx.dealContact.upsert({
          where: {
            dealId_contactId: {
              dealId: finalDealId,
              contactId: finalContactId,
            },
          },
          create: {
            dealId: finalDealId,
            contactId: finalContactId,
            role: contactRole,
          },
          update: {
            role: contactRole,
          },
        })
      }
    }

    // Apply updates to the deal if provided
    if (finalDealId && payload.updates) {
      await tx.deal.update({
        where: { id: finalDealId },
        data: {
          lastDecision: payload.updates.lastDecision,
          nextStep: payload.updates.nextStep,
          rollingSummary: payload.updates.rollingSummary,
          productTags: payload.updates.productTags,
        },
      })
    }

    await tx.decisionLog.create({
      data: {
        itemId,
        action,
        payload: payload as any,
        ts: new Date(),
      },
    })

    // Learning system: Log product tag corrections for future AI improvement
    const aiSuggestedTags = Array.isArray(payload.aiSuggestedTags) ? payload.aiSuggestedTags : []
    const userFinalTags = payload.updates?.productTags || payload.newEntities?.deal?.productTags || []
    const rawTextSnippet = typeof payload.rawTextSnippet === 'string' ? payload.rawTextSnippet.slice(0, 500) : ''
    
    // Only store feedback if there's meaningful data to learn from
    if (rawTextSnippet && (aiSuggestedTags.length > 0 || userFinalTags.length > 0)) {
      await tx.productTagFeedback.create({
        data: {
          rawTextSnippet,
          aiSuggestedTags,
          userFinalTags,
          dealId: finalDealId ?? null,
          organizationId: finalOrgId ?? null,
        },
      })
    }

    const updateData: { status: string; reason?: string | null; dealId?: string | null } = {
      status:
        action === 'approve' || action === 'edit_approve' ? 'approved' : action === 'reject' ? 'rejected' : 'inbox',
    }
    
    if (action === 'reject') updateData.reason = payload.reason ?? null
    if (action === 'defer') updateData.reason = payload.reason ?? 'defer'
    if (finalDealId !== undefined) updateData.dealId = finalDealId ?? null

    return tx.item.update({
      where: { id: itemId },
      data: updateData,
    })
  })

  return Response.json({
    ok: true,
    item: {
      ...item,
      createdAt: item.createdAt.toISOString(),
    },
  })
}

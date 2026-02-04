import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'

const VALID_STAGES = ['qualified', 'mou_signed', 'integration', 'won', 'lost_on_hold'] as const

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      organization: { select: { id: true, name: true } },
      dealContacts: {
        select: {
          role: true,
          contact: {
            select: {
              id: true,
              displayName: true,
              email: true,
              telegramHandle: true,
            },
          },
        },
      },
      items: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          rawText: true,
          status: true,
          createdAt: true,
        },
      },
    },
  })

  if (!deal) {
    return Response.json({ error: 'Deal not found' }, { status: 404 })
  }

  return Response.json({ deal })
}

interface DealUpdateBody {
  stage?: string
  lastDecision?: string
  nextStep?: string
  rollingSummary?: string
  mouSignedAt?: string | null
  integrationCompletedAt?: string | null
  coMarketingCompletedAt?: string | null
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: DealUpdateBody
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const existing = await prisma.deal.findUnique({ where: { id } })
  if (!existing) {
    return Response.json({ error: 'Deal not found' }, { status: 404 })
  }

  const updateData: Record<string, unknown> = {}

  // Handle stage update with validation
  if (body.stage !== undefined) {
    if (!VALID_STAGES.includes(body.stage as typeof VALID_STAGES[number])) {
      return Response.json(
        { error: `Invalid stage. Must be one of: ${VALID_STAGES.join(', ')}` },
        { status: 400 }
      )
    }
    updateData.stage = body.stage
  }

  // Handle text field updates
  if (body.lastDecision !== undefined) updateData.lastDecision = body.lastDecision
  if (body.nextStep !== undefined) updateData.nextStep = body.nextStep
  if (body.rollingSummary !== undefined) updateData.rollingSummary = body.rollingSummary

  // Handle milestone date updates
  if (body.mouSignedAt !== undefined) {
    updateData.mouSignedAt = body.mouSignedAt ? new Date(body.mouSignedAt) : null
  }
  if (body.integrationCompletedAt !== undefined) {
    updateData.integrationCompletedAt = body.integrationCompletedAt ? new Date(body.integrationCompletedAt) : null
  }
  if (body.coMarketingCompletedAt !== undefined) {
    updateData.coMarketingCompletedAt = body.coMarketingCompletedAt ? new Date(body.coMarketingCompletedAt) : null
  }

  const deal = await prisma.deal.update({
    where: { id },
    data: updateData,
    include: {
      organization: { select: { id: true, name: true } },
      dealContacts: {
        select: {
          role: true,
          contact: {
            select: {
              id: true,
              displayName: true,
              email: true,
              telegramHandle: true,
            },
          },
        },
      },
    },
  })

  return Response.json({ deal })
}

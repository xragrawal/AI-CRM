import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { answerRecallQuery } from '@/app/lib/gemini'

export async function POST(request: NextRequest) {
  let body: { query?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const query = typeof body.query === 'string' ? body.query.trim() : ''
  if (!query) {
    return Response.json({ error: 'query is required' }, { status: 400 })
  }

  const [deals, recentItems] = await Promise.all([
    prisma.deal.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: {
        organization: { select: { name: true } },
      },
    }),
    prisma.item.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      where: { status: 'approved' },
      include: {
        deal: { select: { name: true } },
      },
    }),
  ])

  const response = await answerRecallQuery(query, {
    deals: deals.map((d) => ({
      name: d.name,
      lastDecision: d.lastDecision,
      nextStep: d.nextStep,
      rollingSummary: d.rollingSummary,
      organizationName: d.organization?.name ?? null,
    })),
    recentItems: recentItems.map((i) => ({
      dealName: i.deal?.name ?? null,
      rawText: i.rawText,
      createdAt: i.createdAt.toISOString(),
    })),
  })

  return Response.json(response)
}

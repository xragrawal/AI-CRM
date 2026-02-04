import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'

const VALID_STATUSES = ['proposed', 'approved', 'rejected', 'inbox'] as const

export async function POST(request: NextRequest) {
  let body: { rawText?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const rawText =
    typeof body.rawText === 'string' ? body.rawText.trim() : ''
  if (!rawText) {
    return Response.json(
      { error: 'rawText is required, must be non-empty string' },
      { status: 400 }
    )
  }

  const item = await prisma.item.create({
    data: {
      rawText,
      sourceType: 'paste',
      status: 'proposed',
      dealId: null,
      reason: null,
    },
  })

  return Response.json({
    item: {
      ...item,
      createdAt: item.createdAt.toISOString(),
    },
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const statusParam = searchParams.get('status')?.toLowerCase()

  const status =
    statusParam && VALID_STATUSES.includes(statusParam as (typeof VALID_STATUSES)[number])
      ? statusParam
      : undefined

  const items = await prisma.item.findMany({
    orderBy: { createdAt: 'desc' },
    where: status ? { status } : undefined,
  })

  return Response.json({
    items: items.map((i) => ({
      ...i,
      createdAt: i.createdAt.toISOString(),
    })),
  })
}

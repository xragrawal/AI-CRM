import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withCache, CACHE_TTL } from '@/app/lib/cache'

const SEARCH_LIMIT = 200

function isAliasMatch(aliases: unknown, q: string): boolean {
  if (!Array.isArray(aliases)) return false
  return aliases.some(
    (a) => typeof a === 'string' && a.toLowerCase().includes(q)
  )
}

export async function GET(request: NextRequest) {
  return Response.json(
    await withCache(
      request,
      async () => {
        const { searchParams } = new URL(request.url)
        const qRaw = searchParams.get('q') ?? ''
        const q = qRaw.trim().toLowerCase()

        const deals = await prisma.deal.findMany({
          orderBy: { updatedAt: 'desc' },
          ...(q ? { take: SEARCH_LIMIT } : {}),
          include: {
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
            dealContacts: {
              select: {
                role: true,
                contact: {
                  select: {
                    id: true,
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

        const filtered = q
          ? deals.filter((d) => {
              if (d.name.toLowerCase().includes(q)) return true
              if (isAliasMatch(d.aliases, q)) return true
              if (d.organization?.name.toLowerCase().includes(q)) return true
              const contactMatch = d.dealContacts.some(
                (dc) =>
                  dc.contact.displayName?.toLowerCase().includes(q)
              )
              if (contactMatch) return true
              return false
            })
          : deals

        return { deals: filtered }
      },
      // Use a shorter cache time if there's a search query
      new URL(request.url).searchParams.has('q') ? CACHE_TTL.SHORT : CACHE_TTL.MEDIUM
    )
  )
}

const VALID_STAGES = ['qualified', 'mou_signed', 'integration', 'won', 'lost_on_hold'] as const

export async function POST(request: NextRequest) {
  let body: { name?: unknown; organizationId?: unknown; aliases?: unknown; stage?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) {
    return Response.json(
      { error: 'name is required' },
      { status: 400 }
    )
  }

  const organizationId =
    typeof body.organizationId === 'string' && body.organizationId.trim()
      ? body.organizationId.trim()
      : null

  const aliases = Array.isArray(body.aliases) ? body.aliases.filter((a): a is string => typeof a === 'string') : []

  const stage = typeof body.stage === 'string' && VALID_STAGES.includes(body.stage as typeof VALID_STAGES[number])
    ? body.stage
    : 'qualified'

  const deal = await prisma.deal.create({
    data: {
      name,
      aliases,
      organizationId,
      stage,
    },
  })

  return Response.json({ deal })
}

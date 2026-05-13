import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withCache, CACHE_TTL } from '@/app/lib/cache'

export async function GET(request: NextRequest) {
  return Response.json(
    await withCache(
      request,
      async () => {
        const { searchParams } = new URL(request.url)
        const qRaw = searchParams.get('q') ?? ''
        const q = qRaw.trim().toLowerCase()

        const contacts = await prisma.contact.findMany({
          orderBy: { displayName: 'asc' },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                dealContacts: true,
              },
            },
          },
        })

        const filtered = q
          ? contacts.filter((c) => {
              if (c.displayName.toLowerCase().includes(q)) return true
              if (c.email?.toLowerCase().includes(q)) return true
              if (c.telegramHandle?.toLowerCase().includes(q)) return true
              if (c.organization?.name.toLowerCase().includes(q)) return true
              return false
            })
          : contacts

        return { contacts: filtered }
      },
      // Use a shorter cache time if there's a search query
      new URL(request.url).searchParams.has('q') ? CACHE_TTL.SHORT : CACHE_TTL.MEDIUM
    )
  )
}

export async function POST(request: NextRequest) {
  let body: { displayName?: unknown; organizationId?: unknown; email?: unknown; telegramHandle?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : ''
  if (!displayName) {
    return Response.json({ error: 'displayName is required' }, { status: 400 })
  }

  const organizationId =
    typeof body.organizationId === 'string' && body.organizationId.trim()
      ? body.organizationId.trim()
      : null

  try {
    const contact = await prisma.contact.create({
      data: {
        displayName,
        organizationId,
        email: typeof body.email === 'string' ? body.email : null,
        telegramHandle: typeof body.telegramHandle === 'string' ? body.telegramHandle : null,
        aliases: [],
      },
    })
    return Response.json({ contact })
  } catch {
    return Response.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}

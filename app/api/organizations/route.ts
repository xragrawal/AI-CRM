import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'

const SEARCH_LIMIT = 200

function isAliasMatch(aliases: unknown, q: string): boolean {
  if (!Array.isArray(aliases)) return false
  return aliases.some(
    (a) => typeof a === 'string' && a.toLowerCase().includes(q)
  )
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const qRaw = searchParams.get('q') ?? ''
    const q = qRaw.trim().toLowerCase()

    const organizations = await prisma.organization.findMany({
      orderBy: { updatedAt: 'desc' },
      ...(q ? { take: SEARCH_LIMIT } : {}),
      include: {
        _count: {
          select: {
            deals: true,
            contacts: true,
          },
        },
      },
    })

    const filtered = q
      ? organizations.filter((org) => {
          if (org.name.toLowerCase().includes(q)) return true
          if (isAliasMatch(org.aliases, q)) return true
          return false
        })
      : organizations

    return Response.json({ organizations: filtered })
  } catch {
    return Response.json({ error: 'Failed to fetch organizations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let body: { name?: unknown; aliases?: unknown }
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

  const aliases = Array.isArray(body.aliases) ? body.aliases.filter((a): a is string => typeof a === 'string') : []

  const organization = await prisma.organization.create({
    data: {
      name,
      aliases,
    },
  })

  return Response.json({ organization })
}

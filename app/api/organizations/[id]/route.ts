import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      deals: {
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          lastDecision: true,
          nextStep: true,
          updatedAt: true,
        },
      },
      contacts: {
        orderBy: { displayName: 'asc' },
        select: {
          id: true,
          displayName: true,
          email: true,
          telegramHandle: true,
        },
      },
    },
  })

  if (!organization) {
    return Response.json({ error: 'Organization not found' }, { status: 404 })
  }

  return Response.json({ organization })
}

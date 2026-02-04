import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      deal: {
        select: {
          id: true,
          name: true,
          organization: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!item) {
    return Response.json({ error: 'Item not found' }, { status: 404 })
  }

  return Response.json({ item })
}

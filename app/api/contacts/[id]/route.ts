import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      dealContacts: {
        include: {
          deal: {
            select: {
              id: true,
              name: true,
              lastDecision: true,
              nextStep: true,
            },
          },
        },
      },
    },
  })

  if (!contact) {
    return Response.json({ error: 'Contact not found' }, { status: 404 })
  }

  return Response.json({ contact })
}

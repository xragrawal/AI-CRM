import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { generateText } from '@/app/lib/ai'

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { dealId, scope, duration, startDate, pricing, governingLaw, template, partyBContacts } = body
  if (!dealId) return Response.json({ error: 'dealId is required' }, { status: 400 })

  let deal
  try {
    deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        organization: true,
        dealContacts: {
          include: {
            contact: { select: { displayName: true, email: true } },
          },
        },
      },
    })
  } catch {
    return Response.json({ error: 'Database error fetching deal' }, { status: 500 })
  }

  if (!deal) return Response.json({ error: 'Deal not found' }, { status: 404 })

  const partyB = deal.organization?.name ?? 'Partner Organization'
  const dbContacts = deal.dealContacts.map(dc =>
    `${dc.contact.displayName}${dc.role ? ` (${dc.role})` : ''}${dc.contact.email ? ` <${dc.contact.email}>` : ''}`
  ).join(', ')
  const contacts = (typeof partyBContacts === 'string' && partyBContacts.trim()) ? partyBContacts.trim() : dbContacts

  let prompt: string

  if (template) {
    prompt = `You are a professional legal drafting assistant. Fill in the MoU template below using the provided deal data. Replace every {{PLACEHOLDER}} marker with the appropriate content. Use formal legal language. Output ONLY the completed MoU — no preamble, no commentary.

DEAL DATA:
Deal Name: ${deal.name}
Party A: Your Organization (the Service Provider)
Party B: ${partyB}
Key Contacts at Party B: ${contacts || 'TBD'}
Scope of Work: ${scope || deal.rollingSummary || 'As agreed between the parties'}
Pilot Duration: ${duration ?? '60 days'}
Start Date: ${startDate ?? 'To be agreed'}
Commercial Terms: ${pricing || deal.lastDecision || 'As agreed between the parties'}
Governing Law: ${governingLaw ?? 'Delaware, USA'}
Next Steps (context): ${deal.nextStep ?? 'N/A'}

TEMPLATE:
${template}`
  } else {
    prompt = `You are a professional legal drafting assistant. Generate a clean, complete Memorandum of Understanding (MoU) using the details below. Use formal legal language. Output only the MoU text — no preamble, no commentary.

DEAL: ${deal.name}
PARTY A: Your Organization (the Service Provider)
PARTY B: ${partyB}
KEY CONTACTS AT PARTY B: ${contacts || 'TBD'}
SCOPE OF WORK: ${scope || deal.rollingSummary || 'As agreed between the parties'}
PILOT DURATION: ${duration ?? '60 days'}
START DATE: ${startDate ?? 'To be agreed'}
COMMERCIAL TERMS: ${pricing || deal.lastDecision || 'As agreed between the parties'}
GOVERNING LAW: ${governingLaw ?? 'Delaware, USA'}
NEXT STEPS (for context): ${deal.nextStep ?? 'N/A'}

Structure the MoU with these sections:
1. MEMORANDUM OF UNDERSTANDING (title + parties + date)
2. RECITALS
3. PURPOSE
4. SCOPE OF COLLABORATION
5. DURATION
6. FINANCIAL TERMS
7. OBLIGATIONS OF PARTY A
8. OBLIGATIONS OF PARTY B
9. CONFIDENTIALITY
10. GOVERNING LAW & DISPUTE RESOLUTION
11. SIGNATURES

Keep each section concise and professional. Use plain text formatting with ALL CAPS section headers.`
  }

  try {
    const mou = await generateText(prompt)
    return Response.json({ mou })
  } catch (err: any) {
    console.error('Gemini MoU error:', err)
    const message = err?.message ?? 'Failed to generate MoU'
    return Response.json({ error: message }, { status: 500 })
  }
}

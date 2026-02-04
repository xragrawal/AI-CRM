import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') ?? 'json'

  const [organizations, contacts, deals, items, decisionLogs] = await Promise.all([
    prisma.organization.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.contact.findMany({
      orderBy: { displayName: 'asc' },
      include: {
        organization: { select: { id: true, name: true } },
      },
    }),
    prisma.deal.findMany({
      orderBy: { name: 'asc' },
      include: {
        organization: { select: { id: true, name: true } },
        dealContacts: {
          include: {
            contact: { select: { id: true, displayName: true } },
          },
        },
      },
    }),
    prisma.item.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        deal: { select: { id: true, name: true } },
        proposal: true,
      },
    }),
    prisma.decisionLog.findMany({
      orderBy: { ts: 'desc' },
    }),
  ])

  const exportData = {
    exportedAt: new Date().toISOString(),
    organizations,
    contacts,
    deals,
    items,
    decisionLogs,
  }

  if (format === 'markdown') {
    const md = generateMarkdown(exportData)
    return new Response(md, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'attachment; filename="personal-crm-export.md"',
      },
    })
  }

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="personal-crm-export.json"',
    },
  })
}

interface ExportData {
  exportedAt: string
  organizations: Array<{
    id: string
    name: string
    aliases: unknown
    rollingSummary: string | null
  }>
  contacts: Array<{
    id: string
    displayName: string
    aliases: unknown
    email: string | null
    telegramHandle: string | null
    organization?: { id: string; name: string } | null
  }>
  deals: Array<{
    id: string
    name: string
    aliases: unknown
    lastDecision: string | null
    nextStep: string | null
    rollingSummary: string | null
    organization?: { id: string; name: string } | null
    dealContacts: Array<{
      role: string | null
      contact: { id: string; displayName: string }
    }>
  }>
  items: Array<{
    id: string
    rawText: string
    status: string
    createdAt: Date
    deal?: { id: string; name: string } | null
  }>
  decisionLogs: Array<{
    id: string
    itemId: string
    action: string
    payload: unknown
    ts: Date
  }>
}

function generateMarkdown(data: ExportData): string {
  const lines: string[] = []

  lines.push('# PersonalCRM Export')
  lines.push(`Exported at: ${data.exportedAt}`)
  lines.push('')

  lines.push('## Organizations')
  lines.push('')
  if (data.organizations.length === 0) {
    lines.push('_No organizations_')
  } else {
    for (const org of data.organizations) {
      lines.push(`### ${org.name}`)
      const aliases = Array.isArray(org.aliases) ? org.aliases : []
      if (aliases.length > 0) {
        lines.push(`**Aliases:** ${aliases.join(', ')}`)
      }
      if (org.rollingSummary) {
        lines.push('')
        lines.push(org.rollingSummary)
      }
      lines.push('')
    }
  }
  lines.push('')

  lines.push('## Contacts')
  lines.push('')
  if (data.contacts.length === 0) {
    lines.push('_No contacts_')
  } else {
    for (const contact of data.contacts) {
      lines.push(`### ${contact.displayName}`)
      if (contact.organization) {
        lines.push(`**Organization:** ${contact.organization.name}`)
      }
      if (contact.email) {
        lines.push(`**Email:** ${contact.email}`)
      }
      if (contact.telegramHandle) {
        lines.push(`**Telegram:** @${contact.telegramHandle}`)
      }
      lines.push('')
    }
  }
  lines.push('')

  lines.push('## Deals')
  lines.push('')
  if (data.deals.length === 0) {
    lines.push('_No deals_')
  } else {
    for (const deal of data.deals) {
      lines.push(`### ${deal.name}`)
      if (deal.organization) {
        lines.push(`**Organization:** ${deal.organization.name}`)
      }
      if (deal.dealContacts.length > 0) {
        const contactNames = deal.dealContacts.map(dc => 
          dc.role ? `${dc.contact.displayName} (${dc.role})` : dc.contact.displayName
        )
        lines.push(`**Contacts:** ${contactNames.join(', ')}`)
      }
      if (deal.lastDecision) {
        lines.push('')
        lines.push(`**Last Decision:** ${deal.lastDecision}`)
      }
      if (deal.nextStep) {
        lines.push(`**Next Step:** ${deal.nextStep}`)
      }
      if (deal.rollingSummary) {
        lines.push('')
        lines.push(deal.rollingSummary)
      }
      lines.push('')
    }
  }
  lines.push('')

  lines.push('## Conversations')
  lines.push('')
  if (data.items.length === 0) {
    lines.push('_No conversations_')
  } else {
    for (const item of data.items) {
      lines.push(`### Item ${item.id.slice(0, 8)}`)
      lines.push(`**Status:** ${item.status}`)
      lines.push(`**Date:** ${new Date(item.createdAt).toLocaleString()}`)
      if (item.deal) {
        lines.push(`**Deal:** ${item.deal.name}`)
      }
      lines.push('')
      lines.push('```')
      lines.push(item.rawText)
      lines.push('```')
      lines.push('')
    }
  }

  lines.push('## Decision Log')
  lines.push('')
  if (data.decisionLogs.length === 0) {
    lines.push('_No decisions_')
  } else {
    lines.push('| Date | Action | Item |')
    lines.push('|------|--------|------|')
    for (const log of data.decisionLogs) {
      const date = new Date(log.ts).toLocaleString()
      lines.push(`| ${date} | ${log.action} | ${log.itemId.slice(0, 8)} |`)
    }
  }

  return lines.join('\n')
}

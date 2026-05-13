import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { chatWithAssistant as chatWithGemini } from '@/app/lib/gemini'
import { chatWithAssistant as chatWithOpenAI } from '@/app/lib/openai'
import { extractProposalFromText as extractWithGemini } from '@/app/lib/gemini'
import { extractProposalFromText as extractWithOpenAI } from '@/app/lib/openai'
import { TEAM_MEMBERS, OWN_COMPANY } from '@/app/lib/config'
import { buildProductTagContext, getRelevantClassificationContext } from '@/app/lib/learning'
import { parseFileContent } from '@/app/lib/fileParser'
import { fetchURLContent } from '@/app/lib/urlParser'
import { crmChain } from '@/app/lib/langchain'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  message: string
  history?: ChatMessage[]
  provider?: 'gemini' | 'openai'
  action?: 'chat' | 'create_record'
  file?: File
  url?: string
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let body: ChatRequest

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const message = formData.get('message') as string
      const history = formData.get('history') as string
      const provider = formData.get('provider') as string
      const action = formData.get('action') as string
      const file = formData.get('file') as File | null
      const url = formData.get('url') as string | null

      body = {
        message,
        history: history ? JSON.parse(history) : [],
        provider: (provider as 'gemini' | 'openai') || 'gemini',
        action: (action as 'chat' | 'create_record') || 'chat',
      }

      if (file) {
        const parsed = await parseFileContent(file)
        body.message = `File uploaded: ${parsed.metadata.fileName}\n\n${parsed.text}`
      }

      if (url) {
        const parsed = await fetchURLContent(url)
        body.message = `Content from URL: ${parsed.metadata.url}\n\n${parsed.text}`
      }
    } else {
      body = await req.json()
    }

    const { message, history = [], provider = (process.env.AI_PROVIDER ?? 'gemini') } = body

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Use LangChain to determine intent
    const intentResult = await crmChain.processIntent(message)

    if (intentResult.intent === 'capture') {
      const captureText = intentResult.content || message
      const excludedContactNames = TEAM_MEMBERS.flatMap((m) => [m.name, ...m.aliases]).join(', ')
      const excludedOrgNames = [OWN_COMPANY.name, ...OWN_COMPANY.aliases].join(', ')
      const learningContext = await getRelevantClassificationContext(captureText)
      const productTagContext = buildProductTagContext()

      let proposal
      if (provider === 'openai') {
        proposal = await extractWithOpenAI(
          captureText,
          excludedContactNames,
          excludedOrgNames,
          productTagContext,
          learningContext
        )
      } else {
        proposal = await extractWithGemini(captureText)
      }

      const item = await prisma.item.create({
        data: {
          rawText: captureText,
          sourceType: 'chat',
          status: 'pending',
        },
      })

      await prisma.proposal.create({
        data: {
          itemId: item.id,
          candidatesJson: [],
          proposedJson: JSON.parse(JSON.stringify(proposal)),
        },
      })

      return NextResponse.json({
        intent: 'capture',
        response: 'I\'ve extracted the information and created a record for review.',
        itemId: item.id,
        proposal,
      })
    }

    if (intentResult.intent === 'recall') {
      const query = intentResult.query || message
      // Fetch data for recall
      const [deals, contacts, recentActivity] = await Promise.all([
        prisma.deal.findMany({
          select: {
            name: true,
            stage: true,
            organization: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: 20,
        }),
        prisma.contact.findMany({
          select: {
            displayName: true,
            email: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: 20,
        }),
        prisma.item.findMany({
          select: {
            rawText: true,
            deal: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        }),
      ])

      const context = {
        deals: deals.map((d) => ({
          name: d.name,
          stage: d.stage,
          organizationName: d.organization?.name || null,
        })),
        contacts: contacts.map((c) => ({
          displayName: c.displayName,
          email: c.email,
        })),
        recentActivity: recentActivity.map((i) => ({
          dealName: i.deal?.name || null,
          rawText: i.rawText,
        })),
      }

      let response
      if (provider === 'openai') {
        response = await chatWithOpenAI(query, history, context)
      } else {
        response = await chatWithGemini(query, history, context)
      }

      return NextResponse.json({ 
        intent: 'recall',
        response 
      })
    }

    // Default chat
    let chatResponse
    if (provider === 'openai') {
      chatResponse = await chatWithOpenAI(message, history, {})
    } else {
      chatResponse = await chatWithGemini(message, history, {})
    }

    return NextResponse.json({ 
      intent: 'chat',
      response: chatResponse 
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process chat',
      },
      { status: 500 }
    )
  }
}

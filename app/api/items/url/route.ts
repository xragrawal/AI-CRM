import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { fetchURLContent, isValidURL } from '@/app/lib/urlParser'

export async function POST(request: NextRequest) {
  let body: { url?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const url = typeof body.url === 'string' ? body.url.trim() : ''
  
  if (!url) {
    return Response.json(
      { error: 'URL is required' },
      { status: 400 }
    )
  }

  if (!isValidURL(url)) {
    return Response.json(
      { error: 'Invalid URL format. Please provide a valid HTTP or HTTPS URL.' },
      { status: 400 }
    )
  }

  try {
    const parsed = await fetchURLContent(url)

    if (!parsed.text.trim()) {
      return Response.json(
        { error: 'Could not extract any content from the URL' },
        { status: 400 }
      )
    }

    // Create item with URL metadata prepended
    const rawText = `[Source URL: ${url}]\n${parsed.metadata.title ? `[Title: ${parsed.metadata.title}]\n` : ''}[Type: ${parsed.metadata.parseMethod}]\n\n${parsed.text}`

    const item = await prisma.item.create({
      data: {
        rawText,
        sourceType: 'url',
        status: 'proposed',
      },
    })

    return Response.json({
      item: {
        ...item,
        createdAt: item.createdAt.toISOString(),
      },
      metadata: parsed.metadata,
    })
  } catch (error) {
    console.error('URL fetch error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch URL content' },
      { status: 400 }
    )
  }
}

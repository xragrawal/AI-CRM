import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { parseFileContent } from '@/app/lib/fileParser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return Response.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Parse file content
    let parsed
    try {
      parsed = await parseFileContent(file)
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : 'Failed to parse file' },
        { status: 400 }
      )
    }

    if (!parsed.text.trim()) {
      return Response.json(
        { error: 'File appears to be empty or could not be parsed' },
        { status: 400 }
      )
    }

    // Create item with file metadata prepended
    const rawText = `[Source: ${parsed.metadata.fileName}]\n[Type: ${parsed.metadata.parseMethod}]\n\n${parsed.text}`

    const item = await prisma.item.create({
      data: {
        rawText,
        sourceType: 'file_upload',
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
    console.error('File upload error:', error)
    return Response.json(
      { error: 'Failed to process file upload' },
      { status: 500 }
    )
  }
}

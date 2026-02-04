/**
 * URL content fetching and parsing utilities
 */

export interface ParsedURLContent {
  text: string
  metadata: {
    url: string
    title?: string
    description?: string
    parseMethod: string
  }
}

/**
 * Fetch and parse content from a URL
 */
export async function fetchURLContent(url: string): Promise<ParsedURLContent> {
  // Validate URL
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are supported')
    }
  } catch {
    throw new Error('Invalid URL format')
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PersonalCRM/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7',
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || ''
    const text = await response.text()
    
    let parsedText = ''
    let title = ''
    let description = ''
    let parseMethod = 'raw'

    if (contentType.includes('text/html')) {
      const result = parseHTMLContent(text)
      parsedText = result.text
      title = result.title
      description = result.description
      parseMethod = 'html'
    } else if (contentType.includes('application/json')) {
      parsedText = formatJSON(text)
      parseMethod = 'json'
    } else if (contentType.includes('text/plain')) {
      parsedText = text
      parseMethod = 'text'
    } else if (contentType.includes('text/')) {
      parsedText = text
      parseMethod = 'text'
    } else {
      throw new Error(`Unsupported content type: ${contentType}`)
    }

    // Limit content length
    const MAX_CHARS = 100000
    if (parsedText.length > MAX_CHARS) {
      parsedText = parsedText.slice(0, MAX_CHARS) + '\n\n[... content truncated for length ...]'
    }

    return {
      text: parsedText.trim(),
      metadata: {
        url,
        title: title || undefined,
        description: description || undefined,
        parseMethod,
      },
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out while fetching URL')
      }
      throw error
    }
    throw new Error('Failed to fetch URL content')
  }
}

/**
 * Parse HTML content and extract readable text
 */
function parseHTMLContent(html: string): { text: string; title: string; description: string } {
  let title = ''
  let description = ''
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) {
    title = decodeHTMLEntities(titleMatch[1].trim())
  }
  
  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  if (descMatch) {
    description = decodeHTMLEntities(descMatch[1].trim())
  }
  
  // Remove unwanted elements
  let text = html
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  text = text.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
  text = text.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
  text = text.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
  text = text.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
  text = text.replace(/<!--[\s\S]*?-->/g, '')
  
  // Try to extract main content
  const mainMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                    text.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                    text.match(/<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
  
  if (mainMatch) {
    text = mainMatch[1]
  } else {
    // Fall back to body content
    const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) {
      text = bodyMatch[1]
    }
  }
  
  // Convert block elements to newlines
  text = text.replace(/<\/?(p|div|br|h[1-6]|li|tr|blockquote|section)[^>]*>/gi, '\n')
  text = text.replace(/<\/?(ul|ol)[^>]*>/gi, '\n\n')
  
  // Handle links - preserve URL in text
  text = text.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi, '$2 ($1)')
  
  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '')
  
  // Decode HTML entities
  text = decodeHTMLEntities(text)
  
  // Normalize whitespace
  text = text.replace(/[ \t]+/g, ' ')
  text = text.replace(/\n[ \t]+/g, '\n')
  text = text.replace(/\n{3,}/g, '\n\n')
  
  // Build final text with metadata
  let result = ''
  if (title) {
    result += `Title: ${title}\n\n`
  }
  if (description) {
    result += `Summary: ${description}\n\n`
  }
  result += 'Content:\n' + text.trim()
  
  return { text: result, title, description }
}

/**
 * Decode common HTML entities
 */
function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&#x([a-fA-F0-9]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

/**
 * Format JSON for readability
 */
function formatJSON(jsonText: string): string {
  try {
    const data = JSON.parse(jsonText)
    return 'JSON Content:\n\n' + JSON.stringify(data, null, 2)
  } catch {
    return jsonText
  }
}

/**
 * Validate if a string is a valid URL
 */
export function isValidURL(str: string): boolean {
  try {
    const url = new URL(str)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

/**
 * File parsing utilities for extracting text from various file formats
 */

export interface ParsedContent {
  text: string
  metadata: {
    fileName: string
    fileType: string
    fileSize: number
    parseMethod: string
  }
}

/**
 * Parse text content from common file formats
 * Supports: .txt, .md, .csv, .json, .html, .xml
 */
export async function parseFileContent(
  file: File
): Promise<ParsedContent> {
  const fileName = file.name
  const fileType = file.type || getTypeFromExtension(fileName)
  const fileSize = file.size
  
  let text = ''
  let parseMethod = 'raw'

  try {
    if (isTextBasedFile(fileName, fileType)) {
      text = await file.text()
      parseMethod = 'text'
      
      // Clean up based on file type
      if (fileName.endsWith('.csv')) {
        text = parseCSVToReadable(text)
        parseMethod = 'csv'
      } else if (fileName.endsWith('.json')) {
        text = parseJSONToReadable(text)
        parseMethod = 'json'
      } else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
        text = parseHTMLToText(text)
        parseMethod = 'html'
      } else if (fileName.endsWith('.xml')) {
        text = parseXMLToText(text)
        parseMethod = 'xml'
      }
    } else {
      // For binary files, return a message indicating unsupported format
      throw new Error(`Unsupported file format: ${fileType || fileName}`)
    }

    // Trim and normalize whitespace
    text = text.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    
    // Limit text length to prevent overwhelming the AI
    const MAX_CHARS = 100000
    if (text.length > MAX_CHARS) {
      text = text.slice(0, MAX_CHARS) + '\n\n[... content truncated for length ...]'
    }

  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to parse file content'
    )
  }

  return {
    text,
    metadata: {
      fileName,
      fileType,
      fileSize,
      parseMethod,
    },
  }
}

/**
 * Check if file is text-based and can be parsed
 */
function isTextBasedFile(fileName: string, mimeType: string): boolean {
  const textExtensions = [
    '.txt', '.md', '.markdown', '.csv', '.json', 
    '.html', '.htm', '.xml', '.log', '.rtf',
    '.yaml', '.yml', '.ini', '.cfg', '.conf',
    '.js', '.ts', '.jsx', '.tsx', '.py', '.rb',
    '.sh', '.bash', '.zsh', '.sql', '.css', '.scss'
  ]
  
  const textMimeTypes = [
    'text/', 'application/json', 'application/xml',
    'application/javascript', 'application/x-yaml'
  ]

  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'))
  if (textExtensions.includes(ext)) return true
  
  if (textMimeTypes.some(t => mimeType.startsWith(t))) return true
  
  return false
}

/**
 * Get mime type from file extension
 */
function getTypeFromExtension(fileName: string): string {
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'))
  const typeMap: Record<string, string> = {
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.xml': 'application/xml',
  }
  return typeMap[ext] || 'application/octet-stream'
}

/**
 * Parse CSV to readable text format
 */
function parseCSVToReadable(csvText: string): string {
  const lines = csvText.trim().split('\n')
  if (lines.length === 0) return csvText
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1)
  
  let result = `CSV Data with ${rows.length} rows:\n\n`
  result += `Columns: ${headers.join(', ')}\n\n`
  
  // Convert to readable format
  rows.slice(0, 50).forEach((row, idx) => {
    const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    result += `Row ${idx + 1}:\n`
    headers.forEach((header, i) => {
      if (values[i]) {
        result += `  ${header}: ${values[i]}\n`
      }
    })
    result += '\n'
  })
  
  if (rows.length > 50) {
    result += `... and ${rows.length - 50} more rows\n`
  }
  
  return result
}

/**
 * Parse JSON to readable format
 */
function parseJSONToReadable(jsonText: string): string {
  try {
    const data = JSON.parse(jsonText)
    return `JSON Content:\n\n${JSON.stringify(data, null, 2)}`
  } catch {
    return jsonText
  }
}

/**
 * Parse HTML to plain text
 */
function parseHTMLToText(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  
  // Replace common block elements with newlines
  text = text.replace(/<\/?(p|div|br|h[1-6]|li|tr)[^>]*>/gi, '\n')
  
  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '')
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  
  // Normalize whitespace
  text = text.replace(/\n\s*\n/g, '\n\n')
  text = text.replace(/[ \t]+/g, ' ')
  
  return text.trim()
}

/**
 * Parse XML to readable text
 */
function parseXMLToText(xml: string): string {
  // Similar to HTML parsing but preserve structure better
  let text = xml.replace(/<\?xml[^>]*\?>/gi, '')
  text = text.replace(/<!--[\s\S]*?-->/g, '')
  text = text.replace(/<([^>]+)>/g, '\n[$1]: ')
  text = text.replace(/\n\s*\n/g, '\n')
  return text.trim()
}

/**
 * Supported file extensions for display
 */
export const SUPPORTED_FILE_TYPES = [
  '.txt', '.md', '.csv', '.json', '.html', '.xml', '.log'
]

export const SUPPORTED_MIME_TYPES = [
  'text/plain',
  'text/markdown', 
  'text/csv',
  'application/json',
  'text/html',
  'application/xml',
  'text/xml'
]

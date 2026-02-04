import { prisma } from './prisma'

// Product tag definitions for AI context
export const PRODUCT_TAG_DEFINITIONS = {
  'KYA': 'Know Your Agent - Identity verification and authentication for agents/intermediaries',
  'Id/KYC': 'Identity/Know Your Customer - User identity verification and KYC compliance solutions',
  'PoU': 'Proof of Unique User - Verification that users are unique individuals, anti-fraud measures',
  'Others': 'General category for deals not fitting the above product lines'
} as const

export const AVAILABLE_PRODUCT_TAGS = Object.keys(PRODUCT_TAG_DEFINITIONS) as (keyof typeof PRODUCT_TAG_DEFINITIONS)[]

/**
 * Retrieves relevant past classification corrections to provide context for AI
 * Uses simple keyword matching to find similar past decisions
 */
export async function getRelevantClassificationContext(rawText: string): Promise<string> {
  try {
    // Get recent feedback entries (last 50 for performance)
    const recentFeedback = await prisma.productTagFeedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    if (recentFeedback.length === 0) {
      return ''
    }

    // Extract keywords from the input text for matching
    const inputKeywords = extractKeywords(rawText.toLowerCase())
    
    // Find entries with overlapping keywords
    const relevantEntries = recentFeedback
      .map((entry: any) => {
        const snippetKeywords = extractKeywords(entry.rawTextSnippet.toLowerCase())
        const overlap = inputKeywords.filter((k: string) => snippetKeywords.includes(k)).length
        return { entry, overlap }
      })
      .filter(({ overlap }: { overlap: number }) => overlap >= 2) // At least 2 keyword matches
      .sort((a: { overlap: number }, b: { overlap: number }) => b.overlap - a.overlap)
      .slice(0, 5) // Top 5 most relevant

    if (relevantEntries.length === 0) {
      return ''
    }

    // Format as context for AI
    const contextLines = relevantEntries.map(({ entry }: { entry: any }) => {
      const aiTags = Array.isArray(entry.aiSuggestedTags) ? entry.aiSuggestedTags : []
      const userTags = Array.isArray(entry.userFinalTags) ? entry.userFinalTags : []
      
      // Only include if there was a correction (AI was wrong)
      if (JSON.stringify(aiTags.sort()) === JSON.stringify(userTags.sort())) {
        return null
      }
      
      return `- Text snippet: "${entry.rawTextSnippet.slice(0, 100)}..." → AI suggested: [${aiTags.join(', ')}], User corrected to: [${userTags.join(', ')}]`
    }).filter(Boolean)

    if (contextLines.length === 0) {
      return ''
    }

    return `
LEARNING FROM PAST CORRECTIONS:
The following are examples where the AI's initial classification was corrected by the user. Use these to improve your classification:
${contextLines.join('\n')}
`
  } catch (error) {
    console.error('Error fetching classification context:', error)
    return ''
  }
}

/**
 * Extracts meaningful keywords from text for similarity matching
 */
function extractKeywords(text: string): string[] {
  // Remove common stop words and extract meaningful terms
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'to', 'of', 'in',
    'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'between', 'under',
    'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
    'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some',
    'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
    'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until',
    'while', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she',
    'it', 'we', 'they', 'what', 'which', 'who', 'whom', 'its', 'his',
    'her', 'their', 'our', 'your', 'my'
  ])

  return text
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
}

/**
 * Builds the product tag context section for the AI prompt
 */
export function buildProductTagContext(): string {
  const definitions = Object.entries(PRODUCT_TAG_DEFINITIONS)
    .map(([tag, desc]) => `- "${tag}": ${desc}`)
    .join('\n')

  return `
PRODUCT TAG DEFINITIONS (Billions Products):
${definitions}

IMPORTANT: Only assign tags if the text clearly relates to that product. Do NOT guess. If unsure, use "Others" or leave empty.
`
}

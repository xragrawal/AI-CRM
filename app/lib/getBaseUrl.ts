import { headers } from 'next/headers'

/**
 * Base URL for server-side fetch (e.g. calling own API routes).
 * Use when building absolute URLs in RSC/server actions.
 * - Deploy (Vercel): uses VERCEL_URL / VERCEL_BRANCH_URL
 * - Local: uses host from request or localhost:3000
 */
export async function getBaseUrl(): Promise<string> {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  if (process.env.VERCEL_BRANCH_URL) {
    return `https://${process.env.VERCEL_BRANCH_URL}`
  }
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  return `${protocol}://${host}`
}

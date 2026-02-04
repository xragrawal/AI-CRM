import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In-memory store for rate limiting
// In a production environment, you would use Redis or another distributed store
const rateLimit = new Map<string, { count: number; lastReset: number }>()

// Rate limit configuration
const RATE_LIMIT = 60 // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds

export async function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Get client IP from headers
  const ip = request.headers.get('x-forwarded-for') || 'anonymous'
  const now = Date.now()
  
  // Get or initialize rate limit data for this IP
  let rateData = rateLimit.get(ip)
  
  if (!rateData || now - rateData.lastReset > RATE_LIMIT_WINDOW) {
    // First request or window expired, reset counter
    rateData = { count: 1, lastReset: now }
  } else {
    // Increment request count
    rateData.count++
  }
  
  // Store updated rate limit data
  rateLimit.set(ip, rateData)
  
  // Check if rate limit exceeded
  if (rateData.count > RATE_LIMIT) {
    return new NextResponse(
      JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': RATE_LIMIT.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (rateData.lastReset + RATE_LIMIT_WINDOW).toString(),
        },
      }
    )
  }
  
  // Add rate limit headers to response
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString())
  response.headers.set('X-RateLimit-Remaining', (RATE_LIMIT - rateData.count).toString())
  response.headers.set('X-RateLimit-Reset', (rateData.lastReset + RATE_LIMIT_WINDOW).toString())
  
  return response
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*',
  ],
}

// Simple in-memory cache implementation
// In a production environment, you would use Redis or another distributed cache

interface CacheEntry {
  data: any;
  expiry: number;
}

class Cache {
  private cache: Map<string, CacheEntry>;
  private defaultTTL: number; // Time to live in milliseconds

  constructor(defaultTTL = 60 * 1000) { // Default: 1 minute
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any, ttl = this.defaultTTL): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Export a singleton instance
export const apiCache = new Cache();

// Cache TTL constants
export const CACHE_TTL = {
  SHORT: 30 * 1000,        // 30 seconds
  MEDIUM: 5 * 60 * 1000,   // 5 minutes
  LONG: 30 * 60 * 1000,    // 30 minutes
};

// Helper function to create a cache key from a URL
export function createCacheKey(url: URL): string {
  return `${url.pathname}${url.search}`;
}

// Helper function to wrap API handlers with caching
export async function withCache<T>(
  request: Request,
  handler: () => Promise<T>,
  ttl = CACHE_TTL.MEDIUM
): Promise<T> {
  const url = new URL(request.url);
  
  // Only cache GET requests
  if (request.method !== 'GET') {
    return await handler();
  }
  
  const cacheKey = createCacheKey(url);
  const cachedData = apiCache.get(cacheKey);
  
  if (cachedData !== null) {
    return cachedData;
  }
  
  // Execute the handler and cache the result
  const result = await handler();
  apiCache.set(cacheKey, result, ttl);
  
  return result;
}

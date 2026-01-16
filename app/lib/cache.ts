// Simple in-memory cache with TTL support

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  // Clean up expired entries (called periodically)
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance (persists across requests in development)
export const cache = new MemoryCache();

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  PULLS: 300, // 5 minutes for pull requests
  LABELS: 600, // 10 minutes for labels (they rarely change)
  REPOS: 600, // 10 minutes for repository list
} as const;

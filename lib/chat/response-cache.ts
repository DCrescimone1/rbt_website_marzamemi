/**
 * Simple in-memory response cache with LRU eviction
 * Caches chat responses to avoid redundant API calls
 */

interface CacheEntry {
  response: string;
  timestamp: number;
}

/**
 * LRU (Least Recently Used) Cache implementation
 */
class LRUCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Generate a cache key from message and history
   */
  private generateKey(message: string, history: Array<{ role: string; content: string }>): string {
    // Create a deterministic key from message and recent history
    const historyKey = history.slice(-4).map(h => `${h.role}:${h.content}`).join('|');
    return `${message}::${historyKey}`;
  }

  /**
   * Get a cached response
   */
  get(message: string, history: Array<{ role: string; content: string }>): string | null {
    const key = this.generateKey(message, history);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Move to end (most recently used) by deleting and re-adding
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.response;
  }

  /**
   * Store a response in the cache
   */
  set(message: string, history: Array<{ role: string; content: string }>, response: string): void {
    const key = this.generateKey(message, history);

    // If cache is at max size, remove the oldest entry (first in Map)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    // Add new entry
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get current cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; oldestEntry: number | null } {
    let oldestTimestamp: number | null = null;

    if (this.cache.size > 0) {
      const firstEntry = this.cache.values().next().value;
      oldestTimestamp = firstEntry?.timestamp || null;
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      oldestEntry: oldestTimestamp
    };
  }
}

// Export singleton instance
export const responseCache = new LRUCache(100);

// Export class for testing
export { LRUCache };

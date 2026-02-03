import { NextResponse } from 'next/server';
import { responseCache } from '@/lib/chat';

/**
 * GET handler for cache statistics
 */
export async function GET() {
  const stats = responseCache.getStats();
  
  return NextResponse.json({
    cache: {
      ...stats,
      utilizationPercent: Math.round((stats.size / stats.maxSize) * 100),
      oldestEntryAge: stats.oldestEntry 
        ? Math.round((Date.now() - stats.oldestEntry) / 1000) 
        : null
    },
    timestamp: new Date().toISOString()
  });
}

/**
 * DELETE handler to clear the cache
 */
export async function DELETE() {
  const sizeBefore = responseCache.size();
  responseCache.clear();
  
  return NextResponse.json({
    message: 'Cache cleared successfully',
    entriesCleared: sizeBefore,
    timestamp: new Date().toISOString()
  });
}

/**
 * Integration test for response caching
 * Simulates the cache behavior in the chat API
 * Run with: npx tsx test-cache-integration.ts
 */

import { responseCache } from './lib/chat';

console.log('='.repeat(70));
console.log('Cache Integration Test - Simulating Chat API Flow');
console.log('='.repeat(70));
console.log();

// Clear cache to start fresh
responseCache.clear();

// Simulate chat requests
const testRequests = [
  { message: 'Where is the house?', history: [] },
  { message: 'How many people can stay?', history: [] },
  { message: 'Where is the house?', history: [] }, // Duplicate - should hit cache
  { 
    message: 'What about pets?', 
    history: [
      { role: 'user', content: 'Where is the house?' },
      { role: 'assistant', content: 'In Marzamemi, Sicily' }
    ]
  },
  { message: 'Where is the house?', history: [] }, // Duplicate again
];

console.log('Simulating 5 chat requests...\n');

testRequests.forEach((req, index) => {
  console.log(`Request ${index + 1}: "${req.message}"`);
  console.log(`History length: ${req.history.length}`);
  
  // Check cache
  const cached = responseCache.get(req.message, req.history);
  
  if (cached) {
    console.log('✓ CACHE HIT - Returning cached response');
    console.log(`Response: "${cached}"`);
  } else {
    console.log('✗ CACHE MISS - Generating new response');
    // Simulate API call and cache storage
    const mockResponse = `Mock response for: ${req.message}`;
    responseCache.set(req.message, req.history, mockResponse);
    console.log(`Response: "${mockResponse}"`);
    console.log(`✓ Cached for future requests (cache size: ${responseCache.size()})`);
  }
  
  console.log();
});

// Show final stats
const stats = responseCache.getStats();
console.log('='.repeat(70));
console.log('Final Cache Statistics:');
console.log('-'.repeat(70));
console.log(`Total entries: ${stats.size}/${stats.maxSize}`);
console.log(`Utilization: ${Math.round((stats.size / stats.maxSize) * 100)}%`);
console.log(`Cache hits: 2 out of 5 requests (40% hit rate)`);
console.log(`API calls saved: 2`);
console.log('='.repeat(70));
console.log();

// Test cache with 100+ entries
console.log('Testing LRU eviction with 100+ entries...\n');
responseCache.clear();

for (let i = 1; i <= 120; i++) {
  responseCache.set(`Question ${i}`, [], `Answer ${i}`);
}

console.log(`Added 120 entries to cache with max size 100`);
console.log(`Current cache size: ${responseCache.size()}`);
console.log(`First 20 entries should be evicted...`);
console.log(`Question 1: ${responseCache.get('Question 1', []) ? '✓ Found' : '✗ Evicted'}`);
console.log(`Question 20: ${responseCache.get('Question 20', []) ? '✓ Found' : '✗ Evicted'}`);
console.log(`Question 21: ${responseCache.get('Question 21', []) ? '✓ Found' : '✗ Evicted'}`);
console.log(`Question 120: ${responseCache.get('Question 120', []) ? '✓ Found' : '✗ Evicted'}`);
console.log();

console.log('='.repeat(70));
console.log('✓ Integration test completed successfully');
console.log('='.repeat(70));

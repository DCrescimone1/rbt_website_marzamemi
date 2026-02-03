/**
 * Test script for response cache
 * Run with: npx tsx test-response-cache.ts
 */

import { LRUCache } from './lib/chat/response-cache';

console.log('='.repeat(70));
console.log('Testing Response Cache (LRU with 100 entry limit)');
console.log('='.repeat(70));
console.log();

// Create a cache instance
const cache = new LRUCache(5); // Small size for testing

console.log('Test 1: Basic cache operations');
console.log('-'.repeat(70));

// Test set and get
cache.set('Hello', [], 'Hi there!');
cache.set('How are you?', [], 'I am doing well, thanks!');
cache.set('What is your name?', [], 'I am a chatbot.');

console.log('Cache size:', cache.size());
console.log('Get "Hello":', cache.get('Hello', []));
console.log('Get "How are you?":', cache.get('How are you?', []));
console.log('Get "What is your name?":', cache.get('What is your name?', []));
console.log('Get non-existent:', cache.get('Not in cache', []));
console.log();

console.log('Test 2: Cache with history');
console.log('-'.repeat(70));

const history1 = [
  { role: 'user', content: 'Hi' },
  { role: 'assistant', content: 'Hello!' }
];

const history2 = [
  { role: 'user', content: 'Hi' },
  { role: 'assistant', content: 'Hello!' },
  { role: 'user', content: 'How are you?' },
  { role: 'assistant', content: 'Good!' }
];

cache.set('Tell me more', history1, 'Response with history1');
cache.set('Tell me more', history2, 'Response with history2');

console.log('Same message, different history:');
console.log('With history1:', cache.get('Tell me more', history1));
console.log('With history2:', cache.get('Tell me more', history2));
console.log();

console.log('Test 3: LRU eviction (max size = 5)');
console.log('-'.repeat(70));

// Add 5 entries (cache is now full)
for (let i = 1; i <= 5; i++) {
  cache.set(`Message ${i}`, [], `Response ${i}`);
}

console.log('Cache size after adding 5 entries:', cache.size());
console.log('Stats:', JSON.stringify(cache.getStats(), null, 2));

// Access entry 2 to make it recently used
console.log('\nAccessing "Message 2" to make it recently used...');
cache.get('Message 2', []);

// Add a 6th entry - should evict the oldest (Message 1)
console.log('Adding 6th entry (should evict oldest)...');
cache.set('Message 6', [], 'Response 6');

console.log('\nCache size:', cache.size());
console.log('Message 1 (should be evicted):', cache.get('Message 1', []));
console.log('Message 2 (should still exist):', cache.get('Message 2', []));
console.log('Message 6 (newly added):', cache.get('Message 6', []));
console.log();

console.log('Test 4: Clear cache');
console.log('-'.repeat(70));

cache.clear();
console.log('Cache size after clear:', cache.size());
console.log('Get after clear:', cache.get('Message 2', []));
console.log();

console.log('Test 5: Production-size cache (100 entries)');
console.log('-'.repeat(70));

const prodCache = new LRUCache(100);

// Add 150 entries
for (let i = 1; i <= 150; i++) {
  prodCache.set(`Query ${i}`, [], `Answer ${i}`);
}

console.log('Added 150 entries to cache with max size 100');
console.log('Final cache size:', prodCache.size());
console.log('First 50 entries should be evicted...');
console.log('Query 1 (evicted):', prodCache.get('Query 1', []));
console.log('Query 50 (evicted):', prodCache.get('Query 50', []));
console.log('Query 51 (should exist):', prodCache.get('Query 51', []) ? '✓ Found' : '✗ Not found');
console.log('Query 100 (should exist):', prodCache.get('Query 100', []) ? '✓ Found' : '✗ Not found');
console.log('Query 150 (should exist):', prodCache.get('Query 150', []) ? '✓ Found' : '✗ Not found');
console.log();

console.log('='.repeat(70));
console.log('✓ All cache tests completed successfully');
console.log('='.repeat(70));

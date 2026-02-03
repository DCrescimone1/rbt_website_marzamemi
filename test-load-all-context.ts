/**
 * Test script to verify loadAllContext function
 * Run with: npx tsx test-load-all-context.ts
 */

import { loadAllContext } from './lib/chat/context-matcher';

console.log('='.repeat(70));
console.log('Testing loadAllContext Function');
console.log('='.repeat(70));
console.log();

const allQAs = loadAllContext();

console.log(`Total Q&A pairs loaded: ${allQAs.length}`);
console.log();

console.log('First 3 Q&A pairs:');
allQAs.slice(0, 3).forEach((qa, index) => {
  console.log(`\n${index + 1}. Q: ${qa.question.substring(0, 60)}...`);
  console.log(`   A: ${qa.answer.substring(0, 60)}...`);
});

console.log();
console.log('Last 3 Q&A pairs:');
allQAs.slice(-3).forEach((qa, index) => {
  console.log(`\n${allQAs.length - 2 + index}. Q: ${qa.question.substring(0, 60)}...`);
  console.log(`   A: ${qa.answer.substring(0, 60)}...`);
});

console.log();
console.log('='.repeat(70));
console.log(`✓ Successfully loaded all ${allQAs.length} Q&A pairs`);
console.log('='.repeat(70));

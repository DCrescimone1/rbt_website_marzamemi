/**
 * Unit test for language detection in prompt template
 * Run with: npx tsx test-prompt-language.ts
 */

import { buildPrompt } from './lib/chat/prompt-builder';
import { QAPair } from './lib/chat/context-matcher';

console.log('🧪 Testing Language Detection in Prompt Template\n');

// Create sample context
const sampleContext: QAPair[] = [
  {
    question: 'How many people max?',
    answer: 'Max 4 people: 2 in the bedroom (double bed), 2 in the living room (sofa bed).',
    score: 95
  },
  {
    question: 'Is there WiFi?',
    answer: 'Free high-speed WiFi (46 Mbps), suitable for HD streaming and video calls.',
    score: 85
  }
];

// Build the prompt
const prompt = buildPrompt(sampleContext);

console.log('Generated System Prompt:');
console.log('='.repeat(80));
console.log(prompt);
console.log('='.repeat(80));

// Verify language detection instructions are present
const checks = [
  {
    name: 'Language detection instruction present',
    test: () => prompt.toLowerCase().includes('detect') && prompt.toLowerCase().includes('language')
  },
  {
    name: 'Italian language mentioned',
    test: () => prompt.toLowerCase().includes('italian')
  },
  {
    name: 'English language mentioned',
    test: () => prompt.toLowerCase().includes('english')
  },
  {
    name: 'Response language matching instruction',
    test: () => prompt.toLowerCase().includes('same language') || prompt.toLowerCase().includes('match')
  },
  {
    name: 'Context properly injected',
    test: () => prompt.includes('Max 4 people') && prompt.includes('WiFi')
  },
  {
    name: 'Company name replaced',
    test: () => prompt.includes('Acquamarina')
  }
];

console.log('\n✅ Verification Results:\n');

let allPassed = true;
checks.forEach(check => {
  const passed = check.test();
  console.log(`${passed ? '✅' : '❌'} ${check.name}`);
  if (!passed) allPassed = false;
});

console.log('\n' + '='.repeat(80));
if (allPassed) {
  console.log('✅ All checks passed! Language detection is properly configured.');
} else {
  console.log('❌ Some checks failed. Review the prompt template.');
}

/**
 * Manual test script for language detection in CAG chatbot
 * Run with: npx tsx test-language-detection.ts
 */

const API_URL = 'http://localhost:3000/api/chat';

interface ChatResponse {
  message: string;
  timestamp: string;
}

interface ChatError {
  error: string;
  code: string;
  details?: string;
}

async function testChat(message: string, language: string): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing ${language} query:`);
  console.log(`User: ${message}`);
  console.log('-'.repeat(60));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: []
      })
    });

    if (!response.ok) {
      const error = await response.json() as ChatError;
      console.error(`❌ Error (${response.status}):`, error.error);
      if (error.details) {
        console.error(`   Details: ${error.details}`);
      }
      return;
    }

    const data = await response.json() as ChatResponse;
    console.log(`Assistant: ${data.message}`);
    console.log(`✅ Response received in ${language}`);
  } catch (error) {
    console.error(`❌ Request failed:`, error instanceof Error ? error.message : error);
  }
}

async function runTests() {
  console.log('🧪 Testing Language Detection and Multi-Language Support');
  console.log('Make sure the development server is running on http://localhost:3000\n');

  // Test 1: Italian query about capacity
  await testChat('Quante persone può ospitare la casa?', 'Italian');
  
  // Wait a bit between requests
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: English query about WiFi
  await testChat('Is there WiFi available?', 'English');
  
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 3: Italian query about check-in
  await testChat('A che ora posso fare il check-in?', 'Italian');
  
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 4: English query about pets
  await testChat('Can I bring my dog?', 'English');
  
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 5: Italian query about pool
  await testChat('La piscina è privata o condivisa?', 'Italian');
  
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 6: English query about parking
  await testChat('Is parking available?', 'English');

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ All tests completed!');
  console.log('Review the responses above to verify:');
  console.log('  1. Italian queries receive Italian responses');
  console.log('  2. English queries receive English responses');
  console.log('  3. Responses are contextually accurate');
  console.log('  4. Tone is warm and conversational');
}

// Run the tests
runTests().catch(console.error);

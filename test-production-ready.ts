// test-production-ready.ts
// Test script to verify Stripe production readiness

async function testProductionReadiness() {
  console.log('🚀 Testing Stripe Production Readiness\n');

  const checks = [
    {
      name: 'Environment Variables Set',
      test: () => {
        const hasSecret = !!process.env.STRIPE_SECRET_KEY;
        const hasPub = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        const hasUrl = !!process.env.NEXT_PUBLIC_APP_URL;
        
        console.log(`  - STRIPE_SECRET_KEY: ${hasSecret ? '✓ SET' : '✗ MISSING'}`);
        console.log(`  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${hasPub ? '✓ SET' : '✗ MISSING'}`);
        console.log(`  - NEXT_PUBLIC_APP_URL: ${hasUrl ? '✓ SET' : '✗ MISSING'}`);
        
        return hasSecret && hasPub && hasUrl;
      }
    },
    {
      name: 'Using Test Keys (Development)',
      test: () => {
        const isTestSecret = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_');
        const isTestPub = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_');
        
        console.log(`  - Secret key type: ${isTestSecret ? 'TEST ✓' : 'LIVE or INVALID'}`);
        console.log(`  - Publishable key type: ${isTestPub ? 'TEST ✓' : 'LIVE or INVALID'}`);
        
        return isTestSecret && isTestPub;
      }
    },
    {
      name: 'App URL Configuration',
      test: () => {
        const url = process.env.NEXT_PUBLIC_APP_URL;
        console.log(`  - Current URL: ${url}`);
        return !!url;
      }
    },
    {
      name: 'API Endpoint Accessible',
      test: async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const response = await fetch(`${baseUrl}/api/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingDetails: {
                checkIn: '2025-06-01',
                checkOut: '2025-06-08',
                guests: 4,
                totalAmount: 1000,
                language: 'en'
              }
            })
          });
          
          const isOk = response.ok;
          console.log(`  - API Response: ${response.status} ${response.statusText}`);
          
          if (isOk) {
            const data = await response.json();
            console.log(`  - Session created: ${data.sessionId ? '✓' : '✗'}`);
            console.log(`  - Checkout URL: ${data.url ? '✓' : '✗'}`);
          }
          
          return isOk;
        } catch (error) {
          console.log(`  - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.log(`  - Make sure dev server is running: npm run dev`);
          return false;
        }
      }
    }
  ];

  let allPassed = true;

  for (const check of checks) {
    console.log(`\n📋 ${check.name}`);
    try {
      const result = await check.test();
      if (!result) {
        allPassed = false;
      }
      console.log(`${result ? '✅ PASS' : '❌ FAIL'}`);
    } catch (error) {
      console.log(`❌ FAIL - ${error instanceof Error ? error.message : 'Unknown error'}`);
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✅ All checks passed! Ready for production setup.');
    console.log('\nNext steps:');
    console.log('1. Activate your Stripe account');
    console.log('2. Get live API keys from Stripe Dashboard');
    console.log('3. Update .env.production with live keys');
    console.log('4. Deploy to production');
  } else {
    console.log('❌ Some checks failed. Please review the errors above.');
  }
  console.log('='.repeat(50) + '\n');
}

// Run the test
testProductionReadiness();

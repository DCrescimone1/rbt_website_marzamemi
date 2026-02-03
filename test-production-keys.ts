// test-production-keys.ts
// Test script to verify production Stripe keys are valid

import Stripe from 'stripe';

async function testProductionKeys() {
  console.log('🔑 Testing Stripe Production Keys\n');

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Check 1: Keys are set
  console.log('📋 Environment Variables');
  console.log(`  - STRIPE_SECRET_KEY: ${secretKey ? '✓ SET' : '✗ MISSING'}`);
  console.log(`  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${publishableKey ? '✓ SET' : '✗ MISSING'}`);
  console.log(`  - NEXT_PUBLIC_APP_URL: ${appUrl || '✗ MISSING'}`);

  if (!secretKey || !publishableKey) {
    console.log('\n❌ Keys not set. Cannot continue.\n');
    return;
  }

  // Check 2: Key types
  console.log('\n📋 Key Types');
  const isLiveSecret = secretKey.startsWith('sk_live_');
  const isLivePub = publishableKey.startsWith('pk_live_');
  console.log(`  - Secret key: ${isLiveSecret ? '✓ LIVE' : '✗ NOT LIVE'}`);
  console.log(`  - Publishable key: ${isLivePub ? '✓ LIVE' : '✗ NOT LIVE'}`);

  if (!isLiveSecret || !isLivePub) {
    console.log('\n⚠️  Warning: Not using live keys\n');
  }

  // Check 3: Validate keys with Stripe API
  console.log('\n📋 Stripe API Validation');
  try {
    const stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    });

    // Try to retrieve account info (this validates the key)
    console.log('  - Connecting to Stripe API...');
    const account = await stripe.accounts.retrieve();
    
    console.log(`  - ✓ Connection successful`);
    console.log(`  - Account ID: ${account.id}`);
    console.log(`  - Business Name: ${account.business_profile?.name || 'Not set'}`);
    console.log(`  - Country: ${account.country}`);
    console.log(`  - Charges Enabled: ${account.charges_enabled ? '✓ YES' : '✗ NO'}`);
    console.log(`  - Payouts Enabled: ${account.payouts_enabled ? '✓ YES' : '✗ NO'}`);

    if (!account.charges_enabled) {
      console.log('\n⚠️  Warning: Charges not enabled yet. Complete Stripe onboarding.');
    }

    // Check 4: Test creating a checkout session
    console.log('\n📋 Test Checkout Session Creation');
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'Test Booking',
                description: 'Test checkout session',
              },
              unit_amount: 10000, // €100
            },
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}`,
        metadata: {
          test: 'true',
        },
      });

      console.log(`  - ✓ Session created: ${session.id}`);
      console.log(`  - Checkout URL: ${session.url}`);
      console.log(`  - Mode: ${session.mode}`);
      console.log(`  - Status: ${session.status}`);

      console.log('\n✅ All checks passed! Your production keys are valid and working.');
      console.log('\n⚠️  IMPORTANT: This created a real checkout session.');
      console.log('   Do NOT share the checkout URL. It will charge real money if used.');
      
    } catch (error) {
      console.log(`  - ✗ Failed to create session`);
      console.log(`  - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }

  } catch (error) {
    console.log(`  - ✗ API validation failed`);
    if (error instanceof Error) {
      console.log(`  - Error: ${error.message}`);
    }
    console.log('\n❌ Key validation failed. Check your keys are correct.');
    return;
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Production keys are configured correctly!');
  console.log('\nNext steps:');
  console.log('1. Deploy your site to production');
  console.log('2. Set these environment variables in your hosting platform');
  console.log('3. Test with a real payment (small amount)');
  console.log('4. Monitor payments in Stripe Dashboard (Live mode)');
  console.log('='.repeat(60) + '\n');
}

testProductionKeys();

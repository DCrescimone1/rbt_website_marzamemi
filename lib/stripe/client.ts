import Stripe from 'stripe';

// Singleton pattern for Stripe client
let stripeInstance: Stripe | null = null;

/**
 * Get or create Stripe client instance
 * @returns {Stripe} Stripe client instance
 * @throws {Error} If STRIPE_SECRET_KEY is not set
 */
export function getStripeClient(): Stripe {
  if (stripeInstance) {
    return stripeInstance;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      'STRIPE_SECRET_KEY is not defined in environment variables'
    );
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: '2023-10-16',
    typescript: true,
  });

  return stripeInstance;
}

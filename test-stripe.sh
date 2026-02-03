#!/bin/bash
# Simple wrapper to run Stripe production readiness test with environment variables

# Load environment variables from .env.local
export $(grep -v '^#' .env.local | xargs)

# Run the test
npx tsx test-production-ready.ts

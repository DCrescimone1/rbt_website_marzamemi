/**
 * Test script for environment validation utility
 * Run with: npx tsx test-env-validation.ts
 */

import { 
  validateEnvironment, 
  validateEnvironmentOrThrow,
  isEnvironmentConfigured,
  getConfigurationErrorMessage 
} from './lib/chat/env-validator';

console.log('='.repeat(70));
console.log('Testing Environment Validation Utility');
console.log('='.repeat(70));
console.log();

// Test 1: Check current environment
console.log('Test 1: Validating current environment...');
const result = validateEnvironment();
console.log('Result:', JSON.stringify(result, null, 2));
console.log();

// Test 2: Check if configured
console.log('Test 2: Is environment configured?');
console.log('Configured:', isEnvironmentConfigured());
console.log();

// Test 3: Display configuration error message if any
if (!result.isValid) {
  console.log('Test 3: Configuration error message:');
  console.log(getConfigurationErrorMessage(result.missing));
  console.log();
} else {
  console.log('Test 3: No configuration errors - all required variables present ✓');
  console.log();
}

// Test 4: Display warnings if any
if (result.warnings.length > 0) {
  console.log('Test 4: Warnings:');
  result.warnings.forEach(warning => console.log(`  - ${warning}`));
  console.log();
} else {
  console.log('Test 4: No warnings ✓');
  console.log();
}

// Test 5: Try validateEnvironmentOrThrow
console.log('Test 5: Testing validateEnvironmentOrThrow...');
try {
  validateEnvironmentOrThrow();
  console.log('✓ Validation passed - no errors thrown');
} catch (error) {
  console.log('✗ Validation failed with error:');
  console.log(error instanceof Error ? error.message : error);
}
console.log();

console.log('='.repeat(70));
console.log('Environment validation tests complete');
console.log('='.repeat(70));

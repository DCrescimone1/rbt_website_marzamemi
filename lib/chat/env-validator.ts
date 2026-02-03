/**
 * Environment Variable Validator for CAG Chatbot
 * 
 * This utility validates that all required environment variables are present
 * and provides helpful error messages for configuration issues.
 * 
 * Usage:
 * 
 * 1. At application startup (recommended):
 *    ```typescript
 *    import { validateEnvironmentOrThrow } from '@/lib/chat/env-validator';
 *    validateEnvironmentOrThrow(); // Throws if variables are missing
 *    ```
 * 
 * 2. For conditional checks:
 *    ```typescript
 *    import { isEnvironmentConfigured } from '@/lib/chat/env-validator';
 *    if (isEnvironmentConfigured()) {
 *      // Enable chat feature
 *    }
 *    ```
 * 
 * 3. For custom error handling:
 *    ```typescript
 *    import { validateEnvironment, getConfigurationErrorMessage } from '@/lib/chat/env-validator';
 *    const result = validateEnvironment();
 *    if (!result.isValid) {
 *      console.error(getConfigurationErrorMessage(result.missing));
 *    }
 *    ```
 */

export interface EnvValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

export interface EnvVariable {
  name: string;
  description: string;
  example?: string;
  required: boolean;
}

/**
 * Required environment variables for the CAG chatbot
 */
const REQUIRED_ENV_VARS: EnvVariable[] = [
  {
    name: 'XAI_API_KEY',
    description: 'xAI API key for Grok model authentication',
    example: 'xai-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    required: true
  },
  {
    name: 'XAI_API_URL',
    description: 'xAI API endpoint URL',
    example: 'https://api.x.ai/v1/chat/completions',
    required: true
  },
  {
    name: 'XAI_MODEL',
    description: 'xAI model name to use',
    example: 'grok-4-fast',
    required: true
  }
];

/**
 * Validate that all required environment variables are present
 * 
 * @returns Validation result with missing variables and warnings
 */
export function validateEnvironment(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar.name];

    if (!value || value.trim() === '') {
      if (envVar.required) {
        missing.push(envVar.name);
      } else {
        warnings.push(`Optional environment variable ${envVar.name} is not set`);
      }
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Get a helpful error message for missing environment variables
 * 
 * @param missing Array of missing environment variable names
 * @returns Formatted error message with configuration instructions
 */
export function getConfigurationErrorMessage(missing: string[]): string {
  if (missing.length === 0) {
    return '';
  }

  const varDetails = REQUIRED_ENV_VARS
    .filter(v => missing.includes(v.name))
    .map(v => {
      let msg = `  - ${v.name}: ${v.description}`;
      if (v.example) {
        msg += `\n    Example: ${v.example}`;
      }
      return msg;
    })
    .join('\n\n');

  return `
╔════════════════════════════════════════════════════════════════╗
║  CAG Chatbot Configuration Error                               ║
╚════════════════════════════════════════════════════════════════╝

Missing required environment variables:

${varDetails}

To fix this issue:
1. Create a .env.local file in the project root (if it doesn't exist)
2. Add the missing environment variables with appropriate values
3. Restart the development server

Example .env.local configuration:
${missing.map(name => {
  const envVar = REQUIRED_ENV_VARS.find(v => v.name === name);
  return `${name}=${envVar?.example || 'your-value-here'}`;
}).join('\n')}

For more information, see the project documentation.
`.trim();
}

/**
 * Validate environment and log warnings/errors
 * Call this at application startup
 * 
 * @throws Error if required environment variables are missing
 */
export function validateEnvironmentOrThrow(): void {
  const result = validateEnvironment();

  // Log warnings for optional variables
  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment Configuration Warnings:');
    result.warnings.forEach(warning => console.warn(`   ${warning}`));
  }

  // Throw error if required variables are missing
  if (!result.isValid) {
    const errorMessage = getConfigurationErrorMessage(result.missing);
    console.error(errorMessage);
    throw new Error(`Missing required environment variables: ${result.missing.join(', ')}`);
  }

  // Success message
  console.log('✓ Environment variables validated successfully');
}

/**
 * Check if environment is properly configured (non-throwing version)
 * Useful for conditional feature enablement
 * 
 * @returns true if all required variables are present
 */
export function isEnvironmentConfigured(): boolean {
  const result = validateEnvironment();
  return result.isValid;
}

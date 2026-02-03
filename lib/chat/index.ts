export { findRelevantContext, loadAllContext, type QAPair } from './context-matcher';
export { buildPrompt } from './prompt-builder';
export { generateResponse, type Message } from './xai-client';
export { 
  validateEnvironment, 
  validateEnvironmentOrThrow, 
  isEnvironmentConfigured,
  getConfigurationErrorMessage,
  type EnvValidationResult,
  type EnvVariable
} from './env-validator';
export { responseCache, LRUCache } from './response-cache';

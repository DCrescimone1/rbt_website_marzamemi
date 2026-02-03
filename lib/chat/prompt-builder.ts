import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { QAPair } from './context-matcher';

interface PromptTemplate {
  template: string;
}

// Cache for loaded YAML template
let cachedTemplate: string | null = null;

/**
 * Load the YAML prompt template
 */
function loadPromptTemplate(): string {
  if (cachedTemplate) {
    return cachedTemplate;
  }

  try {
    const yamlPath = path.join(process.cwd(), 'prompt_chatbot.yaml');
    const yamlContent = fs.readFileSync(yamlPath, 'utf-8');
    const parsed = yaml.parse(yamlContent) as PromptTemplate;
    
    cachedTemplate = parsed.template;
    return cachedTemplate;
  } catch (error) {
    console.error('Failed to load prompt_chatbot.yaml:', error);
    // Return a basic fallback template
    return "You're a helpful AI assistant for Acquamarina, a holiday home in Sicily. Answer questions based on the context provided.";
  }
}

/**
 * Format Q&A pairs as context string
 */
function formatContext(qaPairs: QAPair[]): string {
  if (qaPairs.length === 0) {
    return 'No specific information available in the database.';
  }

  return qaPairs
    .map(pair => `Q: ${pair.question}\nA: ${pair.answer}`)
    .join('\n\n');
}

/**
 * Build the complete system prompt with injected context
 */
export function buildPrompt(context: QAPair[]): string {
  const template = loadPromptTemplate();
  const formattedContext = formatContext(context);
  
  // Replace template variables
  const prompt = template
    .replace('{company_name}', 'Acquamarina')
    .replace('{intel}', formattedContext);
  
  return prompt;
}

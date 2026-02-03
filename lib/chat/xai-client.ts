import { validateEnvironment, getConfigurationErrorMessage } from './env-validator';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface XAIRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}

export interface XAIResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

/**
 * Validate required environment variables and throw detailed error if missing
 */
function validateEnvironmentOrThrow(): void {
  const result = validateEnvironment();
  
  if (!result.isValid) {
    const errorMessage = getConfigurationErrorMessage(result.missing);
    console.error(errorMessage);
    throw new Error(`Missing required environment variables: ${result.missing.join(', ')}`);
  }
}

/**
 * Generate a response from the xAI Grok API
 */
export async function generateResponse(
  systemPrompt: string,
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  validateEnvironmentOrThrow();
  
  const apiKey = process.env.XAI_API_KEY!;
  const apiUrl = process.env.XAI_API_URL!;
  const model = process.env.XAI_MODEL!;
  
  // Build messages array: system prompt + history + current message
  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ];
  
  const requestBody: XAIRequest = {
    model,
    messages,
    temperature: 0.7,
    max_tokens: 500
  };
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`xAI API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json() as XAIResponse;
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from xAI API');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    if (error instanceof Error) {
      console.error('xAI API request failed:', error.message);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
    throw error;
  }
}

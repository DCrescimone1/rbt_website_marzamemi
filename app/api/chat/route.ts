import { NextRequest, NextResponse } from 'next/server';
import { loadAllContext, buildPrompt, generateResponse, validateEnvironment, getConfigurationErrorMessage, responseCache } from '@/lib/chat';

// Validate environment variables at module load time
const envValidation = validateEnvironment();
if (!envValidation.isValid) {
  const errorMessage = getConfigurationErrorMessage(envValidation.missing);
  console.error(errorMessage);
  console.error('⚠️  Chat API will not function properly without required environment variables');
}

// Log warnings if any
if (envValidation.warnings.length > 0) {
  console.warn('⚠️  Environment Configuration Warnings:');
  envValidation.warnings.forEach(warning => console.warn(`   ${warning}`));
}

// Request body interface
interface ChatRequest {
  message: string;
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

// Response interfaces
interface ChatResponse {
  message: string;
  timestamp: string;
}

interface ChatError {
  error: string;
  code: string;
  details?: string;
}

/**
 * Validate the incoming request body
 */
function validateRequest(body: unknown): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const req = body as Partial<ChatRequest>;

  // Validate message field
  if (!req.message || typeof req.message !== 'string') {
    return { valid: false, error: 'Message field is required and must be a string' };
  }

  if (req.message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (req.message.length > 1000) {
    return { valid: false, error: 'Message is too long (max 1000 characters)' };
  }

  // Validate history field if present
  if (req.history !== undefined) {
    if (!Array.isArray(req.history)) {
      return { valid: false, error: 'History must be an array' };
    }

    for (const msg of req.history) {
      if (!msg.role || !msg.content) {
        return { valid: false, error: 'Each history message must have role and content' };
      }
      if (msg.role !== 'user' && msg.role !== 'assistant') {
        return { valid: false, error: 'History message role must be "user" or "assistant"' };
      }
      if (typeof msg.content !== 'string') {
        return { valid: false, error: 'History message content must be a string' };
      }
    }
  }

  return { valid: true };
}

/**
 * POST handler for chat requests
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return NextResponse.json<ChatError>(
        {
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      console.error('Request validation failed:', validation.error);
      return NextResponse.json<ChatError>(
        {
          error: validation.error || 'Invalid request',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    const { message, history = [] } = body as ChatRequest;

    // Limit history to last 10 message pairs (20 messages total)
    const limitedHistory = history.slice(-20);

    // Check cache first
    const cachedResponse = responseCache.get(message, limitedHistory);
    if (cachedResponse) {
      console.log('✓ Cache hit - returning cached response');
      const response: ChatResponse = {
        message: cachedResponse,
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 200 });
    }

    console.log('Cache miss - generating new response');

    // Step 1: Load ALL Q&A pairs from QnA.csv (all entries)
    let context: Array<{ question: string; answer: string }>;
    try {
      context = loadAllContext();
      console.log(`Loaded ${context.length} Q&A pairs (all entries)`);
    } catch (error) {
      console.error('Context loading failed:', error);
      // Continue without context rather than failing completely
      context = [];
    }

    // Step 2: Build system prompt with context
    let systemPrompt;
    try {
      systemPrompt = buildPrompt(context);
    } catch (error) {
      console.error('Prompt building failed:', error);
      return NextResponse.json<ChatError>(
        {
          error: 'Failed to build prompt',
          code: 'PROMPT_BUILD_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Step 3: Generate response from xAI
    let assistantMessage;
    try {
      assistantMessage = await generateResponse(systemPrompt, message, limitedHistory);
      
      // Store in cache for future requests
      responseCache.set(message, limitedHistory, assistantMessage);
      console.log(`✓ Response cached (cache size: ${responseCache.size()})`);
    } catch (error) {
      console.error('xAI API call failed:', error);
      
      // Check if it's an environment variable issue
      if (error instanceof Error && error.message.includes('Missing required environment variables')) {
        return NextResponse.json<ChatError>(
          {
            error: 'Chat service is not properly configured',
            code: 'CONFIG_ERROR',
            details: error.message
          },
          { status: 500 }
        );
      }
      
      // Check if it's an API availability issue
      if (error instanceof Error && error.message.includes('xAI API error')) {
        return NextResponse.json<ChatError>(
          {
            error: 'Chat service is temporarily unavailable',
            code: 'SERVICE_UNAVAILABLE',
            details: error.message
          },
          { status: 503, headers: { 'Retry-After': '60' } }
        );
      }
      
      // Generic error
      return NextResponse.json<ChatError>(
        {
          error: 'Failed to generate response',
          code: 'GENERATION_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Return successful response
    const response: ChatResponse = {
      message: assistantMessage,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    // Catch-all for unexpected errors
    console.error('Unexpected error in chat API:', error);
    return NextResponse.json<ChatError>(
      {
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

import fs from 'fs';
import path from 'path';

export interface QAPair {
  question: string;
  answer: string;
  score?: number;
}

// Cache for parsed CSV data
let cachedQAPairs: QAPair[] | null = null;

/**
 * Parse the QnA.csv file and cache the results
 */
function loadQnAData(): QAPair[] {
  if (cachedQAPairs) {
    return cachedQAPairs;
  }

  try {
    const csvPath = path.join(process.cwd(), 'QnA.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV (skip header row)
    const lines = csvContent.split('\n').slice(1);
    cachedQAPairs = lines
      .filter(line => line.trim())
      .map(line => {
        // Simple CSV parsing - handles quoted fields with commas
        const match = line.match(/^"?([^"]*)"?,(.*)$/);
        if (!match) return null;
        
        return {
          question: match[1].trim(),
          answer: match[2].replace(/^"(.*)"$/, '$1').trim()
        };
      })
      .filter((pair): pair is QAPair => pair !== null);

    return cachedQAPairs;
  } catch (error) {
    console.warn('Failed to load QnA.csv:', error);
    return [];
  }
}

/**
 * Tokenize text for keyword matching
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(token => token.length > 2); // Filter out very short words
}

/**
 * Calculate relevance score between query and question
 */
function calculateScore(queryTokens: string[], questionTokens: string[]): number {
  let score = 0;
  
  for (const queryToken of queryTokens) {
    for (const questionToken of questionTokens) {
      // Exact match
      if (queryToken === questionToken) {
        score += 3;
      }
      // Partial match (one contains the other)
      else if (queryToken.includes(questionToken) || questionToken.includes(queryToken)) {
        score += 1;
      }
    }
  }
  
  // Normalize by query length to prevent bias toward longer queries
  return queryTokens.length > 0 ? score / queryTokens.length : 0;
}

/**
 * Load all Q&A pairs from the knowledge base
 * Returns all entries without filtering or scoring
 */
export function loadAllContext(): QAPair[] {
  return loadQnAData();
}

/**
 * Find relevant Q&A pairs from the knowledge base based on user query
 */
export function findRelevantContext(userQuery: string, topN: number = 5): QAPair[] {
  const qaPairs = loadQnAData();
  
  if (qaPairs.length === 0) {
    return [];
  }
  
  const queryTokens = tokenize(userQuery);
  
  if (queryTokens.length === 0) {
    return [];
  }
  
  // Score each Q&A pair
  const scoredPairs = qaPairs.map(pair => {
    const questionTokens = tokenize(pair.question);
    const score = calculateScore(queryTokens, questionTokens);
    
    return {
      ...pair,
      score
    };
  });
  
  // Sort by score (descending) and return top N
  return scoredPairs
    .filter(pair => pair.score && pair.score > 0)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, topN);
}

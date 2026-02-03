# priceSearchService.ts - Frontend Service

## File Location
`src/lib/agentql/priceSearchService.ts`

## Purpose
Frontend service that handles communication between the React UI and the backend price search API. Acts as an abstraction layer to simplify API calls from components.

## Dependencies

```typescript
import type { SearchResult } from '@/components/price-comparison/types';
import type { DateRange } from "react-day-picker";
```

## Interfaces

### GuestInfo
```typescript
interface GuestInfo {
  adults: number;    // Number of adult guests
  children: number;  // Number of child guests
}
```

### ApiResponse
```typescript
interface ApiResponse {
  results?: SearchResult[];  // Array of price results from different platforms
  error?: string;           // Error message if request fails
  details?: string;         // Additional error details (development only)
}
```

## Main Function: searchPrices

### Signature
```typescript
export async function searchPrices(
  dates: DateRange,
  guests: GuestInfo,
  language: string
): Promise<SearchResult[]>
```

### Parameters

#### dates: DateRange
- **Type**: DateRange from react-day-picker
- **Structure**:
  ```typescript
  {
    from: Date | undefined,
    to: Date | undefined
  }
  ```
- **Validation**: Both from and to must be defined
- **Purpose**: Check-in and check-out dates for the booking

#### guests: GuestInfo
- **Type**: GuestInfo
- **Structure**:
  ```typescript
  {
    adults: number,
    children: number
  }
  ```
- **Purpose**: Number of guests for the booking

#### language: string
- **Type**: string
- **Values**: "it" or "en"
- **Purpose**: Language preference for localized results (affects Booking.com URL)

### Return Value
- **Type**: `Promise<SearchResult[]>`
- **Success**: Array of SearchResult objects (one per platform)
- **Error**: Throws Error with descriptive message

## Implementation Details

### 1. Input Validation
```typescript
if (!dates.from || !dates.to) {
  throw new Error('Please select valid dates');
}
```
- Ensures both dates are selected before proceeding
- Early validation prevents unnecessary API calls

### 2. Date Normalization
```typescript
const response = await fetch('/api/search-prices', {
  body: JSON.stringify({
    dates: {
      from: dates.from.toISOString().split('T')[0],  // "2025-01-15"
      to: dates.to.toISOString().split('T')[0]        // "2025-01-20"
    },
    guests,
    language
  })
});
```
- Converts Date objects to ISO date strings
- Splits at 'T' to get only the date part (YYYY-MM-DD)
- Removes time component to avoid timezone issues

### 3. Request Configuration
```typescript
{
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify(...)
}
```
- POST method for sending date/guest data
- JSON content type for structured data
- Accept header to request JSON response

### 4. Response Handling

#### Comprehensive Logging
```typescript
console.log('Starting price search with params:', { dates, guests, language });
console.log('Response status:', response.status);
console.log('Response headers:', Object.fromEntries(response.headers.entries()));
console.log('Raw response:', textResponse);
console.log('Parsed response:', data);
```
- Logs all stages of the request for debugging
- Helps diagnose issues in production

#### Text-First Parsing
```typescript
const textResponse = await response.text();
let data: ApiResponse;
try {
  data = JSON.parse(textResponse);
} catch (error) {
  console.error('JSON parse error:', error);
  console.error('Response text:', textResponse);
  throw new Error('Failed to parse server response');
}
```
- Gets raw text first to handle parse errors gracefully
- Logs unparseable responses for debugging
- Prevents silent failures from malformed JSON

### 5. Error Handling

#### HTTP Error Check
```typescript
if (!response.ok) {
  throw new Error(data.error || 'Failed to fetch prices');
}
```
- Checks HTTP status code
- Uses error message from API if available
- Falls back to generic message

#### Empty Results Check
```typescript
if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
  throw new Error('No prices found');
}
```
- Validates results structure
- Ensures results is an array
- Checks for empty results

#### Generic Error Handler
```typescript
catch (error) {
  console.error('Price search error:', error);
  if (error instanceof Error) {
    throw new Error(error.message || 'Failed to fetch prices');
  }
  throw new Error('Failed to fetch prices. Please try again.');
}
```
- Catches any unexpected errors
- Preserves error messages when possible
- Provides user-friendly fallback message

## Usage Example

### From BookingForm Component
```typescript
import { searchPrices } from '@/lib/agentql/priceSearchService';

// In component
const handleCheckAvailability = async () => {
  try {
    setIsSearching(true);
    
    // Adjust dates to noon local time
    const adjustedDates = {
      from: new Date(date.from.getFullYear(), date.from.getMonth(), date.from.getDate(), 12, 0, 0),
      to: new Date(date.to.getFullYear(), date.to.getMonth(), date.to.getDate(), 12, 0, 0)
    };
    
    // Call the service - BUT BookingForm actually calls the API directly
    // This shows how priceSearchService COULD be used
    const results = await searchPrices(adjustedDates, guests, language);
    
    setSearchResults(results);
  } catch (error) {
    setSearchError(error.message);
  } finally {
    setIsSearching(false);
  }
};
```

**Note**: In the current implementation, BookingForm.tsx calls `/api/search-prices` directly rather than using this service. This service exists as a potential abstraction layer but is not actively used.

## Response Flow

### Success Path
```
searchPrices called
  ↓
Dates validated
  ↓
POST /api/search-prices
  ↓
Response received (200 OK)
  ↓
JSON parsed successfully
  ↓
Results validated (array with items)
  ↓
Return SearchResult[]
```

### Error Paths

#### Invalid Dates
```
searchPrices called
  ↓
Dates undefined
  ↓
throw Error("Please select valid dates")
```

#### HTTP Error
```
searchPrices called
  ↓
POST /api/search-prices
  ↓
Response received (4xx/5xx)
  ↓
throw Error(data.error || "Failed to fetch prices")
```

#### Parse Error
```
searchPrices called
  ↓
POST /api/search-prices
  ↓
Response received (200 OK)
  ↓
JSON.parse fails
  ↓
throw Error("Failed to parse server response")
```

#### Empty Results
```
searchPrices called
  ↓
POST /api/search-prices
  ↓
Response received (200 OK)
  ↓
JSON parsed successfully
  ↓
results array empty
  ↓
throw Error("No prices found")
```

## Key Features

### 1. Type Safety
- Full TypeScript typing for all parameters and returns
- Leverages imported types for consistency
- Compile-time error catching

### 2. Defensive Programming
- Multiple validation layers
- Comprehensive error handling
- Graceful failure messages

### 3. Debugging Support
- Extensive console logging
- Raw response preservation
- Error context preservation

### 4. Separation of Concerns
- UI logic separated from API communication
- Reusable across multiple components
- Easy to mock for testing

## Potential Improvements

### 1. Request Deduplication
```typescript
// Could add request caching
const cacheKey = `${dates.from}-${dates.to}-${guests.adults}-${guests.children}`;
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

### 2. Timeout Handling
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

const response = await fetch('/api/search-prices', {
  signal: controller.signal,
  // ...
});
```

### 3. Retry Logic
```typescript
async function searchPricesWithRetry(dates, guests, language, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await searchPrices(dates, guests, language);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 4. Progress Callbacks
```typescript
export async function searchPrices(
  dates: DateRange,
  guests: GuestInfo,
  language: string,
  onProgress?: (platform: string) => void
): Promise<SearchResult[]>
```

## Testing Considerations

### Unit Tests
```typescript
describe('searchPrices', () => {
  it('should throw error for undefined dates', async () => {
    await expect(searchPrices({}, guests, 'en'))
      .rejects
      .toThrow('Please select valid dates');
  });
  
  it('should format dates correctly', async () => {
    const mockFetch = jest.spyOn(global, 'fetch');
    await searchPrices(
      { from: new Date('2025-01-15'), to: new Date('2025-01-20') },
      { adults: 2, children: 0 },
      'en'
    );
    
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/search-prices',
      expect.objectContaining({
        body: expect.stringContaining('"from":"2025-01-15"')
      })
    );
  });
});
```

## Integration with BookingForm

Although `priceSearchService.ts` exists, the actual implementation in `BookingForm.tsx` calls the API directly:

```typescript
// BookingForm.tsx - Current Implementation
const response = await fetch('/api/search-prices', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    dates: {
      from: adjustedDates.from.toISOString().split('T')[0],
      to: adjustedDates.to.toISOString().split('T')[0]
    },
    guests: {
      adults: guests.adults,
      children: guests.children
    },
    language
  })
});
```

This duplication suggests that `priceSearchService.ts` could be refactored to be the single source of truth for API communication, eliminating code duplication between the service and the component.

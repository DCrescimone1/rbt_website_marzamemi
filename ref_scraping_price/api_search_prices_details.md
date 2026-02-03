# /api/search-prices - API Endpoint

## File Location
`pages/api/search-prices.ts`

## Purpose
Backend API endpoint that orchestrates parallel web scraping of Booking.com and Airbnb to retrieve real-time pricing for the MarzaGem property. This is the core orchestration layer that manages browser automation and coordinates multiple platform searches.

## Dependencies

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { chromium } from 'playwright';
import { searchBookingPrice } from '../../src/lib/agentql/searchBooking';
import { searchAirbnbPrice } from '../../src/lib/agentql/searchAirbnb';
import type { SearchResult } from '../../src/components/price-comparison/types';
```

## API Specification

### Endpoint
```
POST /api/search-prices
```

### Request Headers
```
Content-Type: application/json
```

### Request Body
```typescript
{
  dates: {
    from: string,      // ISO date format: "2025-01-15"
    to: string         // ISO date format: "2025-01-20"
  },
  guests: {
    adults: number,    // Number of adult guests (1-6)
    children: number   // Number of child guests (0-5)
  },
  language: string     // "it" or "en"
}
```

### Example Request
```json
{
  "dates": {
    "from": "2025-01-15",
    "to": "2025-01-20"
  },
  "guests": {
    "adults": 2,
    "children": 0
  },
  "language": "it"
}
```

### Success Response (200)
```typescript
{
  results: SearchResult[]
}
```

#### Example Success Response
```json
{
  "results": [
    {
      "platform": "Booking.com",
      "price": "516",
      "currency": "€",
      "url": "https://www.booking.com/hotel/it/marzagem.it-it.html?...",
      "logoSrc": "/logo/logo_booking.png"
    },
    {
      "platform": "Airbnb",
      "price": "522",
      "currency": "€",
      "url": "https://www.airbnb.com/rooms/1151412127742161355?...",
      "logoSrc": "/logo/logo_airbnb.png"
    }
  ]
}
```

### Error Responses

#### 405 Method Not Allowed
```json
{
  "error": "Method not allowed"
}
```

#### 404 Not Found
```json
{
  "error": "No prices found. Please try again."
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to fetch prices. Please try again.",
  "details": "Error details here (development only)"
}
```

#### 500 Browser Initialization Failed
```json
{
  "error": "Browser initialization failed. Please try again later."
}
```

## Implementation Details

### 1. Method Validation
```typescript
if (req.method !== 'POST') {
  return res.status(405).json({ error: 'Method not allowed' });
}
```
- Only accepts POST requests
- Returns 405 for other methods (GET, PUT, DELETE, etc.)

### 2. Request Logging
```typescript
const startedAt = Date.now();
console.log('[prices] Request started');
console.log('Request body:', { dates, guests, language });
```
- Tracks request timing from start
- Logs all input parameters for debugging
- Uses `[prices]` prefix for easy log filtering

### 3. Browser Initialization

#### Chromium Launch Configuration
```typescript
browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

**Configuration Breakdown:**
- **headless: true**: Runs browser without GUI (required for server environments)
- **--no-sandbox**: Disables Chrome sandbox (necessary for containerized environments)
- **--disable-setuid-sandbox**: Additional sandbox bypass for compatibility

**Security Note**: The `--no-sandbox` flag reduces security isolation but is often required in Docker/Raspberry Pi environments.

#### Browser Launch Error Handling
```typescript
try {
  browser = await chromium.launch({...});
} catch (e) {
  console.error('[prices] Failed to launch Chromium:', e);
  return res.status(500).json({ 
    error: 'Browser initialization failed. Please try again later.' 
  });
}
```
- Catches browser launch failures
- Returns specific error for browser issues
- Prevents execution without valid browser instance

### 4. Parallel Search Execution

#### Promise.all Pattern
```typescript
const [bookingResult, airbnbResult] = await Promise.all([
  (async () => {
    const start = Date.now();
    console.log('[prices] Booking.com search started');
    const result = await searchBookingPrice({ dates, guests, language, browser });
    console.log(`[prices] Booking.com search completed in ${Date.now() - start}ms`);
    return result;
  })(),
  (async () => {
    const start = Date.now();
    console.log('[prices] Airbnb search started');
    const result = await searchAirbnbPrice({ dates, guests, browser });
    console.log(`[prices] Airbnb search completed in ${Date.now() - start}ms`);
    return result;
  })()
]);
```

**Why Parallel Execution:**
- **Performance**: Both searches run simultaneously
- **Time Savings**: ~50% reduction vs sequential (8-10s vs 16-20s)
- **Independence**: Searches don't depend on each other
- **Resilience**: One failure doesn't block the other

**Performance Metrics:**
```typescript
const searchStartTime = Date.now();
// ... Promise.all execution ...
console.log(`[prices] Both searches completed in ${Date.now() - searchStartTime}ms (parallel execution)`);
```
- Tracks total parallel execution time
- Logs individual search durations
- Helps identify performance bottlenecks

### 5. Results Aggregation

```typescript
const results: SearchResult[] = [];

if (bookingResult) {
  console.log('[prices] Booking.com result:', bookingResult.price);
  results.push(bookingResult);
} else {
  console.log('[prices] Booking.com returned no price');
}

if (airbnbResult) {
  console.log('[prices] Airbnb result:', airbnbResult.price);
  results.push(airbnbResult);
} else {
  console.log('[prices] Airbnb returned no price');
}
```

**Partial Success Handling:**
- Each result is checked individually
- Null results are logged but don't cause errors
- System returns whatever results are available
- Example: If Booking.com succeeds but Airbnb fails, user still gets Booking.com price

### 6. Response Handling

#### Empty Results Case
```typescript
if (results.length === 0) {
  console.log('[prices] No results found');
  return res.status(404).json({ 
    error: 'No prices found. Please try again.' 
  });
}
```
- Returns 404 when no platforms return results
- Prompts user to retry
- Distinguishes from server errors (500)

#### Success Case
```typescript
console.log('[prices] Search completed. Count:', results.length, 'Duration(ms):', Date.now() - startedAt);
return res.status(200).json({ results });
```
- Logs result count and total duration
- Returns successful results array
- 200 status code for partial or full success

### 7. Error Handling

```typescript
catch (error) {
  console.error('[prices] Search error:', error);
  return res.status(500).json({ 
    error: 'Failed to fetch prices. Please try again.',
    details: process.env.NODE_ENV === 'development' ? String(error) : undefined
  });
}
```

**Error Response Strategy:**
- Generic error message for users
- Detailed error only in development mode
- Prevents information leakage in production
- 500 status for unexpected errors

### 8. Resource Cleanup

```typescript
finally {
  if (browser) {
    await browser.close().catch(console.error);
    console.log('[prices] Browser closed');
  }
}
```

**Critical Cleanup:**
- Always executes, even after errors
- Closes browser to free system resources
- Catches cleanup errors to prevent secondary failures
- Logs successful cleanup for monitoring

**Why This Matters:**
- Prevents memory leaks
- Avoids hanging browser processes
- Critical for Raspberry Pi with limited resources
- Each browser instance uses ~200-300MB RAM

## Execution Flow Diagram

```
POST /api/search-prices
    ↓
1. Validate method (POST only)
    ↓
2. Extract request body
    ↓
3. Launch Chromium browser
    ↓ (if fails → 500 error)
    ↓
4. Start parallel searches
    ├─ Booking.com (searchBookingPrice)
    │   ├─ Create browser context
    │   ├─ Navigate to URL
    │   ├─ Wait for price element
    │   ├─ Extract price
    │   └─ Return result or null
    │
    └─ Airbnb (searchAirbnbPrice)
        ├─ Create browser context
        ├─ Navigate to URL
        ├─ Wait for price element
        ├─ Extract price
        └─ Return result or null
    ↓
5. Aggregate results
    ↓
6. Check result count
    ├─ 0 results → 404 error
    └─ 1+ results → 200 success
    ↓
7. Close browser (always)
    ↓
8. Return response
```

## Performance Characteristics

### Timing Breakdown
```
Browser Launch:           1-2 seconds
Booking.com Search:       4-8 seconds
Airbnb Search:            4-8 seconds
Parallel Execution:       4-10 seconds (max of both)
Total Response Time:      6-15 seconds typical
```

### Resource Usage
- **Memory**: ~300-500MB per request (browser + contexts)
- **CPU**: Moderate (DOM parsing, JavaScript execution)
- **Network**: 2 external HTTP requests + resources loaded by pages

### Raspberry Pi Considerations
- Limited RAM makes browser memory critical
- Proper cleanup essential to prevent crashes
- Parallel execution helps but still resource-intensive
- Consider request queuing for multiple simultaneous requests

## Error Scenarios

### Scenario 1: Browser Launch Failure
```
Request arrives
  ↓
Attempt to launch Chromium
  ↓
Launch fails (missing dependencies, permissions)
  ↓
Return 500: "Browser initialization failed"
  ↓
No cleanup needed (browser never created)
```

### Scenario 2: Both Searches Fail
```
Request arrives
  ↓
Browser launches successfully
  ↓
Start parallel searches
  ├─ Booking.com: Network timeout → null
  └─ Airbnb: Element not found → null
  ↓
results.length === 0
  ↓
Return 404: "No prices found"
  ↓
Browser closed in finally
```

### Scenario 3: Partial Success
```
Request arrives
  ↓
Browser launches successfully
  ↓
Start parallel searches
  ├─ Booking.com: Success → { price: "516", ... }
  └─ Airbnb: Timeout → null
  ↓
results.length === 1
  ↓
Return 200: { results: [booking] }
  ↓
Browser closed in finally
```

### Scenario 4: Unexpected Error
```
Request arrives
  ↓
Browser launches successfully
  ↓
Start parallel searches
  ↓
Unexpected error thrown (e.g., out of memory)
  ↓
Caught by try-catch
  ↓
Return 500: "Failed to fetch prices"
  ↓
Browser closed in finally
```

## Integration with Search Functions

### searchBookingPrice
```typescript
await searchBookingPrice({ 
  dates,      // { from: "2025-01-15", to: "2025-01-20" }
  guests,     // { adults: 2, children: 0 }
  language,   // "it" or "en" - affects URL structure
  browser     // Shared browser instance
})
```

**Returns**: `SearchResult | null`

### searchAirbnbPrice
```typescript
await searchAirbnbPrice({ 
  dates,      // { from: "2025-01-15", to: "2025-01-20" }
  guests,     // { adults: 2, children: 0 }
  browser     // Shared browser instance
})
```

**Returns**: `SearchResult | null`
**Note**: No language parameter - Airbnb search is language-independent

## Logging Strategy

### Log Prefix Convention
All logs use `[prices]` prefix for easy filtering:
```bash
# Filter price search logs
tail -f logs/app.log | grep "\[prices\]"
```

### Log Levels
```typescript
console.log('[prices] Request started');              // INFO
console.log('[prices] Booking.com search started');   // INFO
console.error('[prices] Search error:', error);       // ERROR
```

### Recommended Log Monitoring
```typescript
// Monitor for failures
grep "ERROR" logs/app.log | grep "[prices]"

// Monitor response times
grep "Search completed. Duration" logs/app.log
```

## Testing Considerations

### Manual Testing with curl
```bash
curl -X POST http://localhost:3000/api/search-prices \
  -H "Content-Type: application/json" \
  -d '{
    "dates": {
      "from": "2025-01-15",
      "to": "2025-01-20"
    },
    "guests": {
      "adults": 2,
      "children": 0
    },
    "language": "it"
  }'
```

### Load Testing Considerations
```typescript
// Current implementation issues:
// 1. No rate limiting - can spawn many browser instances
// 2. No request queuing - concurrent requests compete for resources
// 3. No caching - identical requests perform full scraping

// Recommended limits for Raspberry Pi:
// - Max 2 concurrent requests
// - Min 30s between identical requests (caching)
// - Request timeout: 30s
```

### Unit Test Structure
```typescript
describe('/api/search-prices', () => {
  it('should return 405 for GET requests');
  it('should return 500 if browser fails to launch');
  it('should return 404 if no prices found');
  it('should return 200 with results array');
  it('should handle partial success (one platform)');
  it('should close browser even on error');
});
```

## Potential Improvements

### 1. Request Caching
```typescript
const cacheKey = `${dates.from}-${dates.to}-${guests.adults}-${guests.children}`;
const cached = await redis.get(cacheKey);
if (cached) {
  return res.status(200).json(JSON.parse(cached));
}
// ... perform search ...
await redis.setex(cacheKey, 1800, JSON.stringify({ results })); // 30min cache
```

### 2. Request Queuing
```typescript
// Use a job queue (Bull, BullMQ) for concurrent request limiting
const job = await priceSearchQueue.add({ dates, guests, language });
const result = await job.finished();
return res.status(200).json(result);
```

### 3. Browser Pool
```typescript
// Reuse browser instances instead of launching each time
const browser = await browserPool.acquire();
try {
  // ... perform searches ...
} finally {
  await browserPool.release(browser);
}
```

### 4. Timeout Handling
```typescript
const TIMEOUT_MS = 30000;
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Search timeout')), TIMEOUT_MS)
);

const results = await Promise.race([
  Promise.all([searchBooking(...), searchAirbnb(...)]),
  timeoutPromise
]);
```

### 5. Monitoring and Metrics
```typescript
// Track success rate, response times, error types
await metrics.trackSearchRequest({
  duration: Date.now() - startedAt,
  resultCount: results.length,
  platforms: results.map(r => r.platform),
  error: error?.message
});
```

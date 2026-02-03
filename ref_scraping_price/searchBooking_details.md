# searchBooking.ts - Booking.com Price Scraper

## File Location
`src/lib/agentql/searchBooking.ts`

## Purpose
Specialized web scraper for extracting price information from Booking.com. Handles language-specific URLs, constructs search parameters, and performs DOM-based price extraction using Playwright browser automation.

## Dependencies

```typescript
import { Language } from '@/lib/languageUtils';
import { SearchResult } from '@/components/price-comparison/types';
import type { Browser, BrowserContext } from 'playwright';
```

## Static Configuration

### BOOKING_STATIC_PARAMS
```typescript
const BOOKING_STATIC_PARAMS = {
  aid: "397594",
  label: "gog235jc-1FCAEoggI46AdIM1gDaCyIAQGYAQm4AQfIAQzYAQHoAQH4AQyIAgGoAgO4ArWK8bIGwAIB0gIkZWI4MDhjNDctOWZjZi00NjAyLThmODktYzU0MTRlNGEyMDA02AIG4AIB",
  dest_id: "12041954",
  dest_type: "hotel",
  dist: "0",
  hapos: "1",
  hpos: "1",
  matching_block_id: "1204195401_392649505_2_0_0_417880",
  no_rooms: "1",
  sb_price_type: "total",
  sr_order: "popularity",
  type: "total",
  ucfs: "1",
  selected_currency: "EUR",
  changed_currency: "1",
  currency_changed: "1"
};
```

**Parameter Breakdown:**

#### Tracking Parameters
- **aid**: "397594" - Affiliate ID for tracking purposes
- **label**: Encoded tracking label for analytics

#### Property Parameters
- **dest_id**: "12041954" - Unique identifier for MarzaGem property
- **dest_type**: "hotel" - Property type classification

#### Display Parameters
- **dist**: "0" - Distance filter (0 = exact location)
- **hapos**: "1" - Hotel position in search results
- **hpos**: "1" - Alternative position parameter
- **matching_block_id**: Specific room/rate plan identifier

#### Booking Parameters
- **no_rooms**: "1" - Number of rooms (always 1 for this property)
- **sb_price_type**: "total" - Show total price (not per night)
- **type**: "total" - Price display type
- **ucfs**: "1" - Use currency from settings

#### Currency Parameters
- **selected_currency**: "EUR" - Display prices in Euros
- **changed_currency**: "1" - Currency change flag
- **currency_changed**: "1" - Alternative currency flag

**Why These Parameters Matter:**
- Ensures consistent search results
- Forces total price display (not per-night breakdown)
- Locks currency to EUR for predictable parsing
- Pre-fills property selection for direct access

## Interfaces

### BookingSearchParams
```typescript
interface BookingSearchParams {
  dates: {
    from: string;      // ISO date: "2025-01-15"
    to: string;        // ISO date: "2025-01-20"
  };
  guests: {
    adults: number;    // 1-6 adults
    children: number;  // 0-5 children
  };
  language: Language;  // "it" | "en"
  browser: Browser;    // Shared Playwright browser instance
}
```

## Main Function: searchBookingPrice

### Signature
```typescript
export async function searchBookingPrice({
  dates,
  guests,
  language,
  browser
}: BookingSearchParams): Promise<SearchResult | null>
```

### Return Value
- **Success**: SearchResult object with price, platform, URL
- **Failure**: null (no error thrown, graceful degradation)

## Implementation Details

### 1. URL Construction

#### Base URL Selection
```typescript
const langSuffix = language === 'it' ? 'it-it' : 'en-gb';
const BOOKING_BASE_URL = "https://www.booking.com/hotel/it/marzagem.html";
```

**Language Mapping:**
- Italian (it) → `it-it` (Italian interface, Italian region)
- English (en) → `en-gb` (English interface, UK region)

**URL Structure:**
```
https://www.booking.com/hotel/it/marzagem.[LANG].html?[PARAMS]
```

Example:
```
https://www.booking.com/hotel/it/marzagem.it-it.html?aid=397594&...
```

#### Parameter Construction
```typescript
const params = new URLSearchParams({
  ...BOOKING_STATIC_PARAMS,
  checkin: dates.from,
  checkout: dates.to,
  group_adults: guests.adults.toString(),
  group_children: guests.children.toString(),
  req_adults: guests.adults.toString(),
  req_children: guests.children.toString(),
});
```

**Dynamic Parameters:**
- **checkin**: Check-in date (YYYY-MM-DD)
- **checkout**: Check-out date (YYYY-MM-DD)
- **group_adults**: Total adults in booking
- **group_children**: Total children in booking
- **req_adults**: Required adults (same as group_adults)
- **req_children**: Required children (same as group_children)

**Why Duplicate Parameters?**
Booking.com uses both `group_*` and `req_*` parameters for different parts of their system. Including both ensures consistency.

#### Final URL Assembly
```typescript
const bookingUrl = `${BOOKING_BASE_URL.replace('.html', `.${langSuffix}.html`)}?${params.toString()}`;
```

**Example Output:**
```
https://www.booking.com/hotel/it/marzagem.it-it.html?aid=397594&label=...&dest_id=12041954&checkin=2025-01-15&checkout=2025-01-20&group_adults=2&group_children=0&...
```

### 2. Browser Context Creation

```typescript
context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
});
```

**Configuration Rationale:**

#### Desktop Viewport (1920x1080)
- Booking.com has different layouts for mobile vs desktop
- Desktop version has more predictable element structure
- Price elements are consistently positioned
- Avoids mobile-specific UI variations

#### Modern User Agent
- **Browser**: Chrome 120.0.0.0
- **OS**: macOS 10.15.7
- **Purpose**: Avoid bot detection
- **Effect**: Receives full desktop experience

**Why Separate Context?**
- Isolation between Booking.com and Airbnb searches
- Independent cookies/storage
- Prevents cross-contamination
- Easier cleanup (close context, not browser)

### 3. Page Navigation

```typescript
await newPage.goto(bookingUrl, { 
  waitUntil: 'domcontentloaded',
  timeout: 15000 
});
```

**Wait Strategy:**
- **domcontentloaded**: Wait for HTML parsing complete
- **Not networkidle**: Don't wait for all resources
- **Advantage**: ~2-3 seconds faster than networkidle
- **Trade-off**: May need additional waits for dynamic content

**Timeout:**
- 15 seconds maximum wait
- Balances:
  - Server environment (slower than local)
  - Network variability
  - Booking.com's load time
  - User experience (too long = bad UX)

**After Navigation:**
```typescript
await newPage.waitForTimeout(2000);
```
- 2-second pause for dynamic content to load
- Allows JavaScript-rendered elements to appear
- Compensates for domcontentloaded strategy

### 4. Price Extraction

#### Primary Selector
```typescript
await newPage.waitForSelector('.prco-valign-middle-helper', { 
  timeout: 8000,
  state: 'attached'
});
```

**Selector Details:**
- **Class**: `.prco-valign-middle-helper`
- **Purpose**: Main price display container
- **Timeout**: 8 seconds (generous for slow loads)
- **State**: 'attached' (only needs to be in DOM, not visible)

**Why This Selector?**
- Consistent across Booking.com pages
- Direct container for price text
- Less likely to change than generic classes

#### Fallback Strategy
```typescript
try {
  await newPage.waitForSelector('.prco-valign-middle-helper', {...});
  priceText = await newPage.evaluate(() => {
    const element = document.querySelector('.prco-valign-middle-helper');
    return element ? element.textContent : null;
  });
} catch (waitError) {
  console.log('Selector wait timed out, trying direct query...');
  priceText = await newPage.evaluate(() => {
    const element = document.querySelector('.prco-valign-middle-helper');
    return element ? element.textContent : null;
  });
}
```

**Two-Phase Approach:**
1. Wait for selector (up to 8 seconds)
2. If timeout, try immediate query anyway
3. Element might exist but loading slowly

**Why Try After Timeout?**
- Element might be present but slow to attach
- DOM mutations can delay attachment state
- Better to try than fail immediately

#### Price Text Extraction
```typescript
priceText = await newPage.evaluate(() => {
  const element = document.querySelector('.prco-valign-middle-helper');
  return element ? element.textContent : null;
});
```

**Execution Context:**
- Runs in browser context (not Node.js)
- Has access to actual DOM
- Returns primitive values only (no DOM objects)

### 5. Price Parsing

#### Regex Pattern
```typescript
const match = priceText.match(/[€$£]?\s*(\d+(?:,\d+)*(?:\.\d+)?)/);
```

**Pattern Breakdown:**
- `[€$£]?` - Optional currency symbol
- `\s*` - Optional whitespace
- `(\d+(?:,\d+)*(?:\.\d+)?)` - Number with thousand separators and decimals

**Supported Formats:**
```
€ 516
€516
516 €
516
€ 1,234
€ 1,234.56
```

#### Number Normalization
```typescript
const price = match[1].replace(',', '');
```

**Process:**
1. Extract numeric part from match
2. Remove thousand separators (,)
3. Keep decimal point (.)
4. Result: clean number string

**Example Transformations:**
```
"€ 516" → "516"
"€ 1,234" → "1234"
"€ 1,234.56" → "1234.56"
```

### 6. Result Construction

```typescript
return {
  platform: 'Booking.com',
  price,
  currency: '€',
  url: bookingUrl,
  logoSrc: '/logo/logo_booking.png'
};
```

**SearchResult Fields:**
- **platform**: Identifies source as Booking.com
- **price**: Clean number string (e.g., "516")
- **currency**: Always € (forced by URL params)
- **url**: Full booking URL with all parameters
- **logoSrc**: Path to Booking.com logo for display

**Price as String:**
- Avoids floating-point precision issues
- Preserves exact displayed value
- Frontend handles formatting for display

### 7. Error Handling

#### Extraction Error
```typescript
try {
  // ... price extraction ...
} catch (err) {
  const error = err as Error;
  console.error('Error extracting price:', error.message);
}
```

**Strategy:**
- Log error with details
- Don't throw (return null instead)
- Allows other platforms to succeed

#### Navigation Error
```typescript
try {
  // ... entire search ...
} catch (err) {
  const error = err as Error;
  console.error('Booking.com error:', error.message);
  return null;
}
```

**Graceful Degradation:**
- All errors return null
- Never throws to parent
- Parallel execution continues
- Partial results better than no results

### 8. Resource Cleanup

```typescript
finally {
  try {
    if (context) {
      await context.close();
    }
  } catch (err) {
    const error = err as Error;
    console.error('Error closing Booking.com context:', error.message);
  }
}
```

**Cleanup Strategy:**
- Close browser context (not browser)
- Catch cleanup errors to prevent masking
- Always executes (even after return/throw)
- Frees memory (~100-150MB per context)

## Execution Flow

```
searchBookingPrice called
    ↓
Construct Booking.com URL
    ├─ Select language suffix
    ├─ Build parameters
    └─ Assemble final URL
    ↓
Create browser context
    ├─ Desktop viewport
    └─ Modern user agent
    ↓
Navigate to Booking.com
    ├─ Wait for domcontentloaded
    └─ Additional 2s wait
    ↓
Wait for price element
    ├─ Try .prco-valign-middle-helper (8s)
    └─ Fallback: direct query
    ↓
Extract price text
    ├─ Run evaluate() in browser
    └─ Get textContent
    ↓
Parse price
    ├─ Regex match currency & number
    ├─ Extract numeric part
    └─ Remove formatting
    ↓
Construct SearchResult
    ↓
Close context
    ↓
Return result or null
```

## Performance Characteristics

### Timing Breakdown
```
Context creation:      ~500ms
Page navigation:       2-4 seconds
DOM load wait:         2 seconds
Price extraction:      100-500ms
Total:                 4-8 seconds typical
```

### Memory Usage
- **Browser context**: ~100-150MB
- **Page resources**: ~50-100MB
- **Total per search**: ~150-250MB

### Network Activity
- **Main page**: ~1-2MB HTML/CSS/JS
- **Images/fonts**: ~2-5MB additional
- **API calls**: Various (tracking, availability)

## Potential Failure Points

### 1. Navigation Timeout
```
Cause: Slow network, Booking.com down
Effect: Returns null
Log: "Booking.com error: Navigation timeout"
```

### 2. Element Not Found
```
Cause: UI change, slow loading, bot detection
Effect: Returns null
Log: "No price found"
```

### 3. Parse Failure
```
Cause: Unexpected price format
Effect: Returns null
Log: "Error extracting price: ..."
```

### 4. Browser Context Error
```
Cause: Browser closed, memory exhaustion
Effect: Returns null
Log: "Booking.com error: ..."
```

## Debugging Strategies

### Enable Screenshots
```typescript
// Add before returning null
await newPage.screenshot({ 
  path: `/tmp/booking-debug-${Date.now()}.png` 
});
```

### Log HTML Structure
```typescript
const html = await newPage.evaluate(() => document.body.innerHTML);
console.log('Page HTML length:', html.length);
console.log('Sample HTML:', html.substring(0, 500));
```

### Inspect Elements
```typescript
const priceElements = await newPage.$$('.prco-valign-middle-helper');
console.log('Found price elements:', priceElements.length);
```

## Potential Improvements

### 1. Multiple Selector Fallbacks
```typescript
const selectors = [
  '.prco-valign-middle-helper',
  '[data-testid="price-display"]',
  '.bui-price-display__value'
];

for (const selector of selectors) {
  try {
    const el = await newPage.waitForSelector(selector, { timeout: 3000 });
    if (el) {
      priceText = await el.textContent();
      break;
    }
  } catch (e) {
    continue;
  }
}
```

### 2. Retry Logic
```typescript
async function searchWithRetry(params, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    const result = await searchBookingPrice(params);
    if (result) return result;
    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
  }
  return null;
}
```

### 3. Bot Detection Handling
```typescript
// Check for CAPTCHA
const hasCaptcha = await newPage.$('iframe[src*="recaptcha"]');
if (hasCaptcha) {
  console.log('CAPTCHA detected, cannot proceed');
  return null;
}
```

### 4. Response Time Optimization
```typescript
// Block unnecessary resources
await context.route('**/*.{png,jpg,jpeg,gif,svg,woff,woff2}', route => route.abort());
await context.route('**/analytics.js', route => route.abort());
```

## Testing Examples

### Manual Test
```typescript
const { chromium } = require('playwright');
const { searchBookingPrice } = require('./searchBooking');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const result = await searchBookingPrice({
    dates: { from: '2025-01-15', to: '2025-01-20' },
    guests: { adults: 2, children: 0 },
    language: 'it',
    browser
  });
  console.log('Result:', result);
  await browser.close();
})();
```

### Unit Test Structure
```typescript
describe('searchBookingPrice', () => {
  it('should construct correct URL for Italian');
  it('should construct correct URL for English');
  it('should extract price from valid page');
  it('should return null if element not found');
  it('should handle navigation timeout');
  it('should close context on error');
});
```

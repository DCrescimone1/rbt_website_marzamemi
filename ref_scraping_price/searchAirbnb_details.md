# searchAirbnb.ts - Airbnb Price Scraper

## File Location
`src/lib/agentql/searchAirbnb.ts`

## Purpose
Advanced web scraper for extracting price information from Airbnb listings. Features sophisticated price detection algorithms that handle multiple display formats, strikethrough prices, currency variations, and dynamic page structures. More complex than Booking.com scraper due to Airbnb's frequently changing UI.

## Dependencies

```typescript
import type { SearchResult } from '@/components/price-comparison/types';
import type { Browser } from 'playwright';
```

## Static Configuration

### AIRBNB_BASE_URL
```typescript
const AIRBNB_BASE_URL = "https://www.airbnb.com/rooms/1151412127742161355";
```

**Property ID**: `1151412127742161355` (MarzaGem listing)

## Interfaces

### AirbnbSearchParams
```typescript
interface AirbnbSearchParams {
  dates: {
    from: string;      // ISO date: "2025-01-15"
    to: string;        // ISO date: "2025-01-20"
  };
  guests: {
    adults: number;    // 1-16 adults
    children: number;  // 0+ children
  };
  browser: Browser;    // Shared Playwright browser instance
}
```

**Note**: No language parameter - Airbnb search is language-independent (uses query parameters only)

## Main Function: searchAirbnbPrice

### Signature
```typescript
export async function searchAirbnbPrice({
  dates,
  guests,
  browser
}: AirbnbSearchParams): Promise<SearchResult | null>
```

### Return Value
- **Success**: SearchResult object with extracted price
- **Failure**: null (graceful degradation, no throw)

## Implementation Details

### 1. URL Construction

```typescript
const airbnbUrl = `${AIRBNB_BASE_URL}?check_in=${dates.from}&check_out=${dates.to}&guests=${guests.adults + guests.children}&currency=EUR`;
```

**Query Parameters:**
- **check_in**: Check-in date (YYYY-MM-DD)
- **check_out**: Check-out date (YYYY-MM-DD)
- **guests**: Total guest count (adults + children)
- **currency**: EUR (forces Euro pricing)

**Example URL:**
```
https://www.airbnb.com/rooms/1151412127742161355?check_in=2025-01-15&check_out=2025-01-20&guests=2&currency=EUR
```

**Why Combined Guest Count?**
- Airbnb uses single `guests` parameter
- No separate adult/children breakdown in URL
- Pricing may vary by total count

### 2. Browser Context Configuration

```typescript
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
});
```

**Configuration Rationale:**

#### Desktop Viewport (1920x1080)
- Airbnb's desktop UI has more consistent structure
- Price elements positioned more predictably
- Sidebar with booking info reliably present
- Mobile version has different element hierarchy

#### Modern User Agent
- Same as Booking.com for consistency
- Helps avoid bot detection
- Ensures full desktop experience
- Chrome 120 on macOS 10.15.7

### 3. Page Navigation & Content Loading

```typescript
await newPage.goto(airbnbUrl, { 
  waitUntil: 'domcontentloaded',
  timeout: 15000 
});
```

**Navigation Strategy:**
- **domcontentloaded**: Faster than networkidle
- **15s timeout**: Balances speed vs reliability
- Similar to Booking.com approach

**Post-Navigation Wait:**
```typescript
await newPage.waitForTimeout(2000);
```
- Initial 2-second wait for dynamic content
- Airbnb heavily uses React/JavaScript rendering
- Many elements load after DOM ready

**Scroll to Trigger Lazy Loading:**
```typescript
await newPage.evaluate(() => {
  window.scrollTo(0, 300);
});
await newPage.waitForTimeout(1000);
```

**Why Scroll?**
- Triggers lazy-loaded content
- Many Airbnb elements load on viewport entry
- 300px scroll catches most above-fold content
- Additional 1s wait for triggered content to load

### 4. Smart Price Detection System

This is the most sophisticated part of the scraper, handling multiple scenarios.

#### Phase 1: Wait for Booking Sidebar

```typescript
await newPage.waitForSelector(
  '[data-section-id="BOOK_IT_SIDEBAR"], div[data-testid="book-it-default"], [data-testid="book-it-sidebar"]', 
  {
    timeout: 10000,
    state: 'attached'
  }
);
```

**Multiple Selectors:**
- `[data-section-id="BOOK_IT_SIDEBAR"]` - Primary identifier
- `div[data-testid="book-it-default"]` - Alternative test ID
- `[data-testid="book-it-sidebar"]` - Fallback test ID

**Why Multiple?**
- Airbnb frequently changes data attributes
- A/B testing creates variations
- Fallback chain increases reliability

**Fallback for Missing Sidebar:**
```typescript
catch (e) {
  console.log('Booking sidebar not found with standard selectors, trying alternative...');
  await newPage.waitForSelector('span:has-text("€"), span:has-text("CHF"), span:has-text("$"), [class*="price"]', {
    timeout: 5000,
    state: 'attached'
  });
}
```
- If sidebar not found, look for any price-like element
- Uses `:has-text()` pseudo-selector
- Searches for currency symbols
- Generic class pattern matching

#### Phase 2: Smart Price Extraction

The extraction logic runs entirely in browser context for performance:

```typescript
const extractionResult = await newPage.evaluate(() => {
  // Complex extraction logic here
});
```

##### Container Selection Strategy

```typescript
const sidebarSelectors = [
  '[data-section-id="BOOK_IT_SIDEBAR"]',
  'div[data-testid="book-it-default"]',
  '[data-testid="book-it-sidebar"]',
  '[class*="book-it"]',
  '[class*="booking"]',
  '[class*="sidebar"]'
];

let container: Element | null = null;
for (const sel of sidebarSelectors) {
  container = document.querySelector(sel);
  if (container) break;
}
if (!container) container = document.body;
```

**Progressive Fallback:**
1. Try data-section-id
2. Try test IDs
3. Try class patterns
4. Default to entire body

**Why Start Specific?**
- Reduces false positives
- Faster DOM queries
- More accurate results
- Only widen scope if needed

##### Price Selector Array

```typescript
const selectors = [
  'div._1avmy66 span._j1kt73',
  'span[data-testid="price-string"]',
  'span._tyxjp1',
  'span.a8jt5op',
  'span.s15gu328',        // Primary price display
  'span.u3d5yg8',         // Alternative display
  'span.umuuerxh',
  'span.atm_cs_bs05t3',
  'span.atm_cs_l3jtxx__us8791',
  'span.atm_7l_1b1kvyn',
  'span.atm_7l_1dmvgf5',
  '[class*="price"]',
  '[class*="Price"]'
];
```

**Selector Types:**
1. **Specific Airbnb classes**: e.g., `_1avmy66`, `_j1kt73`
2. **Test ID attributes**: `data-testid="price-string"`
3. **Atomic classes**: Airbnb's design system (atm_*)
4. **Pattern matching**: `[class*="price"]`

**Why So Many?**
- Airbnb's CSS classes are generated/hashed
- Classes change between deployments
- Test IDs more stable but not guaranteed
- Pattern matching catches new variations

##### Price Candidate Structure

```typescript
interface PriceCandidate {
  text: string;              // Raw text content
  element: Element;          // DOM element reference
  isStrikethrough: boolean;  // Is this an "original" price?
  hasCurrency: boolean;      // Contains currency symbol?
  numericValue: number | null; // Parsed numeric value
  selector: string;          // Which selector found it
}
```

**Candidate Collection:**
```typescript
const candidates: PriceCandidate[] = [];

for (const selector of selectors) {
  const elements = container.querySelectorAll(selector);
  elements.forEach(el => {
    const text = (el.textContent || '').trim();
    if (!text || text.length === 0) return;

    const hasCurrency = /[€$£]|CHF/.test(text);
    const hasNumbers = /\d{2,}/.test(text);
    
    if (hasCurrency || hasNumbers) {
      // ... validation and candidate creation
    }
  });
}
```

**Candidate Validation:**
- Must have currency OR numbers (at least 2 digits)
- Must have reasonable numeric value (≥10)
- Extracts strikethrough status
- Parses and normalizes numeric value

##### Strikethrough Detection

```typescript
const styles = window.getComputedStyle(el);
const isStrikethrough = styles.textDecoration.includes('line-through') ||
                       el.closest('[style*="text-decoration: line-through"]') !== null ||
                       el.closest('[style*="text-decoration:line-through"]') !== null ||
                       el.classList.toString().toLowerCase().includes('strike');
```

**Multi-Method Detection:**
1. Computed styles (most reliable)
2. Inline styles on parent elements
3. Class name patterns
4. Catches various implementation approaches

**Why Important?**
- Distinguishes original price from discounted
- Airbnb shows both: ~~€600~~ €516
- We want the actual price, not original

##### Number Extraction & Normalization

```typescript
const priceMatch = text.match(/([0-9][0-9\.,]*)/);
let numericValue: number | null = null;
if (priceMatch) {
  const normalized = priceMatch[1]
    .replace(/[.,](?=\d{3}(\D|$))/g, '')  // Remove thousands separators
    .replace(/,/g, '.');                   // Convert comma decimals to dots
  numericValue = parseFloat(normalized);
  if (Number.isNaN(numericValue)) numericValue = null;
}
```

**Normalization Process:**
1. Extract all digits and punctuation
2. Remove thousands separators (1,234 → 1234)
3. Standardize decimal separator (, → .)
4. Parse to float
5. Validate result

**Supported Formats:**
```
1,234.56 → 1234.56
1.234,56 → 1234.56
1234.56  → 1234.56
1234     → 1234.00
```

##### Fallback: Comprehensive Scan

If no candidates found via selectors:

```typescript
if (candidates.length === 0) {
  const allElements = container.querySelectorAll('span, div, strong, p, h1, h2, h3, h4, h5, h6');
  allElements.forEach(el => {
    const text = (el.textContent || '').trim();
    const pricePattern = /([€$£]|CHF)\s*([0-9][0-9\.,]*)|([0-9][0-9\.,]*)\s*([€$£]|CHF)/;
    const match = text.match(pricePattern);
    
    if (match && /\d{2,}/.test(text)) {
      // ... add as candidate
    }
  });
}
```

**Full DOM Scan:**
- Queries all common text elements
- Uses regex to find price patterns
- Only activates if selector approach fails
- More expensive but more reliable

##### Intelligent Price Selection

```typescript
const nonStrikethrough = candidates.filter(c => !c.isStrikethrough && c.numericValue !== null);
const withCurrency = nonStrikethrough.filter(c => c.hasCurrency);
const filtered = withCurrency.length > 0 ? withCurrency : nonStrikethrough;

const cleanCandidates = filtered.filter(c => {
  const lowerText = c.text.toLowerCase();
  return !lowerText.includes('originally') && 
         !lowerText.includes('was') && 
         !lowerText.includes('before') &&
         !lowerText.includes('per night') &&
         !lowerText.includes('/night');
});

const selected = cleanCandidates.length > 0 
  ? cleanCandidates[0] 
  : (nonStrikethrough.length > 0 ? nonStrikethrough[0] : candidates[0]);
```

**Selection Priority:**
1. Non-strikethrough prices
2. Prices with currency symbols
3. Exclude "originally" / "was" prices
4. Exclude per-night breakdowns
5. Take first qualifying candidate

**Why This Logic?**
- Airbnb shows: original price, discounted price, per-night breakdown
- We want the actual total booking price
- Not the per-night rate
- Not the pre-discount price

### 5. Final Price Parsing

```typescript
const patterns = [
  /(€|\$|£|CHF)\s*([0-9][0-9\.,]*)/,
  /([0-9][0-9\.,]*)\s*(€|\$|£|CHF)/
];

let amountStr: string | null = null;
let currencyDetected: string | null = null;

for (const re of patterns) {
  const m = priceText.match(re);
  if (m) {
    if (re === patterns[0]) {
      currencyDetected = m[1];
      amountStr = m[2];
    } else {
      amountStr = m[1];
      currencyDetected = m[2];
    }
    break;
  }
}
```

**Pattern Matching:**
- Pattern 1: Currency first (€ 516)
- Pattern 2: Currency last (516 €)
- Extracts both currency and amount
- Handles European and US formats

**Number-Only Fallback:**
```typescript
if (!amountStr) {
  const numOnly = priceText.match(/([0-9][0-9\.,]*)/);
  if (numOnly) {
    amountStr = numOnly[1];
  }
}
```
- Accepts prices without currency symbols
- Assumes EUR if missing (from URL param)

**Final Normalization:**
```typescript
const normalized = amountStr.replace(/[.,](?=\d{3}(\D|$))/g, '').replace(/,/g, '.');
const numeric = parseFloat(normalized);
if (!Number.isNaN(numeric)) {
  return {
    platform: 'Airbnb',
    price: Math.round(numeric).toString(),
    currency: currencyDetected || '€',
    url: airbnbUrl,
    logoSrc: '/logo/logo_airbnb.png'
  };
}
```

**Final Steps:**
1. Normalize number format
2. Parse to float
3. Round to integer (Airbnb shows whole numbers)
4. Convert to string
5. Use detected or default currency

### 6. Additional Fallback: Full Page Scan

If sidebar extraction fails:

```typescript
if (!priceText) {
  const fullPageScan = await newPage.evaluate(() => {
    const pricePattern = /([€$£]|CHF)\s*([0-9]{2,}[0-9\.,]*)|([0-9]{2,}[0-9\.,]*)\s*([€$£]|CHF)/;
    const allText = document.body.innerText;
    const matches = allText.match(pricePattern);
    
    if (matches) {
      // Find element containing this text
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      );
      
      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent || '';
        if (pricePattern.test(text)) {
          const parent = node.parentElement;
          if (parent) {
            const styles = window.getComputedStyle(parent);
            const isStrikethrough = styles.textDecoration.includes('line-through');
            if (!isStrikethrough && !text.toLowerCase().includes('originally')) {
              return text.trim();
            }
          }
        }
      }
    }
    return null;
  });
}
```

**Tree Walker Approach:**
- Searches all text nodes in DOM
- Finds price patterns
- Checks parent styling
- Returns first valid non-strikethrough price
- Last resort when structured extraction fails

### 7. Resource Cleanup

```typescript
finally {
  try {
    const contexts = browser.contexts();
    if (contexts.length > 0) {
      await contexts[contexts.length - 1].close();
    }
  } catch (err) {
    const error = err as Error;
    console.error('Error closing Airbnb context:', error.message);
  }
}
```

**Context Cleanup:**
- Gets all browser contexts
- Closes the most recent one (ours)
- Different from Booking.com (which stores context)
- More defensive approach
- Always executes (finally block)

## Execution Flow

```
searchAirbnbPrice called
    ↓
Construct Airbnb URL
    ├─ Add dates parameters
    ├─ Add guest count
    └─ Force EUR currency
    ↓
Create browser context
    ├─ Desktop viewport
    └─ Modern user agent
    ↓
Navigate to Airbnb
    ├─ Wait for domcontentloaded
    └─ Wait 2s for dynamic content
    ↓
Scroll page
    ├─ Scroll 300px down
    └─ Wait 1s for lazy load
    ↓
Wait for booking sidebar
    ├─ Try multiple selectors
    └─ Fallback to currency symbols
    ↓
Smart price extraction
    ├─ Find container (sidebar → body)
    ├─ Try all selectors
    ├─ Build candidate list
    │   ├─ Check strikethrough
    │   ├─ Extract numbers
    │   └─ Validate values
    ├─ Filter candidates
    │   ├─ Remove strikethrough
    │   ├─ Prefer with currency
    │   └─ Exclude per-night
    └─ Select best candidate
    ↓
Parse final price
    ├─ Extract currency & amount
    ├─ Normalize number format
    ├─ Round to integer
    └─ Construct result
    ↓
(If failed) Full page scan
    ├─ Search all text nodes
    ├─ Find price patterns
    └─ Return first valid
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
Initial wait:          2 seconds
Scroll & lazy load:    1 second
Sidebar wait:          0-10 seconds
Price extraction:      100-500ms
Total:                 5-18 seconds typical
```

### Memory Usage
- **Browser context**: ~100-150MB
- **Page resources**: ~100-200MB (Airbnb is heavy)
- **React app**: ~50-100MB
- **Total per search**: ~250-450MB

### Why Slower Than Booking.com?
- More complex UI structure
- Heavier JavaScript framework (React)
- More dynamic content loading
- More sophisticated extraction logic
- Additional fallback attempts

## Common Failure Scenarios

### 1. Bot Detection
```
Symptoms: Infinite loading, CAPTCHA, blocked
Cause: Too many requests, detected automation
Effect: No price extracted, returns null
```

### 2. UI Structure Change
```
Symptoms: All selectors fail
Cause: Airbnb UI update, class changes
Effect: Falls back to full page scan
```

### 3. Price Not Loaded
```
Symptoms: Sidebar found but no price
Cause: Slow network, date unavailable
Effect: Returns null after timeout
```

### 4. Ambiguous Prices
```
Symptoms: Multiple prices found
Cause: Discounts, per-night display
Effect: Smart selection picks actual price
```

## Debugging Techniques

### Screenshot on Failure
```typescript
if (!priceText) {
  await newPage.screenshot({ 
    path: `/tmp/airbnb-debug-${Date.now()}.png`,
    fullPage: true
  });
}
```

### Log All Candidates
```typescript
console.log('Price candidates:', extractionResult.allCandidates);
console.log('Selected from:', extractionResult.selectedSelector);
```

### Inspect Page State
```typescript
const pageInfo = await newPage.evaluate(() => ({
  url: window.location.href,
  title: document.title,
  bodyLength: document.body.innerHTML.length,
  hasReact: window.__REACT__ !== undefined
}));
console.log('Page state:', pageInfo);
```

## Potential Improvements

### 1. Machine Learning Price Detection
```typescript
// Train model on labeled Airbnb screenshots
const priceElement = await detectPriceWithML(pageScreenshot);
```

### 2. API Integration (if Available)
```typescript
// Use official Airbnb API instead of scraping
const price = await airbnbAPI.getPrice(listingId, dates, guests);
```

### 3. Selector Auto-Learning
```typescript
// Track which selectors succeed over time
// Prioritize successful selectors in future searches
```

### 4. Headless Browser Alternatives
```typescript
// Consider Puppeteer Extra with stealth plugin
// Or browserless.io service for better reliability
```

## Testing Examples

### Manual Test
```typescript
const { chromium } = require('playwright');
const { searchAirbnbPrice } = require('./searchAirbnb');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const result = await searchAirbnbPrice({
    dates: { from: '2025-01-15', to: '2025-01-20' },
    guests: { adults: 2, children: 0 },
    browser
  });
  console.log('Result:', result);
  await browser.close();
})();
```

### Unit Test Structure
```typescript
describe('searchAirbnbPrice', () => {
  it('should construct correct URL');
  it('should handle strikethrough prices correctly');
  it('should prefer total over per-night price');
  it('should normalize various number formats');
  it('should fallback to full page scan');
  it('should return null on complete failure');
});
```

# Types, Interfaces & Integration Flow

## Type Definitions

### Core Types

#### SearchResult
**Location**: `src/components/price-comparison/types.ts`

```typescript
export interface SearchResult {
    platform: 'Booking.com' | 'Airbnb' | 'MarzaGem';
    price: string;
    currency: string;
    url: string;
    logoSrc: string;
    isDirectBooking?: boolean;
}
```

**Field Descriptions:**
- **platform**: Source platform identifier (union type for type safety)
- **price**: Price as string to avoid floating-point issues (e.g., "516")
- **currency**: Currency symbol (e.g., "€", "$", "£")
- **url**: Full booking URL with all parameters for direct linking
- **logoSrc**: Path to platform logo image for UI display
- **isDirectBooking**: Optional flag for direct booking vs OTA

**Usage Example:**
```typescript
const result: SearchResult = {
  platform: 'Booking.com',
  price: '516',
  currency: '€',
  url: 'https://www.booking.com/...',
  logoSrc: '/logo/logo_booking.png'
};
```

#### DateRange
**Location**: `react-day-picker` library

```typescript
interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}
```

**Usage:**
- Calendar component date selection
- Nullable fields for unselected state
- Native JavaScript Date objects

**Transformation for API:**
```typescript
// Component → API
dates: {
  from: dateRange.from.toISOString().split('T')[0],  // "2025-01-15"
  to: dateRange.to.toISOString().split('T')[0]       // "2025-01-20"
}
```

#### GuestInfo
**Location**: `src/components/booking/types.ts`

```typescript
export interface GuestInfo {
  adults: number;
  children: number;
  pets: boolean;
}
```

**Constraints:**
- **adults**: 1-6 (minimum 1 required)
- **children**: 0-5 (total guests max 6)
- **pets**: Boolean flag (not used in price search)

**Validation:**
```typescript
const isValid = 
  guests.adults >= 1 && 
  guests.adults <= 6 &&
  (guests.adults + guests.children) <= 6;
```

#### Language
**Location**: `src/lib/languageUtils.ts`

```typescript
export type Language = typeof languages[number];
export const languages = ['en', 'it'] as const;
export const defaultLanguage: Language = 'it';
```

**Type Safety:**
- Union type: `'en' | 'it'`
- Compile-time validation
- Default: Italian

### API-Specific Types

#### API Request (POST /api/search-prices)
```typescript
{
  dates: {
    from: string;      // ISO date format
    to: string;
  };
  guests: {
    adults: number;
    children: number;
  };
  language: string;    // "it" | "en"
}
```

#### API Response (Success)
```typescript
{
  results: SearchResult[]
}
```

#### API Response (Error)
```typescript
{
  error: string;
  details?: string;    // Development only
}
```

### Scraper-Specific Types

#### BookingSearchParams
```typescript
interface BookingSearchParams {
  dates: {
    from: string;
    to: string;
  };
  guests: {
    adults: number;
    children: number;
  };
  language: Language;
  browser: Browser;
}
```

#### AirbnbSearchParams
```typescript
interface AirbnbSearchParams {
  dates: {
    from: string;
    to: string;
  };
  guests: {
    adults: number;
    children: number;
  };
  browser: Browser;    // No language parameter
}
```

#### Playwright Types
```typescript
import type { Browser, BrowserContext, Page } from 'playwright';

// Browser: Main browser instance (shared)
// BrowserContext: Isolated session (per platform)
// Page: Individual tab/window
```

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERACTION                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    User selects dates & guests
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BookingForm.tsx                                  │
│  State:                                                                  │
│    - date: DateRange { from: Date, to: Date }                          │
│    - guests: GuestInfo { adults: 2, children: 0, pets: false }         │
│    - language: "it" | "en"                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    User clicks "Check Availability"
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      useBookingAvailability Hook                         │
│  Checks dates against iCal calendar                                     │
│  Returns: boolean (isAvailable)                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                            if isAvailable
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Date Normalization (BookingForm)                      │
│  const adjustedDates = {                                                │
│    from: new Date(YYYY, MM, DD, 12, 0, 0),  // Noon local time         │
│    to: new Date(YYYY, MM, DD, 12, 0, 0)                                │
│  };                                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      HTTP POST /api/search-prices                        │
│  Body: {                                                                │
│    dates: { from: "2025-01-15", to: "2025-01-20" },                    │
│    guests: { adults: 2, children: 0 },                                 │
│    language: "it"                                                       │
│  }                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    API Handler (search-prices.ts)                        │
│  1. Validate request method (POST only)                                 │
│  2. Launch Chromium browser                                             │
│  3. Start parallel searches                                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌─────────────────────────────┐     ┌─────────────────────────────┐
│   searchBookingPrice()       │     │   searchAirbnbPrice()        │
│   (searchBooking.ts)         │     │   (searchAirbnb.ts)          │
└─────────────────────────────┘     └─────────────────────────────┘
         │                                         │
         │ Create context                          │ Create context
         │ Navigate to Booking.com                 │ Navigate to Airbnb
         │ Extract price: "516"                    │ Extract price: "522"
         │                                         │
         ▼                                         ▼
┌─────────────────────────────┐     ┌─────────────────────────────┐
│ SearchResult | null          │     │ SearchResult | null          │
│ {                            │     │ {                            │
│   platform: "Booking.com",   │     │   platform: "Airbnb",        │
│   price: "516",              │     │   price: "522",              │
│   currency: "€",             │     │   currency: "€",             │
│   url: "https://...",        │     │   url: "https://...",        │
│   logoSrc: "/logo/..."       │     │   logoSrc: "/logo/..."       │
│ }                            │     │ }                            │
└─────────────────────────────┘     └─────────────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Results Aggregation                                 │
│  results = [bookingResult, airbnbResult].filter(r => r !== null)       │
│  if (results.length === 0) → 404 Error                                 │
│  else → 200 Success                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Browser Cleanup                                  │
│  await browser.close()                                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       HTTP Response to Frontend                          │
│  { results: [SearchResult, SearchResult] }                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BookingForm.tsx                                  │
│  setSearchResults(data.results)                                         │
│  Scroll to results section                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   PriceComparisonResults.tsx                             │
│  Display results with:                                                  │
│    - Platform logos                                                     │
│    - Prices                                                             │
│    - "Book" buttons                                                     │
│    - Direct booking discount highlight                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                            User sees results
                            User clicks "Book"
```

## Component Integration Map

```
BookingForm
    │
    ├── Uses: DateSection (date selection)
    ├── Uses: GuestSection (guest selection)
    ├── Uses: useIcalData (calendar data)
    ├── Uses: useBookingAvailability (validation)
    ├── Calls: /api/search-prices
    │
    └── Renders: PriceComparisonResults
                      │
                      ├── Uses: LoadingState
                      ├── Uses: ErrorState
                      └── Uses: PriceListItem (for each result)
                                   │
                                   └── Displays: Platform, Price, Logo, Link
```

## State Management Flow

### Frontend State (BookingForm)
```typescript
// User Input State
const [date, setDate] = useState<DateRange | undefined>();
const [guests, setGuests] = useState<GuestInfo>({
  adults: 2,
  children: 0,
  pets: false
});

// UI State
const [loading, setLoading] = useState(false);
const [isSearching, setIsSearching] = useState(false);
const [openSection, setOpenSection] = useState<'date' | 'guest' | null>(null);
const [showValidationMessage, setShowValidationMessage] = useState(false);

// Results State
const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
const [searchError, setSearchError] = useState<string | null>(null);
```

### State Transitions
```
Initial State:
  loading: false
  isSearching: false
  searchResults: []
  searchError: null

User clicks "Check Availability":
  loading: true
  ↓
Availability Check:
  (if unavailable) → show toast, loading: false
  (if available) → isSearching: true
  ↓
API Call:
  (on success) → searchResults: [...], isSearching: false, loading: false
  (on error) → searchError: "...", isSearching: false, loading: false
```

## Error Handling Strategy

### Error Propagation Chain

```
Frontend Error Display
        ↑
        │ throw Error(message)
        │
BookingForm try-catch
        ↑
        │ res.status(500).json({ error })
        │
API Endpoint try-catch
        ↑
        │ return null
        │
searchBookingPrice/searchAirbnbPrice
        ↑
        │ Selector timeout, Parse error, etc.
        │
Playwright/DOM Operations
```

### Error Handling Levels

#### Level 1: DOM Operations (Playwright)
```typescript
// No throw - return null
try {
  const price = await page.$eval('.price', el => el.textContent);
} catch (err) {
  console.error('Price extraction failed:', err);
  return null;  // Graceful degradation
}
```

#### Level 2: Search Functions
```typescript
// searchBooking/searchAirbnb
try {
  // ... scraping logic ...
  return result;
} catch (err) {
  console.error('Platform error:', err);
  return null;  // Allow other platform to succeed
}
```

#### Level 3: API Endpoint
```typescript
// /api/search-prices
try {
  const results = await Promise.all([...]);
  if (results.length === 0) {
    return res.status(404).json({ error: 'No prices found' });
  }
  return res.status(200).json({ results });
} catch (error) {
  return res.status(500).json({ 
    error: 'Failed to fetch prices',
    details: isDev ? error.message : undefined
  });
}
```

#### Level 4: Frontend Component
```typescript
// BookingForm
try {
  const response = await fetch('/api/search-prices', {...});
  if (!response.ok) throw new Error('API error');
  setSearchResults(data.results);
} catch (error) {
  setSearchError(error.message);
  toast({
    title: 'Error',
    description: error.message,
    variant: 'destructive'
  });
}
```

## Performance Optimization Strategies

### 1. Parallel Execution
```typescript
// Sequential (slow): 16-20s
const booking = await searchBookingPrice(...);
const airbnb = await searchAirbnbPrice(...);

// Parallel (fast): 8-10s
const [booking, airbnb] = await Promise.all([
  searchBookingPrice(...),
  searchAirbnbPrice(...)
]);
```

### 2. Browser Reuse
```typescript
// One browser for both searches
const browser = await chromium.launch();
await searchBookingPrice({ ..., browser });
await searchAirbnbPrice({ ..., browser });
await browser.close();
```

### 3. Wait Strategy
```typescript
// Fast (domcontentloaded): ~2s
await page.goto(url, { waitUntil: 'domcontentloaded' });

// Slow (networkidle): ~5s
await page.goto(url, { waitUntil: 'networkidle' });
```

### 4. Timeout Configuration
```typescript
// Balance speed vs reliability
const NAVIGATION_TIMEOUT = 15000;  // 15s
const SELECTOR_TIMEOUT = 8000;     // 8s
const DYNAMIC_WAIT = 2000;         // 2s
```

## Testing Strategy

### Unit Tests

#### Type Tests
```typescript
describe('SearchResult type', () => {
  it('should accept valid platform');
  it('should enforce platform union type');
  it('should require all fields');
});
```

#### Function Tests
```typescript
describe('searchBookingPrice', () => {
  it('should return SearchResult on success');
  it('should return null on failure');
  it('should handle different languages');
  it('should normalize date formats');
});
```

### Integration Tests

```typescript
describe('Price search flow', () => {
  it('should search both platforms in parallel');
  it('should handle partial success (one platform)');
  it('should handle complete failure (both platforms)');
  it('should close browser on error');
});
```

### End-to-End Tests

```typescript
describe('User booking flow', () => {
  it('should select dates and guests');
  it('should validate availability');
  it('should display price comparison');
  it('should handle errors gracefully');
});
```

## Monitoring & Observability

### Key Metrics to Track

```typescript
interface PriceSearchMetrics {
  // Performance
  totalDuration: number;
  bookingDuration: number;
  airbnbDuration: number;
  
  // Success/Failure
  bookingSuccess: boolean;
  airbnbSuccess: boolean;
  resultCount: number;
  
  // Errors
  errorType?: string;
  errorMessage?: string;
  
  // Request metadata
  timestamp: Date;
  language: string;
  guestCount: number;
}
```

### Log Analysis Queries

```bash
# Success rate
grep "\[prices\] Search completed" logs/app.log | wc -l

# Average response time
grep "Duration(ms):" logs/app.log | awk '{print $NF}' | awk '{sum+=$1} END {print sum/NR}'

# Error breakdown
grep "\[prices\].*error" logs/app.log | awk -F': ' '{print $2}' | sort | uniq -c
```

## Future Enhancement Opportunities

### 1. Caching Layer
```typescript
interface PriceCacheEntry {
  key: string;  // `${from}-${to}-${adults}-${children}`
  results: SearchResult[];
  timestamp: Date;
  expiresAt: Date;
}

// Cache for 30 minutes
const TTL = 30 * 60 * 1000;
```

### 2. Request Queuing
```typescript
// Limit concurrent searches to protect resources
const queue = new PQueue({ concurrency: 2 });

const results = await queue.add(() => 
  searchPrices(dates, guests, language)
);
```

### 3. Result Streaming
```typescript
// Stream results as they arrive
const response = new TransformStream();
searchBookingPrice(...).then(result => 
  response.enqueue(JSON.stringify(result))
);
```

### 4. A/B Testing
```typescript
// Test different scraping strategies
const strategy = getExperimentVariant('price-scraping');
if (strategy === 'agentql') {
  return searchWithAgentQL(...);
} else {
  return searchWithPlaywright(...);
}
```

### 5. Monitoring Dashboard
```typescript
// Real-time metrics visualization
{
  successRate: "95%",
  avgResponseTime: "8.2s",
  activeSearches: 3,
  cacheHitRate: "45%"
}
```

# Price Search System - Overview

## Purpose
The price search system is designed to automatically compare direct booking prices with OTA (Online Travel Agency) platforms (Booking.com and Airbnb) to help users make informed booking decisions. The system showcases the value of booking directly by displaying real-time price comparisons.

## Architecture Overview

### High-Level Flow
```
User Input (Dates + Guests)
    ↓
BookingForm Component
    ↓
Availability Check
    ↓
priceSearchService.ts (Frontend)
    ↓
/api/search-prices (API Endpoint)
    ↓
Parallel Web Scraping
    ├─ searchBooking.ts → Booking.com
    └─ searchAirbnb.ts → Airbnb
    ↓
Results Aggregation
    ↓
PriceComparisonResults Component
    ↓
Display to User
```

### Technology Stack
- **Frontend**: Next.js, TypeScript, React
- **Backend**: Next.js API Routes
- **Web Scraping**: Playwright (Chromium)
- **UI Components**: Custom React components with Framer Motion

## Key Components

### 1. Frontend Layer
- **BookingForm.tsx**: Main user interface for date/guest selection
- **priceSearchService.ts**: Client-side service for API communication
- **PriceComparisonResults.tsx**: Display component for search results

### 2. API Layer
- **pages/api/search-prices.ts**: Main API endpoint that orchestrates searches

### 3. Scraping Layer
- **searchBooking.ts**: Booking.com price extraction
- **searchAirbnb.ts**: Airbnb price extraction

### 4. Shared Types
- **SearchResult**: Standard interface for price data
- **GuestInfo**: Guest count structure
- **DateRange**: Date selection interface

## Data Flow

### 1. User Initiates Search
```typescript
// User selects dates and guests in BookingForm
dates: {
  from: Date,
  to: Date
}
guests: {
  adults: number,
  children: number
}
```

### 2. Frontend Validation
- Date selection validation
- Guest count validation (max 6 guests)
- Availability check against iCal calendar

### 3. API Request
```typescript
POST /api/search-prices
{
  dates: {
    from: "2025-01-15",  // ISO format, noon local time
    to: "2025-01-20"
  },
  guests: {
    adults: 2,
    children: 0
  },
  language: "it" | "en"
}
```

### 4. Parallel Scraping
- Chromium browser launched with headless mode
- Two simultaneous searches:
  - Booking.com search (with language-specific URL)
  - Airbnb search (language-agnostic)

### 5. Price Extraction
- DOM parsing using Playwright selectors
- Smart price detection (handles strikethrough, currency formats)
- Numeric value extraction and normalization

### 6. Response Format
```typescript
{
  results: [
    {
      platform: "Booking.com",
      price: "516",
      currency: "€",
      url: "https://www.booking.com/...",
      logoSrc: "/logo/logo_booking.png"
    },
    {
      platform: "Airbnb",
      price: "522",
      currency: "€",
      url: "https://www.airbnb.com/...",
      logoSrc: "/logo/logo_airbnb.png"
    }
  ]
}
```

## Performance Optimizations

### 1. Parallel Execution
- Both Booking.com and Airbnb searches run simultaneously
- Uses `Promise.all()` for concurrent execution
- Typical time: 8-15 seconds for both searches

### 2. Browser Management
- Single Chromium instance for both searches
- Separate browser contexts for isolation
- Automatic cleanup in finally block

### 3. Wait Strategies
- Uses `domcontentloaded` instead of `networkidle` for faster loading
- Strategic timeouts for dynamic content
- Fallback mechanisms for price extraction

### 4. Error Handling
- Individual search failures don't block the other
- Graceful degradation (returns available results)
- Comprehensive logging for debugging

## Integration Points

### With Booking Flow
1. User selects dates/guests
2. System checks availability via iCal
3. If available, price search is triggered
4. Results displayed with "Book Directly" option

### With Calendar System
- Uses `useIcalData` hook for availability
- Cross-references selected dates with booked periods
- Prevents searches for unavailable dates

### With Language System
- Supports Italian (it) and English (en)
- Language affects Booking.com URL structure
- Airbnb search is language-independent

## Static Configuration

### Booking.com Parameters
```typescript
{
  aid: "397594",
  label: "gog235jc-...",
  dest_id: "12041954",
  dest_type: "hotel",
  no_rooms: "1",
  selected_currency: "EUR",
  ...
}
```

### Property URLs
- **Booking.com**: https://www.booking.com/hotel/it/marzagem.html
- **Airbnb**: https://www.airbnb.com/rooms/1151412127742161355

## Security Considerations

1. **Rate Limiting**: No explicit rate limiting implemented
2. **Browser Sandboxing**: Uses `--no-sandbox` for compatibility
3. **Error Sanitization**: Development-only error details
4. **No Caching**: Each request performs fresh scraping

## Known Limitations

1. **Performance**: 8-15 seconds typical response time
2. **Reliability**: Depends on OTA website structure
3. **Rate Limits**: Vulnerable to OTA rate limiting
4. **Maintenance**: Requires updates when OTA UIs change

## Future Considerations

1. **Caching Strategy**: Cache results for same date/guest combinations
2. **Rate Limiting**: Implement request throttling
3. **Monitoring**: Add price extraction success rate tracking
4. **Fallbacks**: Consider API integrations with OTAs
5. **More Platforms**: Potential to add more booking platforms

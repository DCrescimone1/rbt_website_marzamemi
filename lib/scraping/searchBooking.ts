import { Browser } from 'playwright';
import { SearchResult } from './types';
import { SCRAPING_CONFIG, BOOKING_CONFIG } from './config';

interface BookingSearchParams {
  dates: { from: string; to: string };
  guests: { adults: number; children: number };
  language: string;
  browser: Browser;
  signal?: AbortSignal;
}

/**
 * Map language codes to Booking.com language suffixes
 */
function getLanguageSuffix(language: string): string {
  const languageMap: Record<string, string> = {
    it: 'it-it',
    en: 'en-gb',
  };
  return languageMap[language] || 'en-gb';
}

/**
 * Construct Booking.com URL with search parameters
 */
function buildBookingUrl(params: BookingSearchParams): string {
  const { dates, guests, language } = params;
  const languageSuffix = getLanguageSuffix(language);

  // Build URL with static and dynamic parameters
  const url = new URL(BOOKING_CONFIG.baseUrl);

  // Add static parameters
  Object.entries(BOOKING_CONFIG.staticParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  // Add dynamic parameters
  url.searchParams.set('checkin', dates.from);
  url.searchParams.set('checkout', dates.to);
  url.searchParams.set('group_adults', guests.adults.toString());
  url.searchParams.set('group_children', guests.children.toString());

  // Add language suffix to pathname
  url.pathname = url.pathname.replace('.html', `.${languageSuffix}.html`);

  return url.toString();
}

/**
 * Search for price on Booking.com
 * Returns prices for both villas or nulls if extraction fails
 */
export async function searchBookingPrice(
  params: BookingSearchParams
): Promise<{ villaI2Mari: SearchResult | null; villaZefiro: SearchResult | null }> {
  const { browser, dates } = params;
  let context;

  try {
    // Calculate number of nights for safety check
    const from = new Date(dates.from);
    const to = new Date(dates.to);
    const nights = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    const minimumPrice = nights * 40;

    // Create browser context with desktop viewport and user agent
    context = await browser.newContext({
      viewport: SCRAPING_CONFIG.viewport,
      userAgent: SCRAPING_CONFIG.userAgent,
    });

    const page = await context.newPage();
    const url = buildBookingUrl(params);

    console.log('[prices] Booking.com search started');
    console.log('[prices] Booking.com URL:', url);
    const startTime = Date.now();

    // Navigate to Booking.com URL with domcontentloaded strategy
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: SCRAPING_CONFIG.navigationTimeout,
    });

    // Extract prices grouped by room type using data-block-id.
    // Each villa is a distinct room type (identified by the first segment of data-block-id).
    // Each room type has multiple pricing rows (non-refundable, free cancellation, etc.).
    // We filter by guest capacity first, then take the cheapest price per room type, then assign based on guest count
    const requestedGuests = params.guests.adults + params.guests.children;
    let roomTypePrices: { roomTypeId: string; price: number }[] = [];
    try {
      await page.waitForSelector('.prco-valign-middle-helper', {
        timeout: SCRAPING_CONFIG.selectorTimeout,
      });

      roomTypePrices = await page.$$eval(
        'table.hprt-table tbody tr[data-block-id]',
        (rows, requestedGuests) => {
          const results: { roomTypeId: string; price: number }[] = [];

          for (const row of rows) {
            // Each row has data-block-id like "1533882301_424904225_5_0_0"
            // First segment is the room type ID (unique per villa)
            const blockId = row.getAttribute('data-block-id') || '';
            const roomTypeId = blockId.split('_')[0];
            if (!roomTypeId) continue;

            // Extract guest capacity from the row
            // Look for the occupancy icon/text (usually shows person icons with a number)
            const occupancyCell = row.querySelector('td.hprt-table-cell-occupancy, td[class*="occupancy"]');
            let guestCapacity = 0;
            
            if (occupancyCell) {
              // Try to find the guest count - look for patterns like "× 5" or just "5"
              const occupancyText = (occupancyCell.textContent || '').trim();
              const capacityMatch = occupancyText.match(/×?\s*(\d+)/);
              if (capacityMatch) {
                guestCapacity = parseInt(capacityMatch[1], 10);
              }
            }

            // Skip rows that can't accommodate the requested number of guests
            if (guestCapacity > 0 && guestCapacity < requestedGuests) {
              continue;
            }

            const priceEl = row.querySelector('.prco-valign-middle-helper');
            if (!priceEl) continue;

            const text = (priceEl.textContent || '').trim();
            const match = text.match(/[\d.,]+/);
            if (match) {
              const clean = match[0].replace(/[.]/g, '').replace(/,/g, '');
              const value = parseInt(clean, 10);
              if (!isNaN(value)) {
                results.push({ roomTypeId, price: value });
              }
            }
          }

          return results;
        },
        requestedGuests
      );
    } catch (error) {
      console.log('[prices] Booking.com: Failed to extract room type prices', error);
    }

    // Fallback: if structured extraction failed, try flat price collection
    if (!roomTypePrices.length) {
      console.log('[prices] Booking.com: Falling back to flat price extraction');
      const fallbackSelectors = [
        '.prco-valign-middle-helper',
        '[data-testid="price-and-discounted-price"]',
        '.bui-price-display__value',
        '.prco-inline-block-maker-helper',
      ];

      for (const selector of fallbackSelectors) {
        try {
          const texts = await page.$$eval(selector, (els) =>
            els.map((el) => (el.textContent || '').trim()).filter((t) => t.length > 0),
          );
          if (texts.length > 0) {
            // Assign synthetic room type IDs alternating (best effort)
            roomTypePrices = texts
              .map((text, i) => {
                const match = text.match(/[\d.,]+/);
                if (!match) return null;
                const clean = match[0].replace(/[.]/g, '').replace(/,/g, '');
                const value = parseInt(clean, 10);
                if (isNaN(value)) return null;
                // Group every 2 prices as same room type (each villa typically has 2 price options)
                return { roomTypeId: `fallback_${Math.floor(i / 2)}`, price: value };
              })
              .filter((p): p is { roomTypeId: string; price: number } => !!p);
            if (roomTypePrices.length > 0) break;
          }
        } catch {}
      }
    }

    if (!roomTypePrices.length) {
      console.log('[prices] Booking.com: No price elements found');
      return { villaI2Mari: null, villaZefiro: null };
    }

    // Group by room type and take the cheapest price per room type
    const priceByRoomType = new Map<string, number>();
    for (const { roomTypeId, price } of roomTypePrices) {
      if (price < minimumPrice) continue;
      const existing = priceByRoomType.get(roomTypeId);
      if (existing === undefined || price < existing) {
        priceByRoomType.set(roomTypeId, price);
      }
    }

    // Sort room types by their cheapest price (ascending)
    const sortedRoomTypes = Array.from(priceByRoomType.entries()).sort((a, b) => a[1] - b[1]);
    console.log(`[prices] Booking.com: Found ${sortedRoomTypes.length} distinct room types:`,
      sortedRoomTypes.map(([id, price]) => `${id}=${price}`).join(', '));

    if (!sortedRoomTypes.length) {
      console.log('[prices] Booking.com: No valid prices after parsing/filtering');
      return { villaI2Mari: null, villaZefiro: null };
    }

    // Assign prices to villas based on guest count and number of room types found
    // If guests > 4, Villa i 2 Mari can't accommodate, so single room type = Villa Zefiro
    // If guests <= 4, both villas available: cheapest = Villa I Due Mari, second = Villa Zefiro
    const totalGuests = params.guests.adults + params.guests.children;
    const cheapestPrice = sortedRoomTypes[0]?.[1] ?? null;
    const secondPrice = sortedRoomTypes[1]?.[1] ?? null;

    const duration = Date.now() - startTime;
    console.log(`[prices] Booking.com search completed in ${duration}ms`);

    // Build individual property URLs for each villa
    const buildPropertyUrl = (baseUrl: string) => {
      const propertyUrl = new URL(baseUrl);
      propertyUrl.searchParams.set('checkin', params.dates.from);
      propertyUrl.searchParams.set('checkout', params.dates.to);
      propertyUrl.searchParams.set('group_adults', params.guests.adults.toString());
      propertyUrl.searchParams.set('group_children', params.guests.children.toString());
      Object.entries(BOOKING_CONFIG.staticParams).forEach(([key, value]) => {
        propertyUrl.searchParams.set(key, value);
      });
      const languageSuffix = getLanguageSuffix(params.language);
      propertyUrl.pathname = propertyUrl.pathname.replace('.html', `.${languageSuffix}.html`);
      return propertyUrl.toString();
    };

    let villaI2Mari: SearchResult | null = null;
    let villaZefiro: SearchResult | null = null;

    if (totalGuests > 4) {
      // Villa i 2 Mari can't accommodate, so only Villa Zefiro prices should be on the page
      villaZefiro = cheapestPrice
        ? {
            platform: 'Booking.com',
            price: cheapestPrice.toString(),
            currency: '€',
            url: buildPropertyUrl(BOOKING_CONFIG.villaZefiroUrl),
            logoSrc: '/logo/logo_booking.png',
          }
        : null;
    } else {
      // Both villas can accommodate: cheapest = Villa I Due Mari, second = Villa Zefiro
      villaI2Mari = cheapestPrice
        ? {
            platform: 'Booking.com',
            price: cheapestPrice.toString(),
            currency: '€',
            url: buildPropertyUrl(BOOKING_CONFIG.villaI2MariUrl),
            logoSrc: '/logo/logo_booking.png',
          }
        : null;

      villaZefiro = secondPrice
        ? {
            platform: 'Booking.com',
            price: secondPrice.toString(),
            currency: '€',
            url: buildPropertyUrl(BOOKING_CONFIG.villaZefiroUrl),
            logoSrc: '/logo/logo_booking.png',
          }
        : null;
    }

    return { villaI2Mari, villaZefiro };
  } catch (error) {
    // Log errors with [prices] prefix
    console.error('[prices] Booking.com search error:', error);
    // Return nulls on extraction failure without throwing
    return { villaI2Mari: null, villaZefiro: null };
  } finally {
    // Close browser context in finally block
    if (context) {
      console.log('[prices] Booking.com: Closing context');
      await context.close().catch((err) => {
        console.error('[prices] Error closing Booking.com context:', err);
      });
      console.log('[prices] Booking.com: Context closed');
    }
  }
}

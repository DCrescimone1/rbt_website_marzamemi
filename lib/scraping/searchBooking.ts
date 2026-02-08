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

    // Collect all visible price elements on the page
    let rawPriceTexts: string[] = [];
    try {
      await page.waitForSelector('.prco-valign-middle-helper', {
        timeout: SCRAPING_CONFIG.selectorTimeout,
      });
      rawPriceTexts = await page.$$eval('.prco-valign-middle-helper', (elements) =>
        elements
          .map((el) => (el.textContent || '').trim())
          .filter((text) => text.length > 0),
      );
    } catch (error) {
      console.log('[prices] Booking.com: Failed to collect price elements', error);
      
      // Fallback: try alternative selectors
      const fallbackSelectors = [
        '[data-testid="price-and-discounted-price"]',
        '.prco-text-link',
        '[data-testid="price-summary"]',
        '.bui-price-display__value',
        '.prco-inline-block-maker-helper',
      ];
      
      for (const selector of fallbackSelectors) {
        try {
          const elements = await page.$$(selector);
          if (elements.length > 0) {
            console.log(`[prices] Booking.com: Trying fallback selector: ${selector}`);
            rawPriceTexts = await page.$$eval(selector, (els) =>
              els.map((el) => (el.textContent || '').trim()).filter((text) => text.length > 0),
            );
            if (rawPriceTexts.length > 0) {
              console.log(`[prices] Booking.com: Found ${rawPriceTexts.length} prices with fallback selector`);
              break;
            }
          }
        } catch {}
      }
    }

    if (!rawPriceTexts.length) {
      console.log('[prices] Booking.com: No price elements found');
      return { villaI2Mari: null, villaZefiro: null };
    }

    // Extract numeric values and sort ascending
    const parsedPrices = rawPriceTexts
      .map((text) => {
        const match = text.match(/[\d.,]+/);
        if (!match) return null;
        const clean = match[0].replace(/[.]/g, '').replace(/,/g, '');
        const value = parseInt(clean, 10);
        if (isNaN(value)) return null;
        return { text, value };
      })
      .filter((p): p is { text: string; value: number } => !!p)
      .filter((p) => p.value >= minimumPrice)
      .sort((a, b) => a.value - b.value);

    if (!parsedPrices.length) {
      console.log('[prices] Booking.com: No valid prices after parsing/filtering');
      return { villaI2Mari: null, villaZefiro: null };
    }

    const first = parsedPrices[0];
    const second = parsedPrices[1] ?? null;

    const duration = Date.now() - startTime;
    console.log(`[prices] Booking.com search completed in ${duration}ms`);

    const villaI2Mari: SearchResult | null = first
      ? {
          platform: 'Booking.com',
          price: first.value.toString(),
          currency: '€',
          url,
          logoSrc: '/logo/logo_booking.png',
        }
      : null;

    const villaZefiro: SearchResult | null = second
      ? {
          platform: 'Booking.com',
          price: second.value.toString(),
          currency: '€',
          url,
          logoSrc: '/logo/logo_booking.png',
        }
      : null;

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

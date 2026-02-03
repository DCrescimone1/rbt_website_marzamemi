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
 * Returns SearchResult or null if extraction fails
 */
export async function searchBookingPrice(
  params: BookingSearchParams
): Promise<SearchResult | null> {
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
    const startTime = Date.now();

    // Navigate to Booking.com URL with domcontentloaded strategy
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: SCRAPING_CONFIG.navigationTimeout,
    });

    let priceText: string | null = null;

    // Wait for price element with primary selector
    try {
      await page.waitForSelector('.prco-valign-middle-helper', {
        timeout: SCRAPING_CONFIG.selectorTimeout,
      });
      priceText = await page.textContent('.prco-valign-middle-helper');
    } catch (error) {
      // Implement fallback direct query if selector times out
      console.log('[prices] Primary selector timed out, trying fallback');
      priceText = await page.textContent('.prco-valign-middle-helper');
    }

    // Try span.prco-valign-middle-helper if first one fails
    if (!priceText) {
      try {
        await page.waitForSelector('span.prco-valign-middle-helper', {
          timeout: SCRAPING_CONFIG.selectorTimeout,
        });
        priceText = await page.textContent('span.prco-valign-middle-helper');
      } catch (error) {
        console.log('[prices] span.prco-valign-middle-helper selector timed out, trying fallback');
        priceText = await page.textContent('span.prco-valign-middle-helper');
      }
    }

    // Try span.bui-u-sr-only if still no price
    if (!priceText) {
      try {
        await page.waitForSelector('span.bui-u-sr-only', {
          timeout: SCRAPING_CONFIG.selectorTimeout,
        });
        priceText = await page.textContent('span.bui-u-sr-only');
      } catch (error) {
        console.log('[prices] span.bui-u-sr-only selector timed out, trying fallback');
        priceText = await page.textContent('span.bui-u-sr-only');
      }
    }

    if (!priceText) {
      console.log('[prices] Booking.com: No price found');
      return null;
    }

    // Extract and parse price text, removing thousand separators
    const priceMatch = priceText.match(/[\d.,]+/);
    if (!priceMatch) {
      console.log('[prices] Booking.com: Could not parse price from text:', priceText);
      return null;
    }

    // Remove thousand separators (dots or commas) and parse
    const cleanPrice = priceMatch[0].replace(/\./g, '').replace(/,/g, '');
    const price = parseInt(cleanPrice, 10);

    if (isNaN(price)) {
      console.log('[prices] Booking.com: Invalid price value:', cleanPrice);
      return null;
    }

    // Safety check: price should never be lower than (nights × €40)
    if (price < minimumPrice) {
      console.log(`[prices] Booking.com: Price ${price} is below minimum threshold ${minimumPrice} (${nights} nights × €40)`);
      return null;
    }

    const duration = Date.now() - startTime;
    console.log(`[prices] Booking.com search completed in ${duration}ms`);

    return {
      platform: 'Booking.com',
      price: price.toString(),
      currency: '€',
      url,
      logoSrc: '/logo/logo_booking.png',
    };
  } catch (error) {
    // Log errors with [prices] prefix
    console.error('[prices] Booking.com search error:', error);
    // Return null on extraction failure without throwing
    return null;
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

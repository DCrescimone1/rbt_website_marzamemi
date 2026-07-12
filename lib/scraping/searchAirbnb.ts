import type { SearchResult } from './types';
import { Browser } from 'playwright';
import { SCRAPING_CONFIG } from './config';

interface AirbnbSearchParams {
  dates: { from: string; to: string };
  guests: { adults: number; children: number };
  browser: Browser;
  url: string;
  signal?: AbortSignal;
}

// Construct Airbnb URL with search parameters
function buildAirbnbUrl(params: AirbnbSearchParams): string {
  const { dates, guests, url: baseUrl } = params;
  const url = new URL(baseUrl);
  url.searchParams.set('check_in', dates.from);
  url.searchParams.set('check_out', dates.to);
  url.searchParams.set('guests', (guests.adults + guests.children).toString());
  url.searchParams.set('currency', 'EUR');
  return url.toString();
}

// Search for price on Airbnb
export async function searchAirbnbPrice(
  params: AirbnbSearchParams
): Promise<SearchResult | null> {
  const { browser, dates } = params;
  let context;
  try {
    // Nights and minimum price safety
    const from = new Date(dates.from);
    const to = new Date(dates.to);
    const nights = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    const minimumPrice = nights * 40;

    // Browser context
    context = await browser.newContext({
      viewport: SCRAPING_CONFIG.viewport,
      userAgent: SCRAPING_CONFIG.userAgent,
    });
    const page = await context.newPage();
    const url = buildAirbnbUrl(params);

    console.log('[prices] Airbnb search started');
    console.log('[prices] Airbnb URL:', url);
    const startTime = Date.now();

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: SCRAPING_CONFIG.navigationTimeout,
    });

    // Trigger lazy loads
    await page.evaluate(() => window.scrollBy(0, 300));

    // The booking sidebar is the only section whose price belongs to the
    // requested dates; everything else on the page (calendar, suggested dates,
    // similar listings) shows prices for other dates. No sidebar → no price.
    const sidebarSelectors = [
      '[data-section-id="BOOK_IT_SIDEBAR"]',
      '[data-testid="book-it-default"]',
      '[data-plugin-in-point-id="BOOK_IT_SIDEBAR"]',
      '.c1yo0219',
    ];
    let sidebarSelector: string | null = null;
    for (const selector of sidebarSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        sidebarSelector = selector;
        break;
      } catch {}
    }
    if (!sidebarSelector) {
      console.log('[prices] Airbnb: Booking sidebar not found');
      return null;
    }

    // When the dates are booked or violate min-stay, Airbnb keeps them in the
    // sidebar but shows "Aggiungi le date per conoscere i prezzi" with no €
    // amount — waiting for a price to appear distinguishes that case from a
    // slow hydration.
    try {
      await page.waitForFunction(
        (sel) => /€|EUR/.test(document.querySelector(sel)?.textContent || ''),
        sidebarSelector,
        { timeout: 5000 },
      );
    } catch {
      console.log('[prices] Airbnb: No price in booking sidebar (dates likely unavailable)');
      return null;
    }

    // Guard: the sidebar must display the dates we asked for
    const shownDates = await page.evaluate(() => ({
      checkIn: document.querySelector('[data-testid="change-dates-checkIn"]')?.textContent?.trim() ?? '',
      checkOut: document.querySelector('[data-testid="change-dates-checkOut"]')?.textContent?.trim() ?? '',
    }));
    const dayShown = (shown: string, iso: string) => {
      if (!shown) return true; // field not rendered in this layout — skip guard
      const nums = (shown.match(/\d+/g) || []).map(Number);
      return nums.includes(parseInt(iso.split('-')[2], 10));
    };
    if (!dayShown(shownDates.checkIn, dates.from) || !dayShown(shownDates.checkOut, dates.to)) {
      console.log('[prices] Airbnb: Sidebar dates do not match request', shownDates);
      return null;
    }

    // Extract the price from sidebar spans only: skip struck-through amounts
    // (pre-discount originals), prefer the line labelled "total"/"totale", and
    // among those pick the lowest so a discounted total beats the original.
    const priceText = await page.evaluate((sel) => {
      const sidebar = document.querySelector(sel);
      if (!sidebar) return null;
      // Exclude patterns in both English and Italian
      const excludePatterns = ['originally', 'was', 'per night', '/night', 'per notte', 'notti'];
      const candidates: { t: string; v: number }[] = [];
      for (const el of Array.from(sidebar.querySelectorAll('span'))) {
        const text = (el.textContent || '').trim();
        if (!text || (!text.includes('€') && !text.includes('EUR')) || !/\d{2,}/.test(text)) continue;
        const lower = text.toLowerCase();
        if (excludePatterns.some((p) => lower.includes(p))) continue;
        const style = window.getComputedStyle(el);
        if (style.textDecorationLine.includes('line-through') || style.textDecoration.includes('line-through')) continue;
        const m = text.match(/[\d.,]+/);
        const v = m ? parseInt(m[0].replace(/\./g, '').replace(/,/g, ''), 10) : 0;
        if (!isNaN(v) && v > 0) candidates.push({ t: text, v });
      }
      if (candidates.length === 0) return null;
      // "totale" contains "total", so one check covers both languages
      const totals = candidates.filter((c) => c.t.toLowerCase().includes('total'));
      const pool = totals.length > 0 ? totals : candidates;
      pool.sort((a, b) => a.v - b.v);
      return pool[0].t;
    }, sidebarSelector);

    if (!priceText) {
      console.log('[prices] Airbnb: No price found in sidebar');
      return null;
    }
    console.log('[prices] Airbnb: Sidebar price candidate:', priceText);

    const priceMatch = priceText.match(/[\d.,]+/);
    if (!priceMatch) {
      console.log('[prices] Airbnb: Could not parse price from text:', priceText);
      return null;
    }
    const cleanPrice = priceMatch[0].replace(/\./g, '').replace(/,/g, '');
    const price = parseInt(cleanPrice, 10);
    if (isNaN(price)) {
      console.log('[prices] Airbnb: Invalid price value:', cleanPrice);
      return null;
    }

    // Safety minimum
    if (price < minimumPrice) {
      console.log(`[prices] Airbnb: Price ${price} is below minimum threshold ${minimumPrice} (${nights} nights × €40)`);
      return null;
    }

    const duration = Date.now() - startTime;
    console.log(`[prices] Airbnb search completed in ${duration}ms`);
    return {
      platform: 'Airbnb',
      price: price.toString(),
      currency: '€',
      url,
      logoSrc: '/logo/logo_airbnb.png',
    };
  } catch (error) {
    console.error('[prices] Airbnb search error:', error);
    return null;
  } finally {
    if (context) {
      console.log('[prices] Airbnb: Closing context');
      await context.close().catch((err) => {
        console.error('[prices] Error closing Airbnb context:', err);
      });
      console.log('[prices] Airbnb: Context closed');
    }
  }
}

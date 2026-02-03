import type { SearchResult } from './types';
import { Browser } from 'playwright';
import { SCRAPING_CONFIG, AIRBNB_CONFIG } from './config';

interface AirbnbSearchParams {
  dates: { from: string; to: string };
  guests: { adults: number; children: number };
  browser: Browser;
  signal?: AbortSignal;
}

// Construct Airbnb URL with search parameters
function buildAirbnbUrl(params: AirbnbSearchParams): string {
  const { dates, guests } = params;
  const url = new URL(AIRBNB_CONFIG.baseUrl);
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
    const startTime = Date.now();

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: SCRAPING_CONFIG.navigationTimeout,
    });

    // Trigger lazy loads
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1000);

    // Try to locate sidebar
    const sidebarSelectors = [
      '[data-section-id="BOOK_IT_SIDEBAR"]',
      '[data-testid="book-it-default"]',
      '[data-plugin-in-point-id="BOOK_IT_SIDEBAR"]',
      '.c1yo0219',
    ];
    let sidebarFound = false;
    for (const selector of sidebarSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        sidebarFound = true;
        break;
      } catch {}
    }
    if (!sidebarFound) {
      console.log('[prices] Airbnb: Booking sidebar not found');
    }

    // Collect candidates
    const priceSelectors = [
      '[data-testid="book-it-default"] span',
      '._1y74zjx',
      '._tyxjp1',
      '._1k4xcdh',
      'span[aria-hidden="true"]',
    ];

    const priceCandidates: string[] = [];
    for (const selector of priceSelectors) {
      try {
        const elements = await page.$$(selector);
        for (const el of elements) {
          const text = await el.textContent();
          if (text && text.trim()) {
            priceCandidates.push(text.trim());
          }
        }
      } catch {}
    }

    // Filter candidates
    const validCandidates = priceCandidates.filter((t) =>
      ((t.includes('€') || t.includes('EUR')) && /\d{2,}/.test(t))
    );

    const excludePatterns = ['originally', 'was', 'per night', '/night', 'for', 'nights'];
    const filteredCandidates = validCandidates.filter((text) => {
      const lower = text.toLowerCase();
      if (excludePatterns.some((p) => lower.includes(p))) return false;
      if (!text.includes('€') && !text.includes('EUR')) return false;
      if (!/\d/.test(text)) return false;
      return true;
    });

    // Choose best candidate
    let priceText: string | null = null;
    if (filteredCandidates.length > 0) {
      const simple = filteredCandidates.filter((t) => /^\d+$/.test(t.replace(/[€\s,\.]/g, '')));
      const list = simple.length > 0 ? simple : filteredCandidates;
      const withVals = list
        .map((t) => {
          const m = t.match(/[\d.,]+/);
          const v = m ? parseInt(m[0].replace(/\./g, '').replace(/,/g, ''), 10) : 0;
          return { t, v };
        })
        .filter((x) => !isNaN(x.v) && x.v > 0)
        .sort((a, b) => a.v - b.v);
      if (withVals.length > 0) priceText = withVals[0].t;
    }

    // Fallback full page scan
    if (!priceText) {
      console.log('[prices] Airbnb: Using full page scan fallback');
      priceText = await page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        const pricePattern = /€\s*[\d,\.]+/g;
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const text = (node.textContent || '');
          const matches = text.match(pricePattern);
          if (matches && matches.length > 0) {
            const parent = (node as any).parentElement as HTMLElement | null;
            if (parent) {
              const style = window.getComputedStyle(parent);
              const isStrike = style.textDecorationLine === 'line-through' || style.textDecoration.includes('line-through');
              if (!isStrike) {
                const lowerText = text.toLowerCase();
                if (!lowerText.includes('originally') && !lowerText.includes('was') && !lowerText.includes('per night') && !lowerText.includes('/night')) {
                  return matches[0];
                }
              }
            }
          }
        }
        return null;
      });
    }

    if (!priceText) {
      console.log('[prices] Airbnb: No price found');
      return null;
    }

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

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
  // Booking.com requires an age param for each child; without it only 1 child is registered
  for (let i = 0; i < guests.children; i++) {
    url.searchParams.append('age', '10');
  }

  // Add language suffix to pathname
  url.pathname = url.pathname.replace('.html', `.${languageSuffix}.html`);

  return url.toString();
}

/**
 * Build a clean hotel page URL for the "Visualizza" button.
 * Mirrors the scraping URL parameters (currency, price type, language) so the user
 * sees the same prices, but omits dest_id/dest_type which redirect to searchresults.
 */
function buildVillaLinkUrl(villaBaseUrl: string, params: BookingSearchParams): string {
  const { dates, guests, language } = params;
  const languageSuffix = getLanguageSuffix(language);
  const url = new URL(villaBaseUrl);
  url.searchParams.set('aid', BOOKING_CONFIG.staticParams.aid);
  url.searchParams.set('no_rooms', '1');
  url.searchParams.set('selected_currency', BOOKING_CONFIG.staticParams.selected_currency);
  url.searchParams.set('sb_price_type', BOOKING_CONFIG.staticParams.sb_price_type);
  url.searchParams.set('checkin', dates.from);
  url.searchParams.set('checkout', dates.to);
  url.searchParams.set('group_adults', guests.adults.toString());
  url.searchParams.set('group_children', guests.children.toString());
  // Booking.com requires an age param for each child; without it only 1 child is registered
  for (let i = 0; i < guests.children; i++) {
    url.searchParams.append('age', '10');
  }
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

    // Each villa is a distinct room type (identified by the first segment of data-block-id).
    // Each room type has multiple rate blocks (non-refundable, free cancellation, and for
    // Villa Zefiro per-occupancy pricing: 6/5/4-person blocks at different prices in the
    // same table). A block is valid for the requested party when its occupancy is unknown
    // (flat rate) or >= requested guests; among valid blocks the cheapest per room type is
    // the "Non rimborsabile" rate we want.
    const requestedGuests = params.guests.adults + params.guests.children;
    let roomTypePrices: { roomTypeId: string; price: number }[] = [];
    try {
      await page.waitForSelector('.prco-valign-middle-helper', {
        timeout: SCRAPING_CONFIG.selectorTimeout,
      });
    } catch (error) {
      console.log('[prices] Booking.com: Price table did not appear', error);
    }

    // Primary extraction: the rooms JSON Booking embeds in the page. Unlike the visible
    // price cells, it exposes totals in the HOTEL currency (EUR for this property) — some
    // fresh sessions ignore selected_currency and render display prices in e.g. CHF, which
    // must never be shown as "€". It also carries the real per-block occupancy
    // (b_max_persons), including for flat blocks whose data-block-id has no occupancy.
    try {
      roomTypePrices = await page.evaluate((requestedGuests) => {
        const results: { roomTypeId: string; price: number }[] = [];
        const scripts = Array.from(document.querySelectorAll('script'));
        const src = scripts.map((s) => s.textContent || '').find((t) => t.includes('b_rooms_available_and_soldout'));
        if (!src) return results;
        const start = src.indexOf('[', src.indexOf('b_rooms_available_and_soldout'));
        if (start < 0) return results;
        // Find the matching closing bracket of the rooms array
        let depth = 0;
        let end = -1;
        let inStr = false;
        let esc = false;
        for (let i = start; i < src.length; i++) {
          const c = src[i];
          if (inStr) {
            if (esc) esc = false;
            else if (c === '\\') esc = true;
            else if (c === '"') inStr = false;
            continue;
          }
          if (c === '"') inStr = true;
          else if (c === '[') depth++;
          else if (c === ']') {
            depth--;
            if (depth === 0) { end = i; break; }
          }
        }
        if (end < 0) return results;
        const rooms = JSON.parse(src.slice(start, end + 1));
        for (const room of rooms) {
          const roomTypeId = String(room?.b_id ?? '');
          if (!roomTypeId) continue;
          for (const block of room?.b_blocks || []) {
            const occupancy = Number(block?.b_max_persons) || 0;
            if (occupancy > 0 && occupancy < requestedGuests) continue;
            const totalPrice = block?.b_price_breakdown_simplified?.b_total_price?.[0];
            const raw = Number(totalPrice?.b_raw_value_hotel_currency);
            if (!raw || isNaN(raw)) continue;
            // Hotel currency must be EUR; skip anything else rather than mislabel it
            const hotelCcyStr = String(totalPrice?.b_value_hotel_currency || '');
            if (hotelCcyStr && !hotelCcyStr.includes('€')) continue;
            results.push({ roomTypeId, price: Math.round(raw) });
          }
        }
        return results;
      }, requestedGuests);
      if (roomTypePrices.length) {
        console.log(`[prices] Booking.com: Extracted ${roomTypePrices.length} blocks from embedded rooms JSON`);
      }
    } catch (error) {
      console.log('[prices] Booking.com: Embedded rooms JSON extraction failed', error);
    }

    // Fallback 1: extract from the visible availability table rows.
    // Only trust rows priced in EUR (the "€" sign) — see currency note above.
    if (!roomTypePrices.length) try {
      console.log('[prices] Booking.com: Falling back to DOM row extraction');
      roomTypePrices = await page.$$eval(
        'table.hprt-table tbody tr[data-block-id]',
        (rows, requestedGuests) => {
          const results: { roomTypeId: string; price: number }[] = [];

          for (const row of rows) {
            // Each row has data-block-id like "1533882301_424904225_5_0_0"
            // First segment is the room type ID (unique per villa)
            const blockId = row.getAttribute('data-block-id') || '';
            const segments = blockId.split('_');
            const roomTypeId = segments[0];
            if (!roomTypeId) continue;

            // 3rd segment: occupancy the block is priced for; 0/NaN = flat rate block.
            // (The occupancy cell text is NOT a reliable fallback: its format changes with
            // the party composition, e.g. "N° max persone: 4" vs "n. max adulti: 3 <br> ...".)
            const occupancy = parseInt(segments[2] || '', 10) || 0;
            if (occupancy > 0 && occupancy < requestedGuests) {
              continue;
            }

            const priceEl = row.querySelector('.prco-valign-middle-helper');
            if (!priceEl) continue;

            const text = (priceEl.textContent || '').trim();
            if (!text.includes('€')) continue;
            const match = text.match(/[\d.,]+/);
            if (match) {
              // "." is the thousands separator, "," the decimal one (e.g. "1.312,50")
              const clean = match[0].replace(/\./g, '').split(',')[0];
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

    // Fallback 2: flat price collection from known price selectors (EUR-only, like above)
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
            els.map((el) => (el.textContent || '').trim()).filter((t) => t.length > 0 && t.includes('€')),
          );
          if (texts.length > 0) {
            // Assign synthetic room type IDs alternating (best effort)
            roomTypePrices = texts
              .map((text, i) => {
                const match = text.match(/[\d.,]+/);
                if (!match) return null;
                const clean = match[0].replace(/\./g, '').split(',')[0];
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

    console.log(`[prices] Booking.com: Found ${priceByRoomType.size} distinct room types:`,
      Array.from(priceByRoomType.entries()).map(([id, price]) => `${id}=${price}`).join(', '));

    if (!priceByRoomType.size) {
      console.log('[prices] Booking.com: No valid prices after parsing/filtering');
      return { villaI2Mari: null, villaZefiro: null };
    }

    // Assign prices to villas by their stable room type ID (first segment of data-block-id).
    // Both villas are room types of the same "Seacily Villas" property page, and the cheapest
    // row per room type is the "Non rimborsabile" rate we want to show.
    let zefiroPrice = priceByRoomType.get(BOOKING_CONFIG.roomTypeIds.villaZefiro) ?? null;
    let i2MariPrice = priceByRoomType.get(BOOKING_CONFIG.roomTypeIds.villaI2Mari) ?? null;

    if (zefiroPrice === null && i2MariPrice === null) {
      // No known room type ID matched (Booking changed IDs, or flat fallback extraction was
      // used with synthetic IDs). Fall back to the old heuristic: sort room types by price;
      // with >4 guests only Villa Zefiro can appear, otherwise cheapest = Villa I Due Mari.
      console.warn('[prices] Booking.com: No known room type IDs matched, using price-order heuristic');
      const sortedRoomTypes = Array.from(priceByRoomType.entries()).sort((a, b) => a[1] - b[1]);
      const totalGuests = params.guests.adults + params.guests.children;
      if (totalGuests > 4) {
        zefiroPrice = sortedRoomTypes[0]?.[1] ?? null;
      } else {
        i2MariPrice = sortedRoomTypes[0]?.[1] ?? null;
        zefiroPrice = sortedRoomTypes[1]?.[1] ?? null;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[prices] Booking.com search completed in ${duration}ms`);

    // Build clean hotel-page URLs for the "Visualizza" button (no dest_id/dest_type redirect
    // params), anchored to each villa's room type in the availability table.
    const zefiroLinkUrl = buildVillaLinkUrl(BOOKING_CONFIG.villaZefiroUrl, params)
      + `#room_type_id_${BOOKING_CONFIG.roomTypeIds.villaZefiro}`;
    const i2MariLinkUrl = buildVillaLinkUrl(BOOKING_CONFIG.villaI2MariUrl, params)
      + `#room_type_id_${BOOKING_CONFIG.roomTypeIds.villaI2Mari}`;

    const villaZefiro: SearchResult | null = zefiroPrice !== null
      ? {
          platform: 'Booking.com',
          price: zefiroPrice.toString(),
          currency: '€',
          url: zefiroLinkUrl,
          logoSrc: '/logo/logo_booking.png',
        }
      : null;

    const villaI2Mari: SearchResult | null = i2MariPrice !== null
      ? {
          platform: 'Booking.com',
          price: i2MariPrice.toString(),
          currency: '€',
          url: i2MariLinkUrl,
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

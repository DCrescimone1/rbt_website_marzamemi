import { ScrapingConfig } from './types';

/**
 * Browser configuration for scraping operations
 */
export const SCRAPING_CONFIG: ScrapingConfig = {
  viewport: {
    width: 1920,
    height: 1080,
  },
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  navigationTimeout: 10000,
  selectorTimeout: 6000,
};

/**
 * Booking.com base URL and static parameters
 */
export const BOOKING_CONFIG = {
  baseUrl: 'https://www.booking.com/hotel/it/acquamarina-pachino.html',
  staticParams: {
    aid: '397594',
    dest_id: '12041954',
    dest_type: 'hotel',
    no_rooms: '1',
    selected_currency: 'EUR',
    sb_price_type: 'total',
  },
};

/**
 * Airbnb base URL
 */
export const AIRBNB_CONFIG = {
  baseUrl: 'https://www.airbnb.com/rooms/1453439455106920703',
};

/**
 * Direct price calculation defaults
 */
export const DIRECT_PRICE_CONFIG = {
  discountPercentage: 5,
  minimumPerNight: 50,
};

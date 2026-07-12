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
  baseUrl: 'https://www.booking.com/hotel/it/villa-zefiro-marzamemi.html',
  // Both villas are room types of the single "Seacily Villas" property page.
  // The old villa-i-2-mari.html listing is closed on Booking.com and redirects to search results.
  villaZefiroUrl: 'https://www.booking.com/hotel/it/villa-zefiro-marzamemi.html',
  villaI2MariUrl: 'https://www.booking.com/hotel/it/villa-zefiro-marzamemi.html',
  // Room type IDs = first segment of data-block-id in the availability table (hprt-table).
  roomTypeIds: {
    villaZefiro: '1533882301', // 68 m², 2 bathrooms, up to 6 guests
    villaI2Mari: '1533882302', // 45 m², bunk bed, up to 4 guests
  },
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
 * Airbnb configuration (URL will be provided dynamically at call site)
 */
export const AIRBNB_CONFIG = {};

/**
 * Direct price calculation defaults
 */
export const DIRECT_PRICE_CONFIG = {
  discountPercentage: 5,
  minimumPerNight: 50,
};

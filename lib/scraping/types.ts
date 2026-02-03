/**
 * Result from a price search on a booking platform
 */
export interface SearchResult {
  platform: string;
  price: string;
  currency: string;
  url: string;
  logoSrc: string;
  isDirectBooking?: boolean;
}

/**
 * Configuration for browser scraping operations
 */
export interface ScrapingConfig {
  viewport: {
    width: number;
    height: number;
  };
  userAgent: string;
  navigationTimeout: number;
  selectorTimeout: number;
}

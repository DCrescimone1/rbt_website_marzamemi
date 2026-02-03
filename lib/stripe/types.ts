/**
 * Booking details for Stripe checkout session
 */
export interface BookingDetails {
  checkIn: string; // ISO date string (YYYY-MM-DD)
  checkOut: string; // ISO date string (YYYY-MM-DD)
  guests: number;
  totalAmount: number; // Amount in euros (not cents)
  language?: 'it' | 'en';
}

/**
 * Request body for creating checkout session
 */
export interface CreateCheckoutSessionRequest {
  bookingDetails: BookingDetails;
}

/**
 * Response from checkout session creation
 */
export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

/**
 * Error response
 */
export interface ErrorResponse {
  error: string;
  details?: string;
}

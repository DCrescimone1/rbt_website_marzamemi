interface DirectPriceParams {
  otaPrices: Array<{ price: string }>;
  nights: number;
  discountPercentage?: number;
  minimumPerNight?: number;
}

/**
 * Calculate direct booking price based on OTA prices
 * 
 * @param otaPrices - Array of OTA price results (Booking.com, Airbnb)
 * @param nights - Number of nights for the stay
 * @param discountPercentage - Discount to apply (default: 5%)
 * @param minimumPerNight - Minimum price per night floor (default: €50)
 * @returns Calculated direct booking price as integer
 */
export function calculateDirectPrice({
  otaPrices,
  nights,
  discountPercentage = 5,
  minimumPerNight = 50,
}: DirectPriceParams): number {
  // Filter out null/invalid prices and parse to numbers
  const validPrices = otaPrices
    .filter(result => result && result.price)
    .map(result => parseFloat(result.price))
    .filter(price => !isNaN(price) && price > 0);

  // If no valid prices, return minimum
  if (validPrices.length === 0) {
    return minimumPerNight * nights;
  }

  // Calculate average of OTA prices
  const average = validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length;

  // Apply discount percentage
  const discounted = average * (1 - discountPercentage / 100);

  // Calculate per-night rate
  const perNight = discounted / nights;

  // Enforce minimum floor of €50 per night
  const minimumTotal = minimumPerNight * nights;
  const calculatedPrice = perNight < minimumPerNight ? minimumTotal : Math.round(discounted);

  // Ensure direct price is always lower than the minimum OTA price
  const minOtaPrice = Math.min(...validPrices);
  
  // If calculated price is higher than or equal to the lowest OTA price, 
  // apply discount to the lowest OTA price instead
  if (calculatedPrice >= minOtaPrice) {
    const adjustedPrice = Math.round(minOtaPrice * (1 - discountPercentage / 100));
    // Still respect the minimum floor
    return Math.max(adjustedPrice, minimumTotal);
  }

  return calculatedPrice;
}

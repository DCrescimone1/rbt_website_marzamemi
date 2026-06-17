import { type NextRequest, NextResponse } from "next/server"
import { chromium, Browser } from "playwright"
import { translations, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/lib/translations"
import type { LanguageCode } from "@/lib/translations/types"
import { searchBookingPrice } from "@/lib/scraping/searchBooking"
import { searchAirbnbPrice } from "@/lib/scraping/searchAirbnb"
import { calculateDirectPrice } from "@/lib/scraping/calculateDirectPrice"
import type { SearchResult } from "@/lib/scraping/types"

interface SearchRequest {
  dates: { from: string; to: string }
  guests: { adults: number; children: number }
  language?: string
}

type CalendarEvent = {
  start: string
  end: string
  summary: string
  source: string
  property: "villa_zefiro" | "villa_i2mari"
}

const FALLBACK_LANGUAGE: LanguageCode = "en"

const resolveLanguage = (language?: string): LanguageCode => {
  if (!language) {
    return DEFAULT_LANGUAGE
  }

  const normalized = language.toLowerCase() as LanguageCode
  return (SUPPORTED_LANGUAGES.includes(normalized) ? normalized : DEFAULT_LANGUAGE)
}

const getDirectBookingLabel = (language: LanguageCode): string => {
  const primary = translations[language]?.booking?.platforms?.direct
  const fallback = translations[FALLBACK_LANGUAGE]?.booking?.platforms?.direct
  return primary ?? fallback ?? "Direct Booking"
}

const VILLA_ZEFIRO_AIRBNB_URL = process.env.VILLA_ZEFIRO_AIRBNB_URL as string
const VILLA_I2MARI_AIRBNB_URL = process.env.VILLA_I2MARI_AIRBNB_URL as string

// Guest capacity limits
const VILLA_ZEFIRO_MAX_GUESTS = 6
const VILLA_I2MARI_MAX_GUESTS = 4

export async function POST(request: NextRequest) {
  let browser: Browser | null = null

  try {
    const body: SearchRequest = await request.json()
    const { dates, guests, language } = body

    // Calculate total guests
    const totalGuests = guests.adults + guests.children
    
    // Determine which villas can accommodate the guests
    const searchVillaZefiro = totalGuests <= VILLA_ZEFIRO_MAX_GUESTS
    const searchVillaI2Mari = totalGuests <= VILLA_I2MARI_MAX_GUESTS
    
    console.log(`[prices] Total guests: ${totalGuests}`)
    console.log(`[prices] Search Villa Zefiro (max ${VILLA_ZEFIRO_MAX_GUESTS}): ${searchVillaZefiro}`)
    console.log(`[prices] Search Villa i 2 Mari (max ${VILLA_I2MARI_MAX_GUESTS}): ${searchVillaI2Mari}`)
    
    // If no villa can accommodate, return error
    if (!searchVillaZefiro && !searchVillaI2Mari) {
      return NextResponse.json(
        { error: `Maximum ${VILLA_ZEFIRO_MAX_GUESTS} guests allowed` },
        { status: 400 }
      )
    }

    const resolvedLanguage = resolveLanguage(language)

    if (!dates.from || !dates.to) {
      return NextResponse.json({ error: "Missing dates" }, { status: 400 })
    }

    console.log('[prices] Request started')

    // Calculate number of nights from dates
    const from = new Date(dates.from)
    const to = new Date(dates.to)
    const nights = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))

    // Launch browser with headless mode and sandbox flags
    try {
      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',  // Docker /dev/shm is 64MB; Chrome needs more
          '--disable-gpu',
        ]
      })
    } catch (error) {
      console.error('[prices] Browser launch failed:', error)
      return NextResponse.json(
        { error: "Browser initialization failed" },
        { status: 500 }
      )
    }

    // Helper: enforce hard timeout per provider and abort the underlying task
    const withTimeout = async <T>(p: Promise<T>, ms: number, label: string, abort: AbortController): Promise<T | null> => {
      let timeoutId: NodeJS.Timeout | null = null
      try {
        const timeoutPromise = new Promise<null>((resolve) => {
          timeoutId = setTimeout(() => {
            console.warn(`[prices] ${label} timed out after ${ms}ms`)
            try { abort.abort() } catch {}
            resolve(null)
          }, ms)
        })
        const result = await Promise.race<[T | null]>([p as any, timeoutPromise as any])
        return result as unknown as T | null
      } finally {
        if (timeoutId) clearTimeout(timeoutId)
      }
    }

    // Execute OTA searches in parallel using Promise.all with timeouts
    const parallelStartTime = Date.now()
    
    const bookingAbort = new AbortController()
    const airbnbZefiroAbort = new AbortController()
    const airbnbI2MariAbort = new AbortController()

    // TODO: Booking.com scraping temporarily disabled. Re-enable by restoring the
    // searchBookingPrice call below (see commented block).
    const bookingPromise = Promise.resolve({ villaI2Mari: null, villaZefiro: null })
    // const bookingPromise = (searchVillaZefiro || searchVillaI2Mari)
    //   ? withTimeout(
    //       searchBookingPrice({ dates, guests, language: resolvedLanguage, browser, signal: bookingAbort.signal }),
    //       15000,
    //       'Booking.com',
    //       bookingAbort,
    //     )
    //   : Promise.resolve({ villaI2Mari: null, villaZefiro: null })

    // Only search Airbnb for Villa Zefiro if it can accommodate guests
    const airbnbZefiroPromise = (VILLA_ZEFIRO_AIRBNB_URL && searchVillaZefiro)
      ? withTimeout(
          searchAirbnbPrice({ dates, guests, browser, url: VILLA_ZEFIRO_AIRBNB_URL, signal: airbnbZefiroAbort.signal }),
          8000,
          'Airbnb Villa Zefiro',
          airbnbZefiroAbort,
        )
      : Promise.resolve(null)

    // Only search Airbnb for Villa i 2 Mari if it can accommodate guests
    const airbnbI2MariPromise = (VILLA_I2MARI_AIRBNB_URL && searchVillaI2Mari)
      ? withTimeout(
          searchAirbnbPrice({ dates, guests, browser, url: VILLA_I2MARI_AIRBNB_URL, signal: airbnbI2MariAbort.signal }),
          8000,
          'Airbnb Villa i 2 Mari',
          airbnbI2MariAbort,
        )
      : Promise.resolve(null)

    const [bookingResult, airbnbZefiroResult, airbnbI2MariResult] = await Promise.all([
      bookingPromise,
      airbnbZefiroPromise,
      airbnbI2MariPromise,
    ])

    const parallelDuration = Date.now() - parallelStartTime
    console.log(`[prices] Both searches completed in ${parallelDuration}ms (parallel execution)`) 
    if (bookingResult) {
      console.log('[prices] Booking.com: Result OK', bookingResult)
    } else {
      console.log('[prices] Booking.com: Result is null (see earlier logs for reasons)')
    }
    if (airbnbZefiroResult) {
      console.log('[prices] Airbnb Villa Zefiro: Result OK', airbnbZefiroResult)
    } else {
      console.log('[prices] Airbnb Villa Zefiro: Result is null (see earlier logs for reasons)')
    }
    if (airbnbI2MariResult) {
      console.log('[prices] Airbnb Villa i 2 Mari: Result OK', airbnbI2MariResult)
    } else {
      console.log('[prices] Airbnb Villa i 2 Mari: Result is null (see earlier logs for reasons)')
    }

    const bookingVillaI2Mari = bookingResult?.villaI2Mari ?? null
    const bookingVillaZefiro = bookingResult?.villaZefiro ?? null

    // Handle case where both villas have no OTA prices at all (404 error)
    const anyOtaForZefiro = !!(bookingVillaZefiro || airbnbZefiroResult)
    const anyOtaForI2Mari = !!(bookingVillaI2Mari || airbnbI2MariResult)
    if (!anyOtaForZefiro && !anyOtaForI2Mari) {
      return NextResponse.json(
        { error: "No prices found" },
        { status: 404 },
      )
    }

    // Fetch calendar data to determine availability per villa
    let calendarEvents: CalendarEvent[] = []
    try {
      // Use relative URL to avoid issues with NEXT_PUBLIC_APP_URL in development
      const calendarUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000/api/calendar'
        : `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar`
      console.log('[prices] Fetching calendar from:', calendarUrl)
      const calendarRes = await fetch(calendarUrl)
      if (calendarRes.ok) {
        calendarEvents = (await calendarRes.json()) as CalendarEvent[]
      } else {
        console.warn('[prices] Calendar API returned non-OK status', calendarRes.status)
      }
    } catch (err) {
      console.error('[prices] Failed to fetch calendar data:', err)
    }

    const hasOverlap = (event: CalendarEvent) => {
      // Both intervals use exclusive end (checkout day is free for a new checkin).
      // Overlap condition for [a, b) vs [c, d): a < d && c < b
      return event.start < dates.to && dates.from < event.end
    }

    const villaZefiroBooked = calendarEvents
      .filter((e) => e.property === 'villa_zefiro')
      .some((e) => hasOverlap(e))

    const villaI2MariBooked = calendarEvents
      .filter((e) => e.property === 'villa_i2mari')
      .some((e) => hasOverlap(e))

    // Test mode: Force unavailability for testing UI
    const testZefiroUnavailable = process.env.TEST_VILLA_ZEFIRO_UNAVAILABLE === 'true'
    const testI2MariUnavailable = process.env.TEST_VILLA_I2MARI_UNAVAILABLE === 'true'
    
    if (testZefiroUnavailable) console.log('[prices] TEST MODE: Villa Zefiro forced unavailable')
    if (testI2MariUnavailable) console.log('[prices] TEST MODE: Villa i 2 Mari forced unavailable')

    // Villa is available only if: not booked AND can accommodate guests AND not in test mode
    const villaZefiroAvailable = !villaZefiroBooked && searchVillaZefiro && !testZefiroUnavailable
    const villaI2MariAvailable = !villaI2MariBooked && searchVillaI2Mari && !testI2MariUnavailable

    // Build per-villa result arrays and direct prices
    // Only include OTA prices if the villa can accommodate the guests
    const villaZefiroOta: SearchResult[] = []
    if (bookingVillaZefiro && searchVillaZefiro) villaZefiroOta.push(bookingVillaZefiro)
    if (airbnbZefiroResult && searchVillaZefiro) villaZefiroOta.push(airbnbZefiroResult)

    const villaI2MariOta: SearchResult[] = []
    if (bookingVillaI2Mari && searchVillaI2Mari) villaI2MariOta.push(bookingVillaI2Mari)
    if (airbnbI2MariResult && searchVillaI2Mari) villaI2MariOta.push(airbnbI2MariResult)

    const directPriceZefiro = villaZefiroOta.length
      ? calculateDirectPrice({ otaPrices: villaZefiroOta, nights })
      : null
    const directPriceI2Mari = villaI2MariOta.length
      ? calculateDirectPrice({ otaPrices: villaI2MariOta, nights })
      : null

    const villaZefiroResults: SearchResult[] = []
    if (airbnbZefiroResult && searchVillaZefiro) villaZefiroResults.push(airbnbZefiroResult)
    if (bookingVillaZefiro && searchVillaZefiro) villaZefiroResults.push(bookingVillaZefiro)
    if (directPriceZefiro !== null && searchVillaZefiro) {
      villaZefiroResults.push({
        platform: getDirectBookingLabel(resolvedLanguage),
        price: directPriceZefiro.toString(),
        currency: '€',
        url: '#',
        logoSrc: '/logo.webp',
        isDirectBooking: true,
      })
    }

    const villaI2MariResults: SearchResult[] = []
    if (airbnbI2MariResult && searchVillaI2Mari) villaI2MariResults.push(airbnbI2MariResult)
    if (bookingVillaI2Mari && searchVillaI2Mari) villaI2MariResults.push(bookingVillaI2Mari)
    if (directPriceI2Mari !== null && searchVillaI2Mari) {
      villaI2MariResults.push({
        platform: getDirectBookingLabel(resolvedLanguage),
        price: directPriceI2Mari.toString(),
        currency: '€',
        url: '#',
        logoSrc: '/logo.webp',
        isDirectBooking: true,
      })
    }

    const totalDuration = Date.now() - parallelStartTime
    console.log('[prices] Search completed.', {
      durationMs: totalDuration,
      villaZefiroCount: villaZefiroResults.length,
      villaI2MariCount: villaI2MariResults.length,
    })

    // Determine unavailability reasons
    const getUnavailabilityReason = (
      isBooked: boolean, 
      canAccommodate: boolean, 
      maxGuests: number,
      testMode: boolean
    ): string | undefined => {
      if (testMode) return 'Test mode: Forced unavailable'
      if (!canAccommodate) {
        const key = translations[resolvedLanguage]?.booking?.unavailability?.exceedsCapacity
        return key ? key.replace('{maxGuests}', maxGuests.toString()) : `Exceeds capacity (max ${maxGuests} guests)`
      }
      if (isBooked) {
        return translations[resolvedLanguage]?.booking?.unavailability?.alreadyBooked || 'Already booked for these dates'
      }
      return undefined
    }

    return NextResponse.json({
      villaZefiro: {
        results: villaZefiroResults,
        available: villaZefiroAvailable,
        unavailabilityReason: villaZefiroAvailable 
          ? undefined 
          : getUnavailabilityReason(villaZefiroBooked, searchVillaZefiro, VILLA_ZEFIRO_MAX_GUESTS, testZefiroUnavailable),
        maxGuests: VILLA_ZEFIRO_MAX_GUESTS,
      },
      villaI2Mari: {
        results: villaI2MariResults,
        available: villaI2MariAvailable,
        unavailabilityReason: villaI2MariAvailable 
          ? undefined 
          : getUnavailabilityReason(villaI2MariBooked, searchVillaI2Mari, VILLA_I2MARI_MAX_GUESTS, testI2MariUnavailable),
        maxGuests: VILLA_I2MARI_MAX_GUESTS,
      },
    })
  } catch (error) {
    // Log all errors with [prices] prefix
    console.error('[prices] Unexpected error:', error)
    
    // Return 500 error for unexpected errors
    // Hide error details in production
    return NextResponse.json(
      {
        error: "Failed to fetch prices",
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  } finally {
    // Close browser in finally block with error catching
    // Add small delay to ensure contexts finish closing before browser closes
    if (browser) {
      await new Promise(resolve => setTimeout(resolve, 100));
      await browser.close().catch((err) => {
        console.error('[prices] Error closing browser:', err)
      })
      console.log('[prices] Browser closed')
    }
  }
}

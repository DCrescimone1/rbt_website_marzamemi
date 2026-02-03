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

export async function POST(request: NextRequest) {
  let browser: Browser | null = null

  try {
    const body: SearchRequest = await request.json()
    const { dates, guests, language } = body

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
        args: ['--no-sandbox', '--disable-setuid-sandbox']
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

    // Execute both searches in parallel using Promise.all with timeouts
    const parallelStartTime = Date.now()
    
    const bookingAbort = new AbortController()
    const airbnbAbort = new AbortController()

    const [bookingResult, airbnbResult] = await Promise.all([
      withTimeout(
        searchBookingPrice({ dates, guests, language: resolvedLanguage, browser, signal: bookingAbort.signal }),
        15000,
        'Booking.com',
        bookingAbort
      ),
      withTimeout(
        searchAirbnbPrice({ dates, guests, browser, signal: airbnbAbort.signal }),
        8000,
        'Airbnb',
        airbnbAbort
      )
    ])

    const parallelDuration = Date.now() - parallelStartTime
    console.log(`[prices] Both searches completed in ${parallelDuration}ms (parallel execution)`) 
    if (bookingResult) {
      console.log('[prices] Booking.com: Result OK', bookingResult)
    } else {
      console.log('[prices] Booking.com: Result is null (see earlier logs for reasons)')
    }
    if (airbnbResult) {
      console.log('[prices] Airbnb: Result OK', airbnbResult)
    } else {
      console.log('[prices] Airbnb: Result is null (see earlier logs for reasons)')
    }

    // Handle case where both OTA searches return null (404 error)
    if (!bookingResult && !airbnbResult) {
      return NextResponse.json(
        { error: "No prices found" },
        { status: 404 }
      )
    }

    // Build results array with OTA prices and direct price
    const results: SearchResult[] = []

    // Add OTA results if available
    if (bookingResult) {
      results.push(bookingResult)
    }

    if (airbnbResult) {
      results.push(airbnbResult)
    }

    // Call calculateDirectPrice with OTA results
    const otaPrices = [bookingResult, airbnbResult].filter(
      (result): result is SearchResult => result !== null
    )

    const directPrice = calculateDirectPrice({
      otaPrices,
      nights
    })

    console.log(`[prices] Direct price calculated: ${directPrice}`)

    // Add direct booking result with isDirectBooking flag
    results.push({
      platform: getDirectBookingLabel(resolvedLanguage),
      price: directPrice.toString(),
      currency: '€',
      url: '#',
      logoSrc: '/logo.webp',
      isDirectBooking: true
    })

    const totalDuration = Date.now() - parallelStartTime
    console.log(`[prices] Search completed. Count: ${results.length}, Duration(ms): ${totalDuration}`)

    // Return results array with SearchResult objects
    return NextResponse.json({ results })
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

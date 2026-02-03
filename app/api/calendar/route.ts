import { NextResponse } from "next/server"
import ICAL from "ical.js"
import { startOfDay, endOfDay, subDays } from "date-fns"

const AIRBNB_CALENDAR_URL = process.env.AIRBNB_CALENDAR_URL as string
const BOOKING_CALENDAR_URL = process.env.BOOKING_CALENDAR_URL as string
const CACHE_DURATION = 300

let cache: {
  timestamp: number
  data: string
} | null = null

async function fetchAndParseCalendar(url: string, source: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "LuxuryRetreat-Calendar/1.0",
        Accept: "text/calendar",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${source} calendar: ${response.status}`)
    }

    const icalData = await response.text()
    const jcalData = ICAL.parse(icalData)
    const comp = new ICAL.Component(jcalData)
    const vevents = comp.getAllSubcomponents("vevent")

    return vevents.map((vevent) => {
      const event = new ICAL.Event(vevent)
      const startDate = startOfDay(event.startDate.toJSDate())
      const endDate = subDays(endOfDay(event.endDate.toJSDate()), 1)

      return {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        summary: event.summary || "Booked",
        source: source,
      }
    })
  } catch (error) {
    console.error(`Error fetching ${source} calendar:`, error)
    return []
  }
}

export async function GET() {
  try {
    const now = Date.now()

    // Check cache
    if (cache && now - cache.timestamp < CACHE_DURATION * 1000) {
      return new NextResponse(cache.data, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `public, max-age=${CACHE_DURATION}`,
        },
      })
    }

    // Fetch calendar data
    const events = []

    if (AIRBNB_CALENDAR_URL) {
      const airbnbEvents = await fetchAndParseCalendar(AIRBNB_CALENDAR_URL, "Airbnb")
      events.push(...airbnbEvents)
    }

    if (BOOKING_CALENDAR_URL) {
      const bookingEvents = await fetchAndParseCalendar(BOOKING_CALENDAR_URL, "Booking.com")
      events.push(...bookingEvents)
    }

    const jsonData = JSON.stringify(events)
    cache = { timestamp: now, data: jsonData }

    return new NextResponse(jsonData, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${CACHE_DURATION}`,
      },
    })
  } catch (error) {
    console.error("Calendar API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch calendar data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

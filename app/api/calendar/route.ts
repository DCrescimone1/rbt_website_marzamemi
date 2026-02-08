import { NextResponse } from "next/server"
import ICAL from "ical.js"
import { startOfDay, endOfDay, subDays } from "date-fns"

const VILLA_ZEFIRO_ICAL = process.env.VILLA_ZEFIRO_ICAL as string
const VILLA_I2MARI_ICAL = process.env.VILLA_I2MARI_ICAL as string
const VILLA_ZEFIRO_AIRBNB_ICAL = process.env.VILLA_ZEFIRO_AIRBNB_ICAL as string
const VILLA_I2MARI_AIRBNB_ICAL = process.env.VILLA_I2MARI_AIRBNB_ICAL as string
const CACHE_DURATION = 300

let cache: {
  timestamp: number
  data: string
} | null = null

async function fetchAndParseCalendar(
  url: string,
  source: string,
  property: "villa_zefiro" | "villa_i2mari",
) {
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
        property: property,
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
    const events: Array<{
      start: string
      end: string
      summary: string
      source: string
      property: "villa_zefiro" | "villa_i2mari"
    }> = []

    // Fetch Booking.com calendars
    if (VILLA_ZEFIRO_ICAL) {
      const zefiroEvents = await fetchAndParseCalendar(VILLA_ZEFIRO_ICAL, "Villa Zefiro (Booking.com)", "villa_zefiro")
      events.push(...zefiroEvents)
    }

    if (VILLA_I2MARI_ICAL) {
      const i2mariEvents = await fetchAndParseCalendar(VILLA_I2MARI_ICAL, "Villa i 2 Mari (Booking.com)", "villa_i2mari")
      events.push(...i2mariEvents)
    }

    // Fetch Airbnb calendars
    if (VILLA_ZEFIRO_AIRBNB_ICAL) {
      const zefiroAirbnbEvents = await fetchAndParseCalendar(VILLA_ZEFIRO_AIRBNB_ICAL, "Villa Zefiro (Airbnb)", "villa_zefiro")
      events.push(...zefiroAirbnbEvents)
    }

    if (VILLA_I2MARI_AIRBNB_ICAL) {
      const i2mariAirbnbEvents = await fetchAndParseCalendar(VILLA_I2MARI_AIRBNB_ICAL, "Villa i 2 Mari (Airbnb)", "villa_i2mari")
      events.push(...i2mariAirbnbEvents)
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

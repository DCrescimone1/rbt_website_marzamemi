import { type NextRequest, NextResponse } from "next/server"
import { getStripeClient } from "@/lib/stripe"
import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  ErrorResponse,
} from "@/lib/stripe"

/**
 * Calculate number of nights between two dates
 */
function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Format date for display (DD/MM/YYYY)
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * POST /api/create-checkout-session
 * Creates a Stripe Checkout Session for booking payment
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: CreateCheckoutSessionRequest = await request.json()
    const { bookingDetails } = body

    // Validate required fields
    if (!bookingDetails) {
      return NextResponse.json(
        { error: "Missing booking details" } as ErrorResponse,
        { status: 400 },
      )
    }

    const { checkIn, checkOut, guests, totalAmount, language = "en" } = bookingDetails as any

    // Validate booking details
    if (!checkIn || !checkOut || !guests || !totalAmount) {
      return NextResponse.json(
        {
          error: "Invalid booking details",
          details: "checkIn, checkOut, guests, and totalAmount are required",
        } as ErrorResponse,
        { status: 400 },
      )
    }

    // Calculate nights
    const nights = calculateNights(checkIn, checkOut)

    // Get app URL from environment or construct from request
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`

    // Initialize Stripe client
    const stripe = getStripeClient()

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      // Payment configuration
      mode: "payment",
      payment_method_types: ["card"],

      // Line items (what customer is purchasing)
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Acquamarina - Beach Holiday Apartment",
              description: `${nights} night${nights > 1 ? "s" : ""} • ${guests} guest${
                guests > 1 ? "s" : ""
              }\nCheck-in: ${formatDate(checkIn)} • Check-out: ${formatDate(checkOut)}`,
            },
            unit_amount: Math.round(totalAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],

      // Customer information collection
      customer_creation: "always",
      phone_number_collection: {
        enabled: true, // Collect phone (optional for customer)
      },

      // Redirect URLs
      success_url: `${baseUrl}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}`,

      // Store booking metadata
      metadata: {
        checkIn,
        checkOut,
        guests: guests.toString(),
        nights: nights.toString(),
        totalAmount: totalAmount.toString(),
      },

      // Localization
      locale: language === "it" ? "it" : "en",
    })

    // Return session details
    const response: CreateCheckoutSessionResponse = {
      sessionId: session.id,
      url: session.url || "",
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Stripe checkout session creation error:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: errorMessage,
      } as ErrorResponse,
      { status: 500 },
    )
  }
}

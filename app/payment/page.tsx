"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle } from "lucide-react"
import { formatDateDDMMYYYY } from "@/lib/utils/date-format"

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkIn = searchParams?.get("checkIn")
  const checkOut = searchParams?.get("checkOut")
  const adults = searchParams?.get("adults")
  const price = searchParams?.get("price")

  useEffect(() => {
    // Simulate Stripe integration delay
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handlePayment = async () => {
    setLoading(true)
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to success page
      router.push(`/booking-success?reference=LUXURY-${Date.now()}`)
    } catch (err) {
      setError("Payment processing failed. Please try again.")
      setLoading(false)
    }
  }

  if (!price) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Invalid Payment Link</h1>
          <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90">
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-muted/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-xl border border-border p-8">
              <h1 className="font-serif text-3xl font-bold text-foreground mb-8">Secure Payment</h1>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium text-red-900">{error}</p>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Processing payment...</p>
                </div>
              ) : (
                <form className="space-y-6">
                  {/* Card Details - Placeholder for Stripe */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold"
                  >
                    {loading ? "Processing..." : "Pay €" + price}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Booking Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-xl border border-border p-8 sticky top-24">
              <h3 className="font-serif text-xl font-bold text-foreground mb-6">Booking Summary</h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check In:</span>
                  <span className="font-medium text-foreground">{formatDateDDMMYYYY(checkIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check Out:</span>
                  <span className="font-medium text-foreground">{formatDateDDMMYYYY(checkOut)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guests:</span>
                  <span className="font-medium text-foreground">{adults}</span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <span className="font-serif text-lg font-bold text-foreground">Total</span>
                <span className="font-serif text-3xl font-bold text-primary">€{price}</span>
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                By proceeding, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

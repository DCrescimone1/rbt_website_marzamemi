"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { formatDateDDMMYYYY } from "@/lib/utils/date-format"

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const checkIn = searchParams?.get("checkIn")
  const checkOut = searchParams?.get("checkOut")
  const adults = searchParams?.get("adults")
  const children = searchParams?.get("children")
  const price = searchParams?.get("price")

  if (!checkIn || !checkOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Invalid Booking</h1>
          <p className="text-muted-foreground mb-8">Please start your booking again from the beginning.</p>
          <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90">
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-muted/20 px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-2xl border border-border p-8 md:p-12">
          <div className="text-center mb-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="font-serif text-4xl font-bold text-foreground">Booking Summary</h1>
          </div>

          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Check In</p>
                <p className="font-serif text-xl font-semibold text-foreground">{formatDateDDMMYYYY(checkIn)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Check Out</p>
                <p className="font-serif text-xl font-semibold text-foreground">{formatDateDDMMYYYY(checkOut)}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Adults</p>
                <p className="font-semibold text-foreground">{adults}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Children</p>
                <p className="font-semibold text-foreground">{children || "0"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Total</p>
                <p className="font-serif text-2xl font-bold text-primary">€{price}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() =>
                router.push(
                  "/payment?checkIn=" +
                    checkIn +
                    "&checkOut=" +
                    checkOut +
                    "&adults=" +
                    adults +
                    "&children=" +
                    (children || 0) +
                    "&price=" +
                    price +
                    "&currency=€",
                )
              }
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold"
            >
              PROCEED TO PAYMENT
            </Button>
            <Button onClick={() => router.push("/")} variant="outline" className="flex-1 h-12 text-base font-semibold">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

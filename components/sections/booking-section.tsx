"use client"

import { useEffect, useState } from "react"
import { Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AvailabilityCalendar from "@/components/booking/availability-calendar"
import PriceComparison from "@/components/booking/price-comparison"
import { useTranslation } from "@/lib/hooks/useTranslation"
import { formatDateDDMMYYYY } from "@/lib/utils/date-format"

const formatDisplayFromIso = (value: string): string => {
  const formatted = formatDateDDMMYYYY(value, "")
  if (!formatted) return ""
  return formatted.replace(/\//g, " / ")
}

const formatDigitsToDisplay = (digits: string): string => {
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)} / ${digits.slice(2)}`
  return `${digits.slice(0, 2)} / ${digits.slice(2, 4)} / ${digits.slice(4)}`
}

const digitsToIso = (digits: string): string | null => {
  if (digits.length !== 8) return null
  const day = Number.parseInt(digits.slice(0, 2), 10)
  const month = Number.parseInt(digits.slice(2, 4), 10)
  const year = Number.parseInt(digits.slice(4), 10)

  if (month < 1 || month > 12 || day < 1 || day > 31) return null

  const iso = `${year.toString().padStart(4, "0")}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`
  const date = new Date(iso)

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return iso
}

export default function BookingSection() {
  const { t, language } = useTranslation()
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [pets, setPets] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [checkInInput, setCheckInInput] = useState("")
  const [checkOutInput, setCheckOutInput] = useState("")
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [activeField, setActiveField] = useState<"checkIn" | "checkOut">("checkIn")
  const datePlaceholder = language === "en" ? "dd / mm / yyyy" : "gg / mm / aaaa"

  const openCalendar = (field: "checkIn" | "checkOut") => {
    setActiveField(field)
    setIsCalendarOpen(true)
  }

  const closeCalendar = () => setIsCalendarOpen(false)

  useEffect(() => {
    if (!isCalendarOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCalendar()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isCalendarOpen])

  const processDateInput = (
    rawValue: string,
    setDisplay: (value: string) => void,
    setIso: (value: string) => void
  ) => {
    const digits = rawValue.replace(/\D/g, "").slice(0, 8)
    const formatted = formatDigitsToDisplay(digits)
    setDisplay(formatted)

    if (digits.length === 0) {
      setIso("")
      return
    }

    if (digits.length === 8) {
      const iso = digitsToIso(digits)
      if (iso) {
        setIso(iso)
        setDisplay(formatDisplayFromIso(iso))
        return
      }
    }

    setIso("")
  }

  const handleCheckAvailability = async () => {
    // Validation
    if (!checkIn || !checkOut) {
      alert(t('booking.selectDatesError'))
      return
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkInDate < today) {
      alert(t('validation.pastDate'))
      return
    }

    if (checkOutDate <= checkInDate) {
      alert(t('validation.invalidDateRange'))
      return
    }

    if (adults < 1) {
      alert(t('validation.minGuests'))
      return
    }

    if (adults + children > 6) {
      alert(t('validation.maxGuests'))
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/search-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dates: { from: checkIn, to: checkOut },
          guests: { adults, children },
          language: language,
        }),
      })

      // Try to parse JSON safely
      let data: any = null
      try {
        data = await response.json()
      } catch {}

      // If server reported 404 (no providers returned data), show scraping error
      if (!response.ok) {
        if (response.status === 404) {
          alert(t('booking.scrapingError'))
          return
        }
        throw new Error((data && data.error) || "Failed to fetch prices")
      }

      // On success: only show results if we actually have some
      if (data && Array.isArray(data.results) && data.results.length > 0) {
        setSearchResults(data)
      } else {
        // Defensive: treat empty results as scraping failure
        alert(t('booking.scrapingError'))
      }
    } catch (error) {
      console.error("Error:", error)
      // Network/unexpected errors -> availability error, not scraping failure
      alert(t('booking.availabilityError'))
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle direct booking through Stripe
   */
  async function handleDirectBooking(
    checkInParam: string,
    checkOutParam: string,
    guestsParam: number,
    totalAmountParam: number,
    languageParam: 'it' | 'en',
  ) {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingDetails: {
            checkIn: checkInParam,
            checkOut: checkOutParam,
            guests: guestsParam,
            totalAmount: totalAmountParam,
            language: languageParam,
          },
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to start booking process. Please try again.')
    }
  }

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-sm tracking-widest text-muted-foreground uppercase"></span>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            {t('booking.title')}
          </h2>
          <p className="mt-3 text-base md:text-lg text-muted-foreground">
            {t('booking.subtitle')}
          </p>
        </div>

        {/* Booking Widget */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Search & Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8 lg:p-12 border border-border mb-6 sm:mb-8">
              {/* Quick Search */}
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">{t('booking.findDatesTitle')}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 sm:mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('booking.checkIn')}</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder={datePlaceholder}
                    value={checkInInput}
                    onChange={(e) => processDateInput(e.target.value, setCheckInInput, setCheckIn)}
                    onFocus={() => openCalendar("checkIn")}
                    onClick={() => openCalendar("checkIn")}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('booking.checkOut')}</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder={datePlaceholder}
                    value={checkOutInput}
                    onChange={(e) => processDateInput(e.target.value, setCheckOutInput, setCheckOut)}
                    onFocus={() => openCalendar("checkOut")}
                    onClick={() => openCalendar("checkOut")}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 sm:mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('booking.adults')}</label>
                  <Input
                    type="number"
                    min="1"
                    max="6"
                    value={adults}
                    onChange={(e) => setAdults(Number.parseInt(e.target.value) || 1)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('booking.children')}</label>
                  <Input
                    type="number"
                    min="0"
                    max="4"
                    value={children}
                    onChange={(e) => setChildren(Number.parseInt(e.target.value) || 0)}
                    className="w-full"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={pets}
                      onChange={(e) => setPets(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-foreground">{t('booking.pets')}</span>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleCheckAvailability}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white h-11 mb-4 sm:mb-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('booking.checking')}
                  </>
                ) : (
                  t('booking.checkAvailability')
                )}
              </Button>

              <Button
                onClick={() => {
                  // Basic validation mirroring availability checks
                  if (!checkIn || !checkOut) {
                    alert(t('booking.selectDatesError'))
                    return
                  }
                  const checkInDate = new Date(checkIn)
                  const checkOutDate = new Date(checkOut)
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  if (checkInDate < today) {
                    alert(t('validation.pastDate'))
                    return
                  }
                  if (checkOutDate <= checkInDate) {
                    alert(t('validation.invalidDateRange'))
                    return
                  }
                  if (adults < 1) {
                    alert(t('validation.minGuests'))
                    return
                  }
                  if (adults + children > 6) {
                    alert(t('validation.maxGuests'))
                    return
                  }
                  const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
                  const pricePerNight = 250
                  const totalPrice = nights * pricePerNight
                  handleDirectBooking(
                    checkIn,
                    checkOut,
                    adults + children,
                    totalPrice,
                    language,
                  )
                }}
                className="w-full bg-primary/80 hover:bg-primary/70 text-white h-11"
              >
                {t('booking.proceedBooking')}
              </Button>
            </div>

            {/* Price Comparison Results - Two Properties Side by Side */}
            {searchResults && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PriceComparison
                  results={searchResults}
                  bookingDetails={{
                    checkIn,
                    checkOut,
                    guests: adults + children,
                    language
                  }}
                  onDirectBooking={handleDirectBooking}
                  property={{
                    name: t('booking.properties.villaZefiro.name'),
                    image: "/placeholder.svg",
                    size: t('booking.properties.villaZefiro.size'),
                    rooms: t('booking.properties.villaZefiro.rooms')
                  }}
                />
                <PriceComparison
                  results={searchResults}
                  bookingDetails={{
                    checkIn,
                    checkOut,
                    guests: adults + children,
                    language
                  }}
                  onDirectBooking={handleDirectBooking}
                  property={{
                    name: t('booking.properties.villaI2Mari.name'),
                    image: "/placeholder.svg",
                    size: t('booking.properties.villaI2Mari.size'),
                    rooms: t('booking.properties.villaI2Mari.rooms')
                  }}
                />
              </div>
            )}
          </div>

          {/* Right Column - Calendar */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <AvailabilityCalendar
              initialFrom={checkIn || undefined}
              initialTo={checkOut || undefined}
              onDateSelect={(dates) => {
                setCheckIn(dates.from)
                setCheckInInput(formatDisplayFromIso(dates.from))
                setCheckOut(dates.to)
                setCheckOutInput(formatDisplayFromIso(dates.to))
              }}
            />
          </div>
        </div>
      </div>
      {isCalendarOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
          onClick={closeCalendar}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={closeCalendar}
              className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 text-foreground"
              aria-label="Close calendar"
            >
              <X size={18} />
            </button>
            <div className="p-6">
              <h4 className="font-serif text-xl font-semibold text-foreground mb-4">
                {activeField === "checkIn" ? t('booking.checkIn') : t('booking.checkOut')}
              </h4>
              <AvailabilityCalendar
                sticky={false}
                className="shadow-none border-0"
                initialFrom={checkIn || undefined}
                initialTo={checkOut || undefined}
                onDateSelect={(dates) => {
                  setCheckIn(dates.from)
                  setCheckInInput(formatDisplayFromIso(dates.from))
                  setCheckOut(dates.to)
                  setCheckOutInput(formatDisplayFromIso(dates.to))
                  setIsCalendarOpen(false)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

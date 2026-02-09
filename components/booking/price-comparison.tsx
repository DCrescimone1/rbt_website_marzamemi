"use client"

import { ExternalLink, Home, Maximize, BedDouble } from "lucide-react"
import { useTranslation } from "@/lib/hooks/useTranslation"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface PriceResult {
  platform: string
  price: number | string
  currency: string
  url: string
  available?: boolean
  isDirectBooking?: boolean
}

interface PropertyInfo {
  name: string
  image: string
  size: string
  rooms: string
  bedrooms?: string
}

interface PriceComparisonProps {
  results?: {
    results?: PriceResult[]
    loading?: boolean
    error?: string
    unavailabilityReason?: string
    maxGuests?: number
  }
  bookingDetails?: {
    checkIn: string
    checkOut: string
    guests: number
    language: 'it' | 'en'
  }
  onDirectBooking?: (checkIn: string, checkOut: string, guests: number, totalAmount: number, language: 'it' | 'en') => void
  property?: PropertyInfo
  available?: boolean
}

export default function PriceComparison({ results, bookingDetails, onDirectBooking, property, available }: PriceComparisonProps) {
  const { t } = useTranslation()

  if (!results?.results || results.results.length === 0) {
    // Show unavailability message if property exists but no results
    if (property && results?.unavailabilityReason) {
      return (
        <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8 border border-border">
          {/* Property Header */}
          <div className="mb-6">
            {/* Property Image */}
            <div className="relative w-full h-40 sm:h-48 rounded-lg overflow-hidden mb-4 bg-muted">
              <Image
                src={property.image}
                alt={property.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Property Name */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                {property.name}
              </h3>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold border bg-rose-50 text-rose-700 border-rose-200">
                ❌ {t('booking.notAvailable')}
              </span>
            </div>

            {/* Property Specs */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Maximize size={16} className="flex-shrink-0" />
                  <span className="font-medium">{property.size}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BedDouble size={16} className="flex-shrink-0" />
                  <span className="font-medium">{property.rooms}</span>
                </div>
                {results.maxGuests && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Home size={16} className="flex-shrink-0" />
                    <span className="font-medium">{t('booking.maxGuests').replace('{count}', results.maxGuests.toString())}</span>
                  </div>
                )}
              </div>
              {property.bedrooms && (
                <div className="text-xs leading-relaxed text-muted-foreground bg-muted/30 rounded-md px-3 py-2 border border-border/50">
                  {property.bedrooms
                    .split('|')
                    .map((room) => room.trim())
                    .filter((room) => room.length > 0)
                    .map((room, index) => (
                      <div key={index}>{room}</div>
                    ))}
                </div>
              )}
            </div>

            {/* Unavailability Reason */}
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <p className="text-sm text-rose-700 font-medium">
                {results.unavailabilityReason}
              </p>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const sortedResults = [...results.results].sort((a, b) => {
    const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price
    const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price
    return priceA - priceB
  })
  const bestPrice = typeof sortedResults[0]?.price === 'string' 
    ? parseFloat(sortedResults[0].price) 
    : sortedResults[0]?.price

  const handleDirectBookingClick = (result: PriceResult) => {
    if (!bookingDetails || !onDirectBooking) return
    
    const price = typeof result.price === 'string' ? parseFloat(result.price) : result.price
    onDirectBooking(
      bookingDetails.checkIn,
      bookingDetails.checkOut,
      bookingDetails.guests,
      price,
      bookingDetails.language
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8 border border-border">
      {/* Property Header */}
      {property && (
        <div className="mb-6">
          {/* Property Image */}
          <div className="relative w-full h-40 sm:h-48 rounded-lg overflow-hidden mb-4 bg-muted">
            <Image
              src={property.image}
              alt={property.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Property Name */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
              {property.name}
            </h3>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold border ${
                available
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {available ? `✅ ${t('booking.available')}` : `❌ ${t('booking.notAvailable')}`}
            </span>
          </div>

          {/* Property Specs */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Maximize size={16} className="flex-shrink-0" />
                <span className="font-medium">{property.size}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <BedDouble size={16} className="flex-shrink-0" />
                <span className="font-medium">{property.rooms}</span>
              </div>
              {results.maxGuests && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Home size={16} className="flex-shrink-0" />
                  <span className="font-medium">{t('booking.maxGuests').replace('{count}', results.maxGuests.toString())}</span>
                </div>
              )}
            </div>
            {property.bedrooms && (
              <div className="text-xs leading-relaxed text-muted-foreground bg-muted/30 rounded-md px-3 py-2 border border-border/50">
                {property.bedrooms
                  .split('|')
                  .map((room) => room.trim())
                  .filter((room) => room.length > 0)
                  .map((room, index) => (
                    <div key={index}>{room}</div>
                  ))}
              </div>
            )}
          </div>

          {/* Extra spacing for Villa Zefiro to align "Confronto Prezzi" with Villa i 2 Mari */}
          {property.name.includes('Zefiro') && <div className="h-[1.5rem]" />}

          <div className="border-t border-border pt-4">
            <h4 className="font-medium text-foreground mb-3">{t('booking.priceComparison')}</h4>
          </div>
        </div>
      )}

      {/* Original title when no property */}
      {!property && (
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">{t('booking.priceComparison')}</h3>
      )}

      <div className="space-y-3">
        {sortedResults.map((result, index) => {
          const price = typeof result.price === 'string' ? parseFloat(result.price) : result.price
          const isBestPrice = price === bestPrice
          const isDirect = result.isDirectBooking || result.platform === t('booking.platforms.direct')
          
          return (
            <div
              key={result.platform}
              className={`p-4 rounded-lg border transition-all ${
                isBestPrice ? "border-green-400 bg-green-50" : "border-border hover:shadow-md"
              }`}
            >
              <div className="flex flex-col gap-3">
                {/* Platform name and best price badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-base truncate">{result.platform}</p>
                    {isBestPrice && <p className="text-xs text-green-600 font-medium mt-1">{t('booking.bestPrice')}</p>}
                  </div>
                  <p className="text-2xl font-bold text-primary whitespace-nowrap">
                    {result.currency}{price}
                  </p>
                </div>
                
                {/* Action button - full width */}
                <div className="w-full">
                  {isDirect && bookingDetails && onDirectBooking ? (
                    <Button
                      onClick={() => handleDirectBookingClick(result)}
                      disabled={available === false}
                      className={`w-full h-10 text-sm ${
                        available === false
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-70'
                          : 'bg-primary hover:bg-primary/90 text-white'
                      }`}
                    >
                      {t('booking.proceedBooking')}
                    </Button>
                  ) : (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                    >
                      {t('booking.view')} <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

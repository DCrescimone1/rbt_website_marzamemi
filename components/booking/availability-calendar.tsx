"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isAfter, isBefore, startOfToday, getDay } from "date-fns"
import { useTranslation } from "@/lib/hooks/useTranslation"
import { cn } from "@/lib/utils"

interface AvailabilityCalendarProps {
  onDateSelect?: (dates: { from: string; to: string }) => void
  className?: string
  sticky?: boolean
  initialFrom?: string
  initialTo?: string
  readOnly?: boolean // New prop to control if calendar is selectable
}

export default function AvailabilityCalendar({
  onDateSelect,
  className,
  sticky = true,
  initialFrom,
  initialTo,
  readOnly = false,
}: AvailabilityCalendarProps) {
  const { t, language } = useTranslation()
  const intlLocale = language === 'it' ? 'it-IT' : 'en-US'
  // Initialize after mount to avoid SSR/client time mismatches
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null)
  const [bookedDates, setBookedDates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFrom, setSelectedFrom] = useState<Date | null>(null)
  const [selectedTo, setSelectedTo] = useState<Date | null>(null)
  const [today, setToday] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const response = await fetch("/api/calendar")
        if (!response.ok) throw new Error("Failed to fetch calendar")
        const data = await response.json()
        setBookedDates(data)
      } catch (error) {
        console.error(t('booking.calendar.loadingError'), error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookedDates()
  }, [])

  // Set currentMonth and today on mount (client-only)
  useEffect(() => {
    setCurrentMonth(startOfToday())
    setToday(startOfToday())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (initialFrom) {
      setSelectedFrom(new Date(initialFrom))
    } else {
      setSelectedFrom(null)
    }

    if (initialTo) {
      setSelectedTo(new Date(initialTo))
    } else {
      setSelectedTo(null)
    }
  }, [initialFrom, initialTo])

  const isDateBooked = (date: Date) => {
    const zefiroBooked = bookedDates
      .filter((booking) => booking.property === "villa_zefiro")
      .some((booking) => {
        const start = new Date(booking.start)
        const end = new Date(booking.end)
        return date >= start && date <= end
      })

    const i2mariBooked = bookedDates
      .filter((booking) => booking.property === "villa_i2mari")
      .some((booking) => {
        const start = new Date(booking.start)
        const end = new Date(booking.end)
        return date >= start && date <= end
      })

    return zefiroBooked && i2mariBooked
  }

  const effectiveMonth = currentMonth ?? startOfToday()
  const monthStart = startOfMonth(effectiveMonth)
  const days = eachDayOfInterval({
    start: monthStart,
    end: endOfMonth(effectiveMonth),
  })
  // Number of empty cells before day 1 so weekday columns line up (Sunday-first grid).
  const leadingBlanks = getDay(monthStart)

  const handleDateClick = (date: Date) => {
    if (readOnly) return // No selection in read-only mode
    
    const isPast = today ? isBefore(date, today) : false
    if (isDateBooked(date) || isPast) return

    if (!selectedFrom || (selectedFrom && selectedTo)) {
      setSelectedFrom(date)
      setSelectedTo(null)
    } else if (isAfter(date, selectedFrom)) {
      setSelectedTo(date)
      onDateSelect?.({
        from: format(selectedFrom, "yyyy-MM-dd"),
        to: format(date, "yyyy-MM-dd"),
      })
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-6 flex items-center justify-center h-80">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  // Avoid SSR/client mismatch by only rendering date-dependent UI after mount
  if (!mounted) {
    return (
      <div
        className={cn(
          "bg-white rounded-lg shadow-xl p-6 border border-border",
          sticky ? "sticky top-24" : "",
          className
        )}
        aria-hidden
      >
        <div className="h-80" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-xl p-4 sm:p-6 border border-border",
        sticky ? "sticky top-24" : "",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">
          {new Intl.DateTimeFormat(intlLocale, { month: "long", year: "numeric" })
            .format(effectiveMonth)
            .replace(/^\w/, (c) => c.toUpperCase())}
        </h3>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => currentMonth && setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
            className="h-8 w-8"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => currentMonth && setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
            className="h-8 w-8"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {[
          t('booking.calendar.weekdays.sun'),
          t('booking.calendar.weekdays.mon'),
          t('booking.calendar.weekdays.tue'),
          t('booking.calendar.weekdays.wed'),
          t('booking.calendar.weekdays.thu'),
          t('booking.calendar.weekdays.fri'),
          t('booking.calendar.weekdays.sat')
        ].map((day) => (
          <div key={day} className="text-center text-[10px] sm:text-xs font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} className="h-7 sm:h-8 md:h-9" aria-hidden />
        ))}
        {days.map((day) => {
          const isBooked = isDateBooked(day)
          const isPast = today ? isBefore(day, today) : false
          const isSelected =
            !readOnly &&
            ((selectedFrom && day.toDateString() === selectedFrom.toDateString()) ||
              (selectedTo && day.toDateString() === selectedTo.toDateString()))
          const isInRange = !readOnly && selectedFrom && selectedTo && day > selectedFrom && day < selectedTo

          // Use button for selectable calendar, div for read-only
          const Component = readOnly ? "div" : "button"
          
          return (
            <Component
              key={day.toDateString()}
              onClick={readOnly ? undefined : () => handleDateClick(day)}
              disabled={!readOnly && (isBooked || isPast)}
              className={`h-7 sm:h-8 md:h-9 rounded text-xs font-medium flex items-center justify-center ${
                isBooked
                  ? "bg-rose-200 text-rose-800 font-semibold"
                  : isPast
                    ? "bg-gray-100 text-gray-400 opacity-50"
                    : isSelected
                      ? "bg-primary text-primary-foreground"
                      : isInRange
                        ? "bg-primary/20 text-primary"
                        : readOnly
                          ? "bg-[#e8f4f4] text-foreground"
                          : "bg-[#e8f4f4] hover:bg-[#d4e9e9] text-foreground cursor-pointer"
              } ${!readOnly && !isBooked && !isPast ? "transition-colors" : ""}`}
            >
              {format(day, "d")}
            </Component>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border space-y-2 text-xs">
        {!readOnly && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary"></div>
            <span className="text-muted-foreground">{t('booking.calendar.legend.selected')}</span>
          </div>
        )}
        {readOnly && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#e8f4f4]"></div>
            <span className="text-muted-foreground">{t('booking.calendar.legend.available')}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-rose-200"></div>
          <span className="text-muted-foreground">{t('booking.calendar.legend.booked')}</span>
        </div>
      </div>
    </div>
  )
}

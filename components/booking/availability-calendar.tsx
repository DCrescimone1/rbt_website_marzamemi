"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isAfter, isBefore, startOfToday } from "date-fns"
import { useTranslation } from "@/lib/hooks/useTranslation"
import { cn } from "@/lib/utils"

interface AvailabilityCalendarProps {
  onDateSelect?: (dates: { from: string; to: string }) => void
  className?: string
  sticky?: boolean
  initialFrom?: string
  initialTo?: string
}

export default function AvailabilityCalendar({
  onDateSelect,
  className,
  sticky = true,
  initialFrom,
  initialTo,
}: AvailabilityCalendarProps) {
  const { t } = useTranslation()
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
    return bookedDates.some((booking) => {
      const start = new Date(booking.start)
      const end = new Date(booking.end)
      return date >= start && date <= end
    })
  }

  const effectiveMonth = currentMonth ?? startOfToday()
  const days = eachDayOfInterval({
    start: startOfMonth(effectiveMonth),
    end: endOfMonth(effectiveMonth),
  })

  const handleDateClick = (date: Date) => {
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
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">{format(effectiveMonth, "MMMM yyyy")}</h3>
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
        {days.map((day) => {
          const isBooked = isDateBooked(day)
          const isPast = today ? isBefore(day, today) : false
          const isSelected =
            (selectedFrom && day.toDateString() === selectedFrom.toDateString()) ||
            (selectedTo && day.toDateString() === selectedTo.toDateString())
          const isInRange = selectedFrom && selectedTo && day > selectedFrom && day < selectedTo

          return (
            <button
              key={day.toDateString()}
              onClick={() => handleDateClick(day)}
              disabled={isBooked || isPast}
              className={`h-7 sm:h-8 md:h-9 rounded text-xs font-medium transition-colors ${
                isBooked
                  ? "bg-rose-200 text-rose-800 cursor-not-allowed font-semibold"
                  : isPast
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                    : isSelected
                      ? "bg-primary text-primary-foreground"
                      : isInRange
                        ? "bg-primary/20 text-primary"
                        : "bg-[#e8f4f4] hover:bg-[#d4e9e9] text-foreground"
              }`}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary"></div>
          <span className="text-muted-foreground">{t('booking.calendar.legend.selected')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-rose-200"></div>
          <span className="text-muted-foreground">{t('booking.calendar.legend.booked')}</span>
        </div>
      </div>
    </div>
  )
}

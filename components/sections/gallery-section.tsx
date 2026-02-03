"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/hooks/useTranslation"

export default function GallerySection() {
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState(0)
  const [autoRotate, setAutoRotate] = useState(true)

  // Virtual tour images from public/pictures
  const galleryImages = [
    { id: 1, src: "/pictures/IMG_7194.webp", alt: "Virtual tour 1", size: 0 },
    { id: 2, src: "/pictures/IMG_7196.webp", alt: "Virtual tour 2", size: 1 },
    { id: 3, src: "/pictures/IMG_7199.webp", alt: "Virtual tour 3", size: 2 },
    { id: 4, src: "/pictures/IMG_7202.webp", alt: "Virtual tour 4", size: 3 },
    { id: 5, src: "/pictures/IMG_7203.webp", alt: "Virtual tour 5", size: 4 },
    { id: 6, src: "/pictures/IMG_7205.webp", alt: "Virtual tour 6", size: 5 },
    { id: 7, src: "/pictures/IMG_7597.webp", alt: "Virtual tour 7", size: 0 },
    { id: 8, src: "/pictures/IMG_7598.webp", alt: "Virtual tour 8", size: 1 },
    { id: 9, src: "/pictures/IMG_7599.webp", alt: "Virtual tour 9", size: 2 },
    { id: 10, src: "/pictures/IMG_7600.webp", alt: "Virtual tour 10", size: 3 },
    { id: 11, src: "/pictures/IMG_7601.webp", alt: "Virtual tour 11", size: 4 },
    { id: 12, src: "/pictures/IMG_7602.webp", alt: "Virtual tour 12", size: 5 },
  ]

  // Auto-rotate pages every 5 seconds
  useEffect(() => {
    if (!autoRotate) return

    const timer = setInterval(() => {
      setCurrentPage((prev) => {
        const maxPages = Math.ceil(galleryImages.length / 3)
        return (prev + 1) % maxPages
      })
    }, 5000)

    return () => clearInterval(timer)
  }, [autoRotate, galleryImages.length])

  // Always show 3 images per page: 2 smaller in first column, 1 bigger in second column
  const itemsPerPage = 3
  const maxPages = Math.ceil(galleryImages.length / itemsPerPage)
  const startIdx = currentPage * itemsPerPage
  const currentImages = galleryImages.slice(startIdx, startIdx + itemsPerPage)

  const handlePrevPage = () => {
    setAutoRotate(false)
    setCurrentPage((prev) => (prev - 1 + maxPages) % maxPages)
  }

  const handleNextPage = () => {
    setAutoRotate(false)
    setCurrentPage((prev) => (prev + 1) % maxPages)
  }

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">{t('gallery.title')}</h2>
          <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('gallery.subtitle')}
          </p>
        </div>

        {/* Gallery Mosaic Layout */}
        <div className="relative">
          {/* Flexbox container for mosaic layout */}
          <div className="flex gap-3 md:gap-4 mb-8 h-[312px] md:h-[576px]">
            {/* Left column: 2 stacked images */}
            <div className="flex flex-col gap-3 md:gap-4 flex-1">
              {currentImages.slice(0, 2).map((image, idx) => (
                <div
                  key={image.id}
                  className="relative flex-1 rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group cursor-pointer animate-in fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    quality={75}
                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right column: 1 tall image */}
            {currentImages[2] && (
              <div
                className="relative flex-[2] rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group cursor-pointer animate-in fade-in"
                style={{ animationDelay: '100ms' }}
              >
                <Image
                  src={currentImages[2].src || "/placeholder.svg"}
                  alt={currentImages[2].alt}
                  fill
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  quality={75}
                  sizes="(max-width: 640px) 66vw, (max-width: 1024px) 66vw, 66vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pagination Indicator & Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 md:mt-12">
            {/* Minimal Page Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-muted-foreground">
                Page <span className="font-semibold text-foreground">{currentPage + 1}</span>/
                <span className="font-semibold text-foreground">{maxPages}</span>
              </span>
            </div>

            <div className="flex gap-2 md:gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevPage}
                className="rounded-full h-9 w-9 md:h-10 md:w-10 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 active:scale-95 bg-transparent"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                className="rounded-full h-9 w-9 md:h-10 md:w-10 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 active:scale-95 bg-transparent"
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${autoRotate ? "bg-primary scale-125" : "bg-gray-300"}`}
              ></div>
              <span className="hidden sm:inline">{autoRotate ? "Auto" : "Manual"}</span>
            </div>
          </div>

          <div className="mt-6 h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
              style={{ width: `${((currentPage + 1) / maxPages) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  )
}

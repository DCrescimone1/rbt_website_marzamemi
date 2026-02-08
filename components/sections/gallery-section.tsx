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

  // Combined images from both villas - ALL pictures
  const galleryImages = [
    // Villa i 2 Mari - 32 images
    { id: 1, src: "/pictures/villa_i_2_mari/ok%20giardino%20sera-b.webp", alt: "Garden at evening" },
    { id: 2, src: "/pictures/villa_i_2_mari/ok%20piscina%20alta1.webp", alt: "Pool view" },
    { id: 3, src: "/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari-%20camera1.webp", alt: "Bedroom" },
    { id: 4, src: "/pictures/villa_i_2_mari/%20ok%20Villa%20i2mari-cucina.webp", alt: "Kitchen" },
    { id: 5, src: "/pictures/villa_i_2_mari/ok%20z%20soggiorno2%20%202mari.webp", alt: "Living room" },
    { id: 6, src: "/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari-%20bagno.webp", alt: "Bathroom" },
    { id: 7, src: "/pictures/villa_i_2_mari/ok%20drone.webp", alt: "Aerial view" },
    { id: 8, src: "/pictures/villa_i_2_mari/ok%20piscine%20notte1.webp", alt: "Pool at night" },
    { id: 9, src: "/pictures/villa_i_2_mari/ok%20giardino1.webp", alt: "Garden" },
    { id: 10, src: "/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari-dal%20balcone.webp", alt: "Balcony view" },
    { id: 11, src: "/pictures/villa_i_2_mari/ok%20z%20la%20piazzetta1.webp", alt: "Local square" },
    { id: 12, src: "/pictures/villa_i_2_mari/ok%20isola%20di%20capo%20passero.webp", alt: "Capo Passero island" },
    { id: 13, src: "/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari%20TV.webp", alt: "TV room" },
    { id: 14, src: "/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari-bagno1.webp", alt: "Bathroom" },
    { id: 15, src: "/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari-camera%203.webp", alt: "Bedroom 3" },
    { id: 16, src: "/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari-camera.webp", alt: "Bedroom" },
    { id: 17, src: "/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari-cameretta1.webp", alt: "Small bedroom" },
    { id: 18, src: "/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari-corridoio1.webp", alt: "Hallway" },
    { id: 19, src: "/pictures/villa_i_2_mari/ok%20Villa%20i2%20mari-corridoio.webp", alt: "Corridor" },
    { id: 20, src: "/pictures/villa_i_2_mari/ok%20Villa%20i2mari-tavolo%20cucina.webp", alt: "Kitchen table" },
    { id: 21, src: "/pictures/villa_i_2_mari/ok%20giardino2.webp", alt: "Garden view" },
    { id: 22, src: "/pictures/villa_i_2_mari/ok%20villa%20i%202%20mari-cameretta.webp", alt: "Kids room" },
    { id: 23, src: "/pictures/villa_i_2_mari/ok%20Borgo84%202.webp", alt: "Borgo84" },
    { id: 24, src: "/pictures/villa_i_2_mari/ok%20Marzamemi%20cinefest.webp", alt: "Marzamemi cinema festival" },
    { id: 25, src: "/pictures/villa_i_2_mari/ok%20carratois%20pantano.webp", alt: "Carratois beach" },
    { id: 26, src: "/pictures/villa_i_2_mari/ok%20isolotto%20brancati4.webp", alt: "Brancati island" },
    { id: 27, src: "/pictures/villa_i_2_mari/ok%20spiaggiacavettone5.webp", alt: "Cavettone beach" },
    { id: 28, src: "/pictures/villa_i_2_mari/ok%20z%20area%20fitness+padel.webp", alt: "Fitness and padel area" },
    { id: 29, src: "/pictures/villa_i_2_mari/ok%20z%20la%20cialoma1.webp", alt: "La Cialoma restaurant" },
    { id: 30, src: "/pictures/villa_i_2_mari/ok%20z%20manifesto%20tonnara2.webp", alt: "Tonnara poster" },
    { id: 31, src: "/pictures/villa_i_2_mari/ok%20z%20soggiorno3%202%20mari.webp", alt: "Living room" },
    { id: 32, src: "/pictures/villa_i_2_mari/ok%20z%20tonnara.webp", alt: "Tonnara" },
    
    // Villa Zefiro - 36 images
    { id: 33, src: "/pictures/villa_zefiro/ok%20piscina%20alta.webp", alt: "Pool view" },
    { id: 34, src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20soggiorno.webp", alt: "Living room" },
    { id: 35, src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20camera.webp", alt: "Bedroom" },
    { id: 36, src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20terrazza.webp", alt: "Terrace" },
    { id: 37, src: "/pictures/villa_zefiro/ok%20giardino%20sera-b.webp", alt: "Garden at evening" },
    { id: 38, src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20bagno.webp", alt: "Bathroom" },
    { id: 39, src: "/pictures/villa_zefiro/ok%20drone3.webp", alt: "Aerial view" },
    { id: 40, src: "/pictures/villa_zefiro/ok%20piscine%20notte.webp", alt: "Pool at night" },
    { id: 41, src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20mansarda.webp", alt: "Attic room" },
    { id: 42, src: "/pictures/villa_zefiro/ok%20Capo%20Passero%20dalla%20terrazza.webp", alt: "View from terrace" },
    { id: 43, src: "/pictures/villa_zefiro/ok%20z%20cialoma%20%20.webp", alt: "La Cialoma" },
    { id: 44, src: "/pictures/villa_zefiro/ok%20Marzamemi%20porto.webp", alt: "Marzamemi port" },
    { id: 45, src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20soggiorno1.webp", alt: "Living room" },
    { id: 46, src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20bagno1.webp", alt: "Bathroom" },
    { id: 47, src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20balcone.webp", alt: "Balcony" },
    { id: 48, src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20camera2.webp", alt: "Bedroom 2" },
    { id: 49, src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20camera3.webp", alt: "Bedroom 3" },
    { id: 50, src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20letto%20mansarda1.webp", alt: "Attic bed" },
    { id: 51, src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20letto%20mansarda2.webp", alt: "Attic bed 2" },
    { id: 52, src: "/pictures/villa_zefiro/ok%20App.17%20bagno%20mansarda.webp", alt: "Attic bathroom" },
    { id: 53, src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20bagno%20mansarda.webp", alt: "Attic bathroom" },
    { id: 54, src: "/pictures/villa_zefiro/ok%20piscina%20bassa3.webp", alt: "Lower pool" },
    { id: 55, src: "/pictures/villa_zefiro/ok%20piscinabassa4.webp", alt: "Lower pool view" },
    { id: 56, src: "/pictures/villa_zefiro/ok%20spiaggia%20cavettone1.webp", alt: "Cavettone beach" },
    { id: 57, src: "/pictures/villa_zefiro/ok%20Borgo84%201.webp", alt: "Borgo84" },
    { id: 58, src: "/pictures/villa_zefiro/ok%20Baiamuri-b.webp", alt: "Baiamuri beach" },
    { id: 59, src: "/pictures/villa_zefiro/ok%20WhatsApp%20Image%202025-10-26%20at%2019.36.13(2).webp", alt: "Villa view" },
    { id: 60, src: "/pictures/villa_zefiro/ok%20WhatsApp%20Image%202025-10-29%20at%2011.53.10(1).webp", alt: "Villa view" },
    { id: 61, src: "/pictures/villa_zefiro/ok%20z%20aperirivo1%20zefiro.webp", alt: "Aperitivo" },
    { id: 62, src: "/pictures/villa_zefiro/ok%20z%20area%20fitness+padel.webp", alt: "Fitness and padel area" },
    { id: 63, src: "/pictures/villa_zefiro/ok%20z%20colazione%20porto1.webp", alt: "Breakfast at port" },
    { id: 64, src: "/pictures/villa_zefiro/ok%20z%20mansarda%20Zefiro.webp", alt: "Attic" },
    { id: 65, src: "/pictures/villa_zefiro/ok%20z%20padel.webp", alt: "Padel court" },
    { id: 66, src: "/pictures/villa_zefiro/ok%20z%20particolare1%20zefiro.webp", alt: "Detail" },
    { id: 67, src: "/pictures/villa_zefiro/ok%20z%20scala2%20zefiro.webp", alt: "Stairs" },
    { id: 68, src: "/pictures/villa_zefiro/ok%20z%20tonnara1.webp", alt: "Tonnara" },
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

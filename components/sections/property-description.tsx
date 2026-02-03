"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useTranslation } from "@/lib/hooks/useTranslation"

export default function PropertyDescriptionSection() {
  const [isVisible, setIsVisible] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const amenities = [
    { icon: "🏡", title: t('property.amenities.bedrooms.title'), description: t('property.amenities.bedrooms.description') },
    { icon: "🏨", title: t('property.amenities.kitchen.title'), description: t('property.amenities.kitchen.description') },
    { icon: "🏊‍♀️", title: t('property.amenities.pool.title'), description: t('property.amenities.pool.description') },
    { icon: "🌊", title: t('property.amenities.terrace.title'), description: t('property.amenities.terrace.description') },
    { icon: "🎾", title: t('property.amenities.entertainment.title'), description: t('property.amenities.entertainment.description') },
    { icon: "🚴", title: t('property.amenities.wellness.title'), description: t('property.amenities.wellness.description') },
  ]

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            {t('property.sectionTitle')}
          </h2>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center mb-16 md:mb-20">
          {/* Image */}
          <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 order-2 lg:order-1 group">
            <Image
              src="/pictures/IMG_7600.webp"
              alt="Property interior"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/10 transition-all duration-300"></div>
          </div>

          {/* Description */}
          <div
            className={`transition-all duration-1000 order-1 lg:order-2 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">
              {t('property.locationTitle')}
            </h3>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4 md:mb-6">
              {t('property.description')}
            </p>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 md:mb-8">
              {t('property.detailedDescription')}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 pt-6 md:pt-8 border-t border-border">
              <div className="group hover:scale-105 transition-transform duration-200">
                <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-primary transition-colors group-hover:text-accent">
                  4
                </p>
                <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide mt-1 md:mt-2">
                  {t('property.stats.bedrooms')}
                </p>
              </div>
              <div className="group hover:scale-105 transition-transform duration-200">
                <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-primary transition-colors group-hover:text-accent">
                  1
                </p>
                <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide mt-1 md:mt-2">
                  {t('property.stats.bathrooms')}
                </p>
              </div>
              <div className="group hover:scale-105 transition-transform duration-200">
                <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-primary transition-colors group-hover:text-accent">
                  36
                </p>
                <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide mt-1 md:mt-2">{t('property.stats.area')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities Grid */}
        <div className="mt-12 md:mt-20 lg:mt-32">
          <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-center mb-8 md:mb-16">
            {t('property.amenitiesTitle')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {amenities.map((item, index) => (
              <div
                key={index}
                className="p-6 md:p-8 border border-border rounded-lg hover:shadow-lg hover:border-primary/50 transition-all duration-300 group cursor-pointer transform hover:-translate-y-1"
              >
                <p className="text-3xl md:text-4xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {item.icon}
                </p>
                <h4 className="font-serif text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">
                  {item.title}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

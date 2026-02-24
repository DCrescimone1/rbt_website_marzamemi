"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "@/lib/hooks/useTranslation"

export default function PropertyDescriptionSection() {
  const [isVisible, setIsVisible] = useState(false)
  const { t } = useTranslation()

  const amenities = [
    { icon: "🏡", title: t('property.amenities.bedrooms.title'), description: t('property.amenities.bedrooms.description') },
    { icon: "🏨", title: t('property.amenities.kitchen.title'), description: t('property.amenities.kitchen.description') },
    { icon: "🏊‍♀️", title: t('property.amenities.pool.title'), description: t('property.amenities.pool.description') },
    { icon: "🌊", title: t('property.amenities.terrace.title'), description: t('property.amenities.terrace.description') },
    { icon: "🎾", title: t('property.amenities.entertainment.title'), description: t('property.amenities.entertainment.description') },
    { icon: "🚴", title: t('property.amenities.wellness.title'), description: t('property.amenities.wellness.description') },
  ]

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="bg-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            {t("property.sectionTitle")}
          </h2>
        </div>

        {/* Two-column villa comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_auto_minmax(0,1.4fr)] gap-12 lg:gap-16 items-stretch">
          {/* Left column — Villa Zefiro */}
          <div
            className={`flex flex-col transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <span className="text-xs tracking-[0.2em] uppercase text-primary font-semibold">
              {t("property.villaZefiro.tagline")}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4 md:mb-6">
              {t("property.villaZefiro.name")}
            </h3>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {t("property.villaZefiro.description")}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-6 md:gap-8 pt-6 md:pt-8 mt-auto border-t border-border">
              <div>
                <p className="text-lg md:text-xl font-serif font-semibold text-foreground">
                  {t("property.villaZefiro.guests")}
                </p>
              </div>
              <span className="text-border">|</span>
              <div>
                <p className="text-lg md:text-xl font-serif font-semibold text-foreground">
                  {t("property.villaZefiro.size")}
                </p>
              </div>
              <span className="text-border">|</span>
              <div>
                <p className="text-lg md:text-xl font-serif font-semibold text-foreground">
                  {`${t("property.villaZefiro.bedrooms")} · ${t("property.villaZefiro.bathrooms")}`}
                </p>
              </div>
              <span className="text-border">|</span>
              <div>
                <p className="text-lg md:text-xl font-serif font-semibold text-foreground">
                  {t("property.villaZefiro.parking")}
                </p>
              </div>
            </div>

            {/* Highlight badge */}
            <div className="mt-4">
              <span className="inline-flex items-center rounded-full border border-primary/60 bg-primary/5 px-5 py-2 text-xs md:text-sm text-foreground/70">
                {t("property.villaZefiro.highlight")}
              </span>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block w-px bg-border/30" aria-hidden="true" />

          {/* Right column — Villa i 2 Mari */}
          <div
            className={`flex flex-col transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <span className="text-xs tracking-[0.2em] uppercase text-primary font-semibold">
              {t("property.villaI2Mari.tagline")}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4 md:mb-6">
              {t("property.villaI2Mari.name")}
            </h3>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {t("property.villaI2Mari.description")}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-6 md:gap-8 pt-6 md:pt-8 mt-auto border-t border-border">
              <div>
                <p className="text-lg md:text-xl font-serif font-semibold text-foreground">
                  {t("property.villaI2Mari.guests")}
                </p>
              </div>
              <span className="text-border">|</span>
              <div>
                <p className="text-lg md:text-xl font-serif font-semibold text-foreground">
                  {t("property.villaI2Mari.size")}
                </p>
              </div>
              <span className="text-border">|</span>
              <div>
                <p className="text-lg md:text-xl font-serif font-semibold text-foreground">
                  {`${t("property.villaI2Mari.bedrooms")} · ${t("property.villaI2Mari.bathrooms")}`}
                </p>
              </div>
              <span className="text-border">|</span>
              <div>
                <p className="text-lg md:text-xl font-serif font-semibold text-foreground">
                  {t("property.villaI2Mari.parking")}
                </p>
              </div>
            </div>

            {/* Highlight badge */}
            <div className="mt-4">
              <span className="inline-flex items-center rounded-full border border-primary/60 bg-primary/5 px-5 py-2 text-xs md:text-sm text-foreground/70">
                {t("property.villaI2Mari.highlight")}
              </span>
            </div>
          </div>
        </div>

        {/* Residence Section */}
        <div className="mt-12 md:mt-20 lg:mt-32">
          <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-center mb-8 md:mb-16">
            {t('property.residence.title')}
          </h3>

          {/* Image + Description */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 mb-12 md:mb-20">
            {/* Image */}
            <div className="relative aspect-4/3 rounded-lg overflow-hidden shadow-lg">
              <img
                src="/pictures/villa_zefiro/ok piscina alta.webp"
                alt={t('property.residence.name')}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col justify-center">
              <h4 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">
                {t('property.residence.name')}
              </h4>

              <div
                className="text-base md:text-lg text-muted-foreground leading-relaxed [&_strong]:text-foreground [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: t('property.residence.description') }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 md:auto-rows-fr">
            {amenities.map((item, index) => (
              <div
                key={index}
                className="h-full flex flex-col p-6 md:p-8 border border-border rounded-lg hover:shadow-lg hover:border-primary/50 transition-all duration-300 group cursor-pointer transform hover:-translate-y-1"
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

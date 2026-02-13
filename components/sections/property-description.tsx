"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "@/lib/hooks/useTranslation"

export default function PropertyDescriptionSection() {
  const [isVisible, setIsVisible] = useState(false)
  const { t } = useTranslation()

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
            <span className="text-xs tracking-[0.2em] uppercase text-primary">
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
            <span className="text-xs tracking-[0.2em] uppercase text-primary">
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
            </div>

            {/* Highlight badge */}
            <div className="mt-4">
              <span className="inline-flex items-center rounded-full border border-primary/60 bg-primary/5 px-5 py-2 text-xs md:text-sm text-foreground/70">
                {t("property.villaI2Mari.highlight")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

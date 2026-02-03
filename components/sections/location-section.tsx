"use client"

import { MapPin, Phone } from "lucide-react"
import { useTranslation } from "@/lib/hooks/useTranslation"
import { translations } from "@/lib/translations"

export default function LocationSection() {
  const { t, language } = useTranslation()
  const locationData = translations[language].location
  
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-foreground">{t('location.title')}</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('location.subtitle')}
          </p>
        </div>

        {/* Map Container */}
        <div className="rounded-lg overflow-hidden shadow-xl h-[400px] md:h-[600px] bg-muted flex items-center justify-center mb-12 md:mb-16">
          <iframe
            src="https://www.google.com/maps?q=36.723632,15.117694&center=36.728,15.120&z=15&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        {/* Location Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 md:p-8 bg-linear-to-br from-primary/5 to-accent/5 border border-border rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6 text-primary" />
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">{t('location.address.label')}</p>
            </div>
            <p className="font-serif text-xl font-semibold text-foreground">
              {t('location.address.value')}
            </p>
          </div>

          <div className="p-6 md:p-8 bg-linear-to-br from-primary/5 to-accent/5 border border-border rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6 text-primary" />
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">{t('location.coordinates.label')}</p>
            </div>
            <p className="font-serif text-xl font-semibold text-foreground">{t('location.coordinates.value')}</p>
          </div>

          <div className="p-6 md:p-8 bg-linear-to-br from-primary/5 to-accent/5 border border-border rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-6 h-6 text-primary" />
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">{t('location.nearby.label')}</p>
            </div>
            <p className="font-serif text-xl font-semibold text-foreground">
              {t('location.nearby.value')}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 md:mt-20 pt-16 md:pt-20 border-t border-border/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-serif text-2xl font-bold text-foreground mb-6">{t('location.gettingHere.title')}</h3>
              <ul className="space-y-3 text-muted-foreground">
                {locationData.gettingHere.items.map((item: string, index: number) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-2xl font-bold text-foreground mb-6">{t('location.whatsNearby.title')}</h3>
              <ul className="space-y-3 text-muted-foreground">
                {locationData.whatsNearby.items.map((item: string, index: number) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-accent font-bold">★</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

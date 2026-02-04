"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useTranslation } from "../../lib/hooks/useTranslation"

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="relative w-full h-screen min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/pictures/IMG_8540.webp"
          alt="Luxury beach property"
          fill
          priority
          className="object-cover object-center"
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
      </div>

      {/* Content */}
      <div
        className={`relative z-10 text-center px-4 max-w-4xl mx-auto transition-all duration-1000 will-change-transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h1
          className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 md:mb-8 tracking-wider drop-shadow-lg animate-fade-in text-balance"
          style={{ animationDelay: "400ms" }}
        >
          {t('hero.title')}
        </h1>

        <p
          className="text-sm md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed font-light px-2 animate-fade-in"
          style={{ animationDelay: "600ms" }}
        >
          {t('hero.description')}
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="text-white text-center">
          <p className="text-xs tracking-widest uppercase mb-2">{t('hero.scrollText')}</p>
          <svg className="w-5 h-5 md:w-6 md:h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  )
}

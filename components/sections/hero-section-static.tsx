// NOTE: superseded by hero-dual-album.tsx — kept for reference
"use client"

import { useTranslation } from '@/lib/hooks/useTranslation';

/**
 * StaticHeroFallback Component
 * 
 * Fallback hero section used when GSAP plugins fail to load.
 * Provides a simple, static hero without animations.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */
export default function StaticHeroFallback() {
  const { t } = useTranslation();

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="text-center px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 md:mb-8 tracking-wider drop-shadow-lg text-balance leading-tight">
          {t('hero.title')}
        </h1>
        
        <div className="mt-8 text-white text-center">
          <p className="text-xs tracking-widest uppercase mb-2">
            {t('hero.scrollText')}
          </p>
          <svg 
            className="w-5 h-5 md:w-6 md:h-6 mx-auto animate-bounce" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

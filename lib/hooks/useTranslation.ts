'use client'

import { useMemo } from 'react'
import { useLanguageContext } from '../contexts/LanguageContext'
import type { LanguageCode, TranslationParams } from '../translations/types'
import { 
  formatCount, 
  createFormValidationTranslations, 
  createDateTranslations,
  createWhatsAppUtils,
  pluralize 
} from '../utils/translation-utils'

/**
 * Return type for the useTranslation hook
 */
export interface UseTranslationReturn {
  /** Translation function with parameter interpolation */
  t: (key: string, params?: TranslationParams) => string
  /** Current language code */
  language: LanguageCode
  /** Function to change the current language */
  setLanguage: (lang: LanguageCode) => void
  /** Utility property - true if current language is Italian */
  isItalian: boolean
  /** Utility property - true if current language is English */
  isEnglish: boolean
  /** Utility functions for common translation patterns */
  utils: {
    /** Format translation with count and pluralization */
    formatCount: (baseKey: string, count: number, params?: TranslationParams) => string
    /** Simple pluralization helper */
    pluralize: (count: number, singular: string, plural: string, zero?: string) => string
    /** Form validation message helpers */
    validation: {
      required: (field: string) => string
      email: () => string
      minLength: (field: string, min: number) => string
      maxLength: (field: string, max: number) => string
      pattern: (field: string) => string
    }
    /** Date formatting helpers */
    date: {
      formatDate: (date: Date) => string
      formatTime: (date: Date) => string
    }
    /** WhatsApp integration helpers */
    whatsapp: {
      getDefaultUrl: () => string
      getCustomUrl: (messageKey: string, params?: TranslationParams) => string
      getBookingUrl: (checkIn?: string, checkOut?: string, guests?: number) => string
    }
  }
}

/**
 * Custom hook for accessing translation functionality
 * 
 * Provides a convenient interface to the language context with:
 * - Translation function with parameter interpolation
 * - Current language state and setter
 * - Utility properties for language checking
 * - Common translation utility functions
 * - Type safety for translation keys
 * 
 * @returns Translation utilities and language state
 * 
 * @example
 * ```tsx
 * const { t, language, setLanguage, isItalian, utils } = useTranslation()
 * 
 * return (
 *   <div>
 *     <h1>{t('hero.title')}</h1>
 *     <p>{t('hero.welcome', { name: 'Mario' })}</p>
 *     <p>{utils.formatCount('booking.guests', guestCount)}</p>
 *     {isItalian && <span>Benvenuto!</span>}
 *   </div>
 * )
 * ```
 */
export const useTranslation = (): UseTranslationReturn => {
  const context = useLanguageContext()
  
  // Memoize utility functions to prevent unnecessary re-renders
  const utils = useMemo(() => ({
    formatCount: (baseKey: string, count: number, params?: TranslationParams) =>
      formatCount(context.t, baseKey, count, params),
    
    pluralize,
    
    validation: createFormValidationTranslations(context.t),
    
    date: createDateTranslations(context.t),
    
    whatsapp: createWhatsAppUtils(context.t)
  }), [context.t])
  
  return {
    t: context.t,
    language: context.language,
    setLanguage: context.setLanguage,
    isItalian: context.isItalian,
    isEnglish: context.isEnglish,
    utils
  }
}

export default useTranslation
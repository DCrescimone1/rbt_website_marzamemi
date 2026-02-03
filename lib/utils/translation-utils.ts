'use client'

import type { TranslationParams } from '../translations/types'

/**
 * Utility function to get nested translation value from dot notation key
 * @param obj - Translation object
 * @param key - Dot notation key (e.g., 'hero.title')
 * @returns Translation value or undefined if not found
 */
export const getNestedValue = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((current, keyPart) => {
    return current && current[keyPart] !== undefined ? current[keyPart] : undefined
  }, obj)
}

/**
 * Interpolate parameters in translation string
 * Supports {{param}} placeholder syntax
 * @param text - Translation text with {{param}} placeholders
 * @param params - Parameters to interpolate
 * @returns Interpolated string
 * 
 * @example
 * ```ts
 * interpolateParams('Hello {{name}}!', { name: 'Mario' })
 * // Returns: 'Hello Mario!'
 * ```
 */
export const interpolateParams = (text: string, params?: TranslationParams): string => {
  if (!params) return text
  
  return Object.entries(params).reduce((result, [key, value]) => {
    const placeholder = `{{${key}}}`
    return result.replace(new RegExp(placeholder, 'g'), String(value))
  }, text)
}

/**
 * Validate if a translation key exists in the given translation object
 * @param translations - Translation object to check
 * @param key - Translation key to validate
 * @returns True if key exists, false otherwise
 */
export const hasTranslationKey = (translations: any, key: string): boolean => {
  return getNestedValue(translations, key) !== undefined
}

/**
 * Get translation with fallback mechanism
 * @param primaryTranslations - Primary language translations
 * @param fallbackTranslations - Fallback language translations
 * @param key - Translation key
 * @param params - Optional parameters for interpolation
 * @param primaryLanguage - Primary language code for logging
 * @returns Translated string with fallback support
 */
export const getTranslationWithFallback = (
  primaryTranslations: any,
  fallbackTranslations: any,
  key: string,
  params?: TranslationParams,
  primaryLanguage?: string
): string => {
  try {
    // Try primary language first
    const primaryTranslation = getNestedValue(primaryTranslations, key)
    if (primaryTranslation) {
      return interpolateParams(primaryTranslation, params)
    }

    // Fallback to secondary language
    const fallbackTranslation = getNestedValue(fallbackTranslations, key)
    if (fallbackTranslation) {
      if (process.env.NODE_ENV === 'development' && primaryLanguage) {
        console.warn(`Missing translation for key: ${key} in language: ${primaryLanguage}, using fallback`)
      }
      return interpolateParams(fallbackTranslation, params)
    }

    // No translation found
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation for key: ${key} in all languages`)
      return `[${key}]`
    }

    return key
  } catch (error) {
    console.error(`Translation error for key: ${key}`, error)
    return key
  }
}

/**
 * Pluralization utility for translations
 * @param count - Number to determine plural form
 * @param singular - Singular form translation key or text
 * @param plural - Plural form translation key or text
 * @param zero - Optional zero form translation key or text
 * @returns Appropriate form based on count
 */
export const pluralize = (
  count: number,
  singular: string,
  plural: string,
  zero?: string
): string => {
  if (count === 0 && zero) return zero
  return count === 1 ? singular : plural
}

/**
 * Format translation with count and pluralization
 * @param t - Translation function
 * @param baseKey - Base translation key (without .singular/.plural suffix)
 * @param count - Count for pluralization
 * @param params - Additional parameters for interpolation
 * @returns Formatted translation with count
 * 
 * @example
 * ```ts
 * formatCount(t, 'booking.guests', 2, { count: 2 })
 * // Uses 'booking.guests.plural' key and interpolates count
 * ```
 */
export const formatCount = (
  t: (key: string, params?: TranslationParams) => string,
  baseKey: string,
  count: number,
  params?: TranslationParams
): string => {
  const suffix = count === 1 ? 'singular' : 'plural'
  const key = `${baseKey}.${suffix}`
  const mergedParams = { ...params, count: count.toString() }
  return t(key, mergedParams)
}

/**
 * Development mode helper to log missing translation keys
 * @param key - Missing translation key
 * @param language - Language where key is missing
 * @param context - Additional context for debugging
 */
export const logMissingTranslation = (
  key: string,
  language: string,
  context?: string
): void => {
  if (process.env.NODE_ENV === 'development') {
    const contextInfo = context ? ` (${context})` : ''
    console.warn(`🌐 Missing translation: "${key}" for language "${language}"${contextInfo}`)
  }
}

/**
 * Development mode helper to log translation errors
 * @param key - Translation key that caused error
 * @param error - Error object
 * @param context - Additional context for debugging
 */
export const logTranslationError = (
  key: string,
  error: Error,
  context?: string
): void => {
  if (process.env.NODE_ENV === 'development') {
    const contextInfo = context ? ` (${context})` : ''
    console.error(`🌐 Translation error for key "${key}"${contextInfo}:`, error)
  }
}

/**
 * Validate translation object structure
 * @param translations - Translation object to validate
 * @param requiredKeys - Array of required keys to check
 * @returns Array of missing keys
 */
export const validateTranslations = (
  translations: any,
  requiredKeys: string[]
): string[] => {
  const missingKeys: string[] = []
  
  for (const key of requiredKeys) {
    if (!hasTranslationKey(translations, key)) {
      missingKeys.push(key)
    }
  }
  
  return missingKeys
}

/**
 * Common translation patterns for form validation messages
 */
export const createFormValidationTranslations = (
  t: (key: string, params?: TranslationParams) => string
) => ({
  required: (field: string) => t('validation.required', { field }),
  email: () => t('validation.email'),
  minLength: (field: string, min: number) => t('validation.minLength', { field, min: min.toString() }),
  maxLength: (field: string, max: number) => t('validation.maxLength', { field, max: max.toString() }),
  pattern: (field: string) => t('validation.pattern', { field })
})

/**
 * Common translation patterns for date formatting
 */
export const createDateTranslations = (
  t: (key: string, params?: TranslationParams) => string
) => ({
  formatDate: (date: Date) => {
    const day = date.getDate().toString()
    const month = t(`months.${date.getMonth()}`)
    const year = date.getFullYear().toString()
    return t('date.format', { day, month, year })
  },
  formatTime: (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return t('time.format', { hours, minutes })
  }
})

/**
 * Generate WhatsApp URL with language-specific message
 * @param phoneNumber - WhatsApp phone number (with country code)
 * @param message - Pre-filled message text
 * @returns WhatsApp URL with encoded message
 * 
 * @example
 * ```ts
 * const url = generateWhatsAppUrl('+393501159152', 'Ciao! Sono interessato...')
 * // Returns: 'https://wa.me/393501159152?text=Ciao%21%20Sono%20interessato...'
 * ```
 */
export const generateWhatsAppUrl = (phoneNumber: string, message: string): string => {
  // Remove any non-digit characters from phone number except the leading +
  const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '')
  
  // URL encode the message to handle special characters and spaces
  const encodedMessage = encodeURIComponent(message)
  
  return `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`
}

/**
 * Create WhatsApp utility functions with translation support
 * @param t - Translation function
 * @param phoneNumber - WhatsApp phone number
 * @returns WhatsApp utility functions
 */
export const createWhatsAppUtils = (
  t: (key: string, params?: TranslationParams) => string,
  phoneNumber: string = '+393501159152'
) => ({
  /**
   * Generate WhatsApp URL with default message in current language
   */
  getDefaultUrl: () => {
    const message = t('whatsapp.defaultMessage')
    return generateWhatsAppUrl(phoneNumber, message)
  },
  
  /**
   * Generate WhatsApp URL with custom message
   * @param messageKey - Translation key for the message
   * @param params - Optional parameters for message interpolation
   */
  getCustomUrl: (messageKey: string, params?: TranslationParams) => {
    const message = t(messageKey, params)
    return generateWhatsAppUrl(phoneNumber, message)
  },
  
  /**
   * Generate WhatsApp URL with booking inquiry message
   * @param checkIn - Check-in date (optional)
   * @param checkOut - Check-out date (optional)
   * @param guests - Number of guests (optional)
   */
  getBookingUrl: (checkIn?: string, checkOut?: string, guests?: number) => {
    const baseMessage = t('whatsapp.defaultMessage')
    let message = baseMessage
    
    if (checkIn && checkOut) {
      const dateInfo = t('whatsapp.bookingDates', { checkIn, checkOut })
      message += ` ${dateInfo}`
    }
    
    if (guests && guests > 1) {
      const guestInfo = t('whatsapp.guestCount', { count: guests.toString() })
      message += ` ${guestInfo}`
    }
    
    return generateWhatsAppUrl(phoneNumber, message)
  }
})
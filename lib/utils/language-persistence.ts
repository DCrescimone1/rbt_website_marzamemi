import type { LanguageCode, BrowserLanguageDetection, LanguagePersistence } from '../translations/types'
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../translations'

/**
 * Storage key for language preference in localStorage
 */
const STORAGE_KEY = 'acquamarina-language'

/**
 * Language persistence utilities for localStorage management
 * Handles saving, loading, and clearing language preferences with error handling
 */
export const languagePersistence: LanguagePersistence = {
  /**
   * Save language preference to localStorage
   * @param language - Language code to save
   */
  save: (language: LanguageCode): void => {
    try {
      if (typeof window === 'undefined') {
        return
      }
      
      if (!SUPPORTED_LANGUAGES.includes(language)) {
        console.warn(`Attempted to save unsupported language: ${language}`)
        return
      }
      
      localStorage.setItem(STORAGE_KEY, language)
    } catch (error) {
      console.error('Failed to save language preference to localStorage:', error)
    }
  },

  /**
   * Load language preference from localStorage
   * @returns Saved language code or null if not found/invalid
   */
  load: (): LanguageCode | null => {
    try {
      if (typeof window === 'undefined') {
        return null
      }
      
      const stored = localStorage.getItem(STORAGE_KEY)
      
      if (stored && SUPPORTED_LANGUAGES.includes(stored as LanguageCode)) {
        return stored as LanguageCode
      }
      
      return null
    } catch (error) {
      console.error('Failed to load language preference from localStorage:', error)
      return null
    }
  },

  /**
   * Clear language preference from localStorage
   */
  clear: (): void => {
    try {
      if (typeof window === 'undefined') {
        return
      }
      
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear language preference from localStorage:', error)
    }
  }
}

/**
 * Browser language detection utilities
 * Detects user's browser language and determines if it's supported
 */
export const browserLanguageDetection = {
  /**
   * Detect browser language and check if it's supported
   * @returns Browser language detection result
   */
  detect: (): BrowserLanguageDetection => {
    try {
      if (typeof window === 'undefined' || !navigator.language) {
        return {
          detected: null,
          supported: false
        }
      }
      
      // Extract primary language code (e.g., 'it' from 'it-IT')
      const primaryLanguage = navigator.language.split('-')[0].toLowerCase() as LanguageCode
      
      const isSupported = SUPPORTED_LANGUAGES.includes(primaryLanguage)
      
      return {
        detected: isSupported ? primaryLanguage : null,
        supported: isSupported
      }
    } catch (error) {
      console.error('Failed to detect browser language:', error)
      return {
        detected: null,
        supported: false
      }
    }
  },

  /**
   * Get the best language choice based on browser detection and defaults
   * Priority: stored preference > browser language (if supported) > Italian default
   * Note: Italian default always takes precedence for first-time visitors
   * @returns Best language choice
   */
  getBestLanguage: (): LanguageCode => {
    // Check for stored preference first
    const storedLanguage = languagePersistence.load()
    if (storedLanguage) {
      return storedLanguage
    }

    // For first-time visitors, always default to Italian
    // This ensures Italian is the primary language as specified in requirements
    return DEFAULT_LANGUAGE
  },

  /**
   * Get browser language for informational purposes
   * This can be used to show language suggestions but won't override Italian default
   * @returns Detected browser language or null
   */
  getBrowserLanguage: (): LanguageCode | null => {
    const detection = browserLanguageDetection.detect()
    return detection.detected
  }
}

/**
 * Language initialization utilities
 * Handles the complete language initialization process
 */
export const languageInitialization = {
  /**
   * Initialize language with proper priority handling
   * Implements the requirement that Italian default overrides browser preferences initially
   * @returns Initial language to use
   */
  getInitialLanguage: (): LanguageCode => {
    const storedLanguage = languagePersistence.load()
    
    if (storedLanguage) {
      // User has previously selected a language, respect their choice
      return storedLanguage
    }
    
    // First-time visitor: always start with Italian as per requirements
    // This ensures Italian default overrides browser preferences initially
    const initialLanguage = DEFAULT_LANGUAGE
    
    // Save the initial choice to localStorage
    languagePersistence.save(initialLanguage)
    
    return initialLanguage
  },

  /**
   * Check if this is a first-time visitor (no stored language preference)
   * @returns True if first-time visitor
   */
  isFirstTimeVisitor: (): boolean => {
    return languagePersistence.load() === null
  }
}

/**
 * Utility function to validate language code
 * @param language - Language code to validate
 * @returns True if language is supported
 */
export const isValidLanguage = (language: string): language is LanguageCode => {
  return SUPPORTED_LANGUAGES.includes(language as LanguageCode)
}

/**
 * Utility function to get fallback language
 * @param currentLanguage - Current language
 * @returns Fallback language (English if current is Italian, Italian if current is English)
 */
export const getFallbackLanguage = (currentLanguage: LanguageCode): LanguageCode => {
  return currentLanguage === 'it' ? 'en' : 'it'
}

export default {
  languagePersistence,
  browserLanguageDetection,
  languageInitialization,
  isValidLanguage,
  getFallbackLanguage
}
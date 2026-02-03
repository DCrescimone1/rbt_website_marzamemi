'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { 
  LanguageContextType, 
  LanguageProviderProps, 
  LanguageCode, 
  TranslationParams 
} from '../translations/types'
import { translations, SUPPORTED_LANGUAGES } from '../translations'
import { languageInitialization, languagePersistence, isValidLanguage } from '../utils/language-persistence'
import { 
  getNestedValue, 
  interpolateParams, 
  getTranslationWithFallback,
  logMissingTranslation,
  logTranslationError 
} from '../utils/translation-utils'

/**
 * Language Context for managing application language state
 * Provides language switching, translation functions, and persistence
 */
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

/**
 * Custom hook to access the Language Context
 * Throws error if used outside of LanguageProvider
 */
export const useLanguageContext = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider')
  }
  return context
}



/**
 * Language Provider component that manages language state and provides translation functionality
 * Implements Italian as default language with localStorage persistence and browser detection
 */
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ 
  children, 
  defaultLanguage 
}) => {
  // Initialize with the proper language using our utility functions
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    // Use utility function to get initial language with proper priority handling
    return languageInitialization.getInitialLanguage()
  })
  const [isInitialized, setIsInitialized] = useState(false)

  /**
   * Initialize language on component mount
   * Uses language initialization utilities for proper priority handling
   */
  useEffect(() => {
    if (isInitialized) return

    // Get the initial language using our utility function
    // This handles: localStorage > Italian default (overriding browser preferences initially)
    const initialLanguage = languageInitialization.getInitialLanguage()
    setLanguageState(initialLanguage)
    setIsInitialized(true)
  }, [isInitialized])

  /**
   * Change language and persist preference
   */
  const setLanguage = useCallback((newLanguage: LanguageCode): void => {
    if (!isValidLanguage(newLanguage)) {
      console.warn(`Unsupported language: ${newLanguage}`)
      return
    }
    
    setLanguageState(newLanguage)
    languagePersistence.save(newLanguage)
  }, [])

  /**
   * Translation function with parameter interpolation and fallback mechanism
   * Uses enhanced utilities for better error handling and development warnings
   */
  const t = useCallback((key: string, params?: TranslationParams): string => {
    try {
      return getTranslationWithFallback(
        translations[language],
        translations.en,
        key,
        params,
        language
      )
    } catch (error) {
      logTranslationError(key, error as Error, `LanguageContext.t`)
      return key
    }
  }, [language])

  /**
   * Utility properties for language checking
   */
  const isItalian = language === 'it'
  const isEnglish = language === 'en'

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t,
    isItalian,
    isEnglish
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export default LanguageProvider
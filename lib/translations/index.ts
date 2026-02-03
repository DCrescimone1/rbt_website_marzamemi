/**
 * Translation system entry point
 * Exports all translation data and utilities
 */

export { itTranslations } from './it'
export { enTranslations } from './en'
export type {
  TranslationData,
  LanguageCode,
  TranslationFunction,
  LanguageContextType,
  LanguageProviderProps,
  UseTranslationReturn,
  TranslationParams,
  TranslationKey,
  TranslationFile,
  BrowserLanguageDetection,
  LanguagePersistence
} from './types'

import { itTranslations } from './it'
import { enTranslations } from './en'
import type { LanguageCode, TranslationData } from './types'

/**
 * All available translations organized by language code
 */
export const translations: Record<LanguageCode, TranslationData> = {
  it: itTranslations,
  en: enTranslations
}

/**
 * Default language for the application
 */
export const DEFAULT_LANGUAGE: LanguageCode = 'it'

/**
 * Supported language codes
 */
export const SUPPORTED_LANGUAGES: LanguageCode[] = ['it', 'en']

/**
 * Language display names for UI
 */
export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  it: 'Italiano',
  en: 'English'
}

/**
 * Language codes for UI display
 */
export const LANGUAGE_CODES: Record<LanguageCode, string> = {
  it: 'IT',
  en: 'EN'
}
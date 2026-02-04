/**
 * Translation data structure types for the SEAcily villas Casa Vacanze website
 * Provides comprehensive TypeScript interfaces for all translatable content
 */

export interface TranslationData {
  metadata: {
    title: string
    description: string
    keywords: string
    openGraph: {
      title: string
      description: string
      siteName: string
    }
    twitter: {
      title: string
      description: string
    }
  }
  navigation: {
    home: string
    property: string
    gallery: string
    booking: string
    location: string
    contact: string
    bookNow: string
  }
  footer: {
    brand: {
      title: string
      description: string
    }
    navigation: {
      title: string
      home: string
      property: string
      gallery: string
      booking: string
      contact: string
    }
    information: {
      title: string
      terms: string
      privacy: string
      cancellation: string
      faqs: string
      support: string
    }
    contact: {
      title: string
      email: string
      phone: string
      social: {
        instagram: string
        facebook: string
        whatsapp: string
      }
    }
    copyright: string
    tagline: string
  }
  hero: {
    title: string
    subtitle: string
    bookNow: string
    description: string
    scrollText: string
    revealText: string
  }
  property: {
    sectionTitle: string
    locationTitle: string
    description: string
    detailedDescription: string
    amenitiesTitle: string
    amenities: {
      bedrooms: { title: string; description: string }
      kitchen: { title: string; description: string }
      pool: { title: string; description: string }
      terrace: { title: string; description: string }
      entertainment: { title: string; description: string }
      wellness: { title: string; description: string }
    }
    stats: {
      bedrooms: string
      bathrooms: string
      area: string
    }
  }
  gallery: {
    title: string
    subtitle: string
  }
  booking: {
    title: string
    subtitle: string
    findDatesTitle: string
    checkIn: string
    checkOut: string
    adults: string
    children: string
    pets: string
    checkAvailability: string
    proceedBooking: string
    checking: string
    selectDatesError: string
    availabilityError: string
    scrapingError: string
    priceComparison: string
    bestPrice: string
    view: string
    platforms: {
      direct: string
    }
    calendar: {
      weekdays: {
        sun: string
        mon: string
        tue: string
        wed: string
        thu: string
        fri: string
        sat: string
      }
      legend: {
        selected: string
        booked: string
      }
      loadingError: string
    }
    properties: {
      villaZefiro: {
        name: string
        size: string
        rooms: string
      }
      villaI2Mari: {
        name: string
        size: string
        rooms: string
      }
    }
  }
  contact: {
    title: string
    subtitle: string
    connectTitle: string
    email: string
    phone: string
    whatsapp: string
    whatsappText: string
    followUs: string
    form: {
      name: string
      email: string
      phone: string
      message: string
      send: string
      sending: string
      sent: string
      error: string
    }
  }
  location: {
    title: string
    subtitle: string
    address: {
      label: string
      value: string
    }
    coordinates: {
      label: string
      value: string
    }
    nearby: {
      label: string
      value: string
    }
    gettingHere: {
      title: string
      items: string[]
    }
    whatsNearby: {
      title: string
      items: string[]
    }
  }
  whatsapp: {
    defaultMessage: string
  }
  chat: {
    tooltip: string
    header: {
      title: string
      subtitle: string
    }
    welcome: {
      greeting: string
      question: string
    }
    input: {
      placeholder: string
      send: string
    }
    aria: {
      openChat: string
      closeChat: string
      sendMessage: string
    }
  }
  common: {
    loading: string
    error: string
    success: string
    close: string
    open: string
  }
  validation: {
    required: string
    invalidDate: string
    pastDate: string
    invalidDateRange: string
    minGuests: string
    maxGuests: string
    invalidEmail: string
    invalidPhone: string
  }
}

/**
 * Language codes supported by the application
 */
export type LanguageCode = 'it' | 'en'

/**
 * Translation function type with parameter interpolation support
 */
export type TranslationFunction = (key: string, params?: Record<string, string | number>) => string

/**
 * Language context interface for React Context
 */
export interface LanguageContextType {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: TranslationFunction
  isItalian: boolean
  isEnglish: boolean
}

/**
 * Language provider props interface
 */
export interface LanguageProviderProps {
  children: React.ReactNode
  defaultLanguage?: LanguageCode
}

/**
 * Translation hook return type
 */
export interface UseTranslationReturn {
  t: TranslationFunction
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  isItalian: boolean
  isEnglish: boolean
}

/**
 * Translation parameter interpolation type
 */
export interface TranslationParams {
  [key: string]: string | number
}

/**
 * Nested translation key type for type safety
 * Generates dot-notation paths for nested objects
 */
export type TranslationKey = 
  | `metadata.${keyof TranslationData['metadata']}`
  | `metadata.openGraph.${keyof TranslationData['metadata']['openGraph']}`
  | `metadata.twitter.${keyof TranslationData['metadata']['twitter']}`
  | `navigation.${keyof TranslationData['navigation']}`
  | `footer.${keyof TranslationData['footer']}`
  | `footer.brand.${keyof TranslationData['footer']['brand']}`
  | `footer.navigation.${keyof TranslationData['footer']['navigation']}`
  | `footer.information.${keyof TranslationData['footer']['information']}`
  | `footer.contact.${keyof TranslationData['footer']['contact']}`
  | `footer.contact.social.${keyof TranslationData['footer']['contact']['social']}`
  | `hero.${keyof TranslationData['hero']}`
  | `property.${keyof TranslationData['property']}`
  | `property.amenities.${keyof TranslationData['property']['amenities']}.${keyof TranslationData['property']['amenities']['bedrooms']}`
  | `property.stats.${keyof TranslationData['property']['stats']}`
  | `gallery.${keyof TranslationData['gallery']}`
  | `booking.${keyof TranslationData['booking']}`
  | `contact.${keyof TranslationData['contact']}`
  | `contact.form.${keyof TranslationData['contact']['form']}`
  | `location.${keyof TranslationData['location']}`
  | `location.address.${keyof TranslationData['location']['address']}`
  | `location.coordinates.${keyof TranslationData['location']['coordinates']}`
  | `location.nearby.${keyof TranslationData['location']['nearby']}`
  | `location.gettingHere.${keyof TranslationData['location']['gettingHere']}`
  | `location.whatsNearby.${keyof TranslationData['location']['whatsNearby']}`
  | `whatsapp.${keyof TranslationData['whatsapp']}`
  | `chat.${keyof TranslationData['chat']}`
  | `chat.header.${keyof TranslationData['chat']['header']}`
  | `chat.welcome.${keyof TranslationData['chat']['welcome']}`
  | `chat.input.${keyof TranslationData['chat']['input']}`
  | `chat.aria.${keyof TranslationData['chat']['aria']}`
  | `common.${keyof TranslationData['common']}`

/**
 * Translation file structure interface
 */
export interface TranslationFile {
  [key: string]: TranslationData
}

/**
 * Browser language detection result
 */
export interface BrowserLanguageDetection {
  detected: LanguageCode | null
  supported: boolean
}

/**
 * Language persistence interface for localStorage
 */
export interface LanguagePersistence {
  save: (language: LanguageCode) => void
  load: () => LanguageCode | null
  clear: () => void
}
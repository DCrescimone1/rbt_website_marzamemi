"use client"

import { Globe } from "lucide-react"
import { useTranslation } from "../lib/hooks/useTranslation"

interface LanguageSwitcherProps {
  isScrolled: boolean
  isMobile?: boolean
  className?: string
}

export default function LanguageSwitcher({ isScrolled, isMobile = false, className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useTranslation()
  
  // Convert internal language codes to display format
  const selectedLanguage = language.toUpperCase() as "IT" | "EN"

  const languages = [
    { code: "IT", label: "Italiano", value: "it" },
    { code: "EN", label: "English", value: "en" },
  ] as const

  const handleLanguageChange = (langCode: "IT" | "EN") => {
    const langValue = langCode === "IT" ? "it" : "en"
    setLanguage(langValue as "it" | "en")
  }

  if (isMobile) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 ${className || ""}`}>
        <Globe 
          size={16} 
          className={`${isScrolled ? "text-foreground" : "text-white"} transition-colors duration-200`} 
          aria-hidden="true"
        />
        <div 
          className="flex gap-1" 
          role="group" 
          aria-label="Language selection"
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
              e.preventDefault()
              const currentIndex = languages.findIndex(lang => lang.code === selectedLanguage)
              const nextIndex = e.key === 'ArrowRight' 
                ? (currentIndex + 1) % languages.length
                : (currentIndex - 1 + languages.length) % languages.length
              handleLanguageChange(languages[nextIndex].code)
            }
          }}
        >
          {languages.map((lang, index) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105 ${
                selectedLanguage === lang.code
                  ? isScrolled
                    ? "bg-primary text-white focus:ring-primary shadow-md scale-105"
                    : "bg-white/20 text-white backdrop-blur-sm focus:ring-white/50 shadow-lg scale-105"
                  : isScrolled
                    ? "text-muted-foreground hover:bg-muted focus:ring-primary hover:shadow-sm"
                    : "text-white/70 hover:bg-white/10 focus:ring-white/50 hover:shadow-sm"
              }`}
              aria-label={`Switch to ${lang.label}`}
              aria-pressed={selectedLanguage === lang.code}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleLanguageChange(lang.code)
                }
              }}
            >
              <span className="relative">
                {lang.code}
                {selectedLanguage === lang.code && (
                  <span 
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-current rounded-full transition-all duration-200"
                    aria-hidden="true"
                  />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-sm border transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md ${className || ""}`}>
      <Globe 
        size={14} 
        className={`${isScrolled ? "text-muted-foreground" : "text-white/80"} transition-colors duration-200`}
        aria-hidden="true"
      />
      <div 
        className="flex gap-0.5" 
        role="group" 
        aria-label="Language selection"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault()
            const currentIndex = languages.findIndex(lang => lang.code === selectedLanguage)
            const nextIndex = e.key === 'ArrowRight' 
              ? (currentIndex + 1) % languages.length
              : (currentIndex - 1 + languages.length) % languages.length
            handleLanguageChange(languages[nextIndex].code)
          }
        }}
      >
        {languages.map((lang, index) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`px-2 py-0.5 text-xs font-medium rounded transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-1 hover:scale-110 ${
              selectedLanguage === lang.code
                ? isScrolled
                  ? "bg-primary text-white focus:ring-primary shadow-md scale-110"
                  : "bg-white/20 text-white backdrop-blur-sm focus:ring-white/50 shadow-lg scale-110"
                : isScrolled
                  ? "text-muted-foreground hover:bg-muted focus:ring-primary hover:shadow-sm"
                  : "text-white/70 hover:bg-white/10 focus:ring-white/50 hover:shadow-sm"
            }`}
            aria-label={`Switch to ${lang.label}. Currently ${selectedLanguage === lang.code ? 'selected' : 'not selected'}`}
            aria-pressed={selectedLanguage === lang.code}
            aria-current={selectedLanguage === lang.code ? 'true' : 'false'}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleLanguageChange(lang.code)
              }
            }}
          >
            <span className="relative">
              {lang.code}
              {selectedLanguage === lang.code && (
                <span 
                  className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-current rounded-full transition-all duration-200 animate-pulse"
                  aria-hidden="true"
                />
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

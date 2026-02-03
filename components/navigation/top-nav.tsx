"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import LanguageSwitcher from "@/components/language-switcher"
import { useTranslation } from "@/lib/hooks/useTranslation"

interface NavigationProps {
  isScrolled: boolean
}

export default function Navigation({ isScrolled }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t } = useTranslation()

  const navItems = [
    { label: t('navigation.home'), href: "#hero" },
    { label: t('navigation.property'), href: "#property" },
    { label: t('navigation.gallery'), href: "#gallery" },
    { label: t('navigation.booking'), href: "#booking" },
    { label: t('navigation.location'), href: "#location" },
    { label: t('navigation.contact'), href: "#contact" },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-primary/90 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex items-center justify-between h-full">
          <Link href="/" className="hidden md:flex items-center gap-2 z-50 flex-shrink-0 group">
            <div
              className={`${isScrolled ? "bg-primary" : "bg-white/20"} text-white backdrop-blur-sm px-3 md:px-4 py-2 md:py-2.5 rounded-sm transition-all group-hover:shadow-lg ${isScrolled ? "group-hover:bg-primary/90" : "group-hover:bg-white/30"}`}
            >
              <h1 className="font-serif text-sm md:text-base font-bold tracking-wider">ACQUAMARINA</h1>
            </div>
          </Link>

          <Link href="#booking" className="md:hidden flex-shrink-0">
            <Button
              className={`${
                isScrolled ? "bg-primary hover:bg-primary/90" : "bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              } text-white px-3 py-2 rounded-sm text-xs font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95`}
            >
              {t('navigation.bookNow')}
            </Button>
          </Link>

          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`px-3 lg:px-4 py-2 text-xs lg:text-sm tracking-wide transition-all duration-200 hover:scale-105 ${
                    isScrolled ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"
                  }`}
                >
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="lg:hidden">{item.label.substring(0, 3)}</span>
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <Link href="#booking" className="hidden md:block">
              <Button
                className={`${
                  isScrolled ? "bg-primary hover:bg-primary/90" : "bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                } text-white px-3 md:px-6 py-2 rounded-sm text-xs md:text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95`}
              >
                {t('navigation.bookNow')}
              </Button>
            </Link>
            <LanguageSwitcher isScrolled={isScrolled} />
            <button
              className={`md:hidden p-2 rounded transition-all duration-200 flex-shrink-0 hover:scale-110 ${
                isScrolled ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-2 pb-3 border-t border-white/10 pt-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-xs tracking-wide transition-colors ${isScrolled ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"}`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

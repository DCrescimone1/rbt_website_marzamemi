"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "@/lib/hooks/useTranslation"

export default function Footer() {
  const { t, utils } = useTranslation()
  const [currentYear, setCurrentYear] = useState<number | null>(null)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 mb-12 md:mb-16">
          {/* Brand */}
          <div className="hidden md:block">
            <h3 className="font-serif text-xl md:text-2xl font-bold mb-3 md:mb-4">{t('footer.brand.title')}</h3>
            <p className="text-primary-foreground/70 text-xs md:text-sm leading-relaxed">
              {t('footer.brand.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-xs md:text-sm uppercase tracking-wide mb-3 md:mb-4 text-primary-foreground">
              {t('footer.navigation.title')}
            </h4>
            <ul className="space-y-2 text-xs md:text-sm">
              {[
                { label: t('footer.navigation.home'), href: "#hero" },
                { label: t('footer.navigation.property'), href: "#property" },
                { label: t('footer.navigation.gallery'), href: "#gallery" },
                { label: t('footer.navigation.booking'), href: "#booking" },
                { label: t('footer.navigation.contact'), href: "#contact" }
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold text-xs md:text-sm uppercase tracking-wide mb-3 md:mb-4 text-primary-foreground">
              {t('footer.information.title')}
            </h4>
            <ul className="space-y-2 text-xs md:text-sm">
              {[
                { label: t('footer.information.terms'), href: "#" },
                { label: t('footer.information.privacy'), href: "#" },
                { label: t('footer.information.cancellation'), href: "#" },
                { label: t('footer.information.faqs'), href: "#" },
                { label: t('footer.information.support'), href: "#" }
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="hidden md:block">
            <h4 className="font-semibold text-xs md:text-sm uppercase tracking-wide mb-3 md:mb-4 text-primary-foreground">
              {t('footer.contact.title')}
            </h4>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-sm">
              <li>
                <a
                  href={`mailto:${t('footer.contact.email')}`}
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {t('footer.contact.email')}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${t('footer.contact.phone')}`}
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {t('footer.contact.phone')}
                </a>
              </li>
              <li className="pt-1 md:pt-2">
                <div className="flex gap-3 md:gap-4">
                  {[
                    { label: t('footer.contact.social.instagram'), href: "#" },
                    { label: t('footer.contact.social.facebook'), href: "#" },
                    { label: t('footer.contact.social.whatsapp'), href: utils.whatsapp.getDefaultUrl() }
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      className="text-primary-foreground/70 hover:text-primary-foreground hover:scale-110 transition-all duration-200 text-xs hover:underline"
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4 text-xs text-primary-foreground/60">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <p>&copy; {currentYear ?? ""} {t('footer.copyright')}</p>
              <div className="flex gap-4 text-xs">
                <span>CIN: IT089014B4BWIJK4YB</span>
                <span>CIR: 19089014B457455</span>
              </div>
            </div>
            <p className="hidden sm:block">{t('footer.tagline')}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

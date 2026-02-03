"use client"

import { useState, useEffect } from "react"
import HeroSection from "@/components/sections/hero-section"
import PropertyDescriptionSection from "@/components/sections/property-description"
import GallerySection from "@/components/sections/gallery-section"
import BookingSection from "@/components/sections/booking-section"
import LocationSection from "@/components/sections/location-section"
import ContactSection from "@/components/sections/contact-section"
import Footer from "@/components/footer"
import Navigation from "@/components/navigation/top-nav"
import FloatingLogoButton from "@/components/floating-logo-button"
import WaveSeparator from "@/components/wave-separator"
import FooterSeparator from "@/components/footer-separator"

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <main className="w-full min-h-screen overflow-x-hidden max-w-full">
      <Navigation isScrolled={isScrolled} />

      <FloatingLogoButton />

      <div id="hero">
        <HeroSection />
      </div>

      <section id="property">
        <PropertyDescriptionSection />
      </section>

      <section id="gallery">
        <GallerySection />
      </section>

      <section id="booking">
        <BookingSection />
      </section>

      <section id="location">
        <LocationSection />
      </section>

      <WaveSeparator />

      <div id="contact">
        <ContactSection />
      </div>

      <FooterSeparator />

      <Footer />
    </main>
  )
}

import type React from "react"
import type { Metadata, Viewport } from "next"
import { Playfair_Display, Lora } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/lib/contexts"
import { DynamicMetadata } from "@/components/dynamic-metadata"

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "700", "900"],
})

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 5.0,
}

export const metadata: Metadata = {
  metadataBase: new URL((process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")),
  title: "Acquamarina Marzamemi | Casa Vacanze con 2 Piscine e Parcheggio Privato",
  description:
    "A pochi passi dalla spiaggia in una residenza privata a Marzamemi. Casa vacanze con 1 camera da letto (max 4 ospiti), cucina attrezzata, giardino privato, WiFi veloce, 2 piscine (idromassaggio e a sfioro) e parcheggio privato.",
  keywords: [
    "Acquamarina",
    "Marzamemi",
    "casa vacanze",
    "appartamento",
    "1 camera da letto",
    "2 piscine",
    "parcheggio privato",
    "vicino alla spiaggia",
    "Sicilia",
    "WiFi",
  ],
  openGraph: {
    title: "Acquamarina Marzamemi – Casa Vacanze con 2 Piscine",
    description: "Appartamento a Marzamemi con giardino, cucina, WiFi e parcheggio. A 400m dal porto, vicino alla spiaggia.",
    siteName: "Acquamarina Marzamemi",
    type: "website",
    images: [
      {
        url: "/favicon_io/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Acquamarina Marzamemi Icon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Acquamarina Marzamemi – Casa Vacanze",
    description: "1 camera da letto, 2 piscine, vicino alla spiaggia.",
    images: ["/favicon_io/android-chrome-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon.ico", type: "image/x-icon" },
    ],
    apple: "/favicon_io/apple-touch-icon.png",
    shortcut: "/favicon_io/favicon.ico",
  },
  manifest: "/favicon_io/site.webmanifest",
  alternates: {
    canonical: "/",
    languages: {
      it: "/",
      en: "/",
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <head>
        <meta charSet="UTF-8" />
        <meta name="theme-color" content="#25354a" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon_io/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/favicon_io/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon_io/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LodgingBusiness",
              name: "Acquamarina Marzamemi",
              url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
              image: [
                "/logo.webp"
              ],
              logo: "/logo.webp",
              telephone: "+39 3501159152",
              email: "acquamarina.marzamemi@gmail.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Contrada Calafarina SNC",
                addressLocality: "Marzamemi",
                addressRegion: "SR",
                postalCode: "96018",
                addressCountry: "IT"
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 36.723632,
                longitude: 15.117694
              },
              amenityFeature: [
                { "@type": "LocationFeatureSpecification", name: "Private Parking", value: true },
                { "@type": "LocationFeatureSpecification", name: "WiFi", value: true },
                { "@type": "LocationFeatureSpecification", name: "2 Pools (Infinity & Jacuzzi)", value: true },
                { "@type": "LocationFeatureSpecification", name: "Pets Allowed", value: true }
              ],
              checkinTime: "15:00",
              checkoutTime: "11:00",
            }),
          }}
        />
      </head>
      <body
        className={`${playfairDisplay.variable} ${lora.variable} font-sans antialiased bg-background text-foreground overflow-x-hidden`}
      >
        <LanguageProvider>
          <DynamicMetadata />
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}

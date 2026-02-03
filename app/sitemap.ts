import type { MetadataRoute } from 'next'

const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/booking-success`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/booking-confirmation`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/payment`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]
  return urls
}

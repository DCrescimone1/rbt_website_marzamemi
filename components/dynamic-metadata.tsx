'use client'

import { useEffect } from 'react'
import { useTranslation } from '../lib/hooks'

/**
 * Dynamic Metadata Component
 * Updates page metadata and HTML lang attribute based on selected language
 */
export function DynamicMetadata() {
  const { t, language } = useTranslation()

  useEffect(() => {
    // Update document title
    document.title = t('metadata.title')

    // Update HTML lang attribute
    document.documentElement.lang = language

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', t('metadata.description'))
    } else {
      const newMetaDescription = document.createElement('meta')
      newMetaDescription.name = 'description'
      newMetaDescription.content = t('metadata.description')
      document.head.appendChild(newMetaDescription)
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]')
    if (metaKeywords) {
      metaKeywords.setAttribute('content', t('metadata.keywords'))
    } else {
      const newMetaKeywords = document.createElement('meta')
      newMetaKeywords.name = 'keywords'
      newMetaKeywords.content = t('metadata.keywords')
      document.head.appendChild(newMetaKeywords)
    }

    // Update Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', t('metadata.openGraph.title'))
    } else {
      const newOgTitle = document.createElement('meta')
      newOgTitle.setAttribute('property', 'og:title')
      newOgTitle.content = t('metadata.openGraph.title')
      document.head.appendChild(newOgTitle)
    }

    // Update Open Graph description
    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', t('metadata.openGraph.description'))
    } else {
      const newOgDescription = document.createElement('meta')
      newOgDescription.setAttribute('property', 'og:description')
      newOgDescription.content = t('metadata.openGraph.description')
      document.head.appendChild(newOgDescription)
    }

    // Update Open Graph site name
    const ogSiteName = document.querySelector('meta[property="og:site_name"]')
    if (ogSiteName) {
      ogSiteName.setAttribute('content', t('metadata.openGraph.siteName'))
    } else {
      const newOgSiteName = document.createElement('meta')
      newOgSiteName.setAttribute('property', 'og:site_name')
      newOgSiteName.content = t('metadata.openGraph.siteName')
      document.head.appendChild(newOgSiteName)
    }

    // Update Twitter title
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (twitterTitle) {
      twitterTitle.setAttribute('content', t('metadata.twitter.title'))
    } else {
      const newTwitterTitle = document.createElement('meta')
      newTwitterTitle.name = 'twitter:title'
      newTwitterTitle.content = t('metadata.twitter.title')
      document.head.appendChild(newTwitterTitle)
    }

    // Update Twitter description
    const twitterDescription = document.querySelector('meta[name="twitter:description"]')
    if (twitterDescription) {
      twitterDescription.setAttribute('content', t('metadata.twitter.description'))
    } else {
      const newTwitterDescription = document.createElement('meta')
      newTwitterDescription.name = 'twitter:description'
      newTwitterDescription.content = t('metadata.twitter.description')
      document.head.appendChild(newTwitterDescription)
    }
  }, [t, language])

  return null // This component doesn't render anything visible
}
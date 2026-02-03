"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Phone, MessageCircle, ArrowRight, CheckCircle } from "lucide-react"
import emailjs from "@emailjs/browser"
import { useTranslation } from "@/lib/hooks/useTranslation"

export default function ContactSection() {
  const { t, utils } = useTranslation()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Integrate with marzapage contact handling
    setLoading(true)
    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string

      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          reply_to: formData.email,
          phone: formData.phone,
          message: formData.message,
        },
        { publicKey }
      )

      setSubmitted(true)
      setFormData({ name: "", email: "", phone: "", message: "" })
      setTimeout(() => {
        setSubmitted(false)
      }, 3000)
    } catch (err) {
      alert(t('contact.form.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 md:py-32 pb-0 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-32">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-5xl md:text-6xl font-bold">{t('contact.title')}</h2>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-3xl font-bold mb-8">{t('contact.connectTitle')}</h3>

            <div className="space-y-8">
              {/* Email */}
              <div className="flex gap-4 items-start">
                <div className="shrink-0 mt-1">
                  <Mail size={24} className="text-secondary" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide text-primary-foreground/80 mb-2 font-semibold">{t('contact.email')}</p>
                  <a href="mailto:Acquamarina.marzamemi@gmail.com" className="text-lg hover:text-secondary transition-colors">
                    acquamarina.marzamemi@gmail.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4 items-start">
                <div className="shrink-0 mt-1">
                  <Phone size={24} className="text-secondary" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide text-primary-foreground/80 mb-2 font-semibold">{t('contact.phone')}</p>
                  <a href="tel:+393501159152" className="text-lg hover:text-secondary transition-colors">
                    +39 3501159152
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex gap-4 items-start">
                <div className="shrink-0 mt-1">
                  <MessageCircle size={24} className="text-secondary" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide text-primary-foreground/80 mb-2 font-semibold">
                    {t('contact.whatsapp')}
                  </p>
                  <a href={utils.whatsapp.getDefaultUrl()} className="text-lg hover:text-secondary transition-colors">
                    {t('contact.whatsappText')}
                  </a>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-12 pt-8 border-t border-primary-foreground/20">
              <p className="text-sm uppercase tracking-wide text-primary-foreground/80 mb-4 font-semibold">{t('contact.followUs')}</p>
              <div className="flex gap-4">
                {["Instagram", "Facebook"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="text-primary-foreground hover:text-secondary transition-colors hover:underline"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              placeholder={t('contact.form.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-12"
            />

            <Input
              type="email"
              placeholder={t('contact.form.email')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-12"
            />

            <Input
              type="tel"
              placeholder={t('contact.form.phone')}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-12"
            />

            <textarea
              placeholder={t('contact.form.message')}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={5}
              className="w-full px-4 py-3 rounded-md bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 transition-all"
            />

            <Button
              type="submit"
              disabled={loading || submitted}
              className="w-full bg-primary-foreground hover:bg-primary-foreground/90 text-primary font-semibold py-3 rounded-sm transition-all disabled:opacity-75"
            >
              {loading ? (
                <>{t('contact.form.sending')}</>
              ) : submitted ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t('contact.form.sent')}
                </>
              ) : (
                <>
                  {t('contact.form.send')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"
import { useTranslation } from "@/lib/hooks/useTranslation"

const content = {
  en: {
    title: "Privacy Policy",
    updated: "Last updated: May 2025",
    sections: [
      {
        heading: "Data Controller",
        body: "SEAcily villas – Borgo84, Contrada Calafarina SNC, Marzamemi (SR) 96018, Italy. Email: borgo84reservation@gmail.com",
      },
      {
        heading: "Data We Collect",
        body: "When you use the contact form on this website we collect your name and, optionally, your email address and/or phone number. When you make a booking we also collect the information required to process that booking.",
      },
      {
        heading: "Purpose & Legal Basis",
        body: "We use your data solely to respond to your enquiries and to manage your booking. The legal basis is your consent (contact form) and the performance of a contract (bookings). We do not use your data for marketing without your explicit consent.",
      },
      {
        heading: "Data Retention",
        body: "Enquiry data is kept for up to 12 months. Booking data is retained for the period required by Italian tax and accounting regulations.",
      },
      {
        heading: "Your Rights",
        body: "Under the GDPR you have the right to access, rectify, erase, restrict, and port your personal data, and to object to its processing. To exercise any of these rights please write to borgo84reservation@gmail.com.",
      },
      {
        heading: "Third Parties",
        body: "We use EmailJS to deliver contact form submissions. No data is sold or shared with third parties for commercial purposes.",
      },
      {
        heading: "Cookies",
        body: "This website does not use tracking or advertising cookies. Only strictly necessary technical cookies may be set by the hosting infrastructure.",
      },
    ],
  },
  it: {
    title: "Informativa sulla Privacy",
    updated: "Ultimo aggiornamento: maggio 2025",
    sections: [
      {
        heading: "Titolare del Trattamento",
        body: "SEAcily villas – Borgo84, Contrada Calafarina SNC, Marzamemi (SR) 96018, Italia. Email: borgo84reservation@gmail.com",
      },
      {
        heading: "Dati Raccolti",
        body: "Quando utilizzi il modulo di contatto raccogliamo il tuo nome e, facoltativamente, il tuo indirizzo email e/o numero di telefono. In caso di prenotazione raccogliamo i dati necessari per gestirla.",
      },
      {
        heading: "Finalità e Base Giuridica",
        body: "I tuoi dati vengono utilizzati esclusivamente per rispondere alle tue richieste e gestire la prenotazione. La base giuridica è il consenso (modulo di contatto) e l'esecuzione di un contratto (prenotazioni). Non utilizziamo i tuoi dati per scopi di marketing senza consenso esplicito.",
      },
      {
        heading: "Conservazione",
        body: "I dati delle richieste vengono conservati per un massimo di 12 mesi. I dati delle prenotazioni sono conservati per il periodo richiesto dalla normativa fiscale e contabile italiana.",
      },
      {
        heading: "I Tuoi Diritti",
        body: "Ai sensi del GDPR hai il diritto di accedere, rettificare, cancellare, limitare e portare i tuoi dati personali, nonché di opporti al loro trattamento. Per esercitare tali diritti scrivi a borgo84reservation@gmail.com.",
      },
      {
        heading: "Terze Parti",
        body: "Utilizziamo EmailJS per la consegna dei messaggi del modulo di contatto. Nessun dato viene venduto o condiviso con terze parti a fini commerciali.",
      },
      {
        heading: "Cookie",
        body: "Questo sito non utilizza cookie di tracciamento o pubblicitari. Potrebbero essere impostati solo cookie tecnici strettamente necessari dall'infrastruttura di hosting.",
      },
    ],
  },
}

export default function PrivacyPage() {
  const { language } = useTranslation()
  const lang = language === "it" ? "it" : "en"
  const c = content[lang]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        <Link
          href="/"
          className="text-sm text-foreground/50 hover:text-foreground transition-colors mb-10 inline-block"
        >
          ← {lang === "it" ? "Torna alla home" : "Back to home"}
        </Link>

        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">{c.title}</h1>
        <p className="text-sm text-foreground/50 mb-12">{c.updated}</p>

        <div className="space-y-10">
          {c.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-semibold text-base mb-2">{s.heading}</h2>
              <p className="text-foreground/70 text-sm leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}

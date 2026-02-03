export default function FooterSeparator() {
  return (
    <div className="relative w-full h-16 bg-primary overflow-hidden">
      {/* Subtle gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary/95 to-primary" />

      {/* Decorative line with dots */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-4xl px-8 flex items-center gap-4">
          {/* Left line */}
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-primary-foreground/20" />

          {/* Center dots */}
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground/30" />
          </div>

          {/* Right line */}
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-primary-foreground/20 to-primary-foreground/20" />
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useTranslation } from "@/lib/hooks/useTranslation"

const villaI2MariImages = [
  { src: "/pictures/villa_i_2_mari/ok%20giardino%20sera-b.webp", alt: "Garden at evening" },
  { src: "/pictures/villa_i_2_mari/ok%20piscina%20alta1.webp", alt: "Pool view" },
  { src: "/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari-%20camera1.webp", alt: "Bedroom" },
  { src: "/pictures/villa_i_2_mari/%20ok%20Villa%20i2mari-cucina.webp", alt: "Kitchen" },
  { src: "/pictures/villa_i_2_mari/ok%20z%20soggiorno2%20%202mari.webp", alt: "Living room" },
  { src: "/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari-%20bagno.webp", alt: "Bathroom" },
  { src: "/pictures/villa_i_2_mari/ok%20drone.webp", alt: "Aerial view" },
  { src: "/pictures/villa_i_2_mari/ok%20piscine%20notte1.webp", alt: "Pool at night" },
  { src: "/pictures/villa_i_2_mari/ok%20giardino1.webp", alt: "Garden" },
  { src: "/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari-dal%20balcone.webp", alt: "Balcony view" },
  { src: "/pictures/villa_i_2_mari/ok%20Borgo84%202.webp", alt: "Borgo84" },
  { src: "/pictures/villa_i_2_mari/ok%20Marzamemi%20cinefest.webp", alt: "Marzamemi Cinefest" },
  { src: "/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari%20TV.webp", alt: "TV room" },
  { src: "/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari-bagno1.webp", alt: "Bathroom 1" },
  { src: "/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari-camera%203.webp", alt: "Bedroom 3" },
  { src: "/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari-camera.webp", alt: "Bedroom 2" },
  { src: "/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari-cameretta1.webp", alt: "Small bedroom 1" },
  { src: "/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari-corridoio1.webp", alt: "Hallway 1" },
  { src: "/pictures/villa_i_2_mari/ok%20Villa%20i2%20mari-corridoio.webp", alt: "Hallway" },
  { src: "/pictures/villa_i_2_mari/ok%20Villa%20i2mari-tavolo%20cucina.webp", alt: "Kitchen table" },
  { src: "/pictures/villa_i_2_mari/ok%20carratois%20pantano.webp", alt: "Carratois Pantano" },
  { src: "/pictures/villa_i_2_mari/ok%20giardino2.webp", alt: "Garden 2" },
  { src: "/pictures/villa_i_2_mari/ok%20isola%20di%20capo%20passero.webp", alt: "Isola di Capo Passero" },
  { src: "/pictures/villa_i_2_mari/ok%20isolotto%20brancati4.webp", alt: "Isolotto Brancati" },
  { src: "/pictures/villa_i_2_mari/ok%20spiaggiacavettone5.webp", alt: "Spiaggia Cavettone" },
  { src: "/pictures/villa_i_2_mari/ok%20villa%20i%202%20mari-cameretta.webp", alt: "Small bedroom" },
  { src: "/pictures/villa_i_2_mari/ok%20z%20area%20fitness+padel.webp", alt: "Fitness and padel area" },
  { src: "/pictures/villa_i_2_mari/ok%20z%20la%20cialoma1.webp", alt: "La Cialoma" },
  { src: "/pictures/villa_i_2_mari/ok%20z%20la%20piazzetta1.webp", alt: "La Piazzetta" },
  { src: "/pictures/villa_i_2_mari/ok%20z%20manifesto%20tonnara2.webp", alt: "Manifesto Tonnara" },
  { src: "/pictures/villa_i_2_mari/ok%20z%20soggiorno3%202%20mari.webp", alt: "Living room 2" },
  { src: "/pictures/villa_i_2_mari/ok%20z%20tonnara.webp", alt: "Tonnara" },
]

const villaZefiroImages = [
  { src: "/pictures/villa_zefiro/ok%20piscina%20alta.webp", alt: "Pool view" },
  { src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20soggiorno.webp", alt: "Living room" },
  { src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20camera.webp", alt: "Bedroom" },
  { src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20terrazza.webp", alt: "Terrace" },
  { src: "/pictures/villa_zefiro/ok%20giardino%20sera-b.webp", alt: "Garden at evening" },
  { src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20bagno.webp", alt: "Bathroom" },
  { src: "/pictures/villa_zefiro/ok%20drone3.webp", alt: "Aerial view" },
  { src: "/pictures/villa_zefiro/ok%20piscine%20notte.webp", alt: "Pool at night" },
  { src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20mansarda.webp", alt: "Attic room" },
  { src: "/pictures/villa_zefiro/ok%20Capo%20Passero%20dalla%20terrazza.webp", alt: "View from terrace" },
  { src: "/pictures/villa_zefiro/ok%20App.17%20bagno%20mansarda.webp", alt: "Attic bathroom" },
  { src: "/pictures/villa_zefiro/ok%20Baiamuri-b.webp", alt: "Baiamuri" },
  { src: "/pictures/villa_zefiro/ok%20Borgo84%201.webp", alt: "Borgo84" },
  { src: "/pictures/villa_zefiro/ok%20Marzamemi%20porto.webp", alt: "Marzamemi port" },
  { src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20bagno%20mansarda.webp", alt: "Attic bathroom 2" },
  { src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20bagno1.webp", alt: "Bathroom 1" },
  { src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20balcone.webp", alt: "Balcony" },
  { src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20camera2.webp", alt: "Bedroom 2" },
  { src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20camera3.webp", alt: "Bedroom 3" },
  { src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20letto%20mansarda1.webp", alt: "Attic bedroom 1" },
  { src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20letto%20mansarda2.webp", alt: "Attic bedroom 2" },
  { src: "/pictures/villa_zefiro/ok%20Villa%20Zefiro%20soggiorno1.webp", alt: "Living room 2" },
  { src: "/pictures/villa_zefiro/ok%20WhatsApp%20Image%202025-10-26%20at%2019.36.13(2).webp", alt: "Villa view" },
  { src: "/pictures/villa_zefiro/ok%20WhatsApp%20Image%202025-10-29%20at%2011.53.10(1).webp", alt: "Villa view 2" },
  { src: "/pictures/villa_zefiro/ok%20piscina%20bassa3.webp", alt: "Pool low angle" },
  { src: "/pictures/villa_zefiro/ok%20piscinabassa4.webp", alt: "Pool low angle 2" },
  { src: "/pictures/villa_zefiro/ok%20spiaggia%20cavettone1.webp", alt: "Spiaggia Cavettone" },
  { src: "/pictures/villa_zefiro/ok%20z%20aperirivo1%20zefiro.webp", alt: "Aperitivo" },
  { src: "/pictures/villa_zefiro/ok%20z%20area%20fitness+padel.webp", alt: "Fitness and padel area" },
  { src: "/pictures/villa_zefiro/ok%20z%20cialoma%20%20.webp", alt: "Cialoma" },
  { src: "/pictures/villa_zefiro/ok%20z%20colazione%20porto1.webp", alt: "Breakfast at port" },
  { src: "/pictures/villa_zefiro/ok%20z%20mansarda%20Zefiro.webp", alt: "Attic Zefiro" },
  { src: "/pictures/villa_zefiro/ok%20z%20padel.webp", alt: "Padel court" },
  { src: "/pictures/villa_zefiro/ok%20z%20particolare1%20zefiro.webp", alt: "Detail" },
  { src: "/pictures/villa_zefiro/ok%20z%20scala2%20zefiro.webp", alt: "Staircase" },
  { src: "/pictures/villa_zefiro/ok%20z%20tonnara1.webp", alt: "Tonnara" },
]

function useAutoCarousel(length: number) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isHovered || length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isHovered, length])

  const goTo = (index: number) => {
    setCurrentIndex(((index % length) + length) % length)
  }

  const next = () => {
    goTo(currentIndex + 1)
  }

  const prev = () => {
    goTo(currentIndex - 1)
  }

  return { currentIndex, isHovered, setIsHovered, next, prev, goTo }
}

type PanelVariant = "zoom" | "static"

export default function HeroDualAlbum() {
  const { t } = useTranslation()

  const left = useAutoCarousel(villaZefiroImages.length)
  const right = useAutoCarousel(villaI2MariImages.length)

  const renderPanel = (
    images: { src: string; alt: string }[],
    state: ReturnType<typeof useAutoCarousel>,
    titleKey: string,
    variant: PanelVariant = "zoom"
  ) => {
    const total = images.length
    const currentImage = images[state.currentIndex]

    // Different image classes based on variant
    const imageClassName = variant === "zoom"
      ? "object-cover scale-[1.04] transition-transform duration-[12000ms] ease-[ease]"
      : "object-contain transition-none"

    return (
      <div
        className="relative overflow-hidden cursor-pointer group rounded-xl"
        onMouseEnter={() => state.setIsHovered(true)}
        onMouseLeave={() => state.setIsHovered(false)}
      >
        <div className="absolute inset-0 bg-black/5">
          <Image
            key={currentImage.src}
            src={currentImage.src}
            alt={currentImage.alt}
            fill
            className={imageClassName}
            sizes="50vw"
            priority
          />
        </div>

        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/75"
        />

        {/* Content block */}
        <div className="absolute inset-x-0 bottom-0 p-10 flex flex-col gap-6">
          <div className="space-y-2">
            <div className="text-xs tracking-[0.2em] uppercase text-primary">
              Villa · Marzamemi
            </div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white font-bold">
              {t(titleKey)}
            </h2>
          </div>

          {/* Thumbnail strip */}
          <div
            className={
              "flex items-end justify-between gap-4 transition-all duration-500 " +
              (state.isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none")
            }
          >
            <div className="flex gap-1.5">
              {images.slice(0, 5).map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    state.goTo(index)
                  }}
                  className={
                    "relative h-12 w-16 md:h-14 md:w-20 rounded-md overflow-hidden border transition-all duration-300 " +
                    (index === state.currentIndex
                      ? "border-primary shadow-lg"
                      : "border-white/20 hover:border-primary/70")
                  }
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              state.next()
            }}
            className="hidden"
            aria-hidden="true"
          />
        </div>

        {/* Image counter */}
        <div className="absolute top-4 right-4 text-xs md:text-sm text-white/80 bg-black/40 px-3 py-1 rounded-full">
          {String(state.currentIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            state.prev()
          }}
          className={
            "absolute top-1/2 -translate-y-1/2 left-4 flex items-center justify-center text-white bg-black/30 border-2 border-white/60 rounded-full h-9 w-9 md:h-10 md:w-10 " +
            "transition-opacity duration-300 hover:bg-black/50 hover:border-white " +
            (state.isHovered ? "opacity-100" : "opacity-0 pointer-events-none")
          }
          aria-label="Previous image"
        >
          <span className="text-2xl leading-none -translate-y-[1px]">‹</span>
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            state.next()
          }}
          className={
            "absolute top-1/2 -translate-y-1/2 right-4 flex items-center justify-center text-white bg-black/30 border-2 border-white/60 rounded-full h-9 w-9 md:h-10 md:w-10 " +
            "transition-opacity duration-300 hover:bg-black/50 hover:border-white " +
            (state.isHovered ? "opacity-100" : "opacity-0 pointer-events-none")
          }
          aria-label="Next image"
        >
          <span className="text-2xl leading-none -translate-y-[1px]">›</span>
        </button>
      </div>
    )
  }

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 px-6 pb-6 h-[92vh] min-h-[600px]">
        {renderPanel(villaZefiroImages, left, "property.villaZefiro.name", "zoom")}
        {renderPanel(villaI2MariImages, right, "property.villaI2Mari.name", "zoom")}
      </div>
    </section>
  )
}

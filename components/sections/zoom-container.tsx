"use client"

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { imageConfigs, layerConfig, zoomContainerConfig } from '@/lib/gsap/config';
import { useTranslation } from '@/lib/hooks/useTranslation';

/**
 * ZoomContainer Component
 * 
 * Renders 12 images across 3 depth layers for the parallax zoom animation.
 * Images are absolutely positioned and animated by GSAP ScrollTrigger.
 * 
 * Animation behavior:
 * - Container is pinned for 150% of viewport height
 * - Images animate from their layer depth (z: 400/600/800) toward viewer (z: 0)
 * - Layer-specific scale values: Layer 1: 2.5, Layer 2: 2, Layer 3: 1.5
 * 
 * Responsive behavior:
 * - Mobile: Uses mobileSize and mobilePosition for better visibility on small screens
 * - Desktop: Uses standard size and position for optimal layout
 * 
 * Error handling:
 * - Logs failed image loads with detailed error information
 * - Animation continues with available images (no interruption)
 * 
 * Requirements: 2.8
 */
export default function ZoomContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useTranslation();

  // Detect mobile viewport on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useGSAP(() => {
    if (!containerRef.current || !headingRef.current) return;

    const container = containerRef.current;
    const heading = headingRef.current;
    
    // Wait for images to load before creating animation
    const images = container.querySelectorAll('img');
    let loadedCount = 0;
    const totalImages = images.length;
    
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        ScrollTrigger.refresh();
      }
    };
    
    images.forEach(img => {
      if (img.complete) {
        checkAllLoaded();
      } else {
        img.addEventListener('load', checkAllLoaded);
      }
    });
    
    // Create ONE timeline with ONE ScrollTrigger for ALL elements
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: '+=150%',
        pin: true,
        pinSpacing: true,
        scrub: 1,
        // markers: true, // Uncomment for debugging
      }
    });

    // Animate Layer 3 images (0 position means all animations start simultaneously)
    tl.fromTo(
      container.querySelectorAll('[data-layer="3"]'),
      {
        opacity: 0.5,
        z: 0,
        scale: 0.8,
      },
      {
        opacity: 1,
        z: 800,
        scale: 1,
        force3D: true,
        ease: 'power1.inOut'
      },
      0
    );

    // Animate Layer 2 images (except one that passes through)
    const layer2Images = Array.from(container.querySelectorAll('[data-layer="2"]'));
    const passThroughLayer2 = layer2Images.filter((_, index) => index === 2); // Villa Zefiro terrazza
    const otherLayer2Images = layer2Images.filter((_, index) => index !== 2);
    
    // Regular Layer 2 images
    tl.fromTo(
      otherLayer2Images,
      {
        opacity: 0.5,
        z: 0,
        scale: 0.8,
      },
      {
        opacity: 1,
        z: 600,
        scale: 1,
        force3D: true,
        ease: 'power1.inOut'
      },
      0
    );
    
    // Layer 2 image that passes through
    tl.fromTo(
      passThroughLayer2,
      {
        opacity: 0.5,
        z: 0,
        scale: 0.8,
      },
      {
        opacity: 0,
        z: -500,
        scale: 2.5,
        force3D: true,
        ease: 'power1.inOut'
      },
      0
    );

    // Animate Layer 1 images (except bottom two which pass through)
    const layer1Images = Array.from(container.querySelectorAll('[data-layer="1"]'));
    const bottomImages = layer1Images.filter((_, index) => index === 1 || index === 2); // piscina alta and camera
    const otherLayer1Images = layer1Images.filter((_, index) => index !== 1 && index !== 2);
    
    // Regular Layer 1 images
    tl.fromTo(
      otherLayer1Images,
      {
        opacity: 0.5,
        z: 0,
        scale: 0.8,
      },
      {
        opacity: 1,
        z: 400,
        scale: 1,
        force3D: true,
        ease: 'power1.inOut'
      },
      0
    );
    
    // Bottom images that pass through the viewer
    tl.fromTo(
      bottomImages,
      {
        opacity: 0.5,
        z: 0,
        scale: 0.8,
      },
      {
        opacity: 0,
        z: -500, // Pass through and behind the viewer
        scale: 2.5,
        force3D: true,
        ease: 'power1.inOut'
      },
      0
    );

    // Animate heading (synchronized with images) - with scale for zoom effect
    tl.fromTo(
      heading,
      {
        opacity: 0.4,
        z: -100,
        scale: 0.4,
      },
      {
        opacity: 1,
        z: 50,
        scale: 0.85,
        force3D: true,
        ease: 'power1.inOut'
      },
      0
    );

    // Cleanup
    return () => {
      tl.kill();
      images.forEach(img => {
        img.removeEventListener('load', checkAllLoaded);
      });
    };
  }, { scope: containerRef, dependencies: [isMobile] });

  return (
    <div 
      ref={containerRef}
      id="zoom-container"
      className="relative w-full h-screen overflow-hidden bg-white px-4 md:px-8"
      style={{ 
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        zIndex: 1
      }}
    >
      {imageConfigs.map((config, index) => {
        // Use mobile size/position if available and on mobile viewport
        const position = isMobile && config.mobilePosition ? config.mobilePosition : config.position;
        const size = isMobile && config.mobileSize ? config.mobileSize : config.size;
        
        // Priority loading for first 4 images (above-fold), lazy for others - Requirement 10.4
        const isPriority = index < 4;
        
        // Image loading error handler - Requirement 2.8
        const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          console.error(`Failed to load image: ${config.src}`);
          console.error('Image error details:', {
            src: config.src,
            layer: config.layer,
            index: index,
            error: e,
          });
          // Animation continues with available images - no need to stop
        };
        
        return (
          <div
            key={`${config.src}-${index}`}
            className="zoom-image absolute"
            data-layer={config.layer}
            style={{
              ...position,
              width: size.width,
              height: size.height,
              willChange: 'transform, opacity',
            }}
          >
            <Image
              src={config.src}
              alt={`Hero animation layer ${config.layer} image ${index + 1}`}
              fill
              className="object-cover rounded-lg"
              sizes={`(max-width: 768px) ${size.width}, ${config.size.width}`}
              quality={90} // Optimized quality for performance - Requirement 10.3
              priority={isPriority} // Priority for above-fold images - Requirement 10.4
              onError={handleImageError}
            />
          </div>
        );
      })}
      
      {/* Heading inside container for shared 3D context */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 px-4 sm:px-6 md:px-8">
        <h1
          ref={headingRef}
          className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-primary tracking-wider drop-shadow-lg text-center leading-tight max-w-5xl"
          style={{
            transformStyle: 'preserve-3d',
            willChange: 'transform, opacity',
          }}
        >
          {t('hero.title')}
        </h1>
      </div>
    </div>
  );
}

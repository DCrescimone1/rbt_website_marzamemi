// NOTE: superseded by hero-dual-album.tsx — kept for reference
"use client"

import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, ScrollSmoother, registerGSAPPlugins } from '@/lib/gsap';
import { scrollSmootherConfig } from '@/lib/gsap/config';
import ZoomContainer from './zoom-container';
import StaticHeroFallback from './hero-section-static';
import { useTranslation } from '@/lib/hooks/useTranslation';

/**
 * HeroSectionGSAP Component
 * 
 * Main container component that orchestrates all GSAP scroll animations.
 * Integrates ScrollSmoother for smooth scrolling throughout the hero section.
 * 
 * Structure:
 * - smooth-wrapper (ScrollSmoother wrapper)
 *   - smooth-content (ScrollSmoother content)
 *     - ZoomContainer (pinned scroll section with 12 images)
 *     - HeadingSection (animated heading)
 *     - ScrollIndicator (bounce animation)
 * 
 * Error Handling:
 * - Falls back to StaticHeroFallback if GSAP plugins fail to load
 * - Logs errors for debugging
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2, 5.3, 5.4, 5.5
 */
export default function HeroSectionGSAP() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const smootherRef = useRef<any>(null);
  const { t } = useTranslation();
  const [pluginsLoaded, setPluginsLoaded] = useState<boolean | null>(null);

  // Register GSAP plugins on mount with error handling
  // Requirements: 1.1, 1.2, 1.3, 1.4
  useEffect(() => {
    try {
      const success = registerGSAPPlugins();
      setPluginsLoaded(success);
      
      if (!success) {
        console.error('GSAP plugins failed to load. Using static hero fallback.');
      }
    } catch (error) {
      console.error('Error during GSAP plugin registration:', error);
      setPluginsLoaded(false);
    }
  }, []);

  useGSAP(() => {
    // Don't initialize animations if plugins failed to load
    if (pluginsLoaded === false) return;

    // Initialize ScrollSmoother if available
    if (ScrollSmoother && typeof ScrollSmoother.create === 'function') {
      try {
        smootherRef.current = ScrollSmoother.create({
          wrapper: '#smooth-wrapper',
          content: '#smooth-content',
          smooth: scrollSmootherConfig.smooth,
          effects: scrollSmootherConfig.effects,
          normalizeScroll: scrollSmootherConfig.normalizeScroll,
        });
        
        console.log('✓ ScrollSmoother initialized successfully');
      } catch (error) {
        console.error('Failed to initialize ScrollSmoother:', error);
        console.log('ℹ Continuing without ScrollSmoother - animations will still work');
      }
    } else {
      console.log('ℹ ScrollSmoother not available - requires GSAP Club membership');
      console.log('ℹ Animations will work without smooth scrolling');
    }

    // Scroll indicator fade-out animation
    if (scrollIndicatorRef.current) {
      try {
        gsap.to(scrollIndicatorRef.current, {
          opacity: 0,
          force3D: true, // Hardware acceleration - Requirement 10.2
          scrollTrigger: {
            start: 'top top',
            end: '+=100vh',
            scrub: true,
          },
        });
      } catch (error) {
        console.error('Failed to create scroll indicator animation:', error);
      }
    }

    // Debounced resize handler to refresh ScrollTrigger calculations - Requirement 7.3
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      // Clear existing timeout
      clearTimeout(resizeTimeout);
      
      // Debounce resize events (wait 150ms after last resize event)
      resizeTimeout = setTimeout(() => {
        console.log('Refreshing ScrollTrigger on resize');
        try {
          ScrollTrigger.refresh();
        } catch (error) {
          console.error('Failed to refresh ScrollTrigger:', error);
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function - Requirements 8.1, 8.2, 8.3, 8.4
    return () => {
      // Clear any pending resize timeout
      clearTimeout(resizeTimeout);
      
      // Remove resize event listener
      window.removeEventListener('resize', handleResize);

      // Kill all ScrollTrigger instances created in this component
      try {
        ScrollTrigger.getAll().forEach(trigger => {
          if (trigger.vars.trigger === wrapperRef.current || 
              wrapperRef.current?.contains(trigger.vars.trigger as HTMLElement)) {
            trigger.kill();
          }
        });
      } catch (error) {
        console.error('Error during ScrollTrigger cleanup:', error);
      }

      // Destroy ScrollSmoother instance on unmount
      if (smootherRef.current) {
        try {
          smootherRef.current.kill();
          smootherRef.current = null;
        } catch (error) {
          console.error('Error during ScrollSmoother cleanup:', error);
        }
      }
    };
  }, { scope: wrapperRef, dependencies: [pluginsLoaded] });

  // Show loading state while checking plugins
  if (pluginsLoaded === null) {
    return null; // Or a loading spinner
  }

  // Fallback to static hero if plugins failed to load
  // Requirements: 1.1, 1.2, 1.3, 1.4
  if (pluginsLoaded === false) {
    return <StaticHeroFallback />;
  }

  return (
    <div 
      id="smooth-wrapper" 
      ref={wrapperRef}
      className="relative"
    >
      <div id="smooth-content">
        {/* Zoom Container with 12 images across 3 layers */}
        <div className="relative">
          <ZoomContainer />
        </div>

        {/* Scroll Indicator */}
        <div 
          ref={scrollIndicatorRef}
          className="fixed bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-bounce pointer-events-none"
          style={{ willChange: 'transform, opacity' }} // CSS optimization - Requirement 10.1
        >
          <div className="text-white text-center">
            <p className="text-xs tracking-widest uppercase mb-2">
              {t('hero.scrollText')}
            </p>
            <svg 
              className="w-5 h-5 md:w-6 md:h-6 mx-auto" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

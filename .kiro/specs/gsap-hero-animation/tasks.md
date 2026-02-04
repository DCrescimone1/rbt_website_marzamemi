# Implementation Plan: GSAP Hero Animation

## Overview

This plan implements a GSAP-powered scroll animation system for the Next.js hero section, replacing the current static hero with an immersive multi-layered scroll experience. The implementation follows a progressive approach: dependencies → configuration → core animations → integration → testing.

## Tasks

- [x] 1. Install GSAP dependencies and configure plugins
  - Install gsap, @gsap/react packages via npm
  - Add ScrollTrigger, ScrollSmoother, and SplitText plugins
  - Note: SplitText requires GSAP Club membership or use free alternative
  - Create plugin registration utility if needed
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

- [x] 2. Create image configuration data model
  - [x] 2.1 Define TypeScript interfaces for ImageConfig and LayerConfig
    - Create interfaces matching design specifications
    - Include layer (1-3), position, size, and src properties
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 2.2 Create imageConfigs array with 12 images across 3 layers
    - Select 12 images from /public/pictures directory
    - Distribute 4 images per layer with viewport-based positioning
    - Use percentage-based positioning for responsiveness
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [ ]* 2.3 Write unit test for layer distribution
    - **Property 1: Layer Distribution Invariant**
    - **Validates: Requirements 6.1, 6.3, 6.4, 6.5**
  
  - [ ]* 2.4 Write unit test for z-depth ordering
    - **Property 2: Z-Depth Ordering Invariant**
    - **Validates: Requirements 2.3**

- [x] 3. Implement ZoomContainer component
  - [x] 3.1 Create ZoomContainer with image rendering
    - Map through imageConfigs to render Next.js Image components
    - Apply absolute positioning and layer data attributes
    - Use responsive sizing (viewport units)
    - _Requirements: 2.1, 2.8, 2.9, 6.6, 6.7_
  
  - [x] 3.2 Implement zoom animation with ScrollTrigger
    - Pin container for 150% viewport height
    - Animate z-position from layer depth to 0
    - Apply layer-specific scale values (Layer 1: 2.5, Layer 2: 2, Layer 3: 1.5)
    - Use scrub for smooth scroll-linked animation
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ]* 3.3 Write integration test for zoom animation configuration
    - Test ScrollTrigger pin duration is 150%
    - Test layer scale values match specifications
    - _Requirements: 2.2, 2.5, 2.6, 2.7_


- [x] 4. Implement HeadingSection animation
  - [x] 4.1 Create heading element with translation support
    - Use useTranslation hook for hero.title
    - Apply responsive Tailwind text classes
    - Set initial opacity and z-position
    - _Requirements: 3.1, 3.5_
  
  - [x] 4.2 Implement heading zoom and fade animation
    - Animate opacity from 0.1 to 1
    - Animate z-position from -2000px to 50px
    - Synchronize with ZoomContainer ScrollTrigger
    - Use scrub for smooth animation
    - _Requirements: 3.2, 3.3, 3.4_
  
  - [ ]* 4.3 Write unit test for heading animation configuration
    - Test initial and final opacity values
    - Test initial and final z-position values
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 5. Implement TextRevealSection with character animation
  - [x] 5.1 Create text reveal section structure
    - Use useTranslation hook for reveal text
    - Create container for pinned section
    - _Requirements: 4.6_
  
  - [x] 5.2 Implement SplitText character splitting
    - Split text into individual characters
    - Apply character class for styling
    - Store SplitText instance for cleanup
    - _Requirements: 4.1_
  
  - [x] 5.3 Implement character reveal animation
    - Pin section for 1500px scroll distance
    - Animate character opacity 0 to 1 with stagger
    - Animate character fade out with scale
    - Use timeline for two-phase animation
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 5.4 Write integration test for text reveal configuration
    - Test pin duration is 1500px
    - Test character stagger effect exists
    - Test fade-out scale value is 0.8
    - _Requirements: 4.2, 4.3, 4.5_

- [x] 6. Integrate ScrollSmoother for smooth scrolling
  - [x] 6.1 Create smooth-wrapper and smooth-content structure
    - Wrap hero content in required div structure
    - Apply correct IDs for ScrollSmoother
    - _Requirements: 5.4, 5.5_
  
  - [x] 6.2 Initialize ScrollSmoother with configuration
    - Set smooth parameter to 1
    - Enable effects for data-speed and data-lag
    - Enable normalizeScroll for cross-device consistency
    - Store instance for cleanup
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 6.3 Write unit test for ScrollSmoother configuration
    - Test smooth parameter is 1
    - Test effects is enabled
    - Test normalizeScroll is enabled
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 7. Checkpoint - Verify core animations work
  - Ensure all tests pass, ask the user if questions arise.


- [x] 8. Implement ScrollIndicator component
  - [x] 8.1 Create scroll indicator with bounce animation
    - Use useTranslation hook for scroll text
    - Apply Tailwind bounce animation
    - Position at bottom of viewport
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 8.2 Implement scroll indicator fade-out animation
    - Animate opacity to 0 as user scrolls
    - Use ScrollTrigger with scrub
    - Fade out over first viewport height
    - _Requirements: 9.4_
  
  - [ ]* 8.3 Write integration test for scroll indicator
    - Test indicator element exists
    - Test bounce animation is applied
    - Test translation key is used
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 9. Implement cleanup and lifecycle management
  - [x] 9.1 Set up useGSAP hook for animation lifecycle
    - Replace useEffect with useGSAP from @gsap/react
    - Move all GSAP code inside useGSAP callback
    - Ensure automatic cleanup handling
    - _Requirements: 1.5, 8.4_
  
  - [x] 9.2 Implement cleanup for all GSAP instances
    - Kill all ScrollTrigger instances on unmount
    - Revert SplitText instances on unmount
    - Destroy ScrollSmoother instance on unmount
    - Add resize event listener cleanup
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ]* 9.3 Write integration test for cleanup
    - **Property 3: Animation Cleanup Completeness**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [x] 10. Add responsive design and mobile optimizations
  - [x] 10.1 Implement responsive image sizing
    - Add Tailwind responsive classes for image dimensions
    - Adjust positioning for mobile viewports
    - Test on various screen sizes
    - _Requirements: 7.1, 7.4_
  
  - [x] 10.2 Implement responsive text sizing
    - Ensure heading uses responsive text classes
    - Adjust text reveal for mobile readability
    - _Requirements: 7.2, 7.4_
  
  - [x] 10.3 Add ScrollTrigger refresh on resize
    - Listen for window resize events
    - Call ScrollTrigger.refresh() on resize
    - Debounce resize handler for performance
    - _Requirements: 7.3_
  
  - [ ]* 10.4 Write unit test for responsive classes
    - Test Tailwind responsive classes are present
    - Test resize handler is registered
    - _Requirements: 7.1, 7.2, 7.3, 7.4_


- [x] 11. Add performance optimizations
  - [x] 11.1 Add will-change CSS optimization
    - Apply will-change: transform to animated elements
    - Use GSAP's force3D for hardware acceleration
    - _Requirements: 10.1, 10.2_
  
  - [x] 11.2 Optimize Next.js Image components
    - Set appropriate quality prop (75-85)
    - Configure loading strategy (priority for above-fold, lazy for others)
    - Add sizes prop for responsive images
    - _Requirements: 10.3, 10.4_
  
  - [ ]* 11.3 Write unit test for optimization settings
    - **Property 4: Image Component Consistency**
    - **Validates: Requirements 2.8**

- [x] 12. Add error handling and fallbacks
  - [x] 12.1 Add GSAP plugin loading error handling
    - Wrap plugin registration in try-catch
    - Provide fallback to static hero on error
    - Log errors for debugging
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 12.2 Add image loading error handling
    - Add onError prop to Image components
    - Log failed image loads
    - Ensure animation continues with available images
    - _Requirements: 2.8_
  
  - [x] 12.3 Add SplitText availability check
    - Check if SplitText is defined before use
    - Provide fallback text rendering without split
    - Log warning if SplitText unavailable
    - _Requirements: 1.4_
  
  - [ ]* 12.4 Write integration test for error handling
    - Test fallback behavior when plugins fail
    - Test image error handling
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.8_

- [x] 13. Integrate with existing HeroSection component
  - [x] 13.1 Replace current hero-section.tsx implementation
    - Backup current implementation
    - Replace with new GSAP-powered version
    - Ensure "use client" directive is present
    - Preserve useTranslation integration
    - _Requirements: 1.5, 3.5, 4.6, 9.3_
  
  - [x] 13.2 Test integration with rest of application
    - Verify hero renders correctly on home page
    - Test scroll behavior with sections below hero
    - Verify no conflicts with other components
    - _Requirements: All_
  
  - [ ]* 13.3 Write property test for translation preservation
    - **Property 5: Translation Key Preservation**
    - **Validates: Requirements 3.5, 4.6, 9.3**

- [x] 14. Final checkpoint - Complete testing and verification
  - Ensure all tests pass, ask the user if questions arise.


## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific configurations and edge cases
- Integration tests validate component interactions and GSAP setup
- Manual testing is essential for visual scroll animations (see design document)
- SplitText plugin requires GSAP Club membership - consider free alternatives if needed
- ScrollSmoother may conflict with fixed positioning - test thoroughly with existing layout

# GSAP Animation Utilities

This directory contains GSAP (GreenSock Animation Platform) configuration and utilities for the hero section scroll animations.

## Installed Packages

- **gsap** (v3.14.2): Core animation library
- **@gsap/react** (v2.1.2): React integration with `useGSAP` hook
- **ScrollTrigger**: Scroll-based animations (included in GSAP core)

## Files

### `index.ts`
Main entry point for GSAP utilities. Exports:
- `gsap`: Core GSAP library
- `ScrollTrigger`: Scroll-based animation plugin
- `registerGSAPPlugins()`: Function to register required plugins
- `registerPremiumPlugins()`: Function to check premium plugin availability
- `isPluginAvailable()`: Helper to check if a plugin is loaded

### `types.ts`
TypeScript type definitions for:
- `ImageConfig`: Configuration for zoom container images
- `LayerConfig`: Layer depth and scale settings
- `HeadingAnimation`: Heading animation configuration
- `PluginStatus`: Plugin availability tracking

### `config.ts`
Centralized animation configuration:
- `layerConfig`: Z-depth and scale values for 3 layers
- `headingAnimation`: Opacity and z-position values
- `zoomContainerConfig`: Scroll trigger settings
- `textRevealConfig`: Character reveal animation settings
- `scrollSmootherConfig`: Smooth scroll settings

## Usage

### Basic Setup

```typescript
import { gsap, ScrollTrigger, registerGSAPPlugins } from '@/lib/gsap';
import { layerConfig } from '@/lib/gsap/config';

// Register plugins before use
registerGSAPPlugins();

// Use in component
gsap.to(element, {
  scrollTrigger: {
    trigger: element,
    start: 'top center',
  },
  opacity: 1,
});
```

### With React (useGSAP Hook)

```typescript
'use client';

import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export function AnimatedComponent() {
  useGSAP(() => {
    // Animations automatically clean up on unmount
    gsap.to('.element', {
      scrollTrigger: {
        trigger: '.element',
        scrub: true,
      },
      scale: 2,
    });
  });

  return <div className="element">Animated content</div>;
}
```

## Premium Plugins

### ScrollSmoother and SplitText

These plugins require a GSAP Club membership and are not included in the free version:

- **ScrollSmoother**: Provides smooth scrolling with effects
- **SplitText**: Splits text into characters/words/lines for animation

If you have access to these plugins:

1. Install them via npm (requires GSAP Club credentials)
2. Import and register in your component
3. Update `registerPremiumPlugins()` function

### Free Alternatives

- **ScrollSmoother**: Use CSS `scroll-behavior: smooth` or libraries like `locomotive-scroll`
- **SplitText**: Use CSS-based character splitting or libraries like `splitting.js`

## Configuration

All animation values are centralized in `config.ts` for easy adjustment:

```typescript
// Layer 1 (closest): Scale 1 → 2.5, z: 400px → 0
// Layer 2 (middle): Scale 1 → 2, z: 600px → 0
// Layer 3 (farthest): Scale 1 → 1.5, z: 800px → 0
```

## Verification

Run the verification script to test the installation:

```bash
npx tsx verify-gsap-installation.ts
```

## Requirements Satisfied

This implementation satisfies the following requirements:

- **1.1**: GSAP core library loaded ✓
- **1.2**: ScrollTrigger plugin loaded ✓
- **1.3**: ScrollSmoother plugin documented (requires membership)
- **1.4**: SplitText plugin documented (requires membership)
- **1.5**: Ready for client component integration ✓
- **1.6**: Plugin registration utility created ✓

## Next Steps

1. Implement image configuration data model (Task 2)
2. Create ZoomContainer component (Task 3)
3. Implement HeadingSection animation (Task 4)
4. Add TextRevealSection with character animation (Task 5)

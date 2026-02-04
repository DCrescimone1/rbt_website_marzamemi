# Design Document: GSAP Hero Animation

## Overview

This design specifies the implementation of a GSAP-powered scroll animation system for the Next.js hero section. The system replaces the current static hero with an immersive multi-layered scroll experience featuring:

- **Zoom Container Animation**: 12 images across 3 depth layers that zoom toward the viewer as the user scrolls
- **Heading Animation**: Hero text that fades in and zooms from far away (z: -2000px to z: 50px)
- **Text Reveal Animation**: A pinned section with character-by-character text reveal followed by fade-out
- **Smooth Scrolling**: ScrollSmoother integration for fluid scroll behavior

The implementation uses GSAP's useGSAP hook for React integration, ensuring proper cleanup and SSR compatibility with Next.js.

## Architecture

### Component Structure

```
HeroSection (Client Component)
├── smooth-wrapper (ScrollSmoother wrapper)
│   └── smooth-content (ScrollSmoother content)
│       ├── ZoomContainer (pinned scroll section)
│       │   └── ImageLayers (12 images across 3 layers)
│       ├── HeadingSection (animated heading)
│       ├── TextRevealSection (pinned character reveal)
│       └── ScrollIndicator (bounce animation)
```

### Animation Timeline

1. **Initial Load**: GSAP plugins register, ScrollSmoother initializes
2. **Zoom Phase** (0-150% scroll): Images zoom from depth layers toward viewer
3. **Heading Phase** (synchronized with zoom): Text fades in and zooms forward
4. **Text Reveal Phase** (pinned 1500px): Characters reveal then fade out
5. **Cleanup**: All animations and plugins clean up on unmount


## Components and Interfaces

### 1. HeroSection Component

**Purpose**: Main container component that orchestrates all animations

**Props**: None (uses translation hook internally)

**Key Responsibilities**:
- Initialize GSAP plugins (ScrollTrigger, ScrollSmoother, SplitText)
- Set up ScrollSmoother wrapper structure
- Create and manage all scroll-based animations
- Handle cleanup on unmount

**Implementation Notes**:
- Must be a Client Component ("use client" directive)
- Uses `useGSAP` hook from `@gsap/react` for automatic cleanup
- Uses `useTranslation` hook for internationalized text content
- Registers GSAP plugins before component mount using `gsap.registerPlugin()`

### 2. ZoomContainer

**Purpose**: Container for multi-layered image zoom animation

**Structure**:
```typescript
interface ImageConfig {
  src: string;           // Path to image in /public/pictures
  layer: 1 | 2 | 3;      // Depth layer (1=closest, 3=farthest)
  position: {
    top?: string;        // CSS percentage (e.g., "10%")
    left?: string;       // CSS percentage
    right?: string;      // CSS percentage
    bottom?: string;     // CSS percentage
  };
  size: {
    width: string;       // CSS value (e.g., "20vw", "300px")
    height: string;      // CSS value
  };
}
```

**Animation Configuration**:
- Pin duration: 150% of viewport height
- Layer 1 (z: 400px): Scale 1 → 2.5
- Layer 2 (z: 600px): Scale 1 → 2
- Layer 3 (z: 800px): Scale 1 → 1.5
- All layers animate z-position toward 0


### 3. HeadingSection

**Purpose**: Animated hero heading that zooms and fades in

**Animation Configuration**:
```typescript
interface HeadingAnimation {
  initial: {
    opacity: 0.1;
    z: -2000;
  };
  final: {
    opacity: 1;
    z: 50;
  };
  scrollTrigger: {
    trigger: ZoomContainer;  // Synchronized with zoom animation
    scrub: true;             // Smooth scrubbing
  };
}
```

**Styling**:
- Uses existing Tailwind classes from current hero
- Maintains responsive text sizing (text-4xl sm:text-5xl md:text-7xl lg:text-8xl)
- Preserves translation key: `t('hero.title')`

### 4. TextRevealSection

**Purpose**: Pinned section with character-by-character text reveal

**Animation Phases**:

**Phase 1 - Reveal** (0-50% of pin):
```typescript
{
  targets: '.char',
  opacity: 0 → 1,
  stagger: 0.03,  // 30ms between each character
}
```

**Phase 2 - Fade Out** (50-100% of pin):
```typescript
{
  targets: '.char',
  opacity: 1 → 0,
  scale: 1 → 0.8,
}
```

**ScrollTrigger Configuration**:
```typescript
{
  trigger: textRevealSection,
  pin: true,
  pinSpacing: true,
  start: 'top top',
  end: '+=1500',  // Pin for 1500px of scroll
  scrub: true,
}
```

**SplitText Usage**:
```typescript
const split = new SplitText(textElement, {
  type: 'chars',
  charsClass: 'char',
});

// Cleanup on unmount
split.revert();
```


### 5. ScrollSmoother Integration

**Purpose**: Provides smooth scrolling throughout the hero section

**Configuration**:
```typescript
ScrollSmoother.create({
  wrapper: '#smooth-wrapper',
  content: '#smooth-content',
  smooth: 1,              // Smoothness level (0-3)
  effects: true,          // Enable data-speed and data-lag
  normalizeScroll: true,  // Consistent behavior across devices
});
```

**DOM Structure Requirements**:
```html
<div id="smooth-wrapper">
  <div id="smooth-content">
    <!-- All hero content here -->
  </div>
</div>
```

**Important Notes**:
- ScrollSmoother changes positioning context (affects fixed/absolute elements)
- Must be initialized after DOM is ready
- Must be destroyed on component unmount

### 6. ScrollIndicator

**Purpose**: Visual cue for scrollable content

**Behavior**:
- Displays at bottom of initial viewport
- Bounce animation (Tailwind: `animate-bounce`)
- Fades out as user scrolls past first viewport
- Preserves translation key: `t('hero.scrollText')`

**Fade Animation**:
```typescript
gsap.to('.scroll-indicator', {
  opacity: 0,
  scrollTrigger: {
    start: 'top top',
    end: '+=100vh',
    scrub: true,
  },
});
```


## Data Models

### Image Configuration Array

```typescript
const imageConfigs: ImageConfig[] = [
  // Layer 1 (closest) - 4 images
  {
    src: '/pictures/IMG_7194.webp',
    layer: 1,
    position: { top: '10%', left: '5%' },
    size: { width: '20vw', height: '25vh' },
  },
  {
    src: '/pictures/IMG_7196.webp',
    layer: 1,
    position: { top: '60%', right: '10%' },
    size: { width: '25vw', height: '30vh' },
  },
  {
    src: '/pictures/IMG_7199.webp',
    layer: 1,
    position: { bottom: '15%', left: '15%' },
    size: { width: '22vw', height: '28vh' },
  },
  {
    src: '/pictures/IMG_7202.webp',
    layer: 1,
    position: { top: '35%', right: '5%' },
    size: { width: '18vw', height: '24vh' },
  },
  
  // Layer 2 (middle) - 4 images
  {
    src: '/pictures/IMG_7203.webp',
    layer: 2,
    position: { top: '20%', right: '20%' },
    size: { width: '18vw', height: '22vh' },
  },
  {
    src: '/pictures/IMG_7205.webp',
    layer: 2,
    position: { bottom: '25%', left: '8%' },
    size: { width: '20vw', height: '26vh' },
  },
  {
    src: '/pictures/IMG_7597.webp',
    layer: 2,
    position: { top: '45%', left: '25%' },
    size: { width: '16vw', height: '20vh' },
  },
  {
    src: '/pictures/IMG_7598.webp',
    layer: 2,
    position: { top: '15%', left: '40%' },
    size: { width: '19vw', height: '24vh' },
  },
  
  // Layer 3 (farthest) - 4 images
  {
    src: '/pictures/IMG_7599.webp',
    layer: 3,
    position: { top: '30%', left: '10%' },
    size: { width: '15vw', height: '18vh' },
  },
  {
    src: '/pictures/IMG_7600.webp',
    layer: 3,
    position: { bottom: '20%', right: '15%' },
    size: { width: '17vw', height: '21vh' },
  },
  {
    src: '/pictures/IMG_7601.webp',
    layer: 3,
    position: { top: '50%', right: '30%' },
    size: { width: '14vw', height: '17vh' },
  },
  {
    src: '/pictures/IMG_8498.webp',
    layer: 3,
    position: { bottom: '35%', left: '35%' },
    size: { width: '16vw', height: '19vh' },
  },
];
```

### Layer Depth Configuration

```typescript
const layerConfig = {
  1: { initialZ: 400, finalZ: 0, scale: { from: 1, to: 2.5 } },
  2: { initialZ: 600, finalZ: 0, scale: { from: 1, to: 2 } },
  3: { initialZ: 800, finalZ: 0, scale: { from: 1, to: 1.5 } },
};
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Since this feature involves specific UI animations and configurations rather than algorithmic transformations, most testable criteria are concrete examples rather than universal properties. The following properties focus on structural invariants and configuration correctness:

### Property 1: Layer Distribution Invariant

*For any* valid image configuration array, the total number of images across all three layers should equal 12, with exactly 4 images per layer.

**Validates: Requirements 6.1, 6.3, 6.4, 6.5**

**Rationale**: This ensures the zoom animation maintains the intended visual balance and depth effect. An incorrect distribution would break the parallax illusion.

### Property 2: Z-Depth Ordering Invariant

*For any* layer assignment, Layer 1 images must have a smaller initial z-depth than Layer 2, and Layer 2 must have a smaller initial z-depth than Layer 3 (Layer1.z < Layer2.z < Layer3.z).

**Validates: Requirements 2.3**

**Rationale**: This maintains the depth ordering necessary for the parallax effect. If layers are out of order, images would zoom incorrectly relative to each other.

### Property 3: Animation Cleanup Completeness

*For any* component unmount, all created GSAP instances (ScrollTriggers, SplitText, ScrollSmoother) must be properly destroyed or reverted, leaving no orphaned animations.

**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

**Rationale**: Proper cleanup prevents memory leaks and ensures animations don't persist after the component is removed from the DOM.

### Property 4: Image Component Consistency

*For all* rendered images in the zoom container, each must use the Next.js Image component (not native img tags) to maintain optimization benefits.

**Validates: Requirements 2.8**

**Rationale**: Using native img tags would bypass Next.js optimization, leading to larger bundle sizes and slower load times.

### Property 5: Translation Key Preservation

*For all* text content (heading, description, scroll indicator), the rendered output must use translation keys from the useTranslation hook rather than hardcoded strings.

**Validates: Requirements 3.5, 4.6, 9.3**

**Rationale**: Hardcoded strings would break internationalization, preventing the site from supporting multiple languages.


## Error Handling

### 1. GSAP Plugin Loading Failures

**Scenario**: GSAP plugins fail to load or register

**Handling**:
```typescript
try {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
} catch (error) {
  console.error('Failed to register GSAP plugins:', error);
  // Fallback: Render static hero without animations
  return <StaticHeroFallback />;
}
```

**Rationale**: Ensures the hero section remains functional even if GSAP fails to load, preventing a blank page.

### 2. Image Loading Failures

**Scenario**: One or more images fail to load from /public/pictures

**Handling**:
- Next.js Image component handles loading errors automatically
- Use `onError` prop to log failures
- Missing images won't break the animation (other images continue)

```typescript
<Image
  src={config.src}
  alt="Hero animation image"
  fill
  onError={(e) => console.warn('Image failed to load:', config.src)}
/>
```

### 3. SplitText Licensing Issues

**Scenario**: SplitText plugin not available (requires GSAP membership)

**Handling**:
```typescript
if (typeof SplitText === 'undefined') {
  console.warn('SplitText not available, skipping text reveal animation');
  // Render text without character split
  return <div>{t('hero.revealText')}</div>;
}
```

**Alternative**: Use CSS-based character animation or a free alternative library

### 4. ScrollSmoother Conflicts

**Scenario**: ScrollSmoother conflicts with other scroll libraries or fixed elements

**Handling**:
- Document known conflicts in comments
- Provide option to disable ScrollSmoother via environment variable
- Test thoroughly with existing page layout

```typescript
const enableSmoothScroll = process.env.NEXT_PUBLIC_ENABLE_SMOOTH_SCROLL !== 'false';

if (enableSmoothScroll) {
  ScrollSmoother.create({ /* config */ });
}
```

### 5. Resize and Orientation Changes

**Scenario**: User resizes window or changes device orientation during animation

**Handling**:
```typescript
useGSAP(() => {
  // Animations setup...
  
  const handleResize = () => {
    ScrollTrigger.refresh();
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
});
```

**Rationale**: ScrollTrigger calculations are based on viewport dimensions and must be recalculated on resize.


## Testing Strategy

### Overview

This feature requires a dual testing approach combining unit tests for configuration validation and integration tests for animation behavior. Due to the visual and interactive nature of scroll animations, property-based testing has limited applicability—most tests will validate specific configurations and DOM structure.

### Unit Testing

**Focus Areas**:
1. **Configuration Validation**
   - Verify image configuration array has exactly 12 images
   - Verify layer distribution (4 images per layer)
   - Verify z-depth ordering (Layer 1 < Layer 2 < Layer 3)
   - Verify all image paths exist in /public/pictures

2. **Component Structure**
   - Verify "use client" directive is present
   - Verify ScrollSmoother wrapper structure exists
   - Verify translation keys are used (not hardcoded strings)
   - Verify Next.js Image components are used (not img tags)

3. **Animation Configuration**
   - Verify ScrollTrigger pin duration is 150% viewport
   - Verify heading animation values (opacity: 0.1→1, z: -2000→50)
   - Verify text reveal pin duration is 1500px
   - Verify layer scale values (Layer 1: 2.5, Layer 2: 2, Layer 3: 1.5)

4. **Cleanup Logic**
   - Verify useGSAP cleanup function exists
   - Verify ScrollTrigger.getAll() is called in cleanup
   - Verify SplitText.revert() is called in cleanup
   - Verify ScrollSmoother.kill() is called in cleanup

**Example Unit Test**:
```typescript
describe('HeroSection Configuration', () => {
  it('should have exactly 12 images distributed across 3 layers', () => {
    const layer1 = imageConfigs.filter(img => img.layer === 1);
    const layer2 = imageConfigs.filter(img => img.layer === 2);
    const layer3 = imageConfigs.filter(img => img.layer === 3);
    
    expect(imageConfigs).toHaveLength(12);
    expect(layer1).toHaveLength(4);
    expect(layer2).toHaveLength(4);
    expect(layer3).toHaveLength(4);
  });
  
  it('should maintain z-depth ordering across layers', () => {
    const layer1Z = layerConfig[1].initialZ;
    const layer2Z = layerConfig[2].initialZ;
    const layer3Z = layerConfig[3].initialZ;
    
    expect(layer1Z).toBeLessThan(layer2Z);
    expect(layer2Z).toBeLessThan(layer3Z);
  });
});
```

### Integration Testing

**Focus Areas**:
1. **GSAP Plugin Registration**
   - Test that ScrollTrigger is available after component mount
   - Test that ScrollSmoother is available after component mount
   - Test that SplitText is available after component mount

2. **DOM Structure**
   - Test that smooth-wrapper and smooth-content elements exist
   - Test that 12 image elements are rendered
   - Test that images have correct data-layer attributes
   - Test that heading and text reveal sections exist

3. **Animation Initialization**
   - Test that ScrollTrigger instances are created
   - Test that ScrollSmoother instance is created
   - Test that SplitText splits text into character spans

4. **Cleanup Verification**
   - Test that all ScrollTrigger instances are killed on unmount
   - Test that SplitText is reverted on unmount
   - Test that ScrollSmoother is destroyed on unmount

**Example Integration Test**:
```typescript
describe('HeroSection Animation Lifecycle', () => {
  it('should initialize GSAP plugins on mount', () => {
    render(<HeroSection />);
    
    expect(ScrollTrigger).toBeDefined();
    expect(ScrollSmoother).toBeDefined();
    expect(SplitText).toBeDefined();
  });
  
  it('should clean up all animations on unmount', () => {
    const { unmount } = render(<HeroSection />);
    
    // Verify animations exist
    const triggers = ScrollTrigger.getAll();
    expect(triggers.length).toBeGreaterThan(0);
    
    // Unmount and verify cleanup
    unmount();
    expect(ScrollTrigger.getAll()).toHaveLength(0);
  });
});
```

### Property-Based Testing

**Limited Applicability**: This feature has minimal use for property-based testing since we're validating specific UI configurations rather than algorithmic transformations. However, we can use property tests for:

**Property 1: Layer Distribution Invariant**
```typescript
// Feature: gsap-hero-animation, Property 1: Layer Distribution Invariant
test('layer distribution maintains 4 images per layer for any valid configuration', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        src: fc.string(),
        layer: fc.integer({ min: 1, max: 3 }),
        position: fc.record({ top: fc.string() }),
        size: fc.record({ width: fc.string(), height: fc.string() }),
      }), { minLength: 12, maxLength: 12 }),
      (configs) => {
        const layer1 = configs.filter(c => c.layer === 1);
        const layer2 = configs.filter(c => c.layer === 2);
        const layer3 = configs.filter(c => c.layer === 3);
        
        return layer1.length === 4 && 
               layer2.length === 4 && 
               layer3.length === 4;
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 2: Z-Depth Ordering Invariant**
```typescript
// Feature: gsap-hero-animation, Property 2: Z-Depth Ordering Invariant
test('z-depth ordering is maintained for any layer configuration', () => {
  fc.assert(
    fc.property(
      fc.record({
        layer1Z: fc.integer({ min: 100, max: 500 }),
        layer2Z: fc.integer({ min: 501, max: 700 }),
        layer3Z: fc.integer({ min: 701, max: 1000 }),
      }),
      (config) => {
        return config.layer1Z < config.layer2Z && 
               config.layer2Z < config.layer3Z;
      }
    ),
    { numRuns: 100 }
  );
});
```

### Manual Testing Checklist

Due to the visual nature of scroll animations, manual testing is essential:

- [ ] Verify smooth scrolling feels natural (not too fast/slow)
- [ ] Verify images zoom smoothly without jank
- [ ] Verify heading fades in and zooms correctly
- [ ] Verify text reveals character-by-character
- [ ] Verify scroll indicator fades out appropriately
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Test on desktop browsers (Chrome, Firefox, Safari)
- [ ] Test with different viewport sizes
- [ ] Test with slow network (images loading progressively)
- [ ] Verify no console errors or warnings
- [ ] Verify performance (60fps on modern devices)
- [ ] Test with browser DevTools Performance tab

### Testing Tools

- **Unit/Integration Tests**: Jest + React Testing Library
- **Property-Based Tests**: fast-check (JavaScript property testing library)
- **Visual Testing**: Manual testing + Playwright for E2E
- **Performance Testing**: Chrome DevTools Performance tab, Lighthouse

### Test Configuration

```json
{
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/$1"
  }
}
```

**Note**: GSAP plugins may require mocking in test environment since they depend on browser APIs. Consider using `jest.mock()` for GSAP modules in unit tests.

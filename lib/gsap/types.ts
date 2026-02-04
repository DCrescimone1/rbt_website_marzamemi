/**
 * TypeScript type definitions for GSAP animation configuration
 */

/**
 * Configuration for individual images in the zoom container
 */
export interface ImageConfig {
  /** Path to image in /public/pictures */
  src: string;
  /** Depth layer (1=closest, 2=middle, 3=farthest) */
  layer: 1 | 2 | 3;
  /** CSS positioning for desktop */
  position: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  /** CSS sizing for desktop */
  size: {
    width: string;
    height: string;
  };
  /** CSS positioning for mobile (optional) */
  mobilePosition?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  /** CSS sizing for mobile (optional) */
  mobileSize?: {
    width: string;
    height: string;
  };
}

/**
 * Configuration for layer depth and scale animations
 */
export interface LayerConfig {
  /** Initial z-position in pixels */
  initialZ: number;
  /** Final z-position in pixels */
  finalZ: number;
  /** Scale animation values */
  scale: {
    from: number;
    to: number;
  };
}

/**
 * Heading animation configuration
 */
export interface HeadingAnimation {
  initial: {
    opacity: number;
    z: number;
  };
  final: {
    opacity: number;
    z: number;
  };
}

/**
 * Plugin availability status
 */
export interface PluginStatus {
  scrollTrigger: boolean;
  scrollSmoother: boolean;
  splitText: boolean;
}

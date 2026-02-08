/**
 * GSAP Animation Configuration
 * 
 * Centralized configuration for all GSAP animations in the hero section
 */

import type { LayerConfig, ImageConfig } from './types';

/**
 * Layer depth and scale configuration for zoom animation
 * Images start at z: 0 and animate TO their depth (opposite direction)
 */
export const layerConfig: Record<1 | 2 | 3, LayerConfig> = {
  1: {
    initialZ: 0,
    finalZ: 400,
    scale: { from: 1, to: 1 },
  },
  2: {
    initialZ: 0,
    finalZ: 600,
    scale: { from: 1, to: 1 },
  },
  3: {
    initialZ: 0,
    finalZ: 800,
    scale: { from: 1, to: 1 },
  },
};

/**
 * Zoom container scroll configuration
 */
export const zoomContainerConfig = {
  /** Pin duration as percentage of viewport height */
  pinDuration: '150%',
  /** Scrub smoothness (1 = linked to scrollbar) */
  scrub: 1,
};

/**
 * ScrollSmoother configuration
 */
export const scrollSmootherConfig = {
  /** Smoothness level (0-3) */
  smooth: 1,
  /** Enable data-speed and data-lag effects */
  effects: true,
  /** Consistent behavior across devices */
  normalizeScroll: true,
};

/**
 * Image configuration for zoom container animation
 * 14 images distributed across 3 depth layers
 * 
 * Responsive sizing:
 * - Mobile: Larger viewport units for better visibility on small screens
 * - Desktop: Original viewport units for optimal layout
 */
export const imageConfigs: ImageConfig[] = [
  // Layer 1 (closest) - 5 images - well distributed
  {
    src: '/pictures/villa_i_2_mari/ok%20giardino%20sera-b.webp',
    layer: 1,
    position: { top: '5%', left: '3%' },
    size: { width: '14vw', height: '18vh' },
    mobileSize: { width: '22vw', height: '14vh' },
    mobilePosition: { top: '5%', left: '2%' },
  },
  {
    src: '/pictures/villa_i_2_mari/ok%20piscina%20alta1.webp',
    layer: 1,
    position: { bottom: '5%', right: '5%' },
    size: { width: '16vw', height: '20vh' },
    mobileSize: { width: '26vw', height: '16vh' },
    mobilePosition: { bottom: '5%', right: '3%' },
  },
  {
    src: '/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari-%20camera1.webp',
    layer: 1,
    position: { bottom: '8%', left: '8%' },
    size: { width: '15vw', height: '19vh' },
    mobileSize: { width: '24vw', height: '15vh' },
    mobilePosition: { bottom: '8%', left: '5%' },
  },
  {
    src: '/pictures/villa_i_2_mari/%20ok%20Villa%20i2mari-cucina.webp',
    layer: 1,
    position: { top: '8%', right: '4%' },
    size: { width: '13vw', height: '17vh' },
    mobileSize: { width: '20vw', height: '13vh' },
    mobilePosition: { top: '8%', right: '3%' },
  },
  {
    src: '/pictures/villa_zefiro/ok%20piscina%20alta.webp',
    layer: 1,
    position: { top: '60%', right: '35%' },
    size: { width: '14vw', height: '18vh' },
    mobileSize: { width: '22vw', height: '14vh' },
    mobilePosition: { top: '65%', right: '30%' },
  },
  
  // Layer 2 (middle) - 5 images - filling gaps
  {
    src: '/pictures/villa_zefiro/ok%20Villa%20Zefiro%20soggiorno.webp',
    layer: 2,
    position: { top: '35%', left: '15%' },
    size: { width: '12vw', height: '16vh' },
    mobileSize: { width: '18vw', height: '12vh' },
    mobilePosition: { top: '35%', left: '10%' },
  },
  {
    src: '/pictures/villa_zefiro/ok%20Villa%20Zefiro%20camera.webp',
    layer: 2,
    position: { bottom: '35%', left: '5%' },
    size: { width: '14vw', height: '18vh' },
    mobileSize: { width: '22vw', height: '14vh' },
    mobilePosition: { bottom: '35%', left: '3%' },
  },
  {
    src: '/pictures/villa_zefiro/ok%20Villa%20Zefiro%20terrazza.webp',
    layer: 2,
    position: { top: '65%', left: '35%' },
    size: { width: '11vw', height: '14vh' },
    mobileSize: { width: '16vw', height: '11vh' },
    mobilePosition: { top: '70%', left: '30%' },
  },
  {
    src: '/pictures/villa_i_2_mari/ok%20Villa%20i%202%20mari-%20bagno.webp',
    layer: 2,
    position: { bottom: '40%', right: '8%' },
    size: { width: '13vw', height: '17vh' },
    mobileSize: { width: '20vw', height: '13vh' },
    mobilePosition: { bottom: '40%', right: '5%' },
  },
  {
    src: '/pictures/villa_zefiro/ok%20Villa%20Zefiro%20bagno.webp',
    layer: 2,
    position: { top: '40%', right: '15%' },
    size: { width: '12vw', height: '15vh' },
    mobileSize: { width: '18vw', height: '12vh' },
    mobilePosition: { top: '40%', right: '10%' },
  },
  
  // Layer 3 (farthest) - 4 images - background fill
  {
    src: '/pictures/villa_i_2_mari/ok%20drone.webp',
    layer: 3,
    position: { top: '25%', left: '40%' },
    size: { width: '10vw', height: '13vh' },
    mobileSize: { width: '14vw', height: '10vh' },
    mobilePosition: { top: '25%', left: '35%' },
  },
  {
    src: '/pictures/villa_i_2_mari/ok%20piscine%20notte1.webp',
    layer: 3,
    position: { bottom: '15%', right: '30%' },
    size: { width: '11vw', height: '14vh' },
    mobileSize: { width: '16vw', height: '11vh' },
    mobilePosition: { bottom: '15%', right: '25%' },
  },
  {
    src: '/pictures/villa_zefiro/ok%20drone3.webp',
    layer: 3,
    position: { top: '55%', right: '5%' },
    size: { width: '10vw', height: '12vh' },
    mobileSize: { width: '14vw', height: '9vh' },
    mobilePosition: { top: '55%', right: '3%' },
  },
  {
    src: '/pictures/villa_zefiro/ok%20piscine%20notte.webp',
    layer: 3,
    position: { bottom: '60%', left: '60%' },
    size: { width: '11vw', height: '13vh' },
    mobileSize: { width: '15vw', height: '10vh' },
    mobilePosition: { bottom: '60%', left: '55%' },
  },
];

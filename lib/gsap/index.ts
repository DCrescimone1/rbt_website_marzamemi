/**
 * GSAP Plugin Registration and Configuration
 * 
 * This module handles the registration of GSAP plugins for the hero animation system.
 * It provides error handling for plugin loading and fallback behavior.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Note: ScrollSmoother and SplitText require GSAP Club membership
// These will be conditionally imported and registered if available

// Attempt to import ScrollSmoother (requires GSAP Club membership)
let ScrollSmoother: any = null;
try {
  // @ts-ignore - ScrollSmoother may not be available
  ScrollSmoother = require('gsap/ScrollSmoother').ScrollSmoother;
} catch (error) {
  console.warn('ScrollSmoother not available - requires GSAP Club membership');
}

// Attempt to import SplitText (requires GSAP Club membership)
let SplitText: any = null;
try {
  // @ts-ignore - SplitText may not be available
  SplitText = require('gsap/SplitText').SplitText;
} catch (error) {
  console.warn('SplitText not available - requires GSAP Club membership');
}

/**
 * Registers core GSAP plugins required for hero animations
 * Wraps plugin registration in try-catch for error handling
 * 
 * @returns boolean indicating if all required plugins were successfully registered
 * @throws Error if critical plugins (ScrollTrigger) fail to register
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */
export function registerGSAPPlugins(): boolean {
  try {
    // Register ScrollTrigger (included in GSAP core) - CRITICAL
    // Requirement 1.2
    gsap.registerPlugin(ScrollTrigger);
    console.log('✓ GSAP ScrollTrigger registered successfully');
    
    // Register ScrollSmoother if available (optional)
    // Requirement 1.3
    if (ScrollSmoother) {
      try {
        gsap.registerPlugin(ScrollSmoother);
        console.log('✓ ScrollSmoother registered successfully');
      } catch (error) {
        console.error('Failed to register ScrollSmoother:', error);
        console.log('ℹ Continuing without ScrollSmoother - animations will still work');
      }
    } else {
      console.log('ℹ ScrollSmoother not available - requires GSAP Club membership');
    }
    
    // Register SplitText if available (optional)
    // Requirement 1.4
    if (SplitText) {
      try {
        gsap.registerPlugin(SplitText);
        console.log('✓ SplitText registered successfully');
      } catch (error) {
        console.error('Failed to register SplitText:', error);
        console.log('ℹ Continuing without SplitText - text reveal will use fallback');
      }
    } else {
      console.log('ℹ SplitText not available - requires GSAP Club membership');
    }
    
    return true;
  } catch (error) {
    console.error('CRITICAL: Failed to register GSAP plugins:', error);
    console.error('Hero animations will not work. Falling back to static hero.');
    return false;
  }
}

/**
 * Attempts to register premium GSAP plugins (ScrollSmoother, SplitText)
 * These require GSAP Club membership and may not be available
 * @returns object indicating which premium plugins are available
 */
export function registerPremiumPlugins(): {
  scrollSmoother: boolean;
  splitText: boolean;
} {
  const result = {
    scrollSmoother: !!ScrollSmoother,
    splitText: !!SplitText,
  };

  if (!result.scrollSmoother) {
    console.log('ℹ ScrollSmoother requires GSAP Club membership');
  }

  if (!result.splitText) {
    console.log('ℹ SplitText requires GSAP Club membership');
  }

  return result;
}

/**
 * Checks if a GSAP plugin is available
 * @param pluginName - Name of the plugin to check
 * @returns boolean indicating if the plugin is available
 */
export function isPluginAvailable(pluginName: string): boolean {
  try {
    // Check if plugin is registered in GSAP
    return gsap.plugins && pluginName in gsap.plugins;
  } catch {
    return false;
  }
}

/**
 * Checks if SplitText plugin is available
 * @returns boolean indicating if SplitText is available
 */
export function isSplitTextAvailable(): boolean {
  return SplitText !== null;
}

/**
 * Export GSAP and ScrollTrigger for use in components
 */
export { gsap, ScrollTrigger, ScrollSmoother, SplitText };

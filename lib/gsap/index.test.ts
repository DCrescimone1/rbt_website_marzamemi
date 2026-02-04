/**
 * Tests for GSAP plugin registration and configuration
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { gsap, ScrollTrigger, registerGSAPPlugins, isPluginAvailable } from './index';

describe('GSAP Plugin Registration', () => {
  beforeEach(() => {
    // Clean up any existing ScrollTrigger instances
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  });

  it('should successfully import gsap core library', () => {
    expect(gsap).toBeDefined();
    expect(typeof gsap.to).toBe('function');
    expect(typeof gsap.from).toBe('function');
    expect(typeof gsap.fromTo).toBe('function');
  });

  it('should successfully import ScrollTrigger plugin', () => {
    expect(ScrollTrigger).toBeDefined();
    expect(typeof ScrollTrigger.create).toBe('function');
    expect(typeof ScrollTrigger.refresh).toBe('function');
  });

  it('should register GSAP plugins without errors', () => {
    const result = registerGSAPPlugins();
    expect(result).toBe(true);
  });

  it('should have ScrollTrigger available after registration', () => {
    registerGSAPPlugins();
    expect(ScrollTrigger).toBeDefined();
  });
});

describe('GSAP Configuration', () => {
  it('should export gsap for component use', () => {
    expect(gsap).toBeDefined();
    expect(gsap.version).toBeDefined();
  });

  it('should export ScrollTrigger for component use', () => {
    expect(ScrollTrigger).toBeDefined();
  });
});

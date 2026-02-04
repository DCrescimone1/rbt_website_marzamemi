/**
 * Verification script for GSAP installation
 * Run with: npx tsx verify-gsap-installation.ts
 */

import { gsap, ScrollTrigger, registerGSAPPlugins } from './lib/gsap/index';
import { layerConfig, zoomContainerConfig, scrollSmootherConfig } from './lib/gsap/config';

console.log('🔍 Verifying GSAP Installation...\n');

// Test 1: GSAP Core
console.log('✓ Test 1: GSAP Core Library');
console.log(`  - GSAP version: ${gsap.version}`);
console.log(`  - gsap.to: ${typeof gsap.to === 'function' ? '✓' : '✗'}`);
console.log(`  - gsap.from: ${typeof gsap.from === 'function' ? '✓' : '✗'}`);
console.log(`  - gsap.timeline: ${typeof gsap.timeline === 'function' ? '✓' : '✗'}`);

// Test 2: ScrollTrigger Plugin
console.log('\n✓ Test 2: ScrollTrigger Plugin');
console.log(`  - ScrollTrigger.create: ${typeof ScrollTrigger.create === 'function' ? '✓' : '✗'}`);
console.log(`  - ScrollTrigger.refresh: ${typeof ScrollTrigger.refresh === 'function' ? '✓' : '✗'}`);
console.log(`  - ScrollTrigger.getAll: ${typeof ScrollTrigger.getAll === 'function' ? '✓' : '✗'}`);

// Test 3: Plugin Registration
console.log('\n✓ Test 3: Plugin Registration');
const registrationResult = registerGSAPPlugins();
console.log(`  - Registration successful: ${registrationResult ? '✓' : '✗'}`);

// Test 4: Configuration Files
console.log('\n✓ Test 4: Configuration Files');
console.log(`  - Layer config defined: ${Object.keys(layerConfig).length === 3 ? '✓' : '✗'}`);
console.log(`  - Layer 1 scale: ${layerConfig[1].scale.from} → ${layerConfig[1].scale.to}`);
console.log(`  - Layer 2 scale: ${layerConfig[2].scale.from} → ${layerConfig[2].scale.to}`);
console.log(`  - Layer 3 scale: ${layerConfig[3].scale.from} → ${layerConfig[3].scale.to}`);
console.log(`  - Zoom container config defined: ${zoomContainerConfig ? '✓' : '✗'}`);
console.log(`  - ScrollSmoother config defined: ${scrollSmootherConfig ? '✓' : '✗'}`);

// Test 5: Layer Z-Depth Ordering
console.log('\n✓ Test 5: Layer Z-Depth Ordering (Property 2)');
const layer1Z = layerConfig[1].initialZ;
const layer2Z = layerConfig[2].initialZ;
const layer3Z = layerConfig[3].initialZ;
const orderingCorrect = layer1Z < layer2Z && layer2Z < layer3Z;
console.log(`  - Layer 1 z-depth: ${layer1Z}px`);
console.log(`  - Layer 2 z-depth: ${layer2Z}px`);
console.log(`  - Layer 3 z-depth: ${layer3Z}px`);
console.log(`  - Ordering correct (L1 < L2 < L3): ${orderingCorrect ? '✓' : '✗'}`);

console.log('\n✅ GSAP Installation Verification Complete!\n');
console.log('📦 Installed packages:');
console.log('  - gsap: Core animation library');
console.log('  - @gsap/react: React integration with useGSAP hook');
console.log('  - ScrollTrigger: Scroll-based animations (included in gsap)');
console.log('\n⚠️  Note: ScrollSmoother and SplitText require GSAP Club membership');
console.log('   These will need to be added separately if available.\n');

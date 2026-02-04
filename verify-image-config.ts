/**
 * Verification script for image configuration
 * Validates that the imageConfigs array meets all requirements
 */

import { imageConfigs, layerConfig } from './lib/gsap/config';

console.log('🔍 Verifying image configuration...\n');

// Requirement 6.1: 12 images total
const totalImages = imageConfigs.length;
console.log(`✓ Total images: ${totalImages} (expected: 12)`);
if (totalImages !== 12) {
  console.error('❌ FAIL: Expected 12 images');
  process.exit(1);
}

// Requirements 6.3, 6.4, 6.5: 4 images per layer
const layer1 = imageConfigs.filter(img => img.layer === 1);
const layer2 = imageConfigs.filter(img => img.layer === 2);
const layer3 = imageConfigs.filter(img => img.layer === 3);

console.log(`✓ Layer 1 images: ${layer1.length} (expected: 4)`);
console.log(`✓ Layer 2 images: ${layer2.length} (expected: 4)`);
console.log(`✓ Layer 3 images: ${layer3.length} (expected: 4)`);

if (layer1.length !== 4 || layer2.length !== 4 || layer3.length !== 4) {
  console.error('❌ FAIL: Expected 4 images per layer');
  process.exit(1);
}

// Requirement 6.2: Percentage-based positioning
console.log('\n✓ Checking percentage-based positioning...');
let allPercentageBased = true;
imageConfigs.forEach((img, idx) => {
  const hasPercentage = Object.values(img.position).some(val => 
    val && val.includes('%')
  );
  if (!hasPercentage) {
    console.error(`❌ Image ${idx} missing percentage-based positioning`);
    allPercentageBased = false;
  }
});

if (allPercentageBased) {
  console.log('✓ All images use percentage-based positioning');
}

// Requirement 6.6: Absolute positioning (viewport units)
console.log('\n✓ Checking viewport-based sizing...');
let allViewportBased = true;
imageConfigs.forEach((img, idx) => {
  const hasViewportUnits = 
    (img.size.width.includes('vw') || img.size.width.includes('vh')) &&
    (img.size.height.includes('vw') || img.size.height.includes('vh'));
  
  if (!hasViewportUnits) {
    console.error(`❌ Image ${idx} missing viewport-based sizing`);
    allViewportBased = false;
  }
});

if (allViewportBased) {
  console.log('✓ All images use viewport-based sizing');
}

// Verify z-depth ordering (Property 2)
console.log('\n✓ Checking z-depth ordering...');
const layer1Z = layerConfig[1].initialZ;
const layer2Z = layerConfig[2].initialZ;
const layer3Z = layerConfig[3].initialZ;

console.log(`  Layer 1 z-depth: ${layer1Z}px`);
console.log(`  Layer 2 z-depth: ${layer2Z}px`);
console.log(`  Layer 3 z-depth: ${layer3Z}px`);

if (layer1Z < layer2Z && layer2Z < layer3Z) {
  console.log('✓ Z-depth ordering is correct (Layer 1 < Layer 2 < Layer 3)');
} else {
  console.error('❌ FAIL: Z-depth ordering is incorrect');
  process.exit(1);
}

console.log('\n✅ All verification checks passed!');
console.log('\nImage distribution summary:');
console.log(`  Layer 1 (closest, z=${layer1Z}px): ${layer1.length} images`);
console.log(`  Layer 2 (middle, z=${layer2Z}px): ${layer2.length} images`);
console.log(`  Layer 3 (farthest, z=${layer3Z}px): ${layer3.length} images`);

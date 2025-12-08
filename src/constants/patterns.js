/**
 * Visual pattern constants for flicker rendering
 * These patterns control how the light intensity is distributed across the canvas
 */
export const PATTERNS = Object.freeze({
  UNIFORM: 'uniform',
  RADIAL: 'radial',
  SPIRAL: 'spiral',
  TUNNEL: 'tunnel',
  CHECKERBOARD: 'checkerboard',
  CONCENTRIC: 'concentric',
  STARBURST: 'starburst',
  VORTEX: 'vortex',
});

/**
 * Get human-readable name for a pattern
 * @param {string} pattern - Pattern constant
 * @returns {string} Display name
 */
export function getPatternName(pattern) {
  const names = {
    [PATTERNS.UNIFORM]: 'Uniform',
    [PATTERNS.RADIAL]: 'Radial',
    [PATTERNS.SPIRAL]: 'Spiral',
    [PATTERNS.TUNNEL]: 'Tunnel',
    [PATTERNS.CHECKERBOARD]: 'Checkerboard',
    [PATTERNS.CONCENTRIC]: 'Concentric',
    [PATTERNS.STARBURST]: 'Starburst',
    [PATTERNS.VORTEX]: 'Vortex',
  };
  return names[pattern] || pattern;
}

/**
 * Get all pattern values as an array
 * @returns {string[]} Array of pattern constants
 */
export function getAllPatterns() {
  return Object.values(PATTERNS);
}

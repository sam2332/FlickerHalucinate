/**
 * Easing functions for smooth transitions
 */

/**
 * Cubic ease-in-out function for smooth acceleration/deceleration
 * Used for frequency transitions between phases
 * 
 * @param {number} t - Progress value 0-1
 * @returns {number} Eased value 0-1
 */
export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Linear interpolation between two values
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Progress 0-1
 * @returns {number} Interpolated value
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Smooth step function (hermite interpolation)
 * @param {number} t - Progress 0-1
 * @returns {number} Smoothed value 0-1
 */
export function smoothStep(t) {
  return t * t * (3 - 2 * t);
}

/**
 * Ease-in quadratic
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value 0-1
 */
export function easeInQuad(t) {
  return t * t;
}

/**
 * Ease-out quadratic
 * @param {number} t - Progress 0-1
 * @returns {number} Eased value 0-1
 */
export function easeOutQuad(t) {
  return t * (2 - t);
}

/**
 * Brainwave frequency bands and safety constraints
 * 
 * CRITICAL SAFETY: Never exceed 15 Hz to avoid photosensitive epilepsy triggers
 * Safe range: 5-15 Hz (alpha/theta bands)
 * Best entrainment: 8-13 Hz (alpha band)
 */

export const FREQUENCY_BANDS = Object.freeze({
  DELTA: { min: 0.5, max: 4, name: 'Delta', description: 'Deep sleep states' },
  THETA: { min: 4, max: 8, name: 'Theta', description: 'Meditation, creativity, deep relaxation' },
  ALPHA: { min: 8, max: 13, name: 'Alpha', description: 'Relaxed focus, visual hallucinations' },
  BETA: { min: 13, max: 30, name: 'Beta', description: 'Active thinking, alertness' },
});

/**
 * CRITICAL: Safe frequency limits for photic stimulation
 */
export const SAFETY_LIMITS = Object.freeze({
  MIN_SAFE_FREQUENCY: 5,    // Hz - Below this is too slow for visual effect
  MAX_SAFE_FREQUENCY: 15,   // Hz - NEVER exceed this (epilepsy risk at 15-25 Hz)
  OPTIMAL_MIN: 8,           // Hz - Optimal alpha band start
  OPTIMAL_MAX: 13,          // Hz - Optimal alpha band end
  MIN_RAMP_TIME: 3,         // seconds - Minimum ramp-in/ramp-out duration
});

/**
 * Validate frequency is within safe range
 * @param {number} frequency - Frequency in Hz
 * @returns {boolean} True if safe
 */
export function isFrequencySafe(frequency) {
  return frequency >= SAFETY_LIMITS.MIN_SAFE_FREQUENCY 
    && frequency <= SAFETY_LIMITS.MAX_SAFE_FREQUENCY;
}

/**
 * Clamp frequency to safe range
 * @param {number} frequency - Frequency in Hz
 * @returns {number} Clamped frequency
 */
export function clampFrequency(frequency) {
  return Math.max(
    SAFETY_LIMITS.MIN_SAFE_FREQUENCY,
    Math.min(SAFETY_LIMITS.MAX_SAFE_FREQUENCY, frequency)
  );
}

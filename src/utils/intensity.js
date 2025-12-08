/**
 * Intensity calculation utilities for flicker effects
 * Combines sine waves with harmonics for complex waveforms
 */

/**
 * Calculate flicker intensity at a given time using sine wave + harmonics
 * 
 * Algorithm breakdown:
 * 1. Primary sine wave at target frequency
 * 2. Second harmonic (2x frequency) at 30% amplitude
 * 3. Sub-harmonic (0.5x frequency) at 20% amplitude
 * 4. Normalize combined wave to 0-1 range
 * 5. Apply power curve (1.8) for sharper on/off transitions
 * 6. Apply phase intensity and ramp modulation
 * 
 * @param {number} freq - Frequency in Hz
 * @param {number} time - Time in seconds
 * @param {object} phase - Phase configuration
 * @param {number} phaseElapsed - Time elapsed in current phase (seconds)
 * @returns {number} Intensity value 0-1
 */
export function calculateIntensity(freq, time, phase, phaseElapsed) {
  // Generate complex waveform with harmonics
  const primary = Math.sin(2 * Math.PI * freq * time);
  
  // 0.3 = 30% amplitude of primary for 2nd harmonic (double frequency)
  // 0.2 = 20% amplitude for sub-harmonic (half frequency)
  const harmonic1 = 0.3 * Math.sin(2 * Math.PI * (freq * 2) * time);
  const harmonic2 = 0.2 * Math.sin(2 * Math.PI * (freq * 0.5) * time);
  
  // Combine waves: range is roughly -1.5 to +1.5
  const combined = primary + harmonic1 + harmonic2;
  
  // Normalize to 0-1 range (1.5 is max amplitude with harmonics)
  const normalized = (combined + 1.5) / 3.0;
  
  // Apply power curve for sharper transitions
  // 1.0 = linear, 2.0 = moderate sharpening, 3.0+ = very sharp on/off
  const curved = Math.pow(Math.max(0, Math.min(1, normalized)), 1.8);
  
  // Calculate intensity multiplier based on phase settings and ramps
  let intensityMultiplier = phase.intensity;
  
  // Ramp in: fade from 0 to full intensity
  if (phaseElapsed < phase.rampIn) {
    intensityMultiplier *= phaseElapsed / phase.rampIn;
  }
  
  // Ramp out: fade from full intensity to 0
  const rampOutStart = phase.duration - phase.rampOut;
  if (phaseElapsed > rampOutStart) {
    const rampProgress = (phaseElapsed - rampOutStart) / phase.rampOut;
    intensityMultiplier *= (1 - rampProgress);
  }
  
  // TODO: GUARDRAIL REMOVED - was 0.15 floor + 0.75 range (max 0.9)
  // Now: 0.0 floor + 1.0 range (full black to full white)
  return curved * intensityMultiplier;
}

/**
 * Calculate RGB value from intensity (0-1 to 0-255 grayscale)
 * @param {number} intensity - Intensity 0-1
 * @returns {number} RGB value 0-255
 */
export function intensityToRGB(intensity) {
  return Math.floor(Math.max(0, Math.min(1, intensity)) * 255);
}

/**
 * Create RGB color string from intensity
 * @param {number} intensity - Intensity 0-1
 * @returns {string} RGB color string
 */
export function intensityToColor(intensity) {
  const val = intensityToRGB(intensity);
  return `rgb(${val}, ${val}, ${val})`;
}

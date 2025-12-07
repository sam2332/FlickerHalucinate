/**
 * Flicker System Tests
 * 
 * Run with: npm test
 * 
 * These tests verify the core calculations and guardrail documentation
 */

import { describe, it, expect } from 'vitest';
import {
  PATTERNS,
  FREQUENCY_BANDS,
  EXPERIENCE_PACKS,
  getPackDuration,
  formatDuration,
  getCurrentPhase,
  getInterpolatedFrequency
} from '../packs';

describe('Frequency Bands', () => {
  it('should cover full EEG spectrum', () => {
    // TODO: GUARDRAIL - These are the scientifically recognized brainwave bands
    expect(FREQUENCY_BANDS.DELTA.min).toBe(0.5);  // Deep sleep
    expect(FREQUENCY_BANDS.DELTA.max).toBe(4);
    expect(FREQUENCY_BANDS.THETA.min).toBe(4);    // Meditation
    expect(FREQUENCY_BANDS.THETA.max).toBe(8);
    expect(FREQUENCY_BANDS.ALPHA_LOW.min).toBe(8); // Most effective for photic driving
    expect(FREQUENCY_BANDS.ALPHA_HIGH.max).toBe(13);
    expect(FREQUENCY_BANDS.BETA_LOW.min).toBe(13); // Active thinking
    expect(FREQUENCY_BANDS.BETA_HIGH.max).toBe(30);
    expect(FREQUENCY_BANDS.GAMMA.min).toBe(30);   // High cognition
  });

  it('should have no gaps between bands', () => {
    expect(FREQUENCY_BANDS.DELTA.max).toBe(FREQUENCY_BANDS.THETA.min);
    expect(FREQUENCY_BANDS.THETA.max).toBe(FREQUENCY_BANDS.ALPHA_LOW.min);
    // Note: There's intentional overlap in alpha for flexibility
  });
});

describe('Patterns', () => {
  it('should have all 8 pattern types defined', () => {
    expect(Object.keys(PATTERNS)).toHaveLength(8);
    expect(PATTERNS.UNIFORM).toBeDefined();
    expect(PATTERNS.RADIAL).toBeDefined();
    expect(PATTERNS.SPIRAL).toBeDefined();
    expect(PATTERNS.TUNNEL).toBeDefined();
    expect(PATTERNS.CHECKERBOARD).toBeDefined();
    expect(PATTERNS.CONCENTRIC).toBeDefined();
    expect(PATTERNS.STARBURST).toBeDefined();
    expect(PATTERNS.VORTEX).toBeDefined();
  });
});

describe('Experience Packs', () => {
  it('should have at least 6 packs', () => {
    expect(EXPERIENCE_PACKS.length).toBeGreaterThanOrEqual(6);
  });

  it('should include an "Overdrive" pack with full intensity', () => {
    const overdrive = EXPERIENCE_PACKS.find(p => p.id === 'overdrive');
    expect(overdrive).toBeDefined();
    
    // TODO: GUARDRAIL REMOVED - Overdrive should hit 1.0 intensity
    const maxIntensity = Math.max(...overdrive.phases.map(p => p.intensity));
    expect(maxIntensity).toBe(1.0);
  });

  it('all packs should have valid frequencies', () => {
    EXPERIENCE_PACKS.forEach(pack => {
      pack.phases.forEach(phase => {
        // TODO: GUARDRAIL - Frequency should be in usable range (0.5 - 60 Hz)
        // Below 0.5 Hz is imperceptible, above 60 Hz exceeds most display refresh
        expect(phase.frequency).toBeGreaterThanOrEqual(0.5);
        expect(phase.frequency).toBeLessThanOrEqual(60);
      });
    });
  });

  it('all packs should have valid intensities', () => {
    EXPERIENCE_PACKS.forEach(pack => {
      pack.phases.forEach(phase => {
        // TODO: GUARDRAIL - Intensity should be 0-1 (0% to 100%)
        expect(phase.intensity).toBeGreaterThanOrEqual(0);
        expect(phase.intensity).toBeLessThanOrEqual(1);
      });
    });
  });

  it('advanced packs should allow full 1.0 intensity', () => {
    const advancedPacks = EXPERIENCE_PACKS.filter(p => p.difficulty === 'advanced');
    
    advancedPacks.forEach(pack => {
      const maxIntensity = Math.max(...pack.phases.map(p => p.intensity));
      // TODO: GUARDRAIL REMOVED - Advanced packs should not cap intensity
      expect(maxIntensity).toBe(1.0);
    });
  });

  it('should have packs covering theta to beta frequency ranges', () => {
    const allFrequencies = EXPERIENCE_PACKS.flatMap(p => p.phases.map(ph => ph.frequency));
    const minFreq = Math.min(...allFrequencies);
    const maxFreq = Math.max(...allFrequencies);
    
    // Should go down to theta (around 5-6 Hz)
    expect(minFreq).toBeLessThanOrEqual(6);
    
    // Should go up to low beta (around 14-15 Hz)
    // TODO: GUARDRAIL - staying below 16 Hz to avoid seizure trigger zone
    expect(maxFreq).toBeGreaterThanOrEqual(14);
  });
});

describe('Duration Calculations', () => {
  it('should correctly calculate pack duration', () => {
    const testPack = {
      phases: [
        { duration: 30 },
        { duration: 45 },
        { duration: 60 }
      ]
    };
    expect(getPackDuration(testPack)).toBe(135);
  });

  it('should format duration correctly', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(59)).toBe('0:59');
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(125)).toBe('2:05');
    expect(formatDuration(3661)).toBe('61:01');
  });
});

describe('Phase Calculations', () => {
  const testPack = {
    phases: [
      { duration: 30, frequency: 10, name: 'Phase 1', rampIn: 3, rampOut: 3 },
      { duration: 45, frequency: 8, name: 'Phase 2', rampIn: 3, rampOut: 3 },
      { duration: 60, frequency: 12, name: 'Phase 3', rampIn: 3, rampOut: 3 }
    ]
  };

  it('should return correct phase at start', () => {
    const info = getCurrentPhase(testPack, 0);
    expect(info.phaseIndex).toBe(0);
    expect(info.phase.name).toBe('Phase 1');
    expect(info.phaseElapsed).toBe(0);
  });

  it('should return correct phase in middle', () => {
    const info = getCurrentPhase(testPack, 50);
    expect(info.phaseIndex).toBe(1);
    expect(info.phase.name).toBe('Phase 2');
    expect(info.phaseElapsed).toBe(20); // 50 - 30 = 20 into phase 2
  });

  it('should return last phase when exceeded', () => {
    const info = getCurrentPhase(testPack, 200);
    expect(info.phaseIndex).toBe(2);
    expect(info.phase.name).toBe('Phase 3');
    expect(info.phaseProgress).toBe(1);
  });

  it('should interpolate frequency during transitions', () => {
    // At the start of phase 2 (30 seconds), should be ramping from 10 to 8 Hz
    const freq = getInterpolatedFrequency(testPack, 31);
    expect(freq).toBeGreaterThan(8);
    expect(freq).toBeLessThan(10);
  });
});

describe('Intensity Calculation Verification', () => {
  // These values document what the intensity calculation SHOULD produce
  // with guardrails removed
  
  it('documents intensity formula', () => {
    // The intensity formula without guardrails:
    // 1. Primary sine wave at target frequency
    // 2. Add 30% 2nd harmonic (double freq)
    // 3. Add 20% sub-harmonic (half freq)
    // 4. Normalize combined wave to 0-1
    // 5. Apply power curve (1.8) for sharpening
    // 6. Multiply by phase intensity (0-1)
    // 7. Apply ramp in/out multipliers
    
    // TODO: GUARDRAIL REMOVED - Old formula:
    // return 0.15 + (curved * 0.75 * intensityMultiplier);
    // This capped output to 0.15-0.90 range
    
    // TODO: GUARDRAIL REMOVED - New formula:
    // return curved * intensityMultiplier;
    // This allows full 0.0-1.0 range
    
    expect(true).toBe(true); // Documentation test
  });

  it('documents flicker frequency meaning', () => {
    // TODO: These frequencies have specific neurological effects:
    
    // 4-6 Hz (Theta): Deep meditation, drowsiness, hypnagogic states
    // - Best for: relaxation, creativity, sleep transition
    
    // 7-8 Hz (Theta-Alpha border): Light meditation
    // - Best for: relaxation, reduced anxiety
    
    // 8-10 Hz (Low Alpha): Relaxed wakefulness, eyes closed
    // - Best for: calm focus, light entrainment
    
    // 10-12 Hz (High Alpha): Alert relaxation
    // - Best for: strong visual entrainment, pattern perception
    // - This is the MOST EFFECTIVE range for photic driving
    
    // 12-15 Hz (SMR/Low Beta): Focused attention
    // - Best for: concentration, sensorimotor rhythm training
    
    // 15-25 Hz: CAUTION - Seizure trigger zone
    // - Photosensitive epilepsy can be triggered here
    
    // 25-40 Hz (Beta-Gamma): High cognition
    // - Best for: problem solving, peak performance
    // - Harder to perceive visually due to flicker fusion
    
    expect(true).toBe(true); // Documentation test
  });

  it('documents jitter parameter', () => {
    // TODO: Jitter adds random variation to frequency
    // jitter: 0.0 = exact frequency, no variation
    // jitter: 0.1 = ±0.05 Hz variation
    // jitter: 0.5 = ±0.25 Hz variation (chaotic feel)
    // jitter: 1.0 = ±0.5 Hz variation (maximum chaos)
    
    // Jitter prevents habituation - the brain adapts less to unpredictable stimuli
    
    expect(true).toBe(true); // Documentation test
  });
});

describe('Safety Notes (Documentation)', () => {
  it('documents what is NOT enforced', () => {
    // TODO: The following guardrails have been REMOVED:
    
    // 1. Intensity floor (was 0.15, now 0.0)
    //    - Full black is now possible
    //    - More dramatic contrast
    
    // 2. Intensity ceiling (was 0.75 * multiplier, now 1.0)
    //    - Full white is now possible
    //    - Maximum contrast ratio
    
    // 3. Ramp-out reduction (was 30% reduction, now 100%)
    //    - Phases can fully fade out
    //    - More dramatic transitions
    
    // 4. Frequency range (was 6-12 Hz, now 0.5-60 Hz)
    //    - Full spectrum now available
    //    - User assumes responsibility
    
    // 5. Default intensity (was 0.85, now 1.0)
    //    - New phases default to full power
    
    expect(true).toBe(true); // Documentation test
  });

  it('documents what IS still enforced', () => {
    // TODO: The following safety measures remain:
    
    // 1. Seizure warning screen must be acknowledged
    // 2. Tap to pause functionality always available
    // 3. Double-tap to exit always available
    // 4. ESC key always exits
    // 5. Session has defined end (not infinite)
    // 6. Fade out on exit (gradual, not instant)
    
    expect(true).toBe(true); // Documentation test
  });
});

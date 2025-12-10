/**
 * Flicker System Tests
 * 
 * Run with: npm test
 * 
 * These tests verify the core calculations and document Dreamachine research
 * Based on Brion Gysin's 1959 Dreamachine and subsequent neuroscience studies
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

describe('Frequency Bands (Dreamachine Research)', () => {
  it('should define alpha range as 8-13 Hz (Dreamachine optimal)', () => {
    // The Dreamachine was designed to flicker at 8-13 Hz
    // This is the alpha brainwave band where photic driving is strongest
    expect(FREQUENCY_BANDS.ALPHA_LOW.min).toBe(8);
    expect(FREQUENCY_BANDS.ALPHA_HIGH.max).toBe(13);
  });

  it('should identify 10 Hz as the Berger frequency', () => {
    // Hans Berger discovered the ~10 Hz alpha rhythm in 1929
    // This is the dominant frequency of relaxed, eyes-closed wakefulness
    expect(FREQUENCY_BANDS.ALPHA_MID.min).toBe(10);
    expect(FREQUENCY_BANDS.ALPHA_MID.name).toBe('Berger Frequency');
  });

  it('should define theta range as 4-8 Hz (hypnagogic states)', () => {
    // Theta frequencies induce drowsiness and hypnagogic imagery
    expect(FREQUENCY_BANDS.THETA.min).toBe(4);
    expect(FREQUENCY_BANDS.THETA.max).toBe(8);
  });

  it('should mark 15-25 Hz as danger zone', () => {
    // 15-25 Hz is the photosensitive epilepsy trigger range
    expect(FREQUENCY_BANDS.BETA_HIGH.min).toBe(15);
    expect(FREQUENCY_BANDS.BETA_HIGH.max).toBe(25);
    expect(FREQUENCY_BANDS.BETA_HIGH.name).toBe('DANGER ZONE');
  });

  it('should have continuous coverage from delta to beta', () => {
    expect(FREQUENCY_BANDS.DELTA.max).toBe(FREQUENCY_BANDS.THETA.min);
    expect(FREQUENCY_BANDS.THETA.max).toBe(FREQUENCY_BANDS.ALPHA_LOW.min);
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

  it('should use UNIFORM for authentic Dreamachine experience', () => {
    // Original Dreamachine used uniform field (Ganzfeld effect)
    // Non-uniform patterns are visual enhancements, not authentic
    const classicPack = EXPERIENCE_PACKS.find(p => p.id === 'classic-dreamachine');
    expect(classicPack).toBeDefined();
    
    // All phases should use UNIFORM for authentic experience
    classicPack.phases.forEach(phase => {
      expect(phase.pattern).toBe(PATTERNS.UNIFORM);
    });
  });
});

describe('Experience Packs (Dreamachine-Based)', () => {
  it('should have at least 6 packs covering different use cases', () => {
    expect(EXPERIENCE_PACKS.length).toBeGreaterThanOrEqual(6);
  });

  it('should include a Classic Dreamachine pack at 10 Hz', () => {
    const classic = EXPERIENCE_PACKS.find(p => p.id === 'classic-dreamachine');
    expect(classic).toBeDefined();
    expect(classic.difficulty).toBe('beginner');
    
    // Should have a phase at the Berger frequency (10 Hz)
    const bergerPhase = classic.phases.find(p => p.frequency === 10);
    expect(bergerPhase).toBeDefined();
  });

  it('should have theta-based pack for hypnagogic states', () => {
    // Theta (4-8 Hz) induces drowsiness and dream-like imagery
    const thetaPacks = EXPERIENCE_PACKS.filter(p => 
      p.phases.some(phase => phase.frequency >= 4 && phase.frequency < 8)
    );
    expect(thetaPacks.length).toBeGreaterThanOrEqual(1);
  });

  it('all packs should stay within safe frequency range (4-14 Hz)', () => {
    // Based on research: below 4 Hz is imperceptible, above 14 Hz approaches danger zone
    EXPERIENCE_PACKS.forEach(pack => {
      pack.phases.forEach(phase => {
        expect(phase.frequency).toBeGreaterThanOrEqual(4);
        expect(phase.frequency).toBeLessThanOrEqual(14);
      });
    });
  });

  it('no pack should enter the 15-25 Hz seizure danger zone', () => {
    // CRITICAL SAFETY: 15-25 Hz triggers photosensitive epilepsy
    EXPERIENCE_PACKS.forEach(pack => {
      pack.phases.forEach(phase => {
        expect(phase.frequency).toBeLessThan(15);
      });
    });
  });

  it('all packs should have valid intensities (0-1)', () => {
    EXPERIENCE_PACKS.forEach(pack => {
      pack.phases.forEach(phase => {
        expect(phase.intensity).toBeGreaterThanOrEqual(0);
        expect(phase.intensity).toBeLessThanOrEqual(1);
      });
    });
  });

  it('advanced packs should allow full 1.0 intensity', () => {
    const advancedPacks = EXPERIENCE_PACKS.filter(p => p.difficulty === 'advanced');
    
    advancedPacks.forEach(pack => {
      const maxIntensity = Math.max(...pack.phases.map(p => p.intensity));
      expect(maxIntensity).toBe(1.0);
    });
  });

  it('beginner packs should have slower onset (rampIn >= 6)', () => {
    const beginnerPacks = EXPERIENCE_PACKS.filter(p => p.difficulty === 'beginner');
    
    beginnerPacks.forEach(pack => {
      // First phase should have slow onset for safety
      expect(pack.phases[0].rampIn).toBeGreaterThanOrEqual(6);
    });
  });

  it('all packs should center around alpha range (8-13 Hz)', () => {
    // Dreamachine research shows alpha is optimal for visual entrainment
    EXPERIENCE_PACKS.forEach(pack => {
      const frequencies = pack.phases.map(p => p.frequency);
      const avgFreq = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
      
      // Average frequency should be in or near alpha range
      expect(avgFreq).toBeGreaterThanOrEqual(6);
      expect(avgFreq).toBeLessThanOrEqual(12);
    });
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
  it('documents intensity formula for flashlight control', () => {
    // Flashlight-based intensity (digital on/off):
    // 1. Native Java engine receives strobe frequency
    // 2. Half-period calculated: (1000 / frequency) / 2 ms
    // 3. Flashlight toggles on/off at half-period intervals
    // 4. Creates square wave approximation of sine wave
    //
    // For 10 Hz: half-period = 50ms (100ms full cycle)
    // Flash is ON for 50ms, OFF for 50ms = 10 cycles/second
    
    expect(true).toBe(true); // Documentation test
  });

  it('documents Dreamachine frequency effects', () => {
    // DREAMACHINE RESEARCH - Frequency-specific phenomena:
    
    // 4-5 Hz (Low Theta): 
    // - Near sleep threshold
    // - Slow, flowing imagery
    // - Best for: sleep induction, deep meditation
    
    // 5-7 Hz (Mid Theta):
    // - Hypnagogic imagery (faces, landscapes)
    // - Dream-like experiences
    // - Best for: creativity, lucid dream prep
    
    // 7-8 Hz (High Theta / Alpha border):
    // - Transition zone
    // - Relaxed but aware
    // - Best for: light meditation
    
    // 8-10 Hz (Low Alpha):
    // - Classic Dreamachine zone
    // - Mandala-like patterns
    // - Best for: visual entrainment
    
    // 10 Hz (Berger Frequency):
    // - THE OPTIMAL FREQUENCY
    // - Strongest photic driving response
    // - Vivid geometric hallucinations
    // - This is what the Dreamachine was designed for
    
    // 10-12 Hz (Mid Alpha):
    // - Intense geometric patterns
    // - Color phenomena (phosphenes)
    // - Best for: strong visual experience
    
    // 12-13 Hz (High Alpha):
    // - Rapid, complex patterns
    // - Alert but relaxed
    // - Best for: short, intense sessions
    
    // 13-14 Hz (Alpha-Beta border):
    // - Approaching active thinking
    // - Less visual, more alert
    // - CAUTION: getting close to danger zone
    
    // 15-25 Hz: NEVER USE - Seizure trigger range
    
    expect(true).toBe(true); // Documentation test
  });

  it('documents jitter parameter for organic feel', () => {
    // Jitter adds random frequency variation each flash cycle
    // Prevents habituation - brain adapts less to unpredictable stimuli
    //
    // jitter: 0.0 = exact frequency, machine-like precision
    // jitter: 0.1 = ±0.05 Hz variation, subtle organic feel
    // jitter: 0.2 = ±0.1 Hz variation, natural variation
    // jitter: 0.3 = ±0.15 Hz variation, noticeable drift
    //
    // Original Dreamachine had natural jitter from turntable speed variation
    
    expect(true).toBe(true); // Documentation test
  });
});

describe('Safety Documentation (Dreamachine Research)', () => {
  it('documents Dreamachine safety principles', () => {
    // BRION GYSIN DREAMACHINE SAFETY (1959):
    // 1. Use with EYES CLOSED - light passes through eyelids
    // 2. Uniform light field (Ganzfeld) is essential
    // 3. 8-13 Hz is the safe, effective range
    // 4. Sessions should have gradual onset and offset
    // 5. User should be able to stop at any time
    
    // MODERN SAFETY ADDITIONS:
    // 1. Seizure warning must be acknowledged
    // 2. Never exceed 14 Hz (approaching danger zone)
    // 3. NEVER use 15-25 Hz (photosensitive epilepsy trigger)
    // 4. Minimum 3s ramp in/out to prevent sudden onset
    // 5. Tap to pause, double-tap to exit always available
    
    expect(true).toBe(true); // Documentation test
  });

  it('documents what IS enforced for safety', () => {
    // ENFORCED SAFETY MEASURES:
    // 1. Seizure warning screen must be acknowledged before first use
    // 2. All packs stay within 4-14 Hz range
    // 3. No pack enters 15-25 Hz danger zone
    // 4. Minimum rampIn/rampOut of 3 seconds
    // 5. Tap to pause functionality always available
    // 6. Double-tap to exit always available
    // 7. ESC key always exits (desktop testing)
    // 8. Session has defined end (not infinite)
    // 9. Flashlight turns off on session end/exit
    // 10. Gradual fade out on exit (not instant stop)
    
    expect(true).toBe(true); // Documentation test
  });

  it('documents historical Dreamachine research', () => {
    // DREAMACHINE HISTORY:
    //
    // 1959: Brion Gysin and Ian Sommerville create Dreamachine
    // - 78 RPM turntable with slotted cylinder
    // - 100W bulb inside cylinder
    // - Produces 8-13 Hz flicker through slots
    // - User sits with closed eyes facing light
    //
    // 1960s: William S. Burroughs experiments with Dreamachine
    // - Documents "elaborate color visions"
    // - Notes similarity to psychedelic experiences
    //
    // 1970s-2000s: EEG studies confirm photic driving
    // - Alpha entrainment strongest at 10 Hz
    // - Closed eyes essential (light through eyelids)
    // - 15-25 Hz identified as seizure trigger range
    //
    // 2010s-present: Digital Dreamachine implementations
    // - LED/screen-based versions
    // - Smartphone flashlight implementations
    // - Same principles apply: 8-13 Hz, eyes closed, uniform field
    
    expect(true).toBe(true); // Documentation test
  });
});

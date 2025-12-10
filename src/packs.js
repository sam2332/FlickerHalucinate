// Experience Packs - Curated playlists of visual effects for controlled hallucination experiences
// Each pack contains a sequence of phases that transition smoothly

export const PATTERNS = {
  UNIFORM: 'uniform',
  RADIAL: 'radial',
  SPIRAL: 'spiral',
  TUNNEL: 'tunnel',
  CHECKERBOARD: 'checkerboard',
  CONCENTRIC: 'concentric',
  STARBURST: 'starburst',
  VORTEX: 'vortex'
};

// TODO: GUARDRAIL - Frequency bands based on Dreamachine research (Brion Gysin, 1959)
// and subsequent EEG/photic entrainment studies
//
// DREAMACHINE RESEARCH NOTES:
// - Original Dreamachine used 78 RPM turntable = ~8-13 Hz flicker
// - 10 Hz is the "Berger frequency" - dominant alpha rhythm
// - 8-13 Hz produces strongest photic driving response
// - Closed eyes facing light source is essential
// - Ganzfeld (uniform field) enhances hallucinations
//
// Delta (0.5-4 Hz): Deep sleep - NOT USED (too slow for visual entrainment)
// Theta (4-8 Hz): Hypnagogic states, drowsiness, lucid dream induction
// Alpha (8-13 Hz): Dreamachine sweet spot - strongest visual phenomena
// Beta (13-30 Hz): CAUTION: 15-25 Hz triggers photosensitive epilepsy
// Gamma (30-100 Hz): Above flicker fusion threshold - no entrainment
export const FREQUENCY_BANDS = {
  DELTA: { min: 0.5, max: 4, name: 'Delta', description: 'Deep sleep (not used)' },
  THETA: { min: 4, max: 8, name: 'Theta', description: 'Hypnagogic/dream states' },
  ALPHA_LOW: { min: 8, max: 10, name: 'Low Alpha', description: 'Dreamachine zone - relaxed visions' },
  ALPHA_MID: { min: 10, max: 10, name: 'Berger Frequency', description: '10 Hz sweet spot' },
  ALPHA_HIGH: { min: 10, max: 13, name: 'High Alpha', description: 'Dreamachine zone - vivid patterns' },
  BETA_LOW: { min: 13, max: 15, name: 'Low Beta', description: 'Alert focus (safe limit)' },
  BETA_HIGH: { min: 15, max: 25, name: 'DANGER ZONE', description: 'Seizure trigger range - AVOID' },
  GAMMA: { min: 30, max: 50, name: 'Gamma', description: 'Above flicker fusion' }
};

// Phase structure for each step in a pack
// duration: seconds - how long this phase lasts
// frequency: Hz - flicker rate (4-50 Hz practical range)
// pattern: visual pattern type
// rampIn/rampOut: seconds for smooth transition (prevents jarring shifts)
// intensity: 0-1 brightness multiplier
//   TODO: GUARDRAIL - intensity was capped at 0.85, now allows full 1.0
// colorMode: 'mono' | 'warm' | 'cool' | 'spectrum'
// jitter: random frequency variation (0-1, adds organic feel)
const createPhase = (config) => ({
  duration: 30,
  frequency: 10,
  pattern: PATTERNS.UNIFORM,
  rampIn: 3,      // TODO: GUARDRAIL - minimum ramp prevents sudden onset
  rampOut: 3,     // TODO: GUARDRAIL - minimum ramp prevents sudden stop  
  intensity: 1.0, // TODO: GUARDRAIL REMOVED - was 0.85, now full intensity
  colorMode: 'mono',
  jitter: 0,
  ...config
});

export const EXPERIENCE_PACKS = [
  {
    // Classic Dreamachine experience based on Brion Gysin's 1959 design
    // Uses 10 Hz (Berger frequency) as the optimal alpha entrainment point
    id: 'classic-dreamachine',
    name: 'Classic Dreamachine',
    description: 'Authentic Dreamachine experience at 10 Hz - the Berger frequency. Close your eyes and face the light.',
    duration: 300,
    difficulty: 'beginner',
    icon: '🌀',
    color: 'from-amber-400 to-orange-500',
    phases: [
      createPhase({
        name: 'Alpha Onset',
        duration: 45,
        frequency: 8,     // Start at low alpha boundary
        pattern: PATTERNS.UNIFORM,
        rampIn: 8,        // Slow onset per Dreamachine tradition
        intensity: 0.7,
        description: 'Gradual alpha entrainment begins'
      }),
      createPhase({
        name: 'Berger Frequency',
        duration: 120,
        frequency: 10,    // The 10 Hz sweet spot - Dreamachine optimal
        pattern: PATTERNS.UNIFORM,
        intensity: 0.85,
        description: 'Core Dreamachine experience at 10 Hz'
      }),
      createPhase({
        name: 'High Alpha',
        duration: 60,
        frequency: 11,    // Slight increase for pattern variation
        pattern: PATTERNS.UNIFORM,
        intensity: 0.9,
        jitter: 0.1,      // Subtle organic variation
        description: 'Enhanced visual phenomena'
      }),
      createPhase({
        name: 'Alpha Descent',
        duration: 45,
        frequency: 9,
        pattern: PATTERNS.UNIFORM,
        intensity: 0.75,
        description: 'Gradual return from peak'
      }),
      createPhase({
        name: 'Emergence',
        duration: 30,
        frequency: 8,
        pattern: PATTERNS.UNIFORM,
        rampOut: 12,
        intensity: 0.5,
        description: 'Gentle return to waking state'
      })
    ]
  },
  {
    // Hypnagogic tunnel experience - uses alpha-to-theta descent
    // Based on research showing theta (4-8 Hz) induces dream-like states
    id: 'hypnagogic-descent',
    name: 'Hypnagogic Descent',
    description: 'Alpha-to-theta journey inducing hypnagogic (pre-sleep) visions. Tunnel perception and dream imagery.',
    duration: 360,
    difficulty: 'intermediate',
    icon: '🌙',
    color: 'from-purple-600 to-indigo-800',
    phases: [
      createPhase({
        name: 'Alpha Ground',
        duration: 45,
        frequency: 10,    // Start at stable alpha
        pattern: PATTERNS.UNIFORM,
        rampIn: 8,
        intensity: 0.75,
        description: 'Establish alpha baseline'
      }),
      createPhase({
        name: 'Alpha-Theta Border',
        duration: 60,
        frequency: 8,     // 8 Hz is alpha-theta boundary
        pattern: PATTERNS.UNIFORM,
        intensity: 0.85,
        description: 'Crossing into theta territory'
      }),
      createPhase({
        name: 'Theta Onset',
        duration: 75,
        frequency: 7,     // Deep theta - hypnagogic imagery
        pattern: PATTERNS.UNIFORM,
        intensity: 0.9,
        jitter: 0.15,     // Subtle variation enhances dream-like quality
        description: 'Hypnagogic imagery begins'
      }),
      createPhase({
        name: 'Deep Theta',
        duration: 90,
        frequency: 5.5,   // Deep theta - approaching sleep threshold
        pattern: PATTERNS.UNIFORM,
        intensity: 0.95,
        jitter: 0.2,
        description: 'Deep dream-like state'
      }),
      createPhase({
        name: 'Theta Hold',
        duration: 45,
        frequency: 6,     // Maintain low theta
        pattern: PATTERNS.UNIFORM,
        intensity: 0.85,
        description: 'Sustained hypnagogic state'
      }),
      createPhase({
        name: 'Return to Alpha',
        duration: 45,
        frequency: 9,     // Gradual return
        pattern: PATTERNS.UNIFORM,
        rampOut: 10,
        intensity: 0.6,
        description: 'Gentle awakening'
      })
    ]
  },
  {
    // Alpha spectrum exploration - sweeps through 8-13 Hz range
    // Based on research showing different alpha sub-bands produce different phenomena
    id: 'alpha-spectrum',
    name: 'Alpha Spectrum',
    description: 'Explore the full alpha range (8-13 Hz). Each frequency produces unique visual phenomena.',
    duration: 360,
    difficulty: 'intermediate',
    icon: '🌈',
    color: 'from-cyan-500 to-blue-600',
    phases: [
      createPhase({
        name: '8 Hz - Low Alpha',
        duration: 45,
        frequency: 8,
        pattern: PATTERNS.UNIFORM,
        rampIn: 6,
        intensity: 0.75,
        description: 'Relaxed, diffuse patterns'
      }),
      createPhase({
        name: '9 Hz - Rising',
        duration: 50,
        frequency: 9,
        pattern: PATTERNS.UNIFORM,
        intensity: 0.85,
        description: 'Patterns begin to organize'
      }),
      createPhase({
        name: '10 Hz - Berger Peak',
        duration: 70,
        frequency: 10,
        pattern: PATTERNS.UNIFORM,
        intensity: 0.95,
        jitter: 0.1,
        description: 'Optimal entrainment frequency'
      }),
      createPhase({
        name: '11 Hz - High Alpha',
        duration: 60,
        frequency: 11,
        pattern: PATTERNS.UNIFORM,
        intensity: 1.0,
        jitter: 0.1,
        description: 'Vivid geometric forms'
      }),
      createPhase({
        name: '12 Hz - Upper Alpha',
        duration: 50,
        frequency: 12,
        pattern: PATTERNS.UNIFORM,
        intensity: 1.0,
        jitter: 0.15,
        description: 'Complex, rapid patterns'
      }),
      createPhase({
        name: '10 Hz - Return',
        duration: 45,
        frequency: 10,
        pattern: PATTERNS.UNIFORM,
        intensity: 0.8,
        description: 'Return to center'
      }),
      createPhase({
        name: 'Emergence',
        duration: 40,
        frequency: 8,
        pattern: PATTERNS.UNIFORM,
        rampOut: 12,
        intensity: 0.5,
        description: 'Gentle fade out'
      })
    ]
  },
  {
    // Extended theta session for deep meditation and lucid dream induction
    // Research shows 4-7 Hz facilitates hypnagogic states and creativity
    id: 'theta-gateway',
    name: 'Theta Gateway',
    description: 'Deep theta journey for meditation and lucid dream practice. Extended low-frequency session.',
    duration: 480,
    difficulty: 'advanced',
    icon: '🧘',
    color: 'from-amber-500 to-orange-600',
    phases: [
      createPhase({
        name: 'Alpha Entry',
        duration: 40,
        frequency: 10,
        pattern: PATTERNS.UNIFORM,
        rampIn: 10,
        intensity: 0.7,
        description: 'Establish baseline relaxation'
      }),
      createPhase({
        name: 'Alpha-Theta Bridge',
        duration: 50,
        frequency: 8,
        pattern: PATTERNS.UNIFORM,
        intensity: 0.8,
        description: 'Cross into theta territory'
      }),
      createPhase({
        name: 'Upper Theta',
        duration: 60,
        frequency: 7,
        pattern: PATTERNS.UNIFORM,
        intensity: 0.85,
        jitter: 0.1,
        description: 'Hypnagogic imagery emerges'
      }),
      createPhase({
        name: 'Mid Theta',
        duration: 90,
        frequency: 6,
        pattern: PATTERNS.UNIFORM,
        intensity: 0.9,
        jitter: 0.15,
        description: 'Deep meditative state'
      }),
      createPhase({
        name: 'Deep Theta',
        duration: 100,
        frequency: 5,     // Near sleep threshold
        pattern: PATTERNS.UNIFORM,
        intensity: 1.0,   // Full intensity for advanced pack
        jitter: 0.2,
        description: 'Profound theta - lucid dream window'
      }),
      createPhase({
        name: 'Theta Hold',
        duration: 60,
        frequency: 5.5,
        pattern: PATTERNS.UNIFORM,
        intensity: 0.85,
        description: 'Sustained deep state'
      }),
      createPhase({
        name: 'Gradual Rise',
        duration: 50,
        frequency: 7,
        pattern: PATTERNS.UNIFORM,
        intensity: 0.7,
        description: 'Begin emergence'
      }),
      createPhase({
        name: 'Alpha Return',
        duration: 30,
        frequency: 9,
        pattern: PATTERNS.UNIFORM,
        rampOut: 12,
        intensity: 0.5,
        description: 'Return to waking awareness'
      })
    ]
  },
  {
    // Extended alpha session for geometric hallucinations
    // Research shows 10-12 Hz produces most vivid pattern perception
    id: 'geometric-visions',
    name: 'Geometric Visions',
    description: 'Extended high-alpha session optimized for geometric pattern perception and color phenomena.',
    duration: 420,
    difficulty: 'intermediate',
    icon: '🔷',
    color: 'from-cyan-500 to-blue-600',
    phases: [
      createPhase({
        name: 'Alpha Onset',
        duration: 40,
        frequency: 9,
        pattern: PATTERNS.UNIFORM,
        rampIn: 8,
        intensity: 0.7,
        description: 'Gradual entrainment'
      }),
      createPhase({
        name: 'Pattern Emergence',
        duration: 60,
        frequency: 10,    // Berger frequency
        pattern: PATTERNS.UNIFORM,
        intensity: 0.85,
        description: 'Geometric patterns begin'
      }),
      createPhase({
        name: 'Color Field',
        duration: 90,
        frequency: 11,    // High alpha - vivid colors
        pattern: PATTERNS.UNIFORM,
        intensity: 0.95,
        jitter: 0.1,
        description: 'Color phenomena peak'
      }),
      createPhase({
        name: 'Mandala Phase',
        duration: 80,
        frequency: 12,    // Top of alpha - complex patterns
        pattern: PATTERNS.UNIFORM,
        intensity: 1.0,
        jitter: 0.15,
        description: 'Complex mandala-like forms'
      }),
      createPhase({
        name: 'Stabilization',
        duration: 60,
        frequency: 10,    // Return to stable alpha
        pattern: PATTERNS.UNIFORM,
        intensity: 0.85,
        description: 'Pattern integration'
      }),
      createPhase({
        name: 'Gentle Descent',
        duration: 50,
        frequency: 9,
        pattern: PATTERNS.UNIFORM,
        intensity: 0.7,
        description: 'Gradual fade'
      }),
      createPhase({
        name: 'Emergence',
        duration: 40,
        frequency: 8,
        pattern: PATTERNS.UNIFORM,
        rampOut: 15,
        intensity: 0.5,
        description: 'Return to waking'
      })
    ]
  },
  {
    // Short 5-minute session for quick entrainment
    // Uses 10 Hz throughout for reliable, consistent experience
    id: 'quick-session',
    name: 'Quick Session',
    description: '5-minute focused session at optimal 10 Hz. Perfect for short breaks or testing.',
    duration: 300,
    difficulty: 'beginner',
    icon: '⏱️',
    color: 'from-green-500 to-teal-500',
    phases: [
      createPhase({
        name: 'Quick Onset',
        duration: 45,
        frequency: 9,
        pattern: PATTERNS.UNIFORM,
        rampIn: 6,
        intensity: 0.75,
        description: 'Rapid but safe onset'
      }),
      createPhase({
        name: 'Core Session',
        duration: 180,
        frequency: 10,    // Pure Berger frequency
        pattern: PATTERNS.UNIFORM,
        intensity: 0.9,
        jitter: 0.05,     // Minimal variation
        description: 'Sustained 10 Hz entrainment'
      }),
      createPhase({
        name: 'Fade Out',
        duration: 75,
        frequency: 9,
        pattern: PATTERNS.UNIFORM,
        rampOut: 12,
        intensity: 0.6,
        description: 'Gradual emergence'
      })
    ]
  },
  // Advanced experience - pushes to upper alpha/low beta boundary
  // SAFETY: Stays at or below 14 Hz to avoid 15-25 Hz danger zone
  {
    id: 'intensity-wave',
    name: 'Intensity Wave',
    description: 'High-intensity alpha with dynamic variation. Full brightness, maximum entrainment.',
    duration: 300,
    difficulty: 'advanced',
    icon: '⚡',
    color: 'from-orange-600 to-red-700',
    phases: [
      createPhase({
        name: 'Rapid Onset',
        duration: 25,
        frequency: 10,
        pattern: PATTERNS.UNIFORM,
        rampIn: 4,        // Faster onset for experienced users
        intensity: 0.9,
        description: 'Quick entrainment'
      }),
      createPhase({
        name: 'High Alpha',
        duration: 50,
        frequency: 12,    // High alpha - intense patterns
        pattern: PATTERNS.UNIFORM,
        intensity: 1.0,
        jitter: 0.2,
        description: 'Full intensity alpha'
      }),
      createPhase({
        name: 'Alpha-Beta Edge',
        duration: 70,
        frequency: 13,    // Alpha-beta boundary - maximum safe
        pattern: PATTERNS.UNIFORM,
        intensity: 1.0,
        jitter: 0.3,
        description: 'Peak intensity experience'
      }),
      createPhase({
        name: 'Sustained Peak',
        duration: 60,
        frequency: 12,
        pattern: PATTERNS.UNIFORM,
        intensity: 1.0,
        jitter: 0.25,
        description: 'Maintain peak state'
      }),
      createPhase({
        name: 'Berger Return',
        duration: 45,
        frequency: 10,    // Return to optimal
        pattern: PATTERNS.UNIFORM,
        intensity: 0.85,
        description: 'Return to core frequency'
      }),
      createPhase({
        name: 'Cooldown',
        duration: 50,
        frequency: 8,
        pattern: PATTERNS.UNIFORM,
        rampOut: 15,
        intensity: 0.5,
        description: 'Gradual emergence'
      })
    ]
  }
];

// Generate random pack phases on demand
export const generateRandomPack = () => {
  const patterns = Object.values(PATTERNS);
  const numPhases = 4 + Math.floor(Math.random() * 4); // 4-7 phases
  const phases = [];
  
  for (let i = 0; i < numPhases; i++) {
    const duration = 30 + Math.floor(Math.random() * 60); // 30-90 seconds
    const frequency = 7 + Math.random() * 6; // 7-13 Hz (safe alpha range)
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const intensity = 0.6 + Math.random() * 0.3; // 0.6-0.9
    const jitter = Math.random() * 0.3; // 0-0.3
    
    phases.push(createPhase({
      name: `Phase ${i + 1}`,
      duration,
      frequency,
      pattern,
      intensity,
      jitter,
      rampIn: i === 0 ? 5 : 2,
      rampOut: i === numPhases - 1 ? 8 : 2,
    }));
  }
  
  return {
    ...EXPERIENCE_PACKS.find(p => p.id === 'random-mode'),
    phases,
    duration: phases.reduce((sum, p) => sum + p.duration, 0),
  };
};

// Utility to get total duration of a pack
export const getPackDuration = (pack) => {
  return pack.phases.reduce((total, phase) => total + phase.duration, 0);
};

// Utility to format duration as MM:SS
export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Get current phase info based on elapsed time
export const getCurrentPhase = (pack, elapsedTime) => {
  let accumulated = 0;
  
  for (let i = 0; i < pack.phases.length; i++) {
    const phase = pack.phases[i];
    const phaseEnd = accumulated + phase.duration;
    
    if (elapsedTime < phaseEnd) {
      const phaseElapsed = elapsedTime - accumulated;
      const phaseProgress = phaseElapsed / phase.duration;
      
      return {
        phase,
        phaseIndex: i,
        phaseElapsed,
        phaseProgress,
        totalPhases: pack.phases.length
      };
    }
    
    accumulated = phaseEnd;
  }
  
  // Return last phase if we've exceeded duration
  const lastPhase = pack.phases[pack.phases.length - 1];
  return {
    phase: lastPhase,
    phaseIndex: pack.phases.length - 1,
    phaseElapsed: lastPhase.duration,
    phaseProgress: 1,
    totalPhases: pack.phases.length
  };
};

// Calculate interpolated frequency during phase transitions
export const getInterpolatedFrequency = (pack, elapsedTime) => {
  const { phase, phaseIndex, phaseElapsed, phaseProgress } = getCurrentPhase(pack, elapsedTime);
  const nextPhase = pack.phases[phaseIndex + 1];
  
  let frequency = phase.frequency;
  
  // Ramp in from previous frequency
  if (phaseElapsed < phase.rampIn && phaseIndex > 0) {
    const prevPhase = pack.phases[phaseIndex - 1];
    const rampProgress = phaseElapsed / phase.rampIn;
    frequency = prevPhase.frequency + (phase.frequency - prevPhase.frequency) * easeInOutCubic(rampProgress);
  }
  
  // Ramp out to next frequency
  const rampOutStart = phase.duration - phase.rampOut;
  if (phaseElapsed > rampOutStart && nextPhase) {
    const rampProgress = (phaseElapsed - rampOutStart) / phase.rampOut;
    frequency = phase.frequency + (nextPhase.frequency - phase.frequency) * easeInOutCubic(rampProgress);
  }
  
  // Add jitter if specified
  if (phase.jitter > 0) {
    frequency += (Math.random() - 0.5) * phase.jitter;
  }
  
  return frequency;
};

// Easing function for smooth transitions
const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export default EXPERIENCE_PACKS;

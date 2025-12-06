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

export const FREQUENCY_BANDS = {
  THETA: { min: 4, max: 8, name: 'Theta', description: 'Deep meditation, drowsiness' },
  ALPHA_LOW: { min: 8, max: 10, name: 'Low Alpha', description: 'Relaxed awareness' },
  ALPHA_HIGH: { min: 10, max: 13, name: 'High Alpha', description: 'Calm focus' },
  BETA_LOW: { min: 13, max: 15, name: 'Low Beta', description: 'Light focus' }
};

// Phase structure for each step in a pack
// duration: seconds, frequency: Hz, pattern: pattern type
// rampIn/rampOut: seconds for transition, intensity: 0-1 max brightness
// colorMode: 'mono' | 'warm' | 'cool' | 'spectrum'
const createPhase = (config) => ({
  duration: 30,
  frequency: 10,
  pattern: PATTERNS.UNIFORM,
  rampIn: 3,
  rampOut: 3,
  intensity: 0.85,
  colorMode: 'mono',
  jitter: 0,
  ...config
});

export const EXPERIENCE_PACKS = [
  {
    id: 'gentle-intro',
    name: 'Gentle Introduction',
    description: 'A soft, beginner-friendly experience. Perfect for first-time users.',
    duration: 180, // 3 minutes total
    difficulty: 'beginner',
    icon: '🌅',
    color: 'from-blue-500 to-purple-500',
    phases: [
      createPhase({
        name: 'Settling In',
        duration: 30,
        frequency: 8,
        pattern: PATTERNS.UNIFORM,
        rampIn: 5,
        intensity: 0.5,
        description: 'Gentle alpha waves to ease you in'
      }),
      createPhase({
        name: 'Soft Waves',
        duration: 45,
        frequency: 9,
        pattern: PATTERNS.RADIAL,
        intensity: 0.6,
        description: 'Subtle radial patterns emerge'
      }),
      createPhase({
        name: 'Deep Alpha',
        duration: 60,
        frequency: 10,
        pattern: PATTERNS.UNIFORM,
        intensity: 0.7,
        description: 'Peak alpha entrainment'
      }),
      createPhase({
        name: 'Return',
        duration: 45,
        frequency: 8,
        pattern: PATTERNS.UNIFORM,
        rampOut: 10,
        intensity: 0.4,
        description: 'Gentle fade back to baseline'
      })
    ]
  },
  {
    id: 'deep-tunnel',
    name: 'Deep Tunnel',
    description: 'Experience profound depth perception shifts and tunnel visions.',
    duration: 240, // 4 minutes
    difficulty: 'intermediate',
    icon: '🕳️',
    color: 'from-purple-600 to-indigo-800',
    phases: [
      createPhase({
        name: 'Descent Prep',
        duration: 30,
        frequency: 10,
        pattern: PATTERNS.UNIFORM,
        rampIn: 5,
        intensity: 0.6
      }),
      createPhase({
        name: 'Rings Form',
        duration: 40,
        frequency: 10,
        pattern: PATTERNS.CONCENTRIC,
        intensity: 0.75
      }),
      createPhase({
        name: 'Tunnel Opens',
        duration: 60,
        frequency: 9.5,
        pattern: PATTERNS.TUNNEL,
        intensity: 0.85,
        jitter: 0.2
      }),
      createPhase({
        name: 'Deep Dive',
        duration: 70,
        frequency: 8,
        pattern: PATTERNS.TUNNEL,
        intensity: 0.9,
        jitter: 0.3
      }),
      createPhase({
        name: 'Ascent',
        duration: 40,
        frequency: 10,
        pattern: PATTERNS.RADIAL,
        rampOut: 8,
        intensity: 0.5
      })
    ]
  },
  {
    id: 'spiral-journey',
    name: 'Spiral Journey',
    description: 'A hypnotic spiral experience that builds in complexity.',
    duration: 300, // 5 minutes
    difficulty: 'intermediate',
    icon: '🌀',
    color: 'from-cyan-500 to-blue-600',
    phases: [
      createPhase({
        name: 'Center Point',
        duration: 25,
        frequency: 10,
        pattern: PATTERNS.UNIFORM,
        rampIn: 4,
        intensity: 0.55
      }),
      createPhase({
        name: 'Rotation Begins',
        duration: 50,
        frequency: 10.5,
        pattern: PATTERNS.SPIRAL,
        intensity: 0.7
      }),
      createPhase({
        name: 'Vortex',
        duration: 80,
        frequency: 11,
        pattern: PATTERNS.VORTEX,
        intensity: 0.8,
        jitter: 0.15
      }),
      createPhase({
        name: 'Starburst',
        duration: 60,
        frequency: 10,
        pattern: PATTERNS.STARBURST,
        intensity: 0.85
      }),
      createPhase({
        name: 'Spiral Down',
        duration: 50,
        frequency: 9,
        pattern: PATTERNS.SPIRAL,
        intensity: 0.65
      }),
      createPhase({
        name: 'Stillness',
        duration: 35,
        frequency: 8,
        pattern: PATTERNS.UNIFORM,
        rampOut: 10,
        intensity: 0.4
      })
    ]
  },
  {
    id: 'geometry-explorer',
    name: 'Sacred Geometry',
    description: 'Explore geometric patterns and fractals within your mind.',
    duration: 360, // 6 minutes
    difficulty: 'advanced',
    icon: '🔷',
    color: 'from-amber-500 to-orange-600',
    phases: [
      createPhase({
        name: 'Grid Init',
        duration: 30,
        frequency: 10,
        pattern: PATTERNS.CHECKERBOARD,
        rampIn: 5,
        intensity: 0.6
      }),
      createPhase({
        name: 'Pattern Shift',
        duration: 45,
        frequency: 11,
        pattern: PATTERNS.CHECKERBOARD,
        intensity: 0.75,
        jitter: 0.1
      }),
      createPhase({
        name: 'Radial Geometry',
        duration: 60,
        frequency: 10.5,
        pattern: PATTERNS.RADIAL,
        intensity: 0.8
      }),
      createPhase({
        name: 'Complex Forms',
        duration: 80,
        frequency: 10,
        pattern: PATTERNS.STARBURST,
        intensity: 0.85,
        jitter: 0.2
      }),
      createPhase({
        name: 'Tunnel Geometry',
        duration: 70,
        frequency: 9.5,
        pattern: PATTERNS.TUNNEL,
        intensity: 0.8
      }),
      createPhase({
        name: 'Integration',
        duration: 45,
        frequency: 8.5,
        pattern: PATTERNS.CONCENTRIC,
        intensity: 0.6
      }),
      createPhase({
        name: 'Resolution',
        duration: 30,
        frequency: 8,
        pattern: PATTERNS.UNIFORM,
        rampOut: 12,
        intensity: 0.35
      })
    ]
  },
  {
    id: 'theta-meditation',
    name: 'Theta Meditation',
    description: 'Deep theta state for profound relaxation and meditation.',
    duration: 420, // 7 minutes
    difficulty: 'intermediate',
    icon: '🧘',
    color: 'from-violet-500 to-purple-700',
    phases: [
      createPhase({
        name: 'Alpha Entry',
        duration: 40,
        frequency: 10,
        pattern: PATTERNS.UNIFORM,
        rampIn: 8,
        intensity: 0.5
      }),
      createPhase({
        name: 'Alpha-Theta Bridge',
        duration: 50,
        frequency: 8.5,
        pattern: PATTERNS.RADIAL,
        intensity: 0.55
      }),
      createPhase({
        name: 'Theta Onset',
        duration: 60,
        frequency: 7.5,
        pattern: PATTERNS.UNIFORM,
        intensity: 0.6
      }),
      createPhase({
        name: 'Deep Theta',
        duration: 120,
        frequency: 6.5,
        pattern: PATTERNS.CONCENTRIC,
        intensity: 0.65,
        jitter: 0.1
      }),
      createPhase({
        name: 'Theta Hold',
        duration: 80,
        frequency: 7,
        pattern: PATTERNS.UNIFORM,
        intensity: 0.55
      }),
      createPhase({
        name: 'Return to Alpha',
        duration: 50,
        frequency: 9,
        pattern: PATTERNS.UNIFORM,
        rampOut: 15,
        intensity: 0.4
      }),
      createPhase({
        name: 'Awakening',
        duration: 20,
        frequency: 10,
        pattern: PATTERNS.UNIFORM,
        rampOut: 8,
        intensity: 0.3
      })
    ]
  },
  {
    id: 'intensity-peaks',
    name: 'Intensity Peaks',
    description: 'Dynamic experience with building intensity waves. For experienced users.',
    duration: 300, // 5 minutes
    difficulty: 'advanced',
    icon: '⚡',
    color: 'from-red-500 to-pink-600',
    phases: [
      createPhase({
        name: 'Warmup',
        duration: 25,
        frequency: 10,
        pattern: PATTERNS.UNIFORM,
        rampIn: 4,
        intensity: 0.5
      }),
      createPhase({
        name: 'First Wave',
        duration: 40,
        frequency: 11,
        pattern: PATTERNS.RADIAL,
        intensity: 0.75
      }),
      createPhase({
        name: 'Valley',
        duration: 20,
        frequency: 9,
        pattern: PATTERNS.UNIFORM,
        intensity: 0.5
      }),
      createPhase({
        name: 'Second Wave',
        duration: 50,
        frequency: 11.5,
        pattern: PATTERNS.SPIRAL,
        intensity: 0.85,
        jitter: 0.15
      }),
      createPhase({
        name: 'Valley 2',
        duration: 20,
        frequency: 8.5,
        pattern: PATTERNS.UNIFORM,
        intensity: 0.45
      }),
      createPhase({
        name: 'Peak Experience',
        duration: 70,
        frequency: 12,
        pattern: PATTERNS.VORTEX,
        intensity: 0.95,
        jitter: 0.25
      }),
      createPhase({
        name: 'Comedown',
        duration: 40,
        frequency: 9,
        pattern: PATTERNS.CONCENTRIC,
        intensity: 0.55
      }),
      createPhase({
        name: 'Rest',
        duration: 35,
        frequency: 8,
        pattern: PATTERNS.UNIFORM,
        rampOut: 12,
        intensity: 0.35
      })
    ]
  }
];

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

# Flicker - Neural Entrainment App

## Project Overview

Photic stimulation app using rhythmic light (4-15 Hz) to synchronize brainwaves and create visual phenomena. React 19 + Vite 7 web app wrapped in **Capacitor 7** for Android.

**Core Concept**: Alpha/theta frequencies (8-13 Hz) produce visual hallucinations with eyes closed via "flicker frequency response."

## Architecture

### Screen Flow (State Machine in [src/App.jsx](src/App.jsx))
```
SPLASH → WARNING → PACKS → PREVIEW → SESSION → REVIEW → (loop)
```

Simple `useState` manages flow - no Redux/Context needed.

### Key Files
- **[src/components/SessionPlayer.jsx](src/components/SessionPlayer.jsx)**: Core engine - Canvas rendering, intensity calculation (sine waves + harmonics), phase transitions
- **[src/packs.js](src/packs.js)**: Experience pack definitions with phases (`frequency`, `duration`, `pattern`, `intensity`, `jitter`, `rampIn`, `rampOut`)
- **[src/components/preview/](src/components/preview/)**: Modular preview components (IntensityGraph, PatternPreview, PhaseCards)

### Pattern System (8 patterns in SessionPlayer)
`UNIFORM` | `RADIAL` | `SPIRAL` | `TUNNEL` | `CHECKERBOARD` | `CONCENTRIC` | `STARBURST` | `VORTEX`

## Safety Constraints (CRITICAL)

### Frequency Limits
- **Safe range**: 5-15 Hz (alpha/theta bands)
- **DANGER ZONE**: 15-25 Hz triggers photosensitive epilepsy - **NEVER exceed 15 Hz**
- Best entrainment: 8-13 Hz (alpha band)

### Intensity System
```javascript
// calculateIntensity() in SessionPlayer - sine wave + harmonics
const primary = Math.sin(2 * Math.PI * freq * time);
const harmonic1 = 0.3 * Math.sin(2 * Math.PI * (freq * 2) * time);
const harmonic2 = 0.2 * Math.sin(2 * Math.PI * (freq * 0.5) * time);
```

### Ramp Guards
- **Minimum 3s ramp-in/ramp-out** prevents seizure-triggering sudden transitions
- Enforced in `createPhase()` defaults in [src/packs.js](src/packs.js)

## Build & Deploy

```bash
npm run dev          # Vite dev server :5173
npm run build        # Production build to /dist
npm test             # Vitest tests
```

### Android (Capacitor)
```bash
npm run build && npx cap sync && npx cap open android
# Or use Build.bat on Windows
```

**CRITICAL**: Always run `npx cap sync` after web code changes before Android testing.

## Code Conventions

- **Tailwind CSS 4** via PostCSS, dark theme (`bg-gray-900`, `text-white`)
- **Pure React hooks** - no global state library
- **LocalStorage** for session history
- **Inline styles** for dynamic canvas animations

### TODO Comments = Documentation
```javascript
// TODO: GUARDRAIL - intensity was capped at 0.85, now full 1.0
// TODO: Theta for deep states
```
These document **design decisions** - don't remove them.

## Adding Experience Packs

Edit [src/packs.js](src/packs.js):
```javascript
createPhase({
  name: 'Phase 1',
  duration: 60,        // seconds
  frequency: 10,       // Hz (keep 5-15)
  pattern: PATTERNS.UNIFORM,
  intensity: 0.8,      // 0-1
  jitter: 0.1,         // Hz variation
  rampIn: 5,           // fade-in seconds
  rampOut: 5           // fade-out seconds
})
```

## TypeScript Migration Guide

This project is JavaScript (React 19) but designed for easy TypeScript migration.

### Recommended Steps
1. Add TypeScript: `npm install -D typescript @types/react @types/react-dom`
2. Create `tsconfig.json` with `"jsx": "react-jsx"`, `"strict": true`
3. Rename files `.jsx` → `.tsx`, `.js` → `.ts`
4. Add types incrementally (see interfaces below)

### Key Interfaces to Create
```typescript
// types/pack.ts
interface Phase {
  name: string;
  duration: number;      // seconds
  frequency: number;     // Hz (5-15 safe range)
  pattern: Pattern;
  intensity: number;     // 0-1
  jitter: number;        // Hz variation
  rampIn: number;        // seconds
  rampOut: number;       // seconds
  description?: string;
}

interface ExperiencePack {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
  color: string;         // Tailwind gradient classes
  phases: Phase[];
  isRandom?: boolean;
}

type Pattern = 'uniform' | 'radial' | 'spiral' | 'tunnel' | 
               'checkerboard' | 'concentric' | 'starburst' | 'vortex';

// types/session.ts
interface SessionData {
  duration: number;
  bookmarked: boolean;
  bookmarkTime: number | null;
}

interface PhaseInfo {
  phase: Phase;
  phaseIndex: number;
  phaseElapsed: number;
  phaseProgress: number;  // 0-1
  totalPhases: number;
}

// types/review.ts
interface SessionReview {
  id: number;
  packId: string;
  packName: string;
  rating: number;         // 1-5
  intensity: number;      // 1-5 (visual intensity)
  notes: string;
  duration: number;
  timestamp: string;
  bookmarked: boolean;
  bookmarkTime: number | null;
}
```

### Component Props Patterns
```typescript
// Screen components receive callbacks for state transitions
interface PackSelectionProps {
  onSelectPack: (pack: ExperiencePack) => void;
}

interface SessionPlayerProps {
  pack: ExperiencePack;
  onExit: () => void;
  onComplete: (data: SessionData) => void;
}

// Preview subcomponents are display-only or have simple handlers
interface IntensityGraphProps {
  phases: Phase[];
}

interface PatternPreviewProps {
  patterns: Pattern[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}
```

### Modular Architecture Best Practices
When componentizing:

1. **Extract domain types first** → Create `src/types/` folder with shared interfaces
2. **Colocate component types** → Put component-specific types in the same file
3. **Use barrel exports** → `src/types/index.ts` re-exports all types
4. **Prefer interfaces over types** for object shapes (better error messages, extendable)
5. **Discriminated unions** for Pattern type enables exhaustive switch checking

### File Organization (Recommended)
```
src/
  types/
    index.ts          # barrel export
    pack.ts           # Phase, ExperiencePack, Pattern
    session.ts        # SessionData, PhaseInfo
    review.ts         # SessionReview
  hooks/
    usePhaseCalculation.ts   # extract from SessionPlayer
    useSessionTimer.ts       # extract timing logic
  utils/
    intensity.ts      # calculateIntensity, easeInOutCubic
    format.ts         # formatTime, etc.
  components/
    session/          # SessionPlayer + subcomponents
    preview/          # existing preview folder
```

### Canvas Typing
```typescript
// SessionPlayer canvas refs
const canvasRef = useRef<HTMLCanvasElement>(null);
const animationRef = useRef<number>(0);

// Context typing
const ctx = canvasRef.current?.getContext('2d');
if (!ctx) return;
```

## Common Pitfalls

1. **Capacitor sync**: After web edits, MUST run `npx cap sync`
2. **Frequency limits**: Never exceed 15 Hz
3. **Canvas performance**: Avoid heavy calculations in 60fps draw loops
4. **Ramp times**: Always use ≥3s rampIn/rampOut
5. **Android testing**: Real device required - emulator won't show accurate flicker

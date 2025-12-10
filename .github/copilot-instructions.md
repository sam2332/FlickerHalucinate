# Flicker - Neural Entrainment App

## Project Overview

Photic stimulation app using rhythmic light to synchronize brainwaves and create visual phenomena. **React 19** + **Vite 7** web app wrapped in **Capacitor 7** for Android deployment.

**Core Concept**: Alpha/theta frequencies (8-13 Hz) produce visual hallucinations with eyes closed via "flicker frequency response" - the app uses the **phone's flashlight** with a native strobe engine for precise, high-performance light modulation.

## Architecture

### Screen Flow (State Machine)
[src/App.jsx](src/App.jsx) manages navigation with simple `useState` (no Redux/Context):
```
SPLASH → WARNING → PACKS → PREVIEW → SESSION → (loop back to PACKS)
```

State transitions via callback props (`onSelectPack`, `onAccept`, `onComplete`, `onExit`).

### Modular Structure (Post-Refactor)
**Barrel exports** in each folder (`index.js`) enable clean imports:

```javascript
// Instead of: import { formatTime } from '../utils/format'
import { formatTime } from '../utils';
```

**Key Directories**:
- **`src/constants/`** - Frozen objects: `PATTERNS`, `SCREENS`, `FREQUENCY_BANDS`, `SAFETY_LIMITS`
- **`src/utils/`** - Pure functions: `calculateIntensity()`, `easeInOutCubic()`, `formatDuration()`, `clamp()`
- **`src/hooks/`** - Custom hooks: `useSessionTimer`, `usePhaseCalculation`, `useCanvas`, `useUITimeout`
- **`src/renderer/`** - Canvas drawing (legacy - kept for reference, not actively used)
- **`src/services/`** - localStorage/sessionStorage: `reviewStorage`, `warningStorage`, `flashlightService`
- **`src/components/`** - React components (each receives callbacks, no global state)
- **`src/packs.js`** - Experience pack definitions (phases array with frequency progressions)

### Critical Files
- **[src/components/SessionPlayer.jsx](src/components/SessionPlayer.jsx)**: Core engine - converts pack phases to native strobe effects, handles pause/resume via native plugin events, tap controls
- **[src/services/flashlightService.js](src/services/flashlightService.js)**: Singleton service wrapping custom `FlashlightPlugin` - queue-based strobe engine with `enqueue()`, `start()`, `pause()`, `resume()`, `stop()`, and event listeners
- **[src/utils/intensity.js](src/utils/intensity.js)**: (Legacy) `calculateIntensity()` - sine wave + harmonics formula. Now only used for preview visualizations, not runtime.
- **[src/packs.js](src/packs.js)**: `EXPERIENCE_PACKS` array + `createPhase()` factory + utility functions (`getCurrentPhase`, `getInterpolatedFrequency`)

## Safety Constraints (CRITICAL ⚠️)

**NEVER exceed 15 Hz** - 15-25 Hz triggers photosensitive epilepsy. This app is for entertainment only; users assume all risk.

### Frequency Safety
- **Safe range**: 5-15 Hz enforced in `SAFETY_LIMITS` ([src/constants/frequencies.js](src/constants/frequencies.js))
- **Optimal**: 8-13 Hz (alpha band for best entrainment)
- **Validation**: `isFrequencySafe()`, `clampFrequency()` available but not automatically enforced - users can create unsafe packs

### Ramp Transitions (Seizure Prevention)
- **Minimum 3s ramp-in/ramp-out** prevents sudden flashes
- `createPhase()` defaults enforce this ([src/packs.js](src/packs.js) line 42-43)
- Ramps apply fade multiplier in `calculateIntensity()` based on phase elapsed time

### Intensity Formula (Legacy - Preview Visualizations Only)
The native strobe engine handles actual flashlight timing. This formula is preserved for preview graphs:
```javascript
// src/utils/intensity.js - calculateIntensity()
const primary = Math.sin(2 * Math.PI * freq * time);
const harmonic1 = 0.3 * Math.sin(2 * Math.PI * (freq * 2) * time);    // 2nd harmonic
const harmonic2 = 0.2 * Math.sin(2 * Math.PI * (freq * 0.5) * time);  // sub-harmonic
const normalized = (primary + harmonic1 + harmonic2 + 1.5) / 3.0;     // normalize to 0-1
const curved = Math.pow(normalized, 1.8);                              // sharpen transitions
// Apply phase.intensity and ramp-in/ramp-out multipliers
```

### TODO Comments Document Safety Decisions
```javascript
// TODO: GUARDRAIL - intensity was capped at 0.85, now full 1.0
// TODO: GUARDRAIL REMOVED - was 0.85, now allows full intensity
// TODO: Theta for deep states
```
**Do NOT remove TODO comments** - they document design evolution and safety trade-offs.

## Flashlight Implementation

### Native Strobe Engine Architecture
The app uses a **custom Capacitor plugin** (`FlashlightPlugin`) with a queue-based strobe engine implemented in Android native code at [android/app/src/main/java/com/flicker/neural/plugins/FlashlightPlugin.java](android/app/src/main/java/com/flicker/neural/plugins/FlashlightPlugin.java):

```javascript
// src/services/flashlightService.js
import { registerPlugin } from '@capacitor/core';
const FlashlightPlugin = registerPlugin('FlashlightPlugin');

// Effect types for the queue
export const EffectType = {
  ON: 'ON',        // Turn on for duration
  OFF: 'OFF',      // Turn off for duration
  STROBE: 'STROBE', // Strobe at frequency for duration
  PULSE: 'PULSE'   // Single pulse
};

// Session workflow:
await flashlightService.initialize();           // Check availability
await flashlightService.clearQueue();           // Clear any existing effects
await flashlightService.enqueueAll(effects);    // Upload all phase effects
await flashlightService.start();                // Begin playback
await flashlightService.pause();                // Pause (maintains position)
await flashlightService.resume();               // Resume from pause
await flashlightService.stop();                 // Stop completely
await flashlightService.cleanup();              // Ensure flash off on exit
```

### Session Flow (SessionPlayer.jsx)
1. **Mount**: Initialize flashlight, convert pack phases → strobe effects, `enqueueAll()`, `start()`
2. **Playing**: Native engine handles timing/strobing; JS only updates UI elapsed time
3. **Pause/Resume**: Native engine handles precise timing preservation
4. **Cleanup**: Always call `cleanup()` on unmount to ensure flashlight is off

### Event System
```javascript
flashlightService.on('queueEmpty', () => { /* session complete */ });
flashlightService.on('stateChanged', ({ state }) => { /* IDLE/RUNNING/PAUSED/STOPPED */ });
flashlightService.on('error', ({ message }) => { /* handle errors */ });
```

### Error Handling
If flashlight is unavailable (web browser, unsupported device), SessionPlayer shows an error screen and exits gracefully. The `forceOff()` method provides retry logic for stubborn flashlight states.

## Build & Deploy

### Development
```bash
npm run dev          # Vite dev server (http://localhost:5173)
npm test             # Vitest tests (watch mode: npm test -- --watch)
npm run preview      # Preview production build
```

### Production Build
```bash
npm run build        # Compiles to /dist (Vite rollup)
```

### Android Deployment (Capacitor 7)
```bash
# Full workflow
npm run build        # 1. Build web assets
npx cap sync         # 2. Copy to android/app/src/main/assets/
npx cap open android # 3. Open Android Studio

# Windows shortcut
Build.bat            # Runs steps 1-2, then launches Android Studio
```

**CRITICAL**: Always run `npx cap sync` after web edits before testing on Android device/emulator. Capacitor wraps the web app in a WebView - changes to `src/` don't appear until synced.

**Capacitor Config**: [capacitor.config.json](capacitor.config.json) sets package name (`com.flicker.app`), app name, webDir (`dist`)

## Code Conventions

### Styling
- **Tailwind CSS 4** via PostCSS ([postcss.config.js](postcss.config.js), [tailwind.config.js](tailwind.config.js))
- **Dark theme default**: `bg-gray-900`, `text-white`, gradient backgrounds
- **Inline styles in components**: Dynamic values (SessionPlayer canvas, SplashScreen animations) use inline `style={}` objects
- **Preview components**: Use Tailwind classes for static layout, inline for dynamic animations

### State Management
- **No global state**: Pure React hooks (`useState`, `useEffect`, `useCallback`)
- **Screen navigation**: Single `screen` state in [src/App.jsx](src/App.jsx), transitions via callbacks
- **Component props pattern**: Each screen receives callbacks (`onSelectPack`, `onComplete`, `onExit`) - unidirectional data flow

### Storage
- **localStorage**: Session reviews ([src/services/reviewStorage.js](src/services/reviewStorage.js)) - max 50 entries
- **sessionStorage**: Warning acceptance ([src/services/warningStorage.js](src/services/warningStorage.js)) - persists per browser session

### Barrel Exports (Modular Imports)
Every folder has `index.js` for cleaner imports:
```javascript
// ❌ Before refactor
import { formatTime } from '../utils/format';
import { clamp } from '../utils/math';

// ✅ After refactor  
import { formatTime, clamp } from '../utils';
```

### TODO Comments = Safety Documentation
```javascript
// TODO: GUARDRAIL - intensity was capped at 0.85, now full 1.0
// TODO: GUARDRAIL REMOVED - was 0.85, now allows full intensity
// TODO: Theta for deep states (5-7 Hz)
```
**PRESERVE these** - they document design evolution, safety trade-offs, and frequency band rationale.

## Adding Experience Packs

Edit [src/packs.js](src/packs.js) - add new packs to `EXPERIENCE_PACKS` array:

```javascript
{
  id: 'my-pack',               // unique kebab-case ID
  name: 'Pack Name',           // display name
  description: '...',          // 1-2 sentence description
  duration: 180,               // total seconds (auto-calculated from phases)
  difficulty: 'beginner',      // 'beginner' | 'intermediate' | 'advanced'
  icon: '🌟',                  // emoji icon
  color: 'from-blue-500 to-purple-500',  // Tailwind gradient classes
  phases: [
    createPhase({
      name: 'Phase 1',
      duration: 60,           // seconds
      frequency: 10,          // Hz (5-15 safe range, 8-13 optimal)
      pattern: PATTERNS.UNIFORM,  // 8 patterns available
      intensity: 0.8,         // 0-1 (1.0 = full brightness)
      jitter: 0.1,            // Hz frequency variation (0 = none, 0.5 = ±0.25Hz)
      rampIn: 5,              // fade-in seconds (min 3)
      rampOut: 5,             // fade-out seconds (min 3)
      description: '...'      // optional phase description
    })
  ]
}
```

**Phase Transitions**: Overlapping ramps blend frequencies smoothly. If Phase 1 has `rampOut: 8` and Phase 2 has `rampIn: 5`, there's an 8-second transition period where `getInterpolatedFrequency()` blends them.

## Common Pitfalls

1. **Capacitor sync**: After web edits, MUST run `npx cap sync` before Android testing
2. **Frequency limits**: Never exceed 15 Hz - document with TODO comments if approaching limit
3. **Flashlight availability**: Always check `flashlightService.initialize()` before use - gracefully handle unavailable flashlight
4. **Ramp times**: Always use ≥3s rampIn/rampOut - enforced by `createPhase()` defaults
5. **Android testing**: Real device strongly recommended - emulator won't have flashlight
6. **Pattern names**: Use `PATTERNS` constants, not string literals (`PATTERNS.UNIFORM` not `'uniform'`)
7. **Barrel exports**: Import from folder root (`from '../utils'`) not individual files
8. **TODO preservation**: Don't remove TODO comments - they document safety decisions
9. **Native plugin sync**: After changes to web code, always run `npx cap sync` before Android testing

## TypeScript Migration (Optional)

Current stack is JavaScript but designed for TS conversion:

### Quick Start
```bash
npm install -D typescript @types/react @types/react-dom
# Create tsconfig.json with "jsx": "react-jsx", "strict": true
# Rename .jsx → .tsx, .js → .ts
```

### Key Type Definitions
```typescript
// types/pack.ts
interface Phase {
  name: string;
  duration: number;      // seconds
  frequency: number;     // Hz (5-15 safe)
  pattern: Pattern;
  intensity: number;     // 0-1
  jitter: number;
  rampIn: number;
  rampOut: number;
  description?: string;
}

interface ExperiencePack {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
  color: string;
  phases: Phase[];
}

type Pattern = 'uniform' | 'radial' | 'spiral' | 'tunnel' | 
               'checkerboard' | 'concentric' | 'starburst' | 'vortex';

// Component props
interface SessionPlayerProps {
  pack: ExperiencePack;
  onExit: () => void;
  onComplete: (data: SessionData) => void;
}
```

**Canvas refs**: `useRef<HTMLCanvasElement>(null)`, `useRef<number>(0)` for animation IDs

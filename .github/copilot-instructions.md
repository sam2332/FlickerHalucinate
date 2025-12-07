# Flicker - Neural Entrainment App

## Project Overview

Flicker is a **photic stimulation app** for neural entrainment via rhythmic light patterns. It uses specific flicker frequencies (4-15 Hz) to synchronize with brainwave patterns, creating visual phenomena and altered states. Built as a React web app wrapped in **Capacitor** for Android deployment.

**Core Concept**: Rhythmic flashing at alpha/theta frequencies (8-13 Hz) can entrain brainwaves, producing visual hallucinations (geometric patterns, colors, kaleidoscopic effects) with eyes closed. This is based on the "flicker frequency response" - the visual cortex responds to specific frequencies.

## Architecture

### Screen Flow (State Machine)
The app follows a linear flow managed in [src/App.jsx](src/App.jsx):
```
SPLASH → WARNING → PACKS → PREVIEW → SESSION → REVIEW → (loop back to PACKS)
```

- **SPLASH**: Animated intro with branding
- **WARNING**: Critical seizure/safety warnings (must accept to proceed)
- **PACKS**: Browse and select experience packs
- **PREVIEW**: Shows pack details, pattern visualizations, phase timeline, and requires user acceptance before starting
- **SESSION**: Full-screen flicker playback with multi-phase progression
- **REVIEW**: Rate experience and save session data

State is managed with simple `useState` - no Redux/Context needed for this linear flow.

### Key Components

- [src/components/SessionPlayer.jsx](src/components/SessionPlayer.jsx): The core engine. Renders Canvas with animated patterns, calculates intensity using sine waves + harmonics, manages phase transitions with ramp-in/ramp-out
- [src/packs.js](src/packs.js): Data file defining all experience packs. Each pack contains phases with `frequency`, `duration`, `pattern`, `intensity`, `jitter` parameters
- [src/components/PackSelection.jsx](src/components/PackSelection.jsx): Pack browser with difficulty filtering
- [src/components/PackPreview.jsx](src/components/PackPreview.jsx): Preview screen showing animated pattern demos, phase timeline, and acceptance requirement before session starts
- [src/components/SeizureWarning.jsx](src/components/SeizureWarning.jsx): Legal/safety screen (persists acceptance to sessionStorage)

### Pattern System

8 visual patterns implemented as canvas drawing functions in SessionPlayer:
- `UNIFORM`: Solid flashing screen (baseline)
- `RADIAL`: Concentric waves from center
- `SPIRAL`: Rotating spiral
- `TUNNEL`: 3D tunnel effect (most intense)
- `CHECKERBOARD`, `CONCENTRIC`, `STARBURST`, `VORTEX`: Geometric variations

Patterns are selected per-phase in [src/packs.js](src/packs.js).

## Critical Science & Safety Concepts

### Frequency Bands (Brainwave Entrainment)
Defined in `FREQUENCY_BANDS` ([src/packs.js](src/packs.js)):
- **4-8 Hz (Theta)**: Deep meditation, drowsiness
- **8-10 Hz (Low Alpha)**: Relaxed awareness ← **MOST EFFECTIVE** for photic driving
- **10-13 Hz (High Alpha)**: Calm focus, peak visual entrainment
- **13-15 Hz (Low Beta)**: Active focus
- **15-25 Hz**: **DANGER ZONE** - photosensitive epilepsy trigger range ← **AVOID**

**Current guardrail**: Frequencies stay 5-15 Hz (mostly alpha band). Advanced packs push toward 14-15 Hz but stay below 16 Hz.

### Intensity Calculation
In SessionPlayer's `calculateIntensity()`:
```javascript
// Primary sine wave at target frequency
const primary = Math.sin(2 * Math.PI * freq * time);

// Harmonics add organic complexity
const harmonic1 = 0.3 * Math.sin(2 * Math.PI * (freq * 2) * time);     // 2nd harmonic
const harmonic2 = 0.2 * Math.sin(2 * Math.PI * (freq * 0.5) * time);   // sub-harmonic

// Combine, curve, and apply phase intensity multiplier
```

**Removed guardrail**: Old code capped intensity at 0.85. Now allows full 1.0 for advanced packs (marked with `TODO: GUARDRAIL REMOVED` comments).

### Ramp-In/Ramp-Out
Prevents jarring transitions that could trigger discomfort/seizures. Every phase has:
- `rampIn`: Seconds to fade in (minimum 3s enforced)
- `rampOut`: Seconds to fade out (minimum 3s enforced)

Implemented as linear interpolation in SessionPlayer.

### Jitter Parameter
Adds random frequency variation: `jitter: 0.3` = ±0.15 Hz wobble. Makes experience feel more organic, prevents monotonous exact frequencies. Higher jitter = more chaotic/intense.

## Build & Deployment Workflow

### Development
```bash
npm run dev          # Vite dev server on localhost:5173
npm run build        # Production build to /dist
npm test            # Run vitest tests
```

### Android Build (Capacitor)
Use **[Build.bat](Build.bat)** script (Windows):
1. Runs `npm run build` (Vite compile)
2. Runs `npx cap sync` (copies dist/ to android/app/src/main/assets/)
3. Launches Android Studio via `Launch_Android_Studio.bat`

**Manual alternative**:
```bash
npm run build
npx cap sync
npx cap open android  # Opens Android Studio
```

Capacitor config: [capacitor.config.json](capacitor.config.json)
- AppId: `com.flicker.neural`
- Uses KeepAwake plugin to prevent screen dimming during sessions

### Android Project Structure
- [android/](android/): Full Gradle Android project
- [android/app/src/main/](android/app/src/main/): Android manifest, resources
- Built web assets copied to `android/app/src/main/assets/public/`

## Code Conventions

### Styling
- **Tailwind CSS** via PostCSS 4 (see [tailwind.config.js](tailwind.config.js))
- Dark theme throughout (`bg-gray-900`, `text-white`)
- Inline styles for animations in SplashScreen/SessionPlayer (dynamic values need JS)

### State Management
- **No global state library** - pure React `useState`/`useEffect`
- Session data passed via props through the screen flow
- LocalStorage for session history (in PackSelection/SessionReview)

### Testing
- **Vitest** for unit tests ([src/__tests__/flicker.test.js](src/__tests__/flicker.test.js))
- Tests verify frequency band boundaries, phase calculations, pack structure
- Many `TODO:` comments documenting guardrails and scientific reasoning

### TODO Comments
Extensive use of `TODO:` markers for documentation (NOT tasks):
```javascript
// TODO: GUARDRAIL REMOVED - intensity was capped at 0.85, now full 1.0
// TODO: Higher alpha for alertness
// TODO: Theta for deep states
```
These document **design decisions** and **safety considerations**. Don't remove them.

## Adding New Experience Packs

Edit [src/packs.js](src/packs.js) → `EXPERIENCE_PACKS` array:

```javascript
{
  id: 'my-pack',
  name: 'My Pack',
  description: 'Pack description shown in UI',
  duration: 300,  // Total seconds (calculated from phases)
  difficulty: 'intermediate',  // 'beginner' | 'intermediate' | 'advanced'
  icon: '🌀',
  color: 'from-purple-500 to-pink-600',  // Tailwind gradient classes
  phases: [
    createPhase({
      name: 'Phase 1',
      duration: 60,
      frequency: 10,       // Hz
      pattern: PATTERNS.UNIFORM,
      intensity: 0.8,      // 0-1
      jitter: 0.1,         // Hz variation
      rampIn: 5,           // Fade in seconds
      rampOut: 5           // Fade out seconds
    }),
    // ... more phases
  ]
}
```

**Guidelines**:
- Start gentle (8-10 Hz, intensity 0.7), build up gradually
- Use rampIn/rampOut ≥ 3s to prevent jarring transitions
- Keep frequencies 5-15 Hz (avoid 15-25 Hz seizure zone)
- Advanced packs can use intensity 1.0 and jitter 0.3-0.5
- Test with eyes closed in dim lighting for accuracy

## External Dependencies

- **React 19** + **Vite 7** (modern fast build)
- **Capacitor 7** (web-to-native wrapper)
- **Tailwind CSS 4** (via PostCSS)
- **Vitest** (testing)

No UI component libraries - all components custom-built with Tailwind.

## Common Pitfalls

1. **Capacitor sync**: After editing web code, MUST run `npx cap sync` to copy changes to Android project
2. **Frequency limits**: Never exceed 15 Hz without explicit safety review
3. **Canvas performance**: SessionPlayer renders at 60fps - avoid heavy calculations in draw loops
4. **Ramp times**: Forgetting rampIn/rampOut causes jarring starts/stops
5. **Android testing**: Test on real device - emulator may not accurately represent flicker perception

## File Navigation Quick Reference

- Entry: [src/main.jsx](src/main.jsx) → [src/App.jsx](src/App.jsx)
- Core engine: [src/components/SessionPlayer.jsx](src/components/SessionPlayer.jsx)
- Pack data: [src/packs.js](src/packs.js)
- Tests: [src/__tests__/flicker.test.js](src/__tests__/flicker.test.js)
- Build: [Build.bat](Build.bat)
- Config: [vite.config.js](vite.config.js), [capacitor.config.json](capacitor.config.json)

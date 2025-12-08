# Flicker - Neural Entrainment App

## ⚠️ SEIZURE WARNING ⚠️

**THIS APP USES PHOTIC STIMULATION WHICH CAN TRIGGER SEIZURES IN PEOPLE WITH PHOTOSENSITIVE EPILEPSY.**

**DO NOT USE if you:**
- Have epilepsy or a history of seizures
- Have a family history of photosensitive epilepsy
- Have experienced seizures from flashing lights
- Are prone to migraines or have other neurological conditions
- Are under 18 years old without parental supervision

**Stop immediately if you experience:**
- Dizziness or lightheadedness
- Altered vision or eye discomfort
- Muscle twitching or involuntary movements
- Disorientation or confusion
- Loss of awareness

**USE AT YOUR OWN RISK. Consult a medical professional before use if you have any concerns.**

---

A React-based photic stimulation app that uses rhythmic light patterns (4-15 Hz) to synchronize brainwaves and create visual phenomena. Built with React 19, Vite 7, and wrapped in Capacitor 7 for Android deployment.

## Overview

Flicker uses the "flicker frequency response" phenomenon where alpha/theta frequencies (8-13 Hz) produce visual hallucinations with eyes closed. The app generates complex waveforms with harmonics for smooth, organic flicker patterns across 8 different visual designs.

## Features

- **Experience Packs**: Curated sessions with multiple phases
  - Beginner, Intermediate, and Advanced difficulty levels
  - Pre-designed frequency progressions
  - Random mode for exploration
- **8 Visual Patterns**: Uniform, Radial, Spiral, Tunnel, Checkerboard, Concentric, Starburst, Vortex
- **Phase Transitions**: Smooth ramp-in/ramp-out between frequencies
- **Session Controls**: Tap to pause, double-tap to exit
- **Session Reviews**: Rate and track your experiences
- **Safety First**: Built-in frequency limits and seizure warnings

## Safety Constraints ⚠️

**CRITICAL**: This app uses photic stimulation which can trigger seizures in people with photosensitive epilepsy.

### Frequency Limits
- **Safe range**: 5-15 Hz (alpha/theta bands)
- **DANGER ZONE**: 15-25 Hz - **NEVER exceed 15 Hz**
- **Optimal**: 8-13 Hz (alpha band for best entrainment)

### Safety Features
- Mandatory seizure warning on first launch
- Minimum 3-second ramp-in/ramp-out transitions
- Frequency capped at 15 Hz maximum
- No sudden flashes or jarring changes

## Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **Capacitor 7** - Native Android wrapper
- **Tailwind CSS 4** - Styling (dark theme)
- **Canvas API** - High-performance rendering
- **Vitest** - Testing framework

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Android Studio (for mobile builds)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd FlickerHalucinate

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
# Web build
npm run build

# Preview production build
npm run preview
```

### Android Build

```bash
# Build web assets and sync to Android
npm run build
npx cap sync

# Open in Android Studio
npx cap open android

# Or use the Windows batch file
Build.bat
```

**IMPORTANT**: Always run `npx cap sync` after making web code changes before testing on Android.

## Project Structure

```
src/
├── components/          # React components
│   ├── SessionPlayer.jsx      # Core flicker engine
│   ├── PackSelection.jsx      # Experience pack chooser
│   ├── PackPreview.jsx        # Session preview with graphs
│   ├── SessionReview.jsx      # Post-session feedback
│   ├── SeizureWarning.jsx     # Safety warning screen
│   ├── SplashScreen.jsx       # App intro
│   └── preview/               # Preview subcomponents
│
├── constants/           # App constants
│   ├── patterns.js           # Visual pattern types
│   ├── screens.js            # Navigation states
│   └── frequencies.js        # Frequency bands & limits
│
├── hooks/               # Custom React hooks
│   ├── useSessionTimer.js    # Timer management
│   ├── usePhaseCalculation.js # Phase transitions
│   ├── useCanvas.js          # Canvas utilities
│   └── useUITimeout.js       # Auto-hide UI
│
├── utils/               # Pure utility functions
│   ├── intensity.js          # Intensity calculation
│   ├── easing.js             # Easing functions
│   ├── format.js             # String formatting
│   └── math.js               # Math utilities
│
├── renderer/            # Canvas rendering
│   └── patternRenderer.js    # Pattern drawing logic
│
├── services/            # Business logic
│   ├── reviewStorage.js      # Session history
│   └── warningStorage.js     # Warning acceptance
│
├── packs.js             # Experience pack definitions
└── App.jsx              # Main app & state machine
```

## Screen Flow

```
SPLASH → WARNING → PACKS → PREVIEW → SESSION → REVIEW → (loop)
```

Simple `useState` manages navigation - no Redux/Context needed.

## Adding Experience Packs

Edit `src/packs.js`:

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

## Intensity Calculation

The app generates complex waveforms for organic flicker:

1. Primary sine wave at target frequency
2. Second harmonic (2x frequency) at 30% amplitude  
3. Sub-harmonic (0.5x frequency) at 20% amplitude
4. Normalize to 0-1 range
5. Apply power curve (1.8) for sharper transitions
6. Apply phase intensity and ramp modulation

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## Common Issues

1. **Capacitor sync**: After web edits, MUST run `npx cap sync`
2. **Frequency limits**: Never exceed 15 Hz
3. **Canvas performance**: Avoid heavy calculations in 60fps draw loops
4. **Ramp times**: Always use ≥3s rampIn/rampOut
5. **Android testing**: Real device required - emulator won't show accurate flicker

## Development Notes

- **TODO comments** document design decisions - don't remove them
- Tailwind uses dark theme (`bg-gray-900`, `text-white`)
- Pure React hooks - no global state library needed
- LocalStorage for session history
- Inline styles for dynamic canvas animations

## Contributing

This is a personal project focused on neural entrainment and visual phenomena. Contributions should prioritize:

1. **Safety first** - maintain frequency limits and warning systems
2. **Performance** - canvas rendering must stay at 60fps
3. **User experience** - smooth transitions and intuitive controls

## License

GNU Affero General Public License v3.0 (AGPL-3.0)

This project is licensed under the AGPL-3.0 - see below for details.

### Key Terms
- **Copyleft**: Any derivative work must be released under the same AGPL-3.0 license
- **Network Use**: If you run a modified version on a server, you must make the source code available to users
- **Contribute Back**: Any modifications or improvements must be shared with the community
- **No Proprietary Forks**: Cannot be incorporated into proprietary software

For full license text, see [LICENSE](LICENSE)

## Disclaimer

⚠️ **This app uses photic stimulation which can trigger seizures in people with photosensitive epilepsy. Use at your own risk. Consult a medical professional if you have any concerns.**

This app is for entertainment and personal exploration only. It is not a medical device and makes no therapeutic claims.

## Resources

- [Photic Stimulation (Wikipedia)](https://en.wikipedia.org/wiki/Photic_stimulation)
- [Brainwave Entrainment](https://en.wikipedia.org/wiki/Brainwave_entrainment)
- [Alpha Waves](https://en.wikipedia.org/wiki/Alpha_wave)
- [Theta Waves](https://en.wikipedia.org/wiki/Theta_wave)

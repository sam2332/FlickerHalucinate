import React from 'react';
import { PATTERNS } from '../../packs';

// Static pattern icons/thumbnails - no animation, no flashing
const PATTERN_ICONS = {
  [PATTERNS.UNIFORM]: (
    <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 rounded" />
  ),
  [PATTERNS.RADIAL]: (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-3/4 h-3/4 rounded-full border-2 border-gray-400 flex items-center justify-center">
        <div className="w-1/2 h-1/2 rounded-full border-2 border-gray-500 flex items-center justify-center">
          <div className="w-1/3 h-1/3 rounded-full bg-gray-400" />
        </div>
      </div>
    </div>
  ),
  [PATTERNS.SPIRAL]: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M50,50 Q60,40 70,50 T70,70 T50,70 T50,50"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="2"
      />
      <path
        d="M50,50 Q40,40 30,50 T30,70 T50,70"
        fill="none"
        stroke="#6b7280"
        strokeWidth="2"
      />
    </svg>
  ),
  [PATTERNS.TUNNEL]: (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full border-2 border-gray-500 flex items-center justify-center">
        <div className="w-3/4 h-3/4 border-2 border-gray-400 flex items-center justify-center">
          <div className="w-1/2 h-1/2 border-2 border-gray-500 flex items-center justify-center">
            <div className="w-1/4 h-1/4 bg-gray-400" />
          </div>
        </div>
      </div>
    </div>
  ),
  [PATTERNS.CHECKERBOARD]: (
    <div className="w-full h-full grid grid-cols-4 grid-rows-4">
      {[...Array(16)].map((_, i) => (
        <div
          key={i}
          className={`${(Math.floor(i / 4) + (i % 4)) % 2 === 0 ? 'bg-gray-400' : 'bg-gray-700'}`}
        />
      ))}
    </div>
  ),
  [PATTERNS.CONCENTRIC]: (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full rounded-full border-4 border-gray-500 flex items-center justify-center">
        <div className="w-2/3 h-2/3 rounded-full border-4 border-gray-400 flex items-center justify-center">
          <div className="w-1/3 h-1/3 rounded-full bg-gray-500" />
        </div>
      </div>
    </div>
  ),
  [PATTERNS.STARBURST]: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {[0, 45, 90, 135].map((angle) => (
        <line
          key={angle}
          x1="50"
          y1="50"
          x2={50 + 40 * Math.cos((angle * Math.PI) / 180)}
          y2={50 + 40 * Math.sin((angle * Math.PI) / 180)}
          stroke="#9ca3af"
          strokeWidth="2"
        />
      ))}
      {[22.5, 67.5, 112.5, 157.5].map((angle) => (
        <line
          key={angle}
          x1="50"
          y1="50"
          x2={50 + 30 * Math.cos((angle * Math.PI) / 180)}
          y2={50 + 30 * Math.sin((angle * Math.PI) / 180)}
          stroke="#6b7280"
          strokeWidth="2"
        />
      ))}
    </svg>
  ),
  [PATTERNS.VORTEX]: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M50,50 Q60,30 80,50 Q60,70 50,50"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="2"
      />
      <path
        d="M50,50 Q30,30 20,50 Q30,70 50,50"
        fill="none"
        stroke="#6b7280"
        strokeWidth="2"
      />
      <path
        d="M50,50 Q50,30 50,20"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="2"
      />
    </svg>
  ),
};

const PATTERN_NAMES = {
  [PATTERNS.UNIFORM]: 'Uniform Flash',
  [PATTERNS.RADIAL]: 'Radial Waves',
  [PATTERNS.SPIRAL]: 'Spiral',
  [PATTERNS.TUNNEL]: 'Tunnel',
  [PATTERNS.CHECKERBOARD]: 'Checkerboard',
  [PATTERNS.CONCENTRIC]: 'Concentric Rings',
  [PATTERNS.STARBURST]: 'Starburst',
  [PATTERNS.VORTEX]: 'Vortex',
};

const PATTERN_DESCRIPTIONS = {
  [PATTERNS.UNIFORM]: 'Simple full-screen flashing. Ideal for beginners to experience basic entrainment effects.',
  [PATTERNS.RADIAL]: 'Concentric waves emanating from the center, creating a rippling hypnotic effect.',
  [PATTERNS.SPIRAL]: 'Rotating spiral pattern that draws attention inward toward the center point.',
  [PATTERNS.TUNNEL]: 'Three-dimensional tunnel effect that creates a sense of forward motion and depth.',
  [PATTERNS.CHECKERBOARD]: 'Alternating grid pattern that stimulates peripheral vision and creates geometric hallucinations.',
  [PATTERNS.CONCENTRIC]: 'Pulsing rings that expand and contract, creating rhythmic visual waves.',
  [PATTERNS.STARBURST]: 'Radiating rays from the center that pulse in sync with the frequency.',
  [PATTERNS.VORTEX]: 'Multiple spirals rotating together, creating complex swirling motion.',
};

export function getPatternName(pattern) {
  return PATTERN_NAMES[pattern] || pattern;
}

export default function PatternPreview({ patterns, currentIndex, onPrev, onNext }) {
  const currentPattern = patterns[currentIndex];

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h2 className="text-base font-semibold mb-4 text-center">Flashlight Mode</h2>
      
      <div className="flex flex-col items-center">
        {/* Flashlight Icon */}
        <div className="w-32 h-32 bg-gray-900 rounded-lg border border-gray-600 p-4 mb-4 flex items-center justify-center">
          <div style={{ fontSize: '64px' }}>💡</div>
        </div>

        {/* Mode Name */}
        <h3 className="font-semibold text-lg text-center mb-1">
          Phone Flashlight
        </h3>

        {/* Pattern Counter - still show if multiple patterns exist */}
        {patterns.length > 1 && (
          <span className="text-xs text-gray-500 mb-2">
            Phase {currentIndex + 1} of {patterns.length}
          </span>
        )}

        {/* Description */}
        <p className="text-sm text-gray-400 text-center max-w-md mb-4">
          This session uses your phone's flashlight to create the flicker effect. The light will pulse at specific frequencies to induce visual phenomena and brainwave entrainment. Make sure your flashlight is functional before starting.
        </p>

        {/* Navigation */}
        {patterns.length > 1 && (
          <div className="flex gap-3">
            <button
              onClick={onPrev}
              className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              ← Previous Phase
            </button>
            <button
              onClick={onNext}
              className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Next Phase →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { getPatternName } from './PatternPreview';

export default function PhaseCards({ phases }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h2 className="text-base font-semibold mb-3 text-center">Session Phases</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {phases.map((phase, index) => (
          <div
            key={index}
            className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 text-center"
          >
            <div className="font-medium text-sm mb-1 truncate">{phase.name}</div>
            <div className="text-xs text-gray-400 mb-1">{phase.duration}s</div>
            <div className="text-xs text-blue-400 font-medium">
              {phase.frequency} Hz
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(phase.intensity * 100)}% intensity
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              {getPatternName(phase.pattern)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

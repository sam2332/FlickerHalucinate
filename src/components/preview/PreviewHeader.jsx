import React from 'react';

export default function PreviewHeader({ pack, onBack }) {
  const minutes = Math.floor(pack.duration / 60);
  const seconds = pack.duration % 60;

  return (
    <div className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur border-b border-gray-700 px-4 py-3 safe-top">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="text-blue-400 hover:text-blue-300 mb-2 flex items-center gap-2 text-sm"
        >
          ← Back to Packs
        </button>
        
        <div className="text-center">
          <div className="text-4xl mb-2">{pack.icon}</div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">{pack.name}</h1>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <span>⏱️</span>
              <span>{minutes}m {seconds > 0 ? `${seconds}s` : ''}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>📊</span>
              <span className="capitalize">{pack.difficulty}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>🎭</span>
              <span>{pack.phases.length} phases</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

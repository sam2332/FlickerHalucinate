import React from 'react';

export default function PreviewFooter({ pack, onBack, onAccept }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur border-t border-gray-700 safe-bottom">
      <div className="px-4 py-3 max-w-4xl mx-auto">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 px-4 py-3 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={onAccept}
            className={`flex-1 px-4 py-3 text-sm rounded-lg font-semibold transition-colors ${
              pack.difficulty === 'advanced'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Start Session →
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { PATTERNS } from '../packs';

export default function PackPreview({ pack, onAccept, onBack }) {
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  // Get unique patterns from the pack
  const uniquePatterns = [...new Set(pack.phases.map(p => p.pattern))];

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = (timestamp - startTimeRef.current) / 1000;

      drawPattern(ctx, canvas.width, canvas.height, elapsed, uniquePatterns[currentPatternIndex]);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [currentPatternIndex, uniquePatterns]);

  const drawPattern = (ctx, width, height, time, patternType) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Use moderate intensity for preview (0.5)
    const intensity = 0.3 + Math.abs(Math.sin(time * 2)) * 0.4; // Gentle pulsing
    const baseIntensity = Math.floor(intensity * 255);
    const centerX = width / 2;
    const centerY = height / 2;

    switch (patternType) {
      case PATTERNS.UNIFORM:
        ctx.fillStyle = `rgb(${baseIntensity}, ${baseIntensity}, ${baseIntensity})`;
        ctx.fillRect(0, 0, width, height);
        break;

      case PATTERNS.RADIAL: {
        const rings = 8;
        for (let i = rings; i >= 0; i--) {
          const phase = (time + i * 0.2) % 1;
          const radius = (width * 0.6 * phase);
          const alpha = (1 - phase) * intensity;
          ctx.strokeStyle = `rgba(${baseIntensity}, ${baseIntensity}, ${baseIntensity}, ${alpha})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }

      case PATTERNS.SPIRAL: {
        const turns = 5;
        ctx.strokeStyle = `rgba(${baseIntensity}, ${baseIntensity}, ${baseIntensity}, ${intensity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 2 * turns; angle += 0.1) {
          const radius = (angle / (Math.PI * 2)) * width * 0.4;
          const x = centerX + Math.cos(angle + time) * radius;
          const y = centerY + Math.sin(angle + time) * radius;
          if (angle === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        break;
      }

      case PATTERNS.TUNNEL: {
        const rings = 12;
        for (let i = 0; i < rings; i++) {
          const scale = 1 - (i / rings);
          const phase = (time * 2 + i * 0.1) % 1;
          const rectIntensity = Math.floor(phase * intensity * 255);
          ctx.strokeStyle = `rgba(${rectIntensity}, ${rectIntensity}, ${rectIntensity}, ${intensity})`;
          ctx.lineWidth = 2;
          const size = scale * width * 0.8;
          ctx.strokeRect(centerX - size / 2, centerY - size / 2, size, size);
        }
        break;
      }

      case PATTERNS.CHECKERBOARD: {
        const gridSize = 8;
        const cellWidth = width / gridSize;
        const cellHeight = height / gridSize;
        const phase = Math.floor(time * 2) % 2;
        for (let row = 0; row < gridSize; row++) {
          for (let col = 0; col < gridSize; col++) {
            const isLight = ((row + col + phase) % 2 === 0);
            if (isLight) {
              ctx.fillStyle = `rgba(${baseIntensity}, ${baseIntensity}, ${baseIntensity}, ${intensity})`;
              ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
            }
          }
        }
        break;
      }

      case PATTERNS.CONCENTRIC: {
        const rings = 10;
        for (let i = 0; i < rings; i++) {
          const phase = (time + i * 0.15) % 1;
          const radius = (width * 0.5) * (i / rings);
          const alpha = Math.sin(phase * Math.PI) * intensity;
          ctx.strokeStyle = `rgba(${baseIntensity}, ${baseIntensity}, ${baseIntensity}, ${alpha})`;
          ctx.lineWidth = width / rings / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }

      case PATTERNS.STARBURST: {
        const rays = 16;
        ctx.strokeStyle = `rgba(${baseIntensity}, ${baseIntensity}, ${baseIntensity}, ${intensity})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < rays; i++) {
          const angle = (Math.PI * 2 * i) / rays + time;
          const length = width * 0.4 * (0.5 + 0.5 * Math.sin(time * 2 + i));
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(
            centerX + Math.cos(angle) * length,
            centerY + Math.sin(angle) * length
          );
          ctx.stroke();
        }
        break;
      }

      case PATTERNS.VORTEX: {
        const spirals = 3;
        ctx.strokeStyle = `rgba(${baseIntensity}, ${baseIntensity}, ${baseIntensity}, ${intensity})`;
        ctx.lineWidth = 2;
        for (let s = 0; s < spirals; s++) {
          ctx.beginPath();
          for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
            const radius = (angle / (Math.PI * 4)) * width * 0.35;
            const spiralAngle = angle + time + (s * Math.PI * 2) / spirals;
            const x = centerX + Math.cos(spiralAngle) * radius;
            const y = centerY + Math.sin(spiralAngle) * radius;
            if (angle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        break;
      }
    }
  };

  const getPatternDescription = (pattern) => {
    const descriptions = {
      [PATTERNS.UNIFORM]: 'Simple full-screen flashing. Ideal for beginners to experience basic entrainment effects.',
      [PATTERNS.RADIAL]: 'Concentric waves emanating from the center, creating a rippling hypnotic effect.',
      [PATTERNS.SPIRAL]: 'Rotating spiral pattern that draws attention inward toward the center point.',
      [PATTERNS.TUNNEL]: 'Three-dimensional tunnel effect that creates a sense of forward motion and depth.',
      [PATTERNS.CHECKERBOARD]: 'Alternating grid pattern that stimulates peripheral vision and creates geometric hallucinations.',
      [PATTERNS.CONCENTRIC]: 'Pulsing rings that expand and contract, creating rhythmic visual waves.',
      [PATTERNS.STARBURST]: 'Radiating rays from the center that pulse in sync with the frequency.',
      [PATTERNS.VORTEX]: 'Multiple spirals rotating together, creating complex swirling motion.'
    };
    return descriptions[pattern] || 'Visual pattern for neural entrainment.';
  };

  const getPatternName = (pattern) => {
    const names = {
      [PATTERNS.UNIFORM]: 'Uniform Flash',
      [PATTERNS.RADIAL]: 'Radial Waves',
      [PATTERNS.SPIRAL]: 'Spiral',
      [PATTERNS.TUNNEL]: 'Tunnel',
      [PATTERNS.CHECKERBOARD]: 'Checkerboard',
      [PATTERNS.CONCENTRIC]: 'Concentric Rings',
      [PATTERNS.STARBURST]: 'Starburst',
      [PATTERNS.VORTEX]: 'Vortex'
    };
    return names[pattern] || pattern;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
          >
            ← Back to Packs
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {pack.icon} {pack.name}
              </h1>
              <p className="text-gray-400 text-lg mb-1">{pack.description}</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>⏱️ {Math.floor(pack.duration / 60)}m {pack.duration % 60}s</span>
                <span>📊 {pack.difficulty}</span>
                <span>🎭 {pack.phases.length} phases</span>
              </div>
            </div>
          </div>
        </div>

        {/* Intensity Graph */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Session Intensity Profile</h2>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <svg width="100%" height="300" viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid meet">
              {/* Background grid */}
              <defs>
                <linearGradient id="intensityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((y) => (
                <line
                  key={y}
                  x1="50"
                  y1={250 - y * 200}
                  x2="950"
                  y2={250 - y * 200}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
              ))}
              
              {/* Y-axis labels */}
              {[0, 25, 50, 75, 100].map((label, i) => (
                <text
                  key={label}
                  x="40"
                  y={254 - i * 50}
                  fill="#666"
                  fontSize="12"
                  textAnchor="end"
                >
                  {label}%
                </text>
              ))}
              
              {/* Build intensity curve */}
              {(() => {
                const totalDuration = pack.phases.reduce((sum, p) => sum + p.duration, 0);
                const points = [];
                let accumulated = 0;
                
                pack.phases.forEach((phase, index) => {
                  const startX = 50 + (accumulated / totalDuration) * 900;
                  const endX = 50 + ((accumulated + phase.duration) / totalDuration) * 900;
                  const startY = 250 - (index === 0 ? 0 : pack.phases[index - 1].intensity) * 200;
                  const peakY = 250 - phase.intensity * 200;
                  
                  // Ramp in
                  const rampInX = startX + (phase.rampIn / totalDuration) * 900;
                  points.push(`${startX},${startY}`);
                  points.push(`${rampInX},${peakY}`);
                  
                  // Sustain
                  const rampOutStartX = endX - (phase.rampOut / totalDuration) * 900;
                  points.push(`${rampOutStartX},${peakY}`);
                  
                  // Ramp out (to next phase start)
                  const nextIntensity = index < pack.phases.length - 1 ? pack.phases[index + 1].intensity : 0;
                  const nextY = 250 - nextIntensity * 200;
                  points.push(`${endX},${nextY}`);
                  
                  accumulated += phase.duration;
                });
                
                // Create filled area
                const pathData = `M ${points.join(' L ')} L 950,250 L 50,250 Z`;
                const lineData = `M ${points.join(' L ')}`;
                
                return (
                  <>
                    {/* Fill under curve */}
                    <path
                      d={pathData}
                      fill="url(#intensityGradient)"
                    />
                    {/* Curve line */}
                    <path
                      d={lineData}
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                  </>
                );
              })()}
              
              {/* Phase separators and labels */}
              {(() => {
                const totalDuration = pack.phases.reduce((sum, p) => sum + p.duration, 0);
                let accumulated = 0;
                
                return pack.phases.map((phase, index) => {
                  const x = 50 + (accumulated / totalDuration) * 900;
                  accumulated += phase.duration;
                  
                  return (
                    <g key={index}>
                      {/* Vertical separator line */}
                      <line
                        x1={x}
                        y1="50"
                        x2={x}
                        y2="250"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                      {/* Phase label */}
                      <text
                        x={x + 10}
                        y="30"
                        fill="#888"
                        fontSize="11"
                        fontWeight="500"
                      >
                        {phase.name}
                      </text>
                      {/* Frequency label */}
                      <text
                        x={x + 10}
                        y="45"
                        fill="#60a5fa"
                        fontSize="10"
                      >
                        {phase.frequency}Hz
                      </text>
                    </g>
                  );
                });
              })()}
              
              {/* Axes */}
              <line x1="50" y1="250" x2="950" y2="250" stroke="#666" strokeWidth="2" />
              <line x1="50" y1="50" x2="50" y2="250" stroke="#666" strokeWidth="2" />
              
              {/* Axis labels */}
              <text x="500" y="285" fill="#888" fontSize="13" textAnchor="middle" fontWeight="500">
                Time →
              </text>
              <text x="15" y="150" fill="#888" fontSize="13" textAnchor="middle" transform="rotate(-90, 15, 150)" fontWeight="500">
                Intensity
              </text>
            </svg>
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span>Peak Intensity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-blue-400"></div>
                <span>Ramp In/Out</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 border-t border-dashed border-gray-400"></div>
                <span>Phase Transitions</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pattern Visualization */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Pattern Preview</h2>
            <div className="bg-black rounded-lg overflow-hidden border-2 border-gray-700">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="w-full"
              />
            </div>
            
            {/* Pattern Navigation */}
            {uniquePatterns.length > 1 && (
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => setCurrentPatternIndex((prev) => (prev - 1 + uniquePatterns.length) % uniquePatterns.length)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  ← Prev
                </button>
                <span className="flex-1 text-center text-sm text-gray-400">
                  Pattern {currentPatternIndex + 1} of {uniquePatterns.length}
                </span>
                <button
                  onClick={() => setCurrentPatternIndex((prev) => (prev + 1) % uniquePatterns.length)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  Next →
                </button>
              </div>
            )}
            
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2">
                {getPatternName(uniquePatterns[currentPatternIndex])}
              </h3>
              <p className="text-sm text-gray-400">
                {getPatternDescription(uniquePatterns[currentPatternIndex])}
              </p>
            </div>
          </div>

          {/* Phase Details */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Phase Details</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {pack.phases.map((phase, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{phase.name}</h3>
                    <span className="text-sm text-gray-500">{phase.duration}s</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                    <div>
                      <span className="text-gray-500">Frequency:</span> {phase.frequency} Hz
                    </div>
                    <div>
                      <span className="text-gray-500">Pattern:</span> {getPatternName(phase.pattern)}
                    </div>
                    <div>
                      <span className="text-gray-500">Intensity:</span> {Math.round(phase.intensity * 100)}%
                    </div>
                    {phase.jitter > 0 && (
                      <div>
                        <span className="text-gray-500">Jitter:</span> ±{phase.jitter.toFixed(1)} Hz
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Safety Notice & Accept */}
        <div className="mt-8 p-6 bg-yellow-900/20 border-2 border-yellow-700 rounded-lg">
          <h3 className="text-xl font-semibold mb-3 text-yellow-400">⚠️ Before You Begin</h3>
          <ul className="space-y-2 text-sm text-gray-300 mb-4">
            <li>• Find a comfortable, dimly lit space where you won't be disturbed</li>
            <li>• Close your eyes or use soft focus for best results</li>
            <li>• You may stop the session at any time by pressing EXIT or ESC</li>
            <li>• Visual phenomena (patterns, colors) are normal and temporary</li>
            <li>• If you feel discomfort, dizziness, or nausea, stop immediately</li>
          </ul>
          
          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={onAccept}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                pack.difficulty === 'advanced'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              Accept & Begin Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

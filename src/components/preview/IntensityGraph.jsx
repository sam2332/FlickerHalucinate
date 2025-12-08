import React from 'react';

export default function IntensityGraph({ phases }) {
  const totalDuration = phases.reduce((sum, p) => sum + p.duration, 0);

  // Build intensity curve points
  const buildCurve = () => {
    const points = [];
    let accumulated = 0;

    phases.forEach((phase, index) => {
      const startX = 40 + (accumulated / totalDuration) * 740;
      const endX = 40 + ((accumulated + phase.duration) / totalDuration) * 740;
      const startY = 150 - (index === 0 ? 0 : phases[index - 1].intensity) * 120;
      const peakY = 150 - phase.intensity * 120;

      const rampInX = startX + (phase.rampIn / totalDuration) * 740;
      points.push(`${startX},${startY}`);
      points.push(`${rampInX},${peakY}`);

      const rampOutStartX = endX - (phase.rampOut / totalDuration) * 740;
      points.push(`${rampOutStartX},${peakY}`);

      const nextIntensity = index < phases.length - 1 ? phases[index + 1].intensity : 0;
      const nextY = 150 - nextIntensity * 120;
      points.push(`${endX},${nextY}`);

      accumulated += phase.duration;
    });

    return points;
  };

  // Build phase markers
  const buildPhaseMarkers = () => {
    let accumulated = 0;

    return phases.map((phase, index) => {
      const x = 40 + (accumulated / totalDuration) * 740;
      const width = (phase.duration / totalDuration) * 740;
      accumulated += phase.duration;

      return (
        <g key={index}>
          <line
            x1={x}
            y1="30"
            x2={x}
            y2="150"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <text
            x={x + width / 2}
            y="170"
            fill="#888"
            fontSize="9"
            textAnchor="middle"
          >
            {phase.frequency}Hz
          </text>
        </g>
      );
    });
  };

  const points = buildCurve();
  const pathData = `M ${points.join(' L ')} L 780,150 L 40,150 Z`;
  const lineData = `M ${points.join(' L ')}`;

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h2 className="text-base font-semibold mb-3 text-center">Session Intensity</h2>
      <svg
        width="100%"
        height="180"
        viewBox="0 0 800 180"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="intensityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((y) => (
          <line
            key={y}
            x1="40"
            y1={150 - y * 120}
            x2="780"
            y2={150 - y * 120}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Y-axis labels */}
        {[0, 50, 100].map((label, i) => (
          <text
            key={label}
            x="35"
            y={154 - i * 60}
            fill="#666"
            fontSize="10"
            textAnchor="end"
          >
            {label}%
          </text>
        ))}

        {/* Intensity curve */}
        <path d={pathData} fill="url(#intensityGradient)" />
        <path
          d={lineData}
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Phase markers */}
        {buildPhaseMarkers()}

        {/* Axes */}
        <line x1="40" y1="150" x2="780" y2="150" stroke="#666" strokeWidth="1" />
        <line x1="40" y1="30" x2="40" y2="150" stroke="#666" strokeWidth="1" />
      </svg>
    </div>
  );
}

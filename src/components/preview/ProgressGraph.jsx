import React from 'react';

/**
 * Compact progress graph for pause menu
 * Shows session intensity curve with current position indicator
 */
export default function ProgressGraph({ phases, elapsed, totalDuration }) {
  // SVG dimensions - compact for pause menu
  const width = 320;
  const height = 100;
  const padding = { left: 30, right: 10, top: 15, bottom: 20 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Build intensity curve points
  const buildCurve = () => {
    const points = [];
    let accumulated = 0;

    phases.forEach((phase, index) => {
      const startX = padding.left + (accumulated / totalDuration) * graphWidth;
      const endX = padding.left + ((accumulated + phase.duration) / totalDuration) * graphWidth;
      const startY = padding.top + graphHeight - (index === 0 ? 0 : phases[index - 1].intensity) * graphHeight;
      const peakY = padding.top + graphHeight - phase.intensity * graphHeight;

      const rampInX = startX + (phase.rampIn / totalDuration) * graphWidth;
      points.push(`${startX},${startY}`);
      points.push(`${rampInX},${peakY}`);

      const rampOutStartX = endX - (phase.rampOut / totalDuration) * graphWidth;
      points.push(`${rampOutStartX},${peakY}`);

      const nextIntensity = index < phases.length - 1 ? phases[index + 1].intensity : 0;
      const nextY = padding.top + graphHeight - nextIntensity * graphHeight;
      points.push(`${endX},${nextY}`);

      accumulated += phase.duration;
    });

    return points;
  };

  // Calculate progress line position
  const progressX = padding.left + Math.min(elapsed / totalDuration, 1) * graphWidth;
  const progressPercent = Math.min((elapsed / totalDuration) * 100, 100);

  const points = buildCurve();
  const pathData = `M ${points.join(' L ')} L ${width - padding.right},${padding.top + graphHeight} L ${padding.left},${padding.top + graphHeight} Z`;
  const lineData = `M ${points.join(' L ')}`;

  return (
    <div style={{
      background: 'rgba(30, 30, 40, 0.9)',
      borderRadius: '12px',
      padding: '12px 16px',
      border: '1px solid rgba(255,255,255,0.1)',
      marginBottom: '20px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
      }}>
        <span style={{ fontSize: '12px', color: '#888' }}>Session Progress</span>
        <span style={{ fontSize: '12px', color: '#60a5fa', fontWeight: '600' }}>
          {progressPercent.toFixed(0)}%
        </span>
      </div>
      
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="progressFillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line
          x1={padding.left}
          y1={padding.top + graphHeight / 2}
          x2={width - padding.right}
          y2={padding.top + graphHeight / 2}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          strokeDasharray="2,4"
        />

        {/* Completed area (left of progress line) */}
        <clipPath id="completedClip">
          <rect x={padding.left} y={padding.top} width={progressX - padding.left} height={graphHeight} />
        </clipPath>
        <path d={pathData} fill="url(#progressFillGradient)" clipPath="url(#completedClip)" />

        {/* Remaining area (right of progress line) */}
        <clipPath id="remainingClip">
          <rect x={progressX} y={padding.top} width={width - padding.right - progressX} height={graphHeight} />
        </clipPath>
        <path d={pathData} fill="url(#progressGradient)" clipPath="url(#remainingClip)" />

        {/* Intensity curve line */}
        <path
          d={lineData}
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.8"
        />

        {/* Progress indicator line (vertical red line) */}
        <line
          x1={progressX}
          y1={padding.top - 5}
          x2={progressX}
          y2={padding.top + graphHeight + 5}
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Progress indicator dot */}
        <circle
          cx={progressX}
          cy={padding.top - 5}
          r="4"
          fill="#ef4444"
        />

        {/* X-axis */}
        <line 
          x1={padding.left} 
          y1={padding.top + graphHeight} 
          x2={width - padding.right} 
          y2={padding.top + graphHeight} 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth="1" 
        />

        {/* Time labels */}
        <text
          x={padding.left}
          y={height - 4}
          fill="#666"
          fontSize="9"
          textAnchor="start"
        >
          0:00
        </text>
        <text
          x={width - padding.right}
          y={height - 4}
          fill="#666"
          fontSize="9"
          textAnchor="end"
        >
          {formatTime(totalDuration)}
        </text>
        
        {/* Current time label near progress line */}
        <text
          x={progressX}
          y={height - 4}
          fill="#ef4444"
          fontSize="9"
          fontWeight="600"
          textAnchor="middle"
        >
          {formatTime(elapsed)}
        </text>
      </svg>
    </div>
  );
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

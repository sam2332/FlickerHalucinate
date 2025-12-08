import React from 'react';
import IntensityGraph from './preview/IntensityGraph';
import { getPatternName } from './preview/PatternPreview';
import './preview/preview.css';

export default function PackPreview({ pack, onAccept, onBack }) {
  const minutes = Math.floor(pack.duration / 60);
  const seconds = pack.duration % 60;
  const difficulty = pack.difficulty;

  return (
    <div className="preview-container">
      {/* Back Button */}
      <div className="preview-back-wrapper">
        <button onClick={onBack} className={`preview-back-btn ${difficulty}`}>
          ← Back to Packs
        </button>
      </div>

      {/* Header */}
      <div className="preview-header">
        <div className="preview-icon">{pack.icon}</div>
        <h1 className="preview-title">{pack.name}</h1>
        <p className="preview-description">{pack.description}</p>
      </div>

      {/* Stats Row */}
      <div className="preview-stats">
        <div className="preview-stat-card">
          <div className="preview-stat-icon">⏱️</div>
          <div className="preview-stat-value">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          <div className="preview-stat-label">Duration</div>
        </div>
        <div className="preview-stat-card">
          <div className="preview-stat-icon">🎭</div>
          <div className="preview-stat-value">{pack.phases.length}</div>
          <div className="preview-stat-label">Phases</div>
        </div>
        <div className="preview-stat-card">
          <div className="preview-stat-icon">📊</div>
          <div className={`preview-stat-value ${difficulty}`}>{difficulty}</div>
          <div className="preview-stat-label">Level</div>
        </div>
      </div>

      {/* Intensity Graph */}
      <div className="preview-section">
        <IntensityGraph phases={pack.phases} />
      </div>

      {/* Phase Cards */}
      <div className="preview-section">
        <h3 className="preview-section-title">Session Phases</h3>
        <div className="preview-phases-grid">
          {pack.phases.map((phase, index) => (
            <div key={index} className="preview-phase-card">
              <div className="preview-phase-name">{phase.name}</div>
              <div className={`preview-phase-frequency ${difficulty}`}>
                {phase.frequency} Hz
              </div>
              <div className="preview-phase-meta">
                {phase.duration}s • {Math.round(phase.intensity * 100)}%
              </div>
              <div className="preview-phase-pattern">
                {getPatternName(phase.pattern)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="preview-footer">
        <div className="preview-footer-inner">
          <button onClick={onAccept} className={`preview-begin-btn ${difficulty}`}>
            Begin Session
          </button>
        </div>
      </div>
    </div>
  );
}

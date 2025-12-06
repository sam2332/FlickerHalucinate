import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PATTERNS, getCurrentPhase, getInterpolatedFrequency, formatDuration, getPackDuration } from '../packs';

export default function SessionPlayer({ pack, onExit }) {
  const [state, setState] = useState('playing'); // 'playing' | 'paused' | 'ending' | 'ended'
  const [elapsed, setElapsed] = useState(0);
  const [intensity, setIntensity] = useState(0);
  const [showUI, setShowUI] = useState(true);
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);
  const lastTapRef = useRef(0);
  const uiTimeoutRef = useRef(null);
  
  const totalDuration = getPackDuration(pack);
  
  // Hide UI after delay
  useEffect(() => {
    if (state === 'playing') {
      uiTimeoutRef.current = setTimeout(() => setShowUI(false), 3000);
      return () => clearTimeout(uiTimeoutRef.current);
    }
  }, [state, showUI]);
  
  // Calculate intensity based on phase and time
  const calculateIntensity = useCallback((time, freq, phaseInfo) => {
    const { phase, phaseElapsed } = phaseInfo;
    
    const primary = Math.sin(2 * Math.PI * freq * time);
    const harmonic1 = 0.2 * Math.sin(2 * Math.PI * (freq * 2) * time);
    const harmonic2 = 0.15 * Math.sin(2 * Math.PI * (freq * 0.5) * time);
    
    const combined = primary + harmonic1 + harmonic2;
    const normalized = (combined + 1.4) / 2.8;
    const curved = Math.pow(normalized, 2.2);
    
    let intensityMultiplier = phase.intensity;
    
    if (phaseElapsed < phase.rampIn) {
      intensityMultiplier *= phaseElapsed / phase.rampIn;
    }
    
    const rampOutStart = phase.duration - phase.rampOut;
    if (phaseElapsed > rampOutStart) {
      const rampProgress = (phaseElapsed - rampOutStart) / phase.rampOut;
      intensityMultiplier *= 1 - (rampProgress * 0.3);
    }
    
    return 0.15 + (curved * 0.75 * intensityMultiplier);
  }, []);
  
  // Draw patterns
  const drawPattern = useCallback((ctx, width, height, time, currentIntensity, patternType) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const val = Math.floor(currentIntensity * 255);
    
    switch (patternType) {
      case PATTERNS.UNIFORM:
        ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
        ctx.fillRect(0, 0, width, height);
        break;
        
      case PATTERNS.RADIAL: {
        const maxRadius = Math.max(width, height);
        for (let r = 0; r < maxRadius; r += 12) {
          const phase = Math.sin(r * 0.03 + time * 4);
          const intensity = Math.floor(currentIntensity * 255 * (0.5 + 0.5 * phase));
          ctx.strokeStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
          ctx.lineWidth = 12;
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }
      
      case PATTERNS.SPIRAL: {
        for (let t = 0; t < 60; t += 0.15) {
          const radius = t * 10;
          const angle = t + time * 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          const phase = Math.sin(t * 0.4 + time * 5);
          const intensity = Math.floor(currentIntensity * 255 * (0.4 + 0.6 * phase));
          ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      
      case PATTERNS.TUNNEL: {
        for (let ring = 1; ring < 30; ring++) {
          const radius = Math.pow(ring, 1.4) * 20;
          const phase = Math.sin(ring * 0.35 - time * 5);
          const intensity = Math.floor(currentIntensity * 255 * (0.4 + 0.6 * phase));
          ctx.strokeStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
          ctx.lineWidth = 18;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }
      
      case PATTERNS.CHECKERBOARD: {
        const size = 80;
        for (let x = 0; x < width + size; x += size) {
          for (let y = 0; y < height + size; y += size) {
            const checker = ((Math.floor(x / size) + Math.floor(y / size)) % 2);
            const phase = Math.sin((x + y) * 0.008 + time * 6);
            const intensity = Math.floor(currentIntensity * 255 * (checker ? (0.5 + 0.5 * phase) : (0.5 - 0.5 * phase)));
            ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
            ctx.fillRect(x, y, size, size);
          }
        }
        break;
      }
      
      case PATTERNS.CONCENTRIC: {
        for (let r = 0; r < Math.max(width, height); r += 50) {
          const phase = Math.sin(r * 0.015 - time * 4);
          const intensity = Math.floor(currentIntensity * 255 * (0.3 + 0.7 * phase));
          ctx.strokeStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
          ctx.lineWidth = 45;
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }
      
      case PATTERNS.STARBURST: {
        const rays = 20;
        for (let i = 0; i < rays; i++) {
          const angle = (i / rays) * Math.PI * 2 + time * 0.4;
          const phase = Math.sin(i * 0.6 + time * 6);
          const intensity = Math.floor(currentIntensity * 255 * (0.4 + 0.6 * phase));
          ctx.strokeStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
          ctx.lineWidth = 30;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          const len = Math.max(width, height);
          ctx.lineTo(centerX + Math.cos(angle) * len, centerY + Math.sin(angle) * len);
          ctx.stroke();
        }
        break;
      }
      
      case PATTERNS.VORTEX: {
        for (let r = 15; r < Math.max(width, height) * 0.8; r += 20) {
          const spiralOffset = r * 0.08 + time * 3;
          const phase = Math.sin(r * 0.025 + time * 5);
          const intensity = Math.floor(currentIntensity * 255 * (0.4 + 0.6 * phase));
          ctx.strokeStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
          ctx.lineWidth = 16;
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, spiralOffset, spiralOffset + Math.PI * 1.6);
          ctx.stroke();
        }
        break;
      }
      
      default:
        ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
        ctx.fillRect(0, 0, width, height);
    }
  }, []);
  
  // Handle tap/double-tap
  const handleTap = useCallback((e) => {
    e.preventDefault();
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < 300) {
      setState('ending');
    } else {
      if (state === 'playing') {
        setState('paused');
        pausedTimeRef.current = elapsed;
        setShowUI(true);
      } else if (state === 'paused') {
        setState('playing');
        startTimeRef.current = Date.now() - (pausedTimeRef.current * 1000);
      }
    }
    
    lastTapRef.current = now;
  }, [state, elapsed]);
  
  // Show UI on move
  const handleMove = useCallback(() => {
    if (state === 'playing') {
      setShowUI(true);
      if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
      uiTimeoutRef.current = setTimeout(() => setShowUI(false), 2000);
    }
  }, [state]);
  
  // Main animation loop
  useEffect(() => {
    if (state !== 'playing') return;
    
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now() - (pausedTimeRef.current * 1000);
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const ctx = canvas.getContext('2d');
    
    const animate = () => {
      const currentElapsed = (Date.now() - startTimeRef.current) / 1000;
      
      if (currentElapsed >= totalDuration) {
        setState('ending');
        return;
      }
      
      setElapsed(currentElapsed);
      
      const phaseInfo = getCurrentPhase(pack, currentElapsed);
      const frequency = getInterpolatedFrequency(pack, currentElapsed);
      const currentIntensity = calculateIntensity(currentElapsed, frequency, phaseInfo);
      
      setIntensity(currentIntensity);
      drawPattern(ctx, canvas.width, canvas.height, currentElapsed, currentIntensity, phaseInfo.phase.pattern);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [state, pack, totalDuration, calculateIntensity, drawPattern]);
  
  // Handle ending
  useEffect(() => {
    if (state !== 'ending') return;
    
    const canvas = canvasRef.current;
    if (!canvas) {
      setState('ended');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    let fadeIntensity = intensity;
    
    const fadeOut = () => {
      fadeIntensity -= 0.03;
      if (fadeIntensity <= 0) {
        setState('ended');
        return;
      }
      const val = Math.floor(fadeIntensity * 255);
      ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      requestAnimationFrame(fadeOut);
    };
    fadeOut();
  }, [state, intensity]);
  
  // Exit when ended
  useEffect(() => {
    if (state === 'ended') onExit();
  }, [state, onExit]);
  
  // Keyboard
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setState('ending');
      else if (e.key === ' ') {
        e.preventDefault();
        handleTap(e);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleTap]);
  
  const phaseInfo = getCurrentPhase(pack, elapsed);
  const progress = (elapsed / totalDuration) * 100;
  const accent = pack.difficulty === 'beginner' ? '#4ade80' : pack.difficulty === 'intermediate' ? '#a78bfa' : '#f87171';
  
  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        cursor: 'none',
        userSelect: 'none',
        touchAction: 'none',
      }}
      onClick={handleTap}
      onMouseMove={handleMove}
      onTouchStart={handleMove}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      
      {/* Paused Overlay */}
      {state === 'paused' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', margin: '0 0 8px' }}>Paused</h2>
            <p style={{ fontSize: '14px', color: '#888', margin: '0 0 24px' }}>Tap to resume • Double-tap to exit</p>
            <button
              onClick={(e) => { e.stopPropagation(); setState('ending'); }}
              style={{
                padding: '12px 28px',
                background: 'rgba(255,100,100,0.15)',
                border: '1px solid rgba(255,100,100,0.3)',
                borderRadius: '12px',
                color: '#ff7070',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              End Session
            </button>
          </div>
        </div>
      )}
      
      {/* Top UI */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px 20px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
        opacity: showUI || state === 'paused' ? 1 : 0,
        transition: 'opacity 0.3s',
        zIndex: 10,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        {/* Progress */}
        <div style={{
          height: '4px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '2px',
          marginBottom: '12px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${accent}, ${accent}aa)`,
            transition: 'width 0.3s',
          }} />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>{pack.icon}</span>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>{pack.name}</span>
          </div>
          <span style={{ fontSize: '14px', color: '#888' }}>
            {formatDuration(elapsed)} / {formatDuration(totalDuration)}
          </span>
        </div>
        
        {/* Phase dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {pack.phases.map((_, i) => (
              <div key={i} style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: i < phaseInfo.phaseIndex ? accent : i === phaseInfo.phaseIndex ? '#fff' : 'rgba(255,255,255,0.2)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          <span style={{ fontSize: '12px', color: '#666' }}>{phaseInfo.phase.name}</span>
        </div>
      </div>
      
      {/* Bottom hint */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20px',
        textAlign: 'center',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 100%)',
        opacity: showUI || state === 'paused' ? 1 : 0,
        transition: 'opacity 0.3s',
        zIndex: 10,
      }}>
        <p style={{ fontSize: '11px', color: '#555', margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          Tap to pause • Double-tap to exit • ESC to quit
        </p>
      </div>
    </div>
  );
}

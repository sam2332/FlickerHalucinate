import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PATTERNS } from '../constants';
import { getCurrentPhase, getInterpolatedFrequency, getPackDuration } from '../packs';
import { formatDuration } from '../utils/format';
import { calculateIntensity } from '../utils/intensity';
import { renderPattern } from '../renderer';

export default function SessionPlayer({ pack, onExit, onComplete }) {
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
      const currentIntensity = calculateIntensity(frequency, currentElapsed, phaseInfo.phase, phaseInfo.phaseElapsed);
      
      setIntensity(currentIntensity);
      renderPattern(ctx, canvas.width, canvas.height, currentElapsed, currentIntensity, phaseInfo.phase.pattern);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [state, pack, totalDuration]);
  
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
    if (state === 'ended') {
      if (onComplete) {
        onComplete({
          duration: elapsed,
        });
      } else {
        onExit();
      }
    }
  }, [state, elapsed, onExit, onComplete]);
  
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

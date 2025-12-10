import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentPhase, getPackDuration } from '../packs';
import { formatDuration } from '../utils/format';
import { flashlightService, EffectType } from '../services';
import ProgressGraph from './preview/ProgressGraph';

export default function SessionPlayer({ pack, onExit, onComplete }) {
  const [state, setState] = useState('initializing'); // 'initializing' | 'playing' | 'paused' | 'ending' | 'ended'
  const [elapsed, setElapsed] = useState(0);
  const [showUI, setShowUI] = useState(true);
  const [flashlightAvailable, setFlashlightAvailable] = useState(false);
  const [error, setError] = useState(null);
  
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);
  const lastTapRef = useRef(0);
  const uiTimeoutRef = useRef(null);
  const elapsedIntervalRef = useRef(null);
  
  const totalDuration = getPackDuration(pack);
  
  /**
   * Convert pack phases to strobe effects for the native engine
   */
  const createFlashPlan = (pack) => {
    return pack.phases.map(phase => ({
      type: EffectType.STROBE,
      durationMs: phase.duration * 1000,
      frequency: phase.frequency,
      intensity: phase.intensity,
      id: `phase_${phase.name.replace(/\s+/g, '_')}`
    }));
  };
  
  // Initialize flashlight and upload flash plan on mount
  useEffect(() => {
    const init = async () => {
      try {
        const available = await flashlightService.initialize();
        setFlashlightAvailable(available);
        
        if (!available) {
          setError('Flashlight not available on this device');
          setState('ended');
          return;
        }
        
        // Create and upload the flash plan to native engine
        const flashPlan = createFlashPlan(pack);
        console.log('Uploading flash plan:', flashPlan);
        
        // Clear any existing queue and enqueue all phases
        await flashlightService.clearQueue();
        await flashlightService.enqueueAll(flashPlan);
        
        // Start the native strobe engine
        await flashlightService.start();
        
        setState('playing');
        startTimeRef.current = Date.now();
        
      } catch (err) {
        console.error('Flashlight initialization error:', err);
        setError('Failed to initialize flashlight');
        setState('ended');
      }
    };
    
    init();
    
    // Cleanup on unmount
    return () => {
      flashlightService.cleanup();
    };
  }, [pack]);
  
  // Listen for native events (queue empty = session complete)
  useEffect(() => {
    const handleQueueEmpty = () => {
      console.log('Flash plan completed');
      setState('ending');
    };
    
    const handleStateChanged = ({ state: engineState }) => {
      console.log('Engine state changed:', engineState);
    };
    
    const handleError = ({ message }) => {
      console.error('Flashlight error:', message);
      setError(message);
    };
    
    flashlightService.on('queueEmpty', handleQueueEmpty);
    flashlightService.on('stateChanged', handleStateChanged);
    flashlightService.on('error', handleError);
    
    return () => {
      flashlightService.off('queueEmpty', handleQueueEmpty);
      flashlightService.off('stateChanged', handleStateChanged);
      flashlightService.off('error', handleError);
    };
  }, []);
  
  // Update elapsed time display (UI only, not controlling flash)
  useEffect(() => {
    if (state !== 'playing') {
      if (elapsedIntervalRef.current) {
        clearInterval(elapsedIntervalRef.current);
        elapsedIntervalRef.current = null;
      }
      return;
    }
    
    elapsedIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const currentElapsed = (Date.now() - startTimeRef.current) / 1000;
        setElapsed(currentElapsed);
        
        // Check if session should end (backup check)
        if (currentElapsed >= totalDuration) {
          setState('ending');
        }
      }
    }, 250); // Update UI 4 times per second (not controlling flash)
    
    return () => {
      if (elapsedIntervalRef.current) {
        clearInterval(elapsedIntervalRef.current);
        elapsedIntervalRef.current = null;
      }
    };
  }, [state, totalDuration]);
  
  // Hide UI after delay
  useEffect(() => {
    if (state === 'playing') {
      uiTimeoutRef.current = setTimeout(() => setShowUI(false), 3000);
      return () => clearTimeout(uiTimeoutRef.current);
    }
  }, [state, showUI]);
  
  // Handle tap/double-tap
  const handleTap = useCallback(async (e) => {
    e.preventDefault();
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < 300) {
      // Double-tap: end session
      setState('ending');
    } else {
      if (state === 'playing') {
        // Pause the session - native engine handles timing
        setState('paused');
        pausedTimeRef.current = elapsed;
        setShowUI(true);
        try {
          await flashlightService.pause();
        } catch (err) {
          console.error('Failed to pause flashlight:', err);
        }
      } else if (state === 'paused') {
        // Resume the session - native engine resumes from where it left off
        setState('playing');
        startTimeRef.current = Date.now() - (pausedTimeRef.current * 1000);
        try {
          await flashlightService.resume();
        } catch (err) {
          console.error('Failed to resume flashlight:', err);
        }
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
  
  // Handle ending - stop flashlight session completely
  useEffect(() => {
    if (state !== 'ending') return;
    
    const cleanup = async () => {
      console.log('Session ending, stopping native engine...');
      
      // Clear the elapsed interval
      if (elapsedIntervalRef.current) {
        clearInterval(elapsedIntervalRef.current);
        elapsedIntervalRef.current = null;
      }
      
      try {
        // Stop the native engine (handles turning off flash)
        await flashlightService.stop();
        console.log('Native engine stopped');
      } catch (err) {
        console.error('Stop failed:', err);
      }
      
      // Force off as safety measure
      try {
        await flashlightService.forceOff();
      } catch (err) {
        console.error('Force off failed:', err);
      }
      
      console.log('Session cleanup complete');
      setTimeout(() => setState('ended'), 300);
    };
    
    cleanup();
  }, [state]);
  
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
  
  // Show error if flashlight unavailable
  if (error) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px',
          }}>⚠️</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', margin: '0 0 12px' }}>
            Flashlight Not Available
          </h2>
          <p style={{ fontSize: '14px', color: '#888', margin: '0 0 24px', maxWidth: '400px' }}>
            {error}
          </p>
          <button
            onClick={onExit}
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
            Exit
          </button>
        </div>
      </div>
    );
  }
  
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
      {/* Visual indicator (replaces canvas) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
      }}>
        <div style={{
          textAlign: 'center',
          opacity: showUI || state === 'paused' ? 1 : 0,
          transition: 'opacity 0.3s',
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '16px',
            filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))',
          }}>💡</div>
          <p style={{
            fontSize: '16px',
            color: '#888',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}>
            Flashlight Active
          </p>
        </div>
      </div>
      
      {/* Paused Overlay */}
      {state === 'paused' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '360px', width: '90%' }}>
            {/* Pause icon */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', margin: '0 0 4px' }}>Paused</h2>
            <p style={{ fontSize: '13px', color: '#888', margin: '0 0 16px' }}>Tap to resume • Double-tap to exit</p>
            
            {/* Progress Graph with current position */}
            <ProgressGraph 
              phases={pack.phases} 
              elapsed={elapsed} 
              totalDuration={totalDuration} 
            />
            
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
        <p style={{ fontSize: '10px', color: '#444', margin: '4px 0 0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          Using phone flashlight for flicker stimulation
        </p>
      </div>
    </div>
  );
}

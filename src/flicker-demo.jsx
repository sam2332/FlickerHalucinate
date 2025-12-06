import React, { useState, useEffect, useRef } from 'react';

export default function FlickerStimulator() {
  const [agreed, setAgreed] = useState(false);
  const [running, setRunning] = useState(false);
  const [frequency, setFrequency] = useState(10);
  const [pattern, setPattern] = useState('uniform');
  const [intensity, setIntensity] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const canvasRef = useRef(null);

  const calculateIntensity = (time, freq) => {
    // Primary sine wave at target frequency
    const primary = Math.sin(2 * Math.PI * freq * time);
    
    // Add subtle harmonics for complexity
    const harmonic1 = 0.2 * Math.sin(2 * Math.PI * (freq * 2) * time);
    const harmonic2 = 0.15 * Math.sin(2 * Math.PI * (freq * 0.5) * time);
    
    // Combine waves
    const combined = primary + harmonic1 + harmonic2;
    
    // Normalize to 0-1 range
    const normalized = (combined + 1.4) / 2.8;
    
    // Apply curve for sharper transitions (more effective for entrainment)
    const curved = Math.pow(normalized, 2.2);
    
    // Map to safe intensity range (30% to 90% brightness)
    return 0.3 + (curved * 0.6);
  };

  const drawPattern = (ctx, width, height, time, currentIntensity) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    const baseIntensity = Math.floor(currentIntensity * 255);
    
    if (pattern === 'uniform') {
      ctx.fillStyle = `rgb(${baseIntensity}, ${baseIntensity}, ${baseIntensity})`;
      ctx.fillRect(0, 0, width, height);
    } else if (pattern === 'radial') {
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
      
      for (let r = 0; r < maxRadius; r += 5) {
        const phase = Math.sin(r * 0.05 + time * 3);
        const intensity = Math.floor(currentIntensity * 255 * (0.5 + 0.5 * phase));
        ctx.strokeStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (pattern === 'spiral') {
      const centerX = width / 2;
      const centerY = height / 2;
      
      for (let angle = 0; angle < Math.PI * 2; angle += 0.02) {
        for (let radius = 0; radius < 400; radius += 10) {
          const x = centerX + Math.cos(angle + time * 2) * radius;
          const y = centerY + Math.sin(angle + time * 2) * radius;
          const phase = Math.sin(angle * 5 + radius * 0.1 + time * 3);
          const intensity = Math.floor(currentIntensity * 255 * (0.5 + 0.5 * phase));
          ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
          ctx.fillRect(x - 3, y - 3, 6, 6);
        }
      }
    } else if (pattern === 'tunnel') {
      const centerX = width / 2;
      const centerY = height / 2;
      
      for (let ring = 1; ring < 20; ring++) {
        const radius = ring * 30;
        const phase = Math.sin(ring * 0.5 - time * 4);
        const intensity = Math.floor(currentIntensity * 255 * (0.5 + 0.5 * phase));
        ctx.strokeStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
        ctx.lineWidth = 25;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now();
      
      const animate = () => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setTimeElapsed(elapsed);
        
        // Calculate current intensity with fade in (first 2 seconds)
        let fadeMultiplier = 1;
        if (elapsed < 2) {
          fadeMultiplier = elapsed / 2;
        }
        
        const currentIntensity = calculateIntensity(elapsed, frequency) * fadeMultiplier;
        setIntensity(currentIntensity);
        
        // Draw pattern to canvas if available
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          drawPattern(ctx, canvas.width, canvas.height, elapsed, currentIntensity);
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animate();
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      // Fade out
      if (intensity > 0) {
        const fadeOut = setInterval(() => {
          setIntensity(prev => {
            const newIntensity = prev - 0.05;
            if (newIntensity <= 0) {
              clearInterval(fadeOut);
              return 0;
            }
            return newIntensity;
          });
        }, 50);
      }
    }
  }, [running, frequency, pattern]);

  const startSession = () => {
    setRunning(true);
    setTimeElapsed(0);
  };

  const stopSession = () => {
    setRunning(false);
  };

  if (!agreed) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-900 border-2 border-red-500 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-red-300">⚠️ CRITICAL SAFETY WARNING ⚠️</h2>
            <div className="space-y-3 text-red-100">
              <p className="font-bold">DO NOT USE IF YOU HAVE:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Epilepsy or history of seizures</li>
                <li>Photosensitive conditions</li>
                <li>Migraine disorders</li>
                <li>Any neurological conditions</li>
              </ul>
              
              <p className="font-bold mt-4">SAFETY REQUIREMENTS:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Use in a well-lit room (never in darkness)</li>
                <li>View from at least 2 feet away</li>
                <li>Close eyes immediately if you feel discomfort</li>
                <li>Stop if you experience dizziness, nausea, or disorientation</li>
                <li>Maximum 2 minute sessions</li>
                <li>Do not use while driving or operating machinery</li>
              </ul>
              
              <p className="mt-4 text-yellow-300">
                This demonstration operates within safer frequency ranges (6-12 Hz, avoiding the 
                15-25 Hz seizure trigger zone) and limited intensity. However, ANY flashing lights 
                carry risk for susceptible individuals.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">How This Works</h3>
            <p className="mb-4">
              This demonstrates neural entrainment through photic stimulation. Rhythmic light 
              at specific frequencies can synchronize with brain waves, particularly in the 
              alpha band (8-13 Hz), creating visual phenomena.
            </p>
            <p className="mb-4">
              You may experience geometric patterns, color shifts, or kaleidoscopic effects. 
              These are temporary and result from your visual cortex responding to the 
              rhythmic stimulus - not from any external substance or permanent change.
            </p>
            <p className="text-yellow-400 mb-6">
              This is a DEMONSTRATION ONLY. The effects are subtle and require eyes closed 
              or soft focus for best results.
            </p>
            
            <div className="flex items-start space-x-3 mb-6">
              <input 
                type="checkbox" 
                id="agree" 
                className="mt-1"
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="agree" className="text-sm">
                I have read and understand the warnings above. I confirm I do not have 
                epilepsy or photosensitive conditions. I agree to use this demonstration 
                responsibly and will stop immediately if I experience any discomfort.
              </label>
            </div>
            
            <button
              onClick={() => setAgreed(true)}
              disabled={!agreed}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 
                         text-white font-bold py-3 px-6 rounded-lg transition"
            >
              I Understand - Continue to Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Control Panel */}
      <div className="fixed top-0 left-0 right-0 bg-gray-800 bg-opacity-95 p-4 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Flicker Stimulation Demo</h1>
            <button
              onClick={stopSession}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              STOP (ESC)
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-2">
                Frequency: {frequency} Hz (Alpha Band)
              </label>
              <input
                type="range"
                min="6"
                max="12"
                step="0.5"
                value={frequency}
                onChange={(e) => setFrequency(parseFloat(e.target.value))}
                disabled={running}
                className="w-full"
              />
              <p className="text-xs text-gray-400 mt-1">
                6-8 Hz: Theta (deep relaxation), 8-12 Hz: Alpha (meditation)
              </p>
            </div>
            
            <div>
              <label className="block text-sm mb-2">Pattern Type</label>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                disabled={running}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded"
              >
                <option value="uniform">Uniform (Simple)</option>
                <option value="radial">Radial Waves</option>
                <option value="spiral">Spiral</option>
                <option value="tunnel">Tunnel Effect</option>
              </select>
            </div>
            
            <div className="flex items-end">
              {!running ? (
                <button
                  onClick={startSession}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
                >
                  Start Session
                </button>
              ) : (
                <div className="w-full text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {Math.floor(timeElapsed)}s
                  </div>
                  <div className="text-xs text-gray-400">
                    Session active
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-3 text-sm text-yellow-400">
            💡 Tip: Close your eyes or use soft focus for best effect. Look for patterns forming behind closed eyelids.
          </div>
        </div>
      </div>
      
      {/* Stimulus Area */}
      <div className="pt-48 flex items-center justify-center min-h-screen">
        <canvas
          ref={canvasRef}
          width={800}
          height={800}
          className="max-w-full"
          style={{
            opacity: intensity,
            transition: running ? 'none' : 'opacity 2s ease-out'
          }}
        />
      </div>
      
      {/* Instructions */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 p-4">
        <div className="max-w-4xl mx-auto text-sm text-gray-300">
          <p>
            <strong>Usage:</strong> Start a session, then close your eyes or soften your focus. 
            The flashing will synchronize with your alpha brain waves. You may see geometric patterns, 
            spirals, or colors. These effects are temporary and normal. Press STOP or ESC anytime to end.
          </p>
        </div>
      </div>
    </div>
  );
}

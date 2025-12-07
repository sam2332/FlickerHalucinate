import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 2 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    // Complete after fade animation
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2f 50%, #0a0a0f 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.8s ease-out',
      }}
    >
      {/* Animated pulse circles */}
      <div style={{ position: 'relative', marginBottom: '40px' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '120px',
              height: '120px',
              marginLeft: '-60px',
              marginTop: '-60px',
              borderRadius: '50%',
              border: '2px solid rgba(100, 200, 255, 0.3)',
              animation: `pulse 2s ease-out infinite ${i * 0.3}s`,
            }}
          />
        ))}
        
        {/* Center icon */}
        <div
          style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle, rgba(100, 200, 255, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '64px',
            animation: 'float 3s ease-in-out infinite',
          }}
        >
          ✨
        </div>
      </div>

      {/* App name */}
      <h1
        style={{
          fontSize: '42px',
          fontWeight: '700',
          color: '#fff',
          margin: '0 0 12px',
          letterSpacing: '2px',
          textShadow: '0 0 30px rgba(100, 200, 255, 0.5)',
          animation: 'fadeInUp 1s ease-out',
        }}
      >
        Flicker
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontSize: '16px',
          color: '#888',
          margin: 0,
          letterSpacing: '1px',
          animation: 'fadeInUp 1s ease-out 0.2s backwards',
        }}
      >
        Neural Entrainment
      </p>

      {/* Loading indicator */}
      <div
        style={{
          marginTop: '60px',
          width: '200px',
          height: '3px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
          animation: 'fadeInUp 1s ease-out 0.4s backwards',
        }}
      >
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(100, 200, 255, 0.8), transparent)',
            animation: 'shimmer 1.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* Inline CSS animations */}
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}

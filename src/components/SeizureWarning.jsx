import React, { useState } from 'react';

export default function SeizureWarning({ onAccept }) {
  const [checked, setChecked] = useState(false);
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 50%, #0a0a1a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: 'rgba(20, 20, 30, 0.95)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 50, 50, 0.3)',
        padding: '28px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          margin: '0 auto 16px',
          background: 'rgba(255, 50, 50, 0.15)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 style={{
          fontSize: '26px',
          fontWeight: '700',
          color: '#fff',
          textAlign: 'center',
          marginBottom: '6px',
        }}>Seizure Warning</h1>
        <p style={{
          fontSize: '14px',
          color: '#777',
          textAlign: 'center',
          marginBottom: '20px',
        }}>Please read before continuing</p>
        
        {/* Warning Box */}
        <div style={{
          background: 'rgba(255, 50, 50, 0.08)',
          border: '1px solid rgba(255, 80, 80, 0.25)',
          borderRadius: '14px',
          padding: '16px',
          marginBottom: '16px',
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#ff7070',
            marginBottom: '10px',
          }}>⚠️ DO NOT USE IF YOU HAVE:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {['Epilepsy or seizures', 'Photosensitive conditions', 'Migraine disorders', 'Neurological conditions'].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#ccc',
              }}>
                <span style={{ color: '#ff6b6b' }}>✕</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Info */}
        <div style={{
          background: 'rgba(0, 200, 255, 0.05)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '18px',
          fontSize: '12px',
          color: '#999',
          lineHeight: '1.6',
        }}>
          Uses rhythmic light at <span style={{ color: '#00d4ff' }}>8-13 Hz</span> to 
          create temporary visual phenomena through neural entrainment.
        </div>
        
        {/* Checkbox */}
        <div 
          onClick={() => setChecked(!checked)}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '18px',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '6px',
            border: checked ? 'none' : '2px solid #555',
            background: checked ? 'linear-gradient(135deg, #00d4ff, #0066ff)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}>
            {checked && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span style={{
            fontSize: '12px',
            color: '#aaa',
            lineHeight: '1.5',
          }}>
            I confirm I don't have photosensitive conditions and accept responsibility.
          </span>
        </div>
        
        {/* Button */}
        <button 
          onClick={onAccept}
          disabled={!checked}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: checked ? 'pointer' : 'not-allowed',
            background: checked 
              ? 'linear-gradient(135deg, #00d4ff 0%, #0066ff 100%)' 
              : 'rgba(60, 60, 80, 0.5)',
            color: checked ? '#fff' : '#555',
            transition: 'all 0.3s',
            boxShadow: checked ? '0 8px 25px rgba(0, 150, 255, 0.3)' : 'none',
          }}
        >
          {checked ? 'Continue →' : 'Accept to continue'}
        </button>
      </div>
    </div>
  );
}

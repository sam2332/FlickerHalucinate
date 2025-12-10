import React from 'react';
import { EXPERIENCE_PACKS, getPackDuration } from '../packs';
import { formatDuration } from '../utils/format';
import { getPackStatistics, getRelativeTime, formatTotalTime } from '../services/statisticsService';

const PackCard = ({ pack, onSelect, index }) => {
  const duration = getPackDuration(pack);
  const stats = getPackStatistics(pack.id);
  const gradients = {
    'beginner': 'linear-gradient(135deg, #1a4a3a 0%, #0d2818 100%)',
    'intermediate': 'linear-gradient(135deg, #3a2a5a 0%, #1a1030 100%)',
    'advanced': 'linear-gradient(135deg, #4a2a3a 0%, #2a0a1a 100%)',
  };
  const accents = {
    'beginner': '#4ade80',
    'intermediate': '#a78bfa',
    'advanced': '#f87171',
  };

  const handleClick = () => {
    onSelect(pack);
  };
  
  return (
    <button
      onClick={handleClick}
      style={{
        width: '100%',
        background: gradients[pack.difficulty],
        border: `1px solid ${accents[pack.difficulty]}33`,
        borderRadius: '16px',
        padding: '18px 20px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        marginBottom: '12px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '150px',
        height: '150px',
        background: `radial-gradient(circle, ${accents[pack.difficulty]}15 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
        {/* Icon */}
        <div style={{
          width: '52px',
          height: '52px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '26px',
          flexShrink: 0,
        }}>
          {pack.icon}
        </div>
        
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '4px',
          }}>
            <h3 style={{
              fontSize: '17px',
              fontWeight: '600',
              color: '#fff',
              margin: 0,
            }}>{pack.name}</h3>
            <span style={{
              fontSize: '14px',
              color: '#888',
              fontWeight: '500',
            }}>{formatDuration(duration)}</span>
          </div>
          
          <p style={{
            fontSize: '13px',
            color: '#888',
            margin: '0 0 8px 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{pack.description}</p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              color: accents[pack.difficulty],
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>{pack.difficulty}</span>
            <span style={{
              fontSize: '11px',
              color: '#666',
            }}>{pack.phases.length} phases</span>
            {stats.totalSessions > 0 && (
              <>
                <span style={{ fontSize: '11px', color: '#555' }}>•</span>
                <span style={{
                  fontSize: '11px',
                  color: '#888',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  {stats.totalSessions}× played
                </span>
              </>
            )}
          </div>
          {/* User stats row */}
          {stats.totalSessions > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '6px',
              fontSize: '11px',
              color: '#555',
            }}>
              {stats.averageRating > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ color: '#fbbf24' }}>★</span>
                  {stats.averageRating.toFixed(1)}
                </span>
              )}
              <span>{formatTotalTime(stats.totalTime)} total</span>
              <span>•</span>
              <span>{getRelativeTime(stats.lastPlayed)}</span>
              {stats.favorite && (
                <span style={{ color: '#f87171' }}>❤️</span>
              )}
            </div>
          )}
        </div>
        
        {/* Play icon */}
        <div style={{
          width: '40px',
          height: '40px',
          background: `${accents[pack.difficulty]}20`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={accents[pack.difficulty]}>
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      
      {/* Phase progress bar */}
      <div style={{
        display: 'flex',
        gap: '3px',
        marginTop: '12px',
      }}>
        {pack.phases.map((phase, i) => (
          <div
            key={i}
            style={{
              height: '3px',
              borderRadius: '2px',
              background: `${accents[pack.difficulty]}40`,
              flex: phase.duration,
            }}
          />
        ))}
      </div>
    </button>
  );
};

export default function PackSelection({ onSelectPack, onOpenSettings }) {
  return (
    <div style={{
      minHeight: '100vh',
      height: '100vh',
      overflow: 'auto',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      WebkitOverflowScrolling: 'touch',
    }}>
      {/* Header */}
      <div style={{
        padding: '40px 20px 20px',
        background: 'linear-gradient(180deg, rgba(20,20,30,0.9) 0%, transparent 100%)',
        position: 'relative',
      }}>
        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '40px',
            height: '40px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px',
          }}
          aria-label="Settings"
        >
          ⚙️
        </button>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#fff',
            margin: '0 0 6px 0',
          }}>Experiences</h1>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: 0,
          }}>Choose your visual journey</p>
        </div>
      </div>
      
      {/* Pack List */}
      <div style={{
        padding: '0 20px 20px',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        {EXPERIENCE_PACKS.map((pack, i) => (
          <PackCard key={pack.id} pack={pack} onSelect={onSelectPack} index={i} />
        ))}
      </div>
      
      {/* Tips */}
      <div style={{
        padding: '0 20px 20px',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        <div style={{
          background: 'rgba(0, 200, 255, 0.05)',
          border: '1px solid rgba(0, 200, 255, 0.15)',
          borderRadius: '14px',
          padding: '16px',
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#00d4ff',
            marginBottom: '10px',
          }}>💡 Tips</div>
          <div style={{
            fontSize: '12px',
            color: '#888',
            lineHeight: '1.8',
          }}>
            • Close your eyes or use soft focus<br/>
            • Position 2-3 feet away<br/>
            • <span style={{ color: '#fff' }}>Tap</span> to pause • <span style={{ color: '#fff' }}>Double-tap</span> to exit<br/>
            • Use <span style={{ color: '#fff' }}>🔖 Remember</span> to bookmark special moments
          </div>
        </div>
      </div>
    </div>
  );
}

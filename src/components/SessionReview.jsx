import React, { useState, useEffect } from 'react';
import { formatDuration } from '../utils/format';
import { saveReview, createReview } from '../services';

export default function SessionReview({ sessionData, pack, onComplete }) {
  const [rating, setRating] = useState(0);
  const [intensity, setIntensity] = useState(0);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Auto-save review data to localStorage
    if (rating > 0) {
      const reviews = JSON.parse(localStorage.getItem('flickerReviews') || '[]');
      const newReview = {
        id: Date.now(),
        packId: pack.id,
        packName: pack.name,
        rating,
        intensity,
        notes,
        duration: sessionData?.duration || 0,
        timestamp: new Date().toISOString(),
        bookmarked: sessionData?.bookmarked || false,
        bookmarkTime: sessionData?.bookmarkTime || null,
      };
      
      reviews.unshift(newReview);
      // Keep only last 50 reviews
      if (reviews.length > 50) reviews.splice(50);
      
      localStorage.setItem('flickerReviews', JSON.stringify(reviews));
      setSaved(true);
    }
  }, [rating, intensity, notes, pack, sessionData]);

  const handleContinue = () => {
    onComplete('home');
  };

  const handleReplay = () => {
    onComplete('replay');
  };

  const stars = [1, 2, 3, 4, 5];
  const intensityLevels = ['Subtle', 'Mild', 'Moderate', 'Strong', 'Intense'];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
          }}>✨</div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#fff',
            margin: '0 0 8px',
          }}>Session Complete</h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            margin: 0,
          }}>{pack.name} • {formatDuration(sessionData?.duration || 0)}</p>
        </div>

        {/* Rating Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2a 0%, #12121f 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '28px',
          marginBottom: '16px',
        }}>
          {/* Overall Rating */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#aaa',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>How was your experience?</label>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
            }}>
              {stars.map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '36px',
                    padding: '4px',
                    transition: 'transform 0.2s',
                    transform: rating >= star ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {rating >= star ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Rating */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#aaa',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>Visual Intensity</label>
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}>
              {intensityLevels.map((level, idx) => (
                <button
                  key={idx}
                  onClick={() => setIntensity(idx + 1)}
                  style={{
                    flex: '1',
                    minWidth: '80px',
                    padding: '10px 12px',
                    background: intensity === idx + 1 
                      ? 'rgba(100, 200, 255, 0.2)' 
                      : 'rgba(255,255,255,0.05)',
                    border: intensity === idx + 1 
                      ? '1px solid rgba(100, 200, 255, 0.5)' 
                      : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: intensity === idx + 1 ? '#64c8ff' : '#888',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#aaa',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you experience?"
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px 16px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Saved indicator */}
          {saved && rating > 0 && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(100, 255, 100, 0.1)',
              border: '1px solid rgba(100, 255, 100, 0.3)',
              borderRadius: '10px',
              color: '#64ff64',
              fontSize: '13px',
              textAlign: 'center',
            }}>
              ✓ Review saved
            </div>
          )}
        </div>

        {/* Bookmark info */}
        {sessionData?.bookmarked && (
          <div style={{
            background: 'rgba(255, 200, 100, 0.1)',
            border: '1px solid rgba(255, 200, 100, 0.3)',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{ fontSize: '24px' }}>🔖</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#ffb864',
                marginBottom: '4px',
              }}>Bookmarked Moment</div>
              <div style={{
                fontSize: '12px',
                color: '#999',
              }}>
                {formatDuration(sessionData.bookmarkTime)} - Saved for replay
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <button
            onClick={handleReplay}
            style={{
              flex: 1,
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(100, 200, 255, 0.15) 0%, rgba(100, 200, 255, 0.05) 100%)',
              border: '1px solid rgba(100, 200, 255, 0.3)',
              borderRadius: '14px',
              color: '#64c8ff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🔄 Replay
          </button>
          <button
            onClick={handleContinue}
            style={{
              flex: 1,
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '14px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Done
          </button>
        </div>

        {/* History link */}
        <button
          onClick={handleContinue}
          style={{
            width: '100%',
            padding: '12px',
            background: 'none',
            border: 'none',
            color: '#666',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          View Review History →
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getSettings, 
  saveSettings, 
  resetSettings, 
  getDefaultSettings 
} from '../services/settingsStorage';
import { getGlobalStatistics, formatTotalTime } from '../services/statisticsService';
import { clearReviews } from '../services/reviewStorage';

const SettingToggle = ({ label, description, value, onChange }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  }}>
    <div style={{ flex: 1, paddingRight: '12px' }}>
      <div style={{
        fontSize: '15px',
        fontWeight: '500',
        color: '#fff',
        marginBottom: '2px',
      }}>{label}</div>
      {description && (
        <div style={{
          fontSize: '12px',
          color: '#666',
        }}>{description}</div>
      )}
    </div>
    <button
      onClick={() => onChange(!value)}
      style={{
        width: '52px',
        height: '30px',
        borderRadius: '15px',
        border: 'none',
        background: value ? '#4ade80' : 'rgba(255,255,255,0.1)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s',
      }}
    >
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute',
        top: '3px',
        left: value ? '25px' : '3px',
        transition: 'left 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  </div>
);

const SettingSlider = ({ label, description, value, onChange, min, max, step, format }) => (
  <div style={{
    padding: '14px 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '10px',
    }}>
      <div>
        <div style={{
          fontSize: '15px',
          fontWeight: '500',
          color: '#fff',
          marginBottom: '2px',
        }}>{label}</div>
        {description && (
          <div style={{
            fontSize: '12px',
            color: '#666',
          }}>{description}</div>
        )}
      </div>
      <div style={{
        fontSize: '14px',
        fontWeight: '600',
        color: '#4ade80',
        minWidth: '50px',
        textAlign: 'right',
      }}>{format ? format(value) : value}</div>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{
        width: '100%',
        height: '4px',
        borderRadius: '2px',
        background: `linear-gradient(to right, #4ade80 0%, #4ade80 ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
        appearance: 'none',
        cursor: 'pointer',
      }}
    />
  </div>
);

const StatCard = ({ icon, label, value }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '14px',
    textAlign: 'center',
  }}>
    <div style={{ fontSize: '24px', marginBottom: '6px' }}>{icon}</div>
    <div style={{
      fontSize: '18px',
      fontWeight: '700',
      color: '#fff',
      marginBottom: '2px',
    }}>{value}</div>
    <div style={{
      fontSize: '11px',
      color: '#666',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>{label}</div>
  </div>
);

export default function Settings({ onBack }) {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(getSettings());
  const [stats, setStats] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/packs');
    }
  };

  useEffect(() => {
    setStats(getGlobalStatistics());
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleResetSettings = () => {
    resetSettings();
    setSettings(getDefaultSettings());
    setShowResetConfirm(false);
  };

  const handleClearData = () => {
    clearReviews();
    setStats(getGlobalStatistics());
    setShowClearDataConfirm(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <button
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          ←
        </button>
        <h1 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#fff',
          margin: 0,
        }}>Settings</h1>
      </div>

      <div style={{
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        {/* Statistics Section */}
        {stats && stats.totalSessions > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
            }}>Your Statistics</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
            }}>
              <StatCard icon="🧘" label="Sessions" value={stats.totalSessions} />
              <StatCard icon="⏱️" label="Total Time" value={formatTotalTime(stats.totalTime)} />
              <StatCard icon="⭐" label="Avg Rating" value={stats.averageRating || '—'} />
            </div>
            {stats.streakDays > 0 && (
              <div style={{
                marginTop: '10px',
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(255,180,100,0.1) 0%, rgba(255,100,100,0.05) 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <span style={{ fontSize: '20px' }}>🔥</span>
                <span style={{ fontSize: '14px', color: '#ffb864' }}>
                  {stats.streakDays} day streak!
                </span>
              </div>
            )}
          </div>
        )}

        {/* Session Settings */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px',
          }}>Session</h2>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '14px',
            padding: '0 16px',
          }}>
            <SettingToggle
              label="Show UI Hints"
              description="Display control hints during session"
              value={settings.showUIHints}
              onChange={(v) => updateSetting('showUIHints', v)}
            />
            <SettingSlider
              label="UI Auto-Hide Delay"
              description="Time before session UI fades out"
              value={settings.uiHideDelay}
              onChange={(v) => updateSetting('uiHideDelay', v)}
              min={1000}
              max={10000}
              step={500}
              format={(v) => `${v / 1000}s`}
            />
            <SettingToggle
              label="Show Frequency"
              description="Display current Hz during session"
              value={settings.showFrequencyDuringSession}
              onChange={(v) => updateSetting('showFrequencyDuringSession', v)}
            />
            <SettingToggle
              label="Show Phase Progress"
              description="Display phase indicator dots"
              value={settings.showPhaseProgress}
              onChange={(v) => updateSetting('showPhaseProgress', v)}
            />
            <SettingToggle
              label="Confirm Exit"
              description="Ask for confirmation before ending session"
              value={settings.confirmExit}
              onChange={(v) => updateSetting('confirmExit', v)}
            />
          </div>
        </div>

        {/* Feedback Settings */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px',
          }}>Feedback</h2>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '14px',
            padding: '0 16px',
          }}>
            <SettingToggle
              label="Haptic Feedback"
              description="Vibrate on pause, resume, and session end"
              value={settings.hapticFeedback}
              onChange={(v) => updateSetting('hapticFeedback', v)}
            />
            <SettingToggle
              label="Phase Change Haptic"
              description="Vibrate when transitioning between phases"
              value={settings.hapticOnPhaseChange}
              onChange={(v) => updateSetting('hapticOnPhaseChange', v)}
            />
          </div>
        </div>

        {/* Safety Settings */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px',
          }}>Safety</h2>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '14px',
            padding: '0 16px',
          }}>
            <SettingToggle
              label="Brightness Warning"
              description="Remind to adjust screen brightness"
              value={settings.brightnessWarning}
              onChange={(v) => updateSetting('brightnessWarning', v)}
            />
            <SettingToggle
              label="Track Statistics"
              description="Save session history and stats"
              value={settings.trackStatistics}
              onChange={(v) => updateSetting('trackStatistics', v)}
            />
          </div>
        </div>

        {/* Data Management */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px',
          }}>Data</h2>
          <div style={{
            display: 'flex',
            gap: '10px',
          }}>
            <button
              onClick={() => setShowResetConfirm(true)}
              style={{
                flex: 1,
                padding: '14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#888',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Reset Settings
            </button>
            <button
              onClick={() => setShowClearDataConfirm(true)}
              style={{
                flex: 1,
                padding: '14px',
                background: 'rgba(255,100,100,0.1)',
                border: '1px solid rgba(255,100,100,0.2)',
                borderRadius: '12px',
                color: '#ff7070',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Clear History
            </button>
          </div>
        </div>

        {/* App Info */}
        <div style={{
          textAlign: 'center',
          padding: '20px 0',
          color: '#444',
          fontSize: '12px',
        }}>
          <div style={{ marginBottom: '4px' }}>Flicker v1.0.0</div>
          <div>Neural Entrainment Experience</div>
        </div>
      </div>

      {/* Reset Settings Confirmation Modal */}
      {showResetConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2a 0%, #12121f 100%)',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '340px',
            width: '100%',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#fff',
              margin: '0 0 8px',
            }}>Reset Settings?</h3>
            <p style={{
              fontSize: '14px',
              color: '#888',
              margin: '0 0 20px',
            }}>This will restore all settings to their default values.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleResetSettings}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#4ade80',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#000',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Confirmation Modal */}
      {showClearDataConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2a 0%, #12121f 100%)',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '340px',
            width: '100%',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#fff',
              margin: '0 0 8px',
            }}>Clear Session History?</h3>
            <p style={{
              fontSize: '14px',
              color: '#888',
              margin: '0 0 20px',
            }}>This will permanently delete all your session reviews and statistics. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowClearDataConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ff7070',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

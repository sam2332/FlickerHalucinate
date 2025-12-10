import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import SeizureWarning from './components/SeizureWarning';
import PackSelection from './components/PackSelection';
import PackPreview from './components/PackPreview';
import SessionPlayer from './components/SessionPlayer';
import Settings from './components/Settings';
import { isWarningAccepted } from './services';
import { usePack } from './context';

/**
 * Route guard that checks warning acceptance
 * Redirects to warning if not accepted
 */
function RequireWarning({ children }) {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isWarningAccepted()) {
      navigate('/warning', { replace: true });
    }
  }, [navigate]);

  return isWarningAccepted() ? children : null;
}

/**
 * Route guard that requires a selected pack
 * Redirects to packs if no pack selected
 */
function RequirePack({ children }) {
  const { selectedPack } = usePack();
  
  if (!selectedPack) {
    return <Navigate to="/packs" replace />;
  }
  
  return children;
}

/**
 * Main App with React Router navigation
 * Routes:
 *   /           - Splash screen (redirects to /warning or /packs)
 *   /warning    - Seizure warning (must accept to continue)
 *   /packs      - Pack selection (main screen)
 *   /preview    - Pack preview (requires selected pack)
 *   /session    - Active session (requires selected pack)
 *   /settings   - User settings
 */
export default function App() {
  return (
    <Routes>
      {/* Splash - entry point */}
      <Route path="/" element={<SplashRoute />} />
      
      {/* Warning - must accept before accessing app */}
      <Route path="/warning" element={<WarningRoute />} />
      
      {/* Main screens - require warning acceptance */}
      <Route path="/packs" element={
        <RequireWarning>
          <PackSelectionRoute />
        </RequireWarning>
      } />
      
      <Route path="/preview" element={
        <RequireWarning>
          <RequirePack>
            <PackPreviewRoute />
          </RequirePack>
        </RequireWarning>
      } />
      
      <Route path="/session" element={
        <RequireWarning>
          <RequirePack>
            <SessionRoute />
          </RequirePack>
        </RequireWarning>
      } />
      
      <Route path="/settings" element={
        <RequireWarning>
          <SettingsRoute />
        </RequireWarning>
      } />
      
      {/* Fallback - redirect to splash */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ============================================
// Route Components (wire up navigation)
// ============================================

function SplashRoute() {
  const navigate = useNavigate();
  
  const handleComplete = () => {
    if (isWarningAccepted()) {
      navigate('/packs', { replace: true });
    } else {
      navigate('/warning', { replace: true });
    }
  };
  
  return <SplashScreen onComplete={handleComplete} />;
}

function WarningRoute() {
  const navigate = useNavigate();
  
  // If already accepted, redirect to packs
  useEffect(() => {
    if (isWarningAccepted()) {
      navigate('/packs', { replace: true });
    }
  }, [navigate]);
  
  const handleAccept = () => {
    navigate('/packs', { replace: true });
  };
  
  return <SeizureWarning onAccept={handleAccept} />;
}

function PackSelectionRoute() {
  const navigate = useNavigate();
  const { selectPack } = usePack();
  
  const handleSelectPack = (pack) => {
    selectPack(pack);
    navigate('/preview');
  };
  
  const handleOpenSettings = () => {
    navigate('/settings');
  };
  
  return (
    <PackSelection 
      onSelectPack={handleSelectPack} 
      onOpenSettings={handleOpenSettings}
    />
  );
}

function PackPreviewRoute() {
  const navigate = useNavigate();
  const { selectedPack, clearPack } = usePack();
  
  const handleAccept = () => {
    navigate('/session');
  };
  
  const handleBack = () => {
    clearPack();
    navigate('/packs');
  };
  
  return (
    <PackPreview
      pack={selectedPack}
      onAccept={handleAccept}
      onBack={handleBack}
    />
  );
}

function SessionRoute() {
  const navigate = useNavigate();
  const { selectedPack, clearPack, saveSessionData } = usePack();
  
  const handleExit = () => {
    clearPack();
    navigate('/packs', { replace: true });
  };
  
  const handleComplete = (data) => {
    saveSessionData(data);
    clearPack();
    navigate('/packs', { replace: true });
  };
  
  return (
    <SessionPlayer
      pack={selectedPack}
      onExit={handleExit}
      onComplete={handleComplete}
    />
  );
}

function SettingsRoute() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/packs');
  };
  
  return <Settings onBack={handleBack} />;
}

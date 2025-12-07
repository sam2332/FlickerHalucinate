import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import SeizureWarning from './components/SeizureWarning';
import PackSelection from './components/PackSelection';
import PackPreview from './components/PackPreview';
import SessionPlayer from './components/SessionPlayer';
import SessionReview from './components/SessionReview';

const SCREENS = {
  SPLASH: 'splash',
  WARNING: 'warning',
  PACKS: 'packs',
  PREVIEW: 'preview',
  SESSION: 'session',
  REVIEW: 'review'
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.SPLASH);
  const [selectedPack, setSelectedPack] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    if (screen === SCREENS.WARNING && sessionStorage.getItem('seizureWarningAccepted') === 'true') {
      setScreen(SCREENS.PACKS);
    }
  }, [screen]);

  const handleSplashComplete = () => setScreen(SCREENS.WARNING);
  
  const handleAcceptWarning = () => {
    sessionStorage.setItem('seizureWarningAccepted', 'true');
    setScreen(SCREENS.PACKS);
  };
  
  const handleSelectPack = (pack) => {
    setSelectedPack(pack);
    setScreen(SCREENS.PREVIEW);
  };

  const handleAcceptPreview = () => {
    setScreen(SCREENS.SESSION);
  };

  const handleBackFromPreview = () => {
    setSelectedPack(null);
    setScreen(SCREENS.PACKS);
  };
  
  const handleSessionComplete = (data) => {
    setSessionData(data);
    setScreen(SCREENS.REVIEW);
  };
  
  const handleReviewComplete = (action) => {
    if (action === 'replay' && selectedPack) {
      setScreen(SCREENS.SESSION);
    } else {
      setSelectedPack(null);
      setSessionData(null);
      setScreen(SCREENS.PACKS);
    }
  };
  
  const handleExitSession = () => {
    setSelectedPack(null);
    setScreen(SCREENS.PACKS);
  };

  switch (screen) {
    case SCREENS.SPLASH:
      return <SplashScreen onComplete={handleSplashComplete} />;
    case SCREENS.WARNING:
      return <SeizureWarning onAccept={handleAcceptWarning} />;
    case SCREENS.PACKS:
      return <PackSelection onSelectPack={handleSelectPack} />;
    case SCREENS.PREVIEW:
      return selectedPack ? (
        <PackPreview
          pack={selectedPack}
          onAccept={handleAcceptPreview}
          onBack={handleBackFromPreview}
        />
      ) : null;
    case SCREENS.SESSION:
      if (!selectedPack) {
        setScreen(SCREENS.PACKS);
        return null;
      }
      return <SessionPlayer pack={selectedPack} onExit={handleExitSession} onComplete={handleSessionComplete} />;
    case SCREENS.REVIEW:
      return <SessionReview sessionData={sessionData} pack={selectedPack} onComplete={handleReviewComplete} />;
    default:
      return <SplashScreen onComplete={handleSplashComplete} />;
  }
}

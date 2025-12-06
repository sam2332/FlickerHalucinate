import React, { useState, useEffect } from 'react';
import SeizureWarning from './components/SeizureWarning';
import PackSelection from './components/PackSelection';
import SessionPlayer from './components/SessionPlayer';

const SCREENS = {
  WARNING: 'warning',
  PACKS: 'packs',
  SESSION: 'session'
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.WARNING);
  const [selectedPack, setSelectedPack] = useState(null);
  
  // Check for previous acceptance
  useEffect(() => {
    if (sessionStorage.getItem('seizureWarningAccepted') === 'true') {
      setScreen(SCREENS.PACKS);
    }
  }, []);
  
  const handleAcceptWarning = () => {
    sessionStorage.setItem('seizureWarningAccepted', 'true');
    setScreen(SCREENS.PACKS);
  };
  
  const handleSelectPack = (pack) => {
    setSelectedPack(pack);
    setScreen(SCREENS.SESSION);
  };
  
  const handleExitSession = () => {
    setSelectedPack(null);
    setScreen(SCREENS.PACKS);
  };
  
  switch (screen) {
    case SCREENS.WARNING:
      return <SeizureWarning onAccept={handleAcceptWarning} />;
    case SCREENS.PACKS:
      return <PackSelection onSelectPack={handleSelectPack} />;
    case SCREENS.SESSION:
      if (!selectedPack) {
        setScreen(SCREENS.PACKS);
        return null;
      }
      return <SessionPlayer pack={selectedPack} onExit={handleExitSession} />;
    default:
      return <SeizureWarning onAccept={handleAcceptWarning} />;
  }
}

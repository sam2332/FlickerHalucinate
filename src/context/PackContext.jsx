import React, { createContext, useContext, useState } from 'react';

/**
 * Context for sharing selected pack data across routes
 * Avoids prop drilling and works well with react-router
 */
const PackContext = createContext(null);

export function PackProvider({ children }) {
  const [selectedPack, setSelectedPack] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  const selectPack = (pack) => {
    setSelectedPack(pack);
  };

  const clearPack = () => {
    setSelectedPack(null);
    setSessionData(null);
  };

  const saveSessionData = (data) => {
    setSessionData(data);
  };

  return (
    <PackContext.Provider value={{
      selectedPack,
      sessionData,
      selectPack,
      clearPack,
      saveSessionData,
    }}>
      {children}
    </PackContext.Provider>
  );
}

export function usePack() {
  const context = useContext(PackContext);
  if (!context) {
    throw new Error('usePack must be used within a PackProvider');
  }
  return context;
}

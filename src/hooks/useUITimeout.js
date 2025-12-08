import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing UI visibility with auto-hide timeout
 * Useful for session player controls that fade out during playback
 * 
 * @param {number} timeout - Timeout in milliseconds (default 3000)
 * @returns {object} UI state and control functions
 */
export function useUITimeout(timeout = 3000) {
  const [showUI, setShowUI] = useState(true);
  const [timeoutId, setTimeoutId] = useState(null);

  /**
   * Show UI and reset timeout
   */
  const show = useCallback(() => {
    setShowUI(true);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const id = setTimeout(() => setShowUI(false), timeout);
    setTimeoutId(id);
  }, [timeout, timeoutId]);

  /**
   * Hide UI immediately
   */
  const hide = useCallback(() => {
    setShowUI(false);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  /**
   * Toggle UI visibility
   */
  const toggle = useCallback(() => {
    if (showUI) {
      hide();
    } else {
      show();
    }
  }, [showUI, show, hide]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  // Initial timeout
  useEffect(() => {
    const id = setTimeout(() => setShowUI(false), timeout);
    setTimeoutId(id);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    showUI,
    show,
    hide,
    toggle,
  };
}

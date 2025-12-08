import { useRef, useCallback } from 'react';

/**
 * Custom hook for managing session timer state
 * Handles play/pause, elapsed time tracking, and bookmark functionality
 * 
 * @returns {object} Timer state and control functions
 */
export function useSessionTimer() {
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);
  const lastTapRef = useRef(0);

  /**
   * Get current elapsed time in seconds
   * @returns {number} Elapsed seconds
   */
  const getElapsed = useCallback(() => {
    if (!startTimeRef.current) return 0;
    return (Date.now() - startTimeRef.current) / 1000;
  }, []);

  /**
   * Start or resume the timer
   */
  const start = useCallback(() => {
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now() - (pausedTimeRef.current * 1000);
    }
  }, []);

  /**
   * Pause the timer
   */
  const pause = useCallback(() => {
    if (startTimeRef.current) {
      pausedTimeRef.current = getElapsed();
      startTimeRef.current = null;
    }
  }, [getElapsed]);

  /**
   * Resume the timer from paused state
   */
  const resume = useCallback(() => {
    startTimeRef.current = Date.now() - (pausedTimeRef.current * 1000);
  }, []);

  /**
   * Reset timer to zero
   */
  const reset = useCallback(() => {
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  }, []);

  /**
   * Toggle between paused and running
   * @returns {boolean} New running state
   */
  const toggle = useCallback(() => {
    if (startTimeRef.current) {
      pause();
      return false;
    } else {
      resume();
      return true;
    }
  }, [pause, resume]);

  /**
   * Check if timer is running
   * @returns {boolean} True if running
   */
  const isRunning = useCallback(() => {
    return startTimeRef.current !== null;
  }, []);

  /**
   * Handle double-tap detection for pause/resume
   * @param {Function} onDoubleTap - Callback for double tap
   * @param {number} tapThreshold - Max milliseconds between taps (default 300)
   * @returns {Function} Tap handler function
   */
  const createTapHandler = useCallback((onDoubleTap, tapThreshold = 300) => {
    return (e) => {
      e.preventDefault();
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;
      
      if (timeSinceLastTap < tapThreshold) {
        onDoubleTap();
      }
      
      lastTapRef.current = now;
    };
  }, []);

  return {
    getElapsed,
    start,
    pause,
    resume,
    reset,
    toggle,
    isRunning,
    createTapHandler,
    refs: {
      startTimeRef,
      pausedTimeRef,
      lastTapRef,
    },
  };
}

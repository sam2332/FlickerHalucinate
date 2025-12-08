import { useCallback } from 'react';
import { easeInOutCubic } from '../utils/easing.js';

/**
 * Custom hook for phase calculation and interpolation
 * Handles phase transitions, frequency interpolation, and progress tracking
 * 
 * @param {object} pack - Experience pack with phases
 * @returns {object} Phase calculation functions
 */
export function usePhaseCalculation(pack) {
  /**
   * Get current phase info based on elapsed time
   * @param {number} elapsed - Total elapsed time in seconds
   * @returns {object|null} Phase info or null if complete
   */
  const getCurrentPhase = useCallback((elapsed) => {
    let accumulated = 0;
    
    for (let i = 0; i < pack.phases.length; i++) {
      const phase = pack.phases[i];
      const phaseEnd = accumulated + phase.duration;
      
      if (elapsed < phaseEnd) {
        const phaseElapsed = elapsed - accumulated;
        const phaseProgress = phaseElapsed / phase.duration;
        
        return {
          phase,
          phaseIndex: i,
          phaseElapsed,
          phaseProgress,
          totalPhases: pack.phases.length,
        };
      }
      
      accumulated = phaseEnd;
    }
    
    // Session complete - return last phase
    const lastPhase = pack.phases[pack.phases.length - 1];
    return {
      phase: lastPhase,
      phaseIndex: pack.phases.length - 1,
      phaseElapsed: lastPhase.duration,
      phaseProgress: 1,
      totalPhases: pack.phases.length,
    };
  }, [pack.phases]);

  /**
   * Get interpolated frequency with smooth transitions
   * Applies ramp-in/ramp-out and jitter
   * 
   * @param {object} phaseInfo - Current phase information
   * @returns {number} Interpolated frequency in Hz
   */
  const getInterpolatedFrequency = useCallback((phaseInfo) => {
    const { phase, phaseIndex, phaseElapsed } = phaseInfo;
    const nextPhase = pack.phases[phaseIndex + 1];
    
    let frequency = phase.frequency;
    
    // Ramp in: smooth transition from previous phase frequency
    if (phaseElapsed < phase.rampIn && phaseIndex > 0) {
      const prevPhase = pack.phases[phaseIndex - 1];
      const rampProgress = phaseElapsed / phase.rampIn;
      frequency = prevPhase.frequency + (phase.frequency - prevPhase.frequency) * easeInOutCubic(rampProgress);
    }
    
    // Ramp out: smooth transition to next phase frequency
    const rampOutStart = phase.duration - phase.rampOut;
    if (nextPhase && phaseElapsed > rampOutStart) {
      const rampProgress = (phaseElapsed - rampOutStart) / phase.rampOut;
      frequency = phase.frequency + (nextPhase.frequency - phase.frequency) * easeInOutCubic(rampProgress);
    }
    
    // Apply jitter (random frequency variation)
    if (phase.jitter > 0) {
      frequency += (Math.random() - 0.5) * phase.jitter;
    }
    
    return frequency;
  }, [pack.phases]);

  /**
   * Get total pack duration
   * @returns {number} Total duration in seconds
   */
  const getPackDuration = useCallback(() => {
    return pack.phases.reduce((total, phase) => total + phase.duration, 0);
  }, [pack.phases]);

  /**
   * Get progress percentage (0-1)
   * @param {number} elapsed - Elapsed time in seconds
   * @returns {number} Progress 0-1
   */
  const getProgress = useCallback((elapsed) => {
    const total = getPackDuration();
    return Math.min(1, elapsed / total);
  }, [getPackDuration]);

  return {
    getCurrentPhase,
    getInterpolatedFrequency,
    getPackDuration,
    getProgress,
  };
}

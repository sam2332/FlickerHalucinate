/**
 * Flashlight control service for Capacitor
 * Wraps custom FlashlightPlugin with strobe engine, queue management, 
 * pause/resume/stop functionality
 */

import { registerPlugin } from '@capacitor/core';

// Register the custom FlashlightPlugin (implemented in Android native code)
const FlashlightPlugin = registerPlugin('FlashlightPlugin');

/**
 * Effect types for strobe queue
 */
export const EffectType = {
  ON: 'ON',           // Turn on for duration
  OFF: 'OFF',         // Turn off for duration  
  STROBE: 'STROBE',   // Strobe at frequency for duration
  PULSE: 'PULSE'      // Single pulse (on then off)
};

/**
 * Engine states
 */
export const EngineState = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  STOPPED: 'STOPPED'
};

class FlashlightService {
  constructor() {
    this.isOn = false;
    this.isAvailable = false;
    this.initialized = false;
    this.state = EngineState.IDLE;
    this.plugin = FlashlightPlugin;
    this.eventListeners = {
      effectStarted: [],
      effectCompleted: [],
      queueEmpty: [],
      error: [],
      stateChanged: []
    };
  }

  /**
   * Initialize flashlight service and check availability
   * @returns {Promise<boolean>} True if flashlight is available
   */
  async initialize() {
    if (this.initialized) return this.isAvailable;

    try {
      // Check if flashlight is available on device
      const result = await this.plugin.isAvailable();
      this.isAvailable = result.value || false;
      this.initialized = true;
      
      // Set up event listeners from native plugin
      this._setupNativeListeners();
      
      console.log('Flashlight available:', this.isAvailable);
      return this.isAvailable;
    } catch (error) {
      console.error('Flashlight initialization failed:', error);
      this.isAvailable = false;
      this.initialized = true;
      return false;
    }
  }

  /**
   * Set up listeners for native plugin events
   */
  _setupNativeListeners() {
    try {
      this.plugin.addListener('effectStarted', (data) => {
        this._emit('effectStarted', data);
      });
      
      this.plugin.addListener('effectCompleted', (data) => {
        this._emit('effectCompleted', data);
      });
      
      this.plugin.addListener('queueEmpty', () => {
        this._emit('queueEmpty');
      });
      
      this.plugin.addListener('error', (data) => {
        console.error('Flashlight error:', data.message);
        this._emit('error', data);
      });
      
      this.plugin.addListener('stateChanged', (data) => {
        this.state = data.state;
        this._emit('stateChanged', data);
      });
    } catch (error) {
      console.warn('Failed to setup native listeners:', error);
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback);
    }
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Emit event to listeners
   */
  _emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(cb => cb(data));
    }
  }

  /**
   * Get current engine state
   * @returns {Promise<{state: string, queueSize: number}>}
   */
  async getEngineState() {
    try {
      return await this.plugin.getState();
    } catch (error) {
      console.error('Failed to get state:', error);
      return { state: EngineState.IDLE, queueSize: 0 };
    }
  }

  /**
   * Turn flashlight on immediately (bypasses queue)
   * @returns {Promise<boolean>} True if successful
   */
  async turnOn() {
    if (!this.isAvailable) return false;

    try {
      await this.plugin.switchOn();
      this.isOn = true;
      return true;
    } catch (error) {
      console.error('Failed to turn on flashlight:', error);
      return false;
    }
  }

  /**
   * Turn flashlight off immediately (bypasses queue)
   * @returns {Promise<boolean>} True if successful
   */
  async turnOff() {
    if (!this.isAvailable) return false;

    try {
      await this.plugin.switchOff();
      this.isOn = false;
      return true;
    } catch (error) {
      console.error('Failed to turn off flashlight:', error);
      return false;
    }
  }

  /**
   * Force flashlight off with multiple retry attempts
   * Use when normal turnOff doesn't work
   * @returns {Promise<boolean>} True if successful
   */
  async forceOff() {
    try {
      await this.plugin.forceOff();
      this.isOn = false;
      return true;
    } catch (error) {
      console.error('Failed to force off flashlight:', error);
      // Fallback to normal off
      return await this.turnOff();
    }
  }

  /**
   * Set flashlight based on intensity threshold (real-time control)
   * Uses intensity value to determine on/off state
   * @param {number} intensity - Intensity value 0-1
   * @param {number} threshold - Threshold for on/off (default 0.5)
   * @returns {Promise<void>}
   */
  async setIntensity(intensity, threshold = 0.5) {
    if (!this.isAvailable) return;

    try {
      await this.plugin.setIntensity({ intensity, threshold });
      this.isOn = intensity >= threshold;
    } catch (error) {
      // Fallback to manual control
      const shouldBeOn = intensity >= threshold;
      if (shouldBeOn && !this.isOn) {
        await this.turnOn();
      } else if (!shouldBeOn && this.isOn) {
        await this.turnOff();
      }
    }
  }

  // ============================================
  // Queue-based strobe effect methods
  // ============================================

  /**
   * Enqueue a single strobe effect
   * @param {Object} effect - Effect configuration
   * @param {string} effect.type - Effect type: ON, OFF, STROBE, PULSE
   * @param {number} effect.durationMs - Duration in milliseconds
   * @param {number} [effect.frequency] - Frequency in Hz (for STROBE type)
   * @param {number} [effect.intensity] - Intensity 0-1
   * @param {string} [effect.id] - Optional unique ID
   * @returns {Promise<{id: string, queueSize: number}>}
   */
  async enqueue(effect) {
    if (!this.isAvailable) {
      throw new Error('Flashlight not available');
    }

    try {
      return await this.plugin.enqueue({
        type: effect.type || EffectType.STROBE,
        durationMs: effect.durationMs || 1000,
        frequency: effect.frequency || 10,
        intensity: effect.intensity || 1.0,
        id: effect.id
      });
    } catch (error) {
      console.error('Failed to enqueue effect:', error);
      throw error;
    }
  }

  /**
   * Enqueue multiple effects at once
   * @param {Array<Object>} effects - Array of effect configurations
   * @returns {Promise<{count: number, queueSize: number}>}
   */
  async enqueueAll(effects) {
    if (!this.isAvailable) {
      throw new Error('Flashlight not available');
    }

    try {
      return await this.plugin.enqueueAll({ effects });
    } catch (error) {
      console.error('Failed to enqueue effects:', error);
      throw error;
    }
  }

  /**
   * Create and enqueue a strobe sequence for a session phase
   * @param {Object} phase - Phase configuration from pack
   * @param {number} phase.duration - Duration in seconds
   * @param {number} phase.frequency - Frequency in Hz
   * @param {number} phase.intensity - Intensity 0-1
   * @returns {Promise<{id: string, queueSize: number}>}
   */
  async enqueuePhase(phase) {
    return await this.enqueue({
      type: EffectType.STROBE,
      durationMs: phase.duration * 1000,
      frequency: phase.frequency,
      intensity: phase.intensity
    });
  }

  /**
   * Start processing the effect queue
   * @returns {Promise<void>}
   */
  async start() {
    if (!this.isAvailable) return;

    try {
      await this.plugin.start();
      this.state = EngineState.RUNNING;
    } catch (error) {
      console.error('Failed to start:', error);
      throw error;
    }
  }

  /**
   * Pause the current session (can be resumed)
   * @returns {Promise<{state: string}>}
   */
  async pause() {
    if (!this.isAvailable) return { state: this.state };

    try {
      const result = await this.plugin.pause();
      this.state = result.state;
      this.isOn = false;
      return result;
    } catch (error) {
      console.error('Failed to pause:', error);
      throw error;
    }
  }

  /**
   * Resume from pause
   * @returns {Promise<{state: string}>}
   */
  async resume() {
    if (!this.isAvailable) return { state: this.state };

    try {
      const result = await this.plugin.resume();
      this.state = result.state;
      return result;
    } catch (error) {
      console.error('Failed to resume:', error);
      throw error;
    }
  }

  /**
   * Stop the session completely (cannot resume - must restart)
   * @returns {Promise<{state: string}>}
   */
  async stop() {
    if (!this.isAvailable) return { state: this.state };

    try {
      const result = await this.plugin.stop();
      this.state = result.state;
      this.isOn = false;
      return result;
    } catch (error) {
      console.error('Failed to stop:', error);
      // Ensure flash is off even if stop fails
      await this.turnOff();
      throw error;
    }
  }

  /**
   * Clear the effect queue
   * @returns {Promise<{queueSize: number}>}
   */
  async clearQueue() {
    if (!this.isAvailable) return { queueSize: 0 };

    try {
      return await this.plugin.clearQueue();
    } catch (error) {
      console.error('Failed to clear queue:', error);
      throw error;
    }
  }

  /**
   * Get current queue size
   * @returns {Promise<number>}
   */
  async getQueueSize() {
    try {
      const result = await this.plugin.getQueueSize();
      return result.queueSize;
    } catch (error) {
      console.error('Failed to get queue size:', error);
      return 0;
    }
  }

  /**
   * Check if engine is currently paused
   * @returns {boolean}
   */
  isPaused() {
    return this.state === EngineState.PAUSED;
  }

  /**
   * Check if engine is currently running
   * @returns {boolean}
   */
  isRunning() {
    return this.state === EngineState.RUNNING;
  }

  /**
   * Ensure flashlight is off and queue is cleared (cleanup)
   * @returns {Promise<void>}
   */
  async cleanup() {
    console.log('Flashlight cleanup starting...');
    try {
      // First try to stop the engine
      await this.stop();
      await this.clearQueue();
    } catch (error) {
      console.error('Cleanup stop error:', error);
    }
    
    // Always try to force off as a final safety measure
    try {
      await this.forceOff();
    } catch (e) {
      console.error('Cleanup forceOff error:', e);
      // Last resort
      try {
        await this.turnOff();
      } catch (e2) {
        console.error('Cleanup turnOff error:', e2);
      }
    }
    
    this.isOn = false;
    console.log('Flashlight cleanup complete');
  }

  /**
   * Check current flash state
   * @returns {boolean} True if flashlight is currently on
   */
  getFlashState() {
    return this.isOn;
  }
}

// Export singleton instance
export const flashlightService = new FlashlightService();

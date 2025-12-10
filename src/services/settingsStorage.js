/**
 * LocalStorage service for user settings/preferences
 * Provides type-safe storage operations for app settings
 */

const STORAGE_KEY = 'flickerSettings';

/**
 * Default settings values
 */
const DEFAULT_SETTINGS = {
  // Session settings
  autoStartSession: false,       // Start session immediately on preview accept
  showUIHints: true,             // Show control hints during session
  uiHideDelay: 3000,             // Milliseconds before UI auto-hides (1000-10000)
  
  // Haptic feedback
  hapticFeedback: true,          // Vibrate on pause/resume/end
  hapticOnPhaseChange: true,     // Vibrate when phase changes
  
  // Safety settings
  brightnessWarning: true,       // Warn about screen brightness
  confirmExit: false,            // Require confirmation to exit session
  
  // Display preferences
  showFrequencyDuringSession: true,  // Show current Hz in session UI
  showPhaseProgress: true,       // Show phase dots in session UI
  darkTheme: true,               // Always dark (no toggle yet, but future-proofed)
  
  // Statistics
  trackStatistics: true,         // Track session history and stats
};

/**
 * Get all settings from localStorage
 * @returns {object} Settings object with defaults applied
 */
export function getSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const stored = data ? JSON.parse(data) : {};
    // Merge with defaults to ensure all keys exist
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch (error) {
    console.error('Error reading settings from localStorage:', error);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Save settings to localStorage
 * @param {object} settings - Settings object to save
 * @returns {boolean} Success status
 */
export function saveSettings(settings) {
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
    return false;
  }
}

/**
 * Get a single setting value
 * @param {string} key - Setting key
 * @returns {*} Setting value or default
 */
export function getSetting(key) {
  const settings = getSettings();
  return settings[key] ?? DEFAULT_SETTINGS[key];
}

/**
 * Update a single setting
 * @param {string} key - Setting key
 * @param {*} value - Setting value
 * @returns {boolean} Success status
 */
export function setSetting(key, value) {
  return saveSettings({ [key]: value });
}

/**
 * Reset all settings to defaults
 * @returns {boolean} Success status
 */
export function resetSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return true;
  } catch (error) {
    console.error('Error resetting settings:', error);
    return false;
  }
}

/**
 * Check if this is the first app launch (no settings saved)
 * @returns {boolean} True if first launch
 */
export function isFirstLaunch() {
  return localStorage.getItem(STORAGE_KEY) === null;
}

/**
 * Get default settings (for reference/reset)
 * @returns {object} Default settings object
 */
export function getDefaultSettings() {
  return { ...DEFAULT_SETTINGS };
}

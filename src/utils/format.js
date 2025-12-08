/**
 * Formatting utilities for display strings
 */

/**
 * Format seconds into MM:SS string
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time string
 */
export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format seconds into human-readable duration (e.g., "5 minutes", "1.5 hours")
 * @param {number} seconds - Total seconds
 * @returns {string} Human-readable duration
 */
export function formatDurationHuman(seconds) {
  if (seconds < 60) {
    return `${Math.floor(seconds)} seconds`;
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return mins === 1 ? '1 minute' : `${mins} minutes`;
  } else {
    const hours = (seconds / 3600).toFixed(1);
    return hours === '1.0' ? '1 hour' : `${hours} hours`;
  }
}

/**
 * Format timestamp to local date string
 * @param {string|Date} timestamp - ISO timestamp or Date object
 * @returns {string} Formatted date
 */
export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Format timestamp to local date and time string
 * @param {string|Date} timestamp - ISO timestamp or Date object
 * @returns {string} Formatted date and time
 */
export function formatDateTime(timestamp) {
  return new Date(timestamp).toLocaleString();
}

/**
 * Format frequency with Hz unit
 * @param {number} frequency - Frequency in Hz
 * @param {number} decimals - Number of decimal places (default 1)
 * @returns {string} Formatted frequency string
 */
export function formatFrequency(frequency, decimals = 1) {
  return `${frequency.toFixed(decimals)} Hz`;
}

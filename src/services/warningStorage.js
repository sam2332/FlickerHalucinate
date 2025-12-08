/**
 * SessionStorage service for warning acceptance
 * Manages session-based seizure warning state
 */

const WARNING_KEY = 'seizureWarningAccepted';

/**
 * Check if seizure warning has been accepted this session
 * @returns {boolean} True if accepted
 */
export function isWarningAccepted() {
  return sessionStorage.getItem(WARNING_KEY) === 'true';
}

/**
 * Mark seizure warning as accepted
 */
export function acceptWarning() {
  sessionStorage.setItem(WARNING_KEY, 'true');
}

/**
 * Clear warning acceptance (for testing)
 */
export function clearWarning() {
  sessionStorage.removeItem(WARNING_KEY);
}

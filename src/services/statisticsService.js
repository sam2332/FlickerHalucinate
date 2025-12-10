/**
 * Statistics service for tracking session history and pack usage
 * Aggregates data from reviews and provides computed statistics
 */

import { getReviews, getReviewsByPack } from './reviewStorage.js';

/**
 * Get comprehensive statistics for a specific pack
 * @param {string} packId - Pack ID
 * @returns {object} Pack statistics
 */
export function getPackStatistics(packId) {
  const reviews = getReviewsByPack(packId);
  
  if (reviews.length === 0) {
    return {
      totalSessions: 0,
      totalTime: 0,
      averageRating: 0,
      averageIntensity: 0,
      lastPlayed: null,
      bestRating: 0,
      completionRate: 0,
      favorite: false,
    };
  }
  
  const totalSessions = reviews.length;
  const totalTime = reviews.reduce((sum, r) => sum + (r.duration || 0), 0);
  const ratings = reviews.filter(r => r.rating > 0);
  const intensities = reviews.filter(r => r.intensity > 0);
  
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
    : 0;
  
  const averageIntensity = intensities.length > 0
    ? intensities.reduce((sum, r) => sum + r.intensity, 0) / intensities.length
    : 0;
  
  const bestRating = ratings.length > 0
    ? Math.max(...ratings.map(r => r.rating))
    : 0;
  
  // Sort by timestamp to get most recent
  const sorted = [...reviews].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  const lastPlayed = sorted[0]?.timestamp || null;
  
  // Completion rate: sessions with rating (completed) vs total
  const completionRate = totalSessions > 0 
    ? (ratings.length / totalSessions) * 100 
    : 0;
  
  return {
    totalSessions,
    totalTime,
    averageRating: Math.round(averageRating * 10) / 10,
    averageIntensity: Math.round(averageIntensity * 10) / 10,
    lastPlayed,
    bestRating,
    completionRate: Math.round(completionRate),
    favorite: totalSessions >= 3 && averageRating >= 4,
  };
}

/**
 * Get overall app statistics
 * @returns {object} Global statistics
 */
export function getGlobalStatistics() {
  const reviews = getReviews();
  
  if (reviews.length === 0) {
    return {
      totalSessions: 0,
      totalTime: 0,
      averageRating: 0,
      uniquePacks: 0,
      streakDays: 0,
      longestSession: 0,
      mostPlayedPack: null,
    };
  }
  
  const totalSessions = reviews.length;
  const totalTime = reviews.reduce((sum, r) => sum + (r.duration || 0), 0);
  const ratings = reviews.filter(r => r.rating > 0);
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;
  
  // Unique packs played
  const packIds = new Set(reviews.map(r => r.packId));
  const uniquePacks = packIds.size;
  
  // Longest session
  const longestSession = Math.max(...reviews.map(r => r.duration || 0));
  
  // Most played pack
  const packCounts = {};
  reviews.forEach(r => {
    packCounts[r.packId] = (packCounts[r.packId] || 0) + 1;
  });
  const mostPlayedPackId = Object.entries(packCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const mostPlayedPack = mostPlayedPackId ? {
    packId: mostPlayedPackId,
    packName: reviews.find(r => r.packId === mostPlayedPackId)?.packName,
    count: packCounts[mostPlayedPackId],
  } : null;
  
  // Calculate streak (consecutive days with sessions)
  const streakDays = calculateStreak(reviews);
  
  return {
    totalSessions,
    totalTime,
    averageRating: Math.round(averageRating * 10) / 10,
    uniquePacks,
    streakDays,
    longestSession,
    mostPlayedPack,
  };
}

/**
 * Calculate consecutive day streak
 * @param {Array} reviews - Array of reviews
 * @returns {number} Streak in days
 */
function calculateStreak(reviews) {
  if (reviews.length === 0) return 0;
  
  // Get unique dates (YYYY-MM-DD format)
  const dates = [...new Set(
    reviews.map(r => new Date(r.timestamp).toISOString().split('T')[0])
  )].sort().reverse(); // Most recent first
  
  if (dates.length === 0) return 0;
  
  // Check if most recent is today or yesterday
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (dates[0] !== today && dates[0] !== yesterday) {
    return 0; // Streak broken
  }
  
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = (prevDate - currDate) / 86400000;
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Format time duration for display
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatTotalTime(seconds) {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
}

/**
 * Get relative time string (e.g., "2 days ago")
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Relative time string
 */
export function getRelativeTime(timestamp) {
  if (!timestamp) return 'Never';
  
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return new Date(timestamp).toLocaleDateString();
}

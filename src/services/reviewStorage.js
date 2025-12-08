/**
 * LocalStorage service for session reviews
 * Provides type-safe storage operations for session review data
 */

const STORAGE_KEY = 'flickerReviews';
const MAX_REVIEWS = 50;

/**
 * Get all reviews from localStorage
 * @returns {Array} Array of review objects
 */
export function getReviews() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading reviews from localStorage:', error);
    return [];
  }
}

/**
 * Save a new review
 * @param {object} review - Review object to save
 * @returns {boolean} Success status
 */
export function saveReview(review) {
  try {
    const reviews = getReviews();
    reviews.unshift(review);
    
    // Limit to MAX_REVIEWS
    if (reviews.length > MAX_REVIEWS) {
      reviews.splice(MAX_REVIEWS);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    return true;
  } catch (error) {
    console.error('Error saving review to localStorage:', error);
    return false;
  }
}

/**
 * Get reviews for a specific pack
 * @param {string} packId - Pack ID to filter by
 * @returns {Array} Filtered reviews
 */
export function getReviewsByPack(packId) {
  return getReviews().filter(review => review.packId === packId);
}

/**
 * Get recent reviews (up to N)
 * @param {number} count - Number of reviews to retrieve
 * @returns {Array} Recent reviews
 */
export function getRecentReviews(count = 3) {
  return getReviews().slice(0, count);
}

/**
 * Delete a review by ID
 * @param {number} reviewId - Review ID to delete
 * @returns {boolean} Success status
 */
export function deleteReview(reviewId) {
  try {
    const reviews = getReviews();
    const filtered = reviews.filter(r => r.id !== reviewId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    return false;
  }
}

/**
 * Clear all reviews
 * @returns {boolean} Success status
 */
export function clearReviews() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing reviews:', error);
    return false;
  }
}

/**
 * Get average rating for a pack
 * @param {string} packId - Pack ID
 * @returns {number} Average rating (0 if no reviews)
 */
export function getAverageRating(packId) {
  const packReviews = getReviewsByPack(packId);
  if (packReviews.length === 0) return 0;
  
  const sum = packReviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / packReviews.length;
}

/**
 * Get review statistics for a pack
 * @param {string} packId - Pack ID
 * @returns {object} Statistics object
 */
export function getPackStats(packId) {
  const packReviews = getReviewsByPack(packId);
  
  if (packReviews.length === 0) {
    return {
      count: 0,
      averageRating: 0,
      averageIntensity: 0,
      totalDuration: 0,
    };
  }
  
  const totalRating = packReviews.reduce((acc, r) => acc + r.rating, 0);
  const totalIntensity = packReviews.reduce((acc, r) => acc + r.intensity, 0);
  const totalDuration = packReviews.reduce((acc, r) => acc + r.duration, 0);
  
  return {
    count: packReviews.length,
    averageRating: totalRating / packReviews.length,
    averageIntensity: totalIntensity / packReviews.length,
    totalDuration,
  };
}

/**
 * Create a new review object with defaults
 * @param {object} data - Review data
 * @returns {object} Complete review object
 */
export function createReview(data) {
  return {
    id: Date.now(),
    packId: data.packId,
    packName: data.packName,
    rating: data.rating || 0,
    intensity: data.intensity || 0,
    notes: data.notes || '',
    duration: data.duration || 0,
    timestamp: new Date().toISOString(),
    bookmarked: data.bookmarked || false,
    bookmarkTime: data.bookmarkTime || null,
  };
}

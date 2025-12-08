import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook for canvas setup and animation loop management
 * Handles canvas sizing, context retrieval, and requestAnimationFrame
 * 
 * @returns {object} Canvas ref and control functions
 */
export function useCanvas() {
  const canvasRef = useRef(null);
  const animationRef = useRef(0);
  const contextRef = useRef(null);

  /**
   * Get canvas 2D context (cached)
   * @returns {CanvasRenderingContext2D|null} Canvas context
   */
  const getContext = useCallback(() => {
    if (!contextRef.current && canvasRef.current) {
      contextRef.current = canvasRef.current.getContext('2d');
    }
    return contextRef.current;
  }, []);

  /**
   * Resize canvas to match window dimensions
   * @param {HTMLCanvasElement} canvas - Canvas element (optional, uses ref if not provided)
   */
  const resizeCanvas = useCallback((canvas = null) => {
    const canvasElement = canvas || canvasRef.current;
    if (canvasElement) {
      canvasElement.width = window.innerWidth;
      canvasElement.height = window.innerHeight;
      // Clear cached context on resize
      contextRef.current = null;
    }
  }, []);

  /**
   * Start animation loop
   * @param {Function} animationCallback - Function to call each frame
   * @returns {Function} Stop function
   */
  const startAnimation = useCallback((animationCallback) => {
    const animate = () => {
      animationCallback();
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Return cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }
    };
  }, []);

  /**
   * Stop current animation
   */
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
  }, []);

  /**
   * Clear canvas to black
   */
  const clearCanvas = useCallback(() => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [getContext]);

  /**
   * Get canvas dimensions
   * @returns {{width: number, height: number}} Canvas dimensions
   */
  const getDimensions = useCallback(() => {
    if (!canvasRef.current) {
      return { width: 0, height: 0 };
    }
    return {
      width: canvasRef.current.width,
      height: canvasRef.current.height,
    };
  }, []);

  /**
   * Get canvas center point
   * @returns {{x: number, y: number}} Center coordinates
   */
  const getCenter = useCallback(() => {
    const { width, height } = getDimensions();
    return {
      x: width / 2,
      y: height / 2,
    };
  }, [getDimensions]);

  // Setup resize listener
  useEffect(() => {
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    
    // Initial resize
    resizeCanvas();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      stopAnimation();
    };
  }, [resizeCanvas, stopAnimation]);

  return {
    canvasRef,
    getContext,
    resizeCanvas,
    startAnimation,
    stopAnimation,
    clearCanvas,
    getDimensions,
    getCenter,
  };
}

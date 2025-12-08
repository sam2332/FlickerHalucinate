/**
 * Pattern rendering engine for visual flicker effects
 * Each pattern creates a unique spatial distribution of light intensity
 */

import { PATTERNS } from '../constants/patterns.js';
import { intensityToColor, intensityToRGB } from '../utils/intensity.js';

/**
 * Render uniform pattern (solid color)
 * Simplest pattern - entire canvas at same intensity
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} time - Current time in seconds
 * @param {number} intensity - Current intensity 0-1
 */
function renderUniform(ctx, width, height, time, intensity) {
  ctx.fillStyle = intensityToColor(intensity);
  ctx.fillRect(0, 0, width, height);
}

/**
 * Render radial pattern (concentric circles with traveling wave)
 * Creates ripple effect emanating from center
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} time - Current time in seconds
 * @param {number} intensity - Current intensity 0-1
 */
function renderRadial(ctx, width, height, time, intensity) {
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.max(width, height);
  
  for (let r = 0; r < maxRadius; r += 10) {
    const phase = Math.sin(r * 0.03 + time * 4);
    const ringIntensity = intensity * (0.5 + 0.5 * phase);
    ctx.strokeStyle = intensityToColor(ringIntensity);
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/**
 * Render spiral pattern (Archimedean spiral with dots)
 * Creates hypnotic rotating spiral effect
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} time - Current time in seconds
 * @param {number} intensity - Current intensity 0-1
 */
function renderSpiral(ctx, width, height, time, intensity) {
  const centerX = width / 2;
  const centerY = height / 2;
  
  for (let t = 0; t < 60; t += 0.15) {
    const angle = t + time * 2;
    const radius = t * 10;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const phase = Math.sin(t * 0.4 + time * 5);
    const dotIntensity = intensity * (0.4 + 0.6 * phase);
    ctx.fillStyle = intensityToColor(dotIntensity);
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Render tunnel pattern (expanding/contracting rings)
 * Creates perception of depth and forward motion
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} time - Current time in seconds
 * @param {number} intensity - Current intensity 0-1
 */
function renderTunnel(ctx, width, height, time, intensity) {
  const centerX = width / 2;
  const centerY = height / 2;
  
  for (let ring = 0; ring < 30; ring++) {
    const radius = Math.pow(ring, 1.4) * 20;
    const phase = Math.sin(ring * 0.35 - time * 5);
    const ringIntensity = intensity * (0.4 + 0.6 * phase);
    ctx.strokeStyle = intensityToColor(ringIntensity);
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/**
 * Render checkerboard pattern (alternating squares with wave)
 * Creates complex geometric interference patterns
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} time - Current time in seconds
 * @param {number} intensity - Current intensity 0-1
 */
function renderCheckerboard(ctx, width, height, time, intensity) {
  const size = 60;
  
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      const checker = ((Math.floor(x / size) + Math.floor(y / size)) % 2);
      const phase = Math.sin((x + y) * 0.008 + time * 6);
      const squareIntensity = intensity * (checker ? (0.5 + 0.5 * phase) : (0.5 - 0.5 * phase));
      ctx.fillStyle = intensityToColor(squareIntensity);
      ctx.fillRect(x, y, size, size);
    }
  }
}

/**
 * Render concentric pattern (thick concentric rings)
 * Simpler than radial, with wider bands
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} time - Current time in seconds
 * @param {number} intensity - Current intensity 0-1
 */
function renderConcentric(ctx, width, height, time, intensity) {
  const centerX = width / 2;
  const centerY = height / 2;
  
  for (let r = 0; r < Math.max(width, height); r += 50) {
    const phase = Math.sin(r * 0.015 - time * 4);
    const ringIntensity = intensity * (0.3 + 0.7 * phase);
    ctx.strokeStyle = intensityToColor(ringIntensity);
    ctx.lineWidth = 45;
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/**
 * Render starburst pattern (radiating rays from center)
 * Creates explosive, radiating effect
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} time - Current time in seconds
 * @param {number} intensity - Current intensity 0-1
 */
function renderStarburst(ctx, width, height, time, intensity) {
  const centerX = width / 2;
  const centerY = height / 2;
  const rays = 24;
  
  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2 + time * 0.4;
    const phase = Math.sin(i * 0.6 + time * 6);
    const rayIntensity = intensity * (0.4 + 0.6 * phase);
    ctx.strokeStyle = intensityToColor(rayIntensity);
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    const len = Math.max(width, height);
    ctx.lineTo(centerX + Math.cos(angle) * len, centerY + Math.sin(angle) * len);
    ctx.stroke();
  }
}

/**
 * Render vortex pattern (spiral with arc segments)
 * Most complex pattern - creates swirling vortex effect
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} time - Current time in seconds
 * @param {number} intensity - Current intensity 0-1
 */
function renderVortex(ctx, width, height, time, intensity) {
  const centerX = width / 2;
  const centerY = height / 2;
  
  for (let r = 15; r < Math.max(width, height) * 0.8; r += 20) {
    const spiralOffset = r * 0.08 + time * 3;
    const phase = Math.sin(r * 0.025 + time * 5);
    const arcIntensity = intensity * (0.4 + 0.6 * phase);
    ctx.strokeStyle = intensityToColor(arcIntensity);
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, spiralOffset, spiralOffset + Math.PI * 1.6);
    ctx.stroke();
  }
}

/**
 * Pattern renderer map
 * Maps pattern constants to their rendering functions
 */
const patternRenderers = {
  [PATTERNS.UNIFORM]: renderUniform,
  [PATTERNS.RADIAL]: renderRadial,
  [PATTERNS.SPIRAL]: renderSpiral,
  [PATTERNS.TUNNEL]: renderTunnel,
  [PATTERNS.CHECKERBOARD]: renderCheckerboard,
  [PATTERNS.CONCENTRIC]: renderConcentric,
  [PATTERNS.STARBURST]: renderStarburst,
  [PATTERNS.VORTEX]: renderVortex,
};

/**
 * Main pattern rendering function
 * Renders the specified pattern to the canvas
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} time - Current time in seconds
 * @param {number} intensity - Current intensity 0-1
 * @param {string} pattern - Pattern type from PATTERNS constants
 */
export function renderPattern(ctx, width, height, time, intensity, pattern) {
  // Clear canvas to black
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);
  
  // Render pattern
  const renderer = patternRenderers[pattern];
  if (renderer) {
    renderer(ctx, width, height, time, intensity);
  } else {
    // Fallback to uniform if pattern not found
    renderUniform(ctx, width, height, time, intensity);
  }
}

/**
 * Export individual renderers for testing
 */
export {
  renderUniform,
  renderRadial,
  renderSpiral,
  renderTunnel,
  renderCheckerboard,
  renderConcentric,
  renderStarburst,
  renderVortex,
};

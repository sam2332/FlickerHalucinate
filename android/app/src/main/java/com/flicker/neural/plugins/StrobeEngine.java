package com.flicker.neural.plugins;

import android.content.Context;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.os.Handler;
import android.os.HandlerThread;
import android.util.Log;

import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Engine for managing flashlight strobe effects with queue support.
 * Runs on a dedicated background thread for precise timing.
 */
public class StrobeEngine {
    
    private static final String TAG = "StrobeEngine";
    
    public interface StrobeEventListener {
        void onEffectStarted(String effectId);
        void onEffectCompleted(String effectId);
        void onQueueEmpty();
        void onError(String message);
        void onStateChanged(EngineState state);
    }
    
    public enum EngineState {
        IDLE,
        RUNNING,
        PAUSED,
        STOPPED
    }
    
    private final Context context;
    private final CameraManager cameraManager;
    private String cameraId;
    private boolean hasFlashlight = false;
    
    private HandlerThread strobeThread;
    private Handler strobeHandler;
    
    private final ConcurrentLinkedQueue<StrobeEffect> effectQueue;
    private StrobeEffect currentEffect;
    
    private final AtomicBoolean isFlashOn = new AtomicBoolean(false);
    private final AtomicBoolean isPaused = new AtomicBoolean(false);
    private final AtomicBoolean isStopped = new AtomicBoolean(true);
    private final AtomicBoolean isRunning = new AtomicBoolean(false);
    
    private final AtomicLong effectStartTime = new AtomicLong(0);
    private final AtomicLong pausedElapsed = new AtomicLong(0);
    
    private StrobeEventListener listener;
    private EngineState state = EngineState.IDLE;
    
    private Runnable currentStrobeRunnable;
    
    public StrobeEngine(Context context) {
        this.context = context;
        this.cameraManager = (CameraManager) context.getSystemService(Context.CAMERA_SERVICE);
        this.effectQueue = new ConcurrentLinkedQueue<>();
        
        initializeCamera();
        initializeThread();
    }
    
    private void initializeCamera() {
        try {
            String[] cameraIds = cameraManager.getCameraIdList();
            for (String id : cameraIds) {
                CameraCharacteristics characteristics = cameraManager.getCameraCharacteristics(id);
                Boolean hasFlash = characteristics.get(CameraCharacteristics.FLASH_INFO_AVAILABLE);
                if (hasFlash != null && hasFlash) {
                    cameraId = id;
                    hasFlashlight = true;
                    Log.d(TAG, "Flashlight found on camera: " + cameraId);
                    break;
                }
            }
        } catch (CameraAccessException e) {
            Log.e(TAG, "Failed to access camera", e);
            hasFlashlight = false;
        }
    }
    
    private void initializeThread() {
        strobeThread = new HandlerThread("StrobeEngineThread", Thread.MAX_PRIORITY);
        strobeThread.start();
        strobeHandler = new Handler(strobeThread.getLooper());
    }
    
    public void setListener(StrobeEventListener listener) {
        this.listener = listener;
    }
    
    public boolean isFlashlightAvailable() {
        return hasFlashlight;
    }
    
    public EngineState getState() {
        return state;
    }
    
    /**
     * Add an effect to the queue
     */
    public void enqueue(StrobeEffect effect) {
        effectQueue.offer(effect);
        Log.d(TAG, "Enqueued effect: " + effect);
        
        // Auto-start if not running
        if (!isRunning.get() && !isPaused.get()) {
            start();
        }
    }
    
    /**
     * Add multiple effects to the queue
     */
    public void enqueueAll(StrobeEffect[] effects) {
        for (StrobeEffect effect : effects) {
            effectQueue.offer(effect);
        }
        Log.d(TAG, "Enqueued " + effects.length + " effects");
        
        if (!isRunning.get() && !isPaused.get()) {
            start();
        }
    }
    
    /**
     * Clear the effect queue
     */
    public void clearQueue() {
        effectQueue.clear();
        Log.d(TAG, "Queue cleared");
    }
    
    /**
     * Get current queue size
     */
    public int getQueueSize() {
        return effectQueue.size();
    }
    
    /**
     * Start processing the queue
     */
    public void start() {
        if (!hasFlashlight) {
            notifyError("Flashlight not available");
            return;
        }
        
        if (isRunning.get() && !isPaused.get()) {
            Log.d(TAG, "Already running");
            return;
        }
        
        isStopped.set(false);
        isPaused.set(false);
        isRunning.set(true);
        
        setState(EngineState.RUNNING);
        Log.d(TAG, "Starting strobe engine");
        
        processNextEffect();
    }
    
    /**
     * Pause the current session (can be resumed)
     */
    public void pause() {
        if (!isRunning.get() || isPaused.get()) return;
        
        isPaused.set(true);
        
        // Store elapsed time for current effect
        if (effectStartTime.get() > 0) {
            pausedElapsed.set(System.currentTimeMillis() - effectStartTime.get());
        }
        
        // Turn off flash while paused
        setFlash(false);
        
        // Remove pending callbacks
        if (currentStrobeRunnable != null) {
            strobeHandler.removeCallbacks(currentStrobeRunnable);
        }
        
        setState(EngineState.PAUSED);
        Log.d(TAG, "Paused strobe engine");
    }
    
    /**
     * Resume from pause
     */
    public void resume() {
        if (!isPaused.get()) return;
        
        isPaused.set(false);
        setState(EngineState.RUNNING);
        Log.d(TAG, "Resuming strobe engine");
        
        // Resume current effect if any
        if (currentEffect != null) {
            long remaining = currentEffect.getDurationMs() - pausedElapsed.get();
            if (remaining > 0) {
                executeEffect(currentEffect, remaining);
            } else {
                processNextEffect();
            }
        } else {
            processNextEffect();
        }
    }
    
    /**
     * Stop the session completely (cannot resume - must restart)
     */
    public void stop() {
        Log.d(TAG, "Stopping strobe engine");
        
        isStopped.set(true);
        isPaused.set(false);
        isRunning.set(false);
        
        // Remove all pending callbacks - must do this first to prevent race conditions
        if (strobeHandler != null) {
            strobeHandler.removeCallbacksAndMessages(null);
        }
        currentStrobeRunnable = null;
        
        // Turn off flash immediately
        setFlash(false);
        
        // Clear current effect
        currentEffect = null;
        effectStartTime.set(0);
        pausedElapsed.set(0);
        
        setState(EngineState.STOPPED);
        Log.d(TAG, "Strobe engine stopped, flash off");
    }
    
    /**
     * Immediate flash control (bypasses queue)
     */
    public void flashOn() {
        setFlash(true);
    }
    
    /**
     * Immediate flash control (bypasses queue)
     */
    public void flashOff() {
        setFlash(false);
    }
    
    /**
     * Toggle based on intensity threshold (for real-time control)
     */
    public void setIntensityThreshold(double intensity, double threshold) {
        boolean shouldBeOn = intensity >= threshold;
        if (shouldBeOn != isFlashOn.get()) {
            setFlash(shouldBeOn);
        }
    }
    
    private void processNextEffect() {
        if (isStopped.get() || isPaused.get()) return;
        
        currentEffect = effectQueue.poll();
        
        if (currentEffect == null) {
            // Queue is empty
            isRunning.set(false);
            setState(EngineState.IDLE);
            notifyQueueEmpty();
            return;
        }
        
        Log.d(TAG, "Processing effect: " + currentEffect);
        notifyEffectStarted(currentEffect.getId());
        
        executeEffect(currentEffect, currentEffect.getDurationMs());
    }
    
    private void executeEffect(StrobeEffect effect, long remainingMs) {
        effectStartTime.set(System.currentTimeMillis());
        
        switch (effect.getType()) {
            case ON:
                executeOnEffect(remainingMs);
                break;
            case OFF:
                executeOffEffect(remainingMs);
                break;
            case STROBE:
                executeStrobeEffect(effect, remainingMs);
                break;
            case PULSE:
                executePulseEffect(effect);
                break;
        }
    }
    
    private void executeOnEffect(long durationMs) {
        setFlash(true);
        scheduleNextEffect(durationMs);
    }
    
    private void executeOffEffect(long durationMs) {
        setFlash(false);
        scheduleNextEffect(durationMs);
    }
    
    private void executePulseEffect(StrobeEffect effect) {
        setFlash(true);
        
        long halfPeriod = effect.getHalfPeriodMs();
        if (halfPeriod <= 0) halfPeriod = 50; // Default 50ms pulse
        
        currentStrobeRunnable = () -> {
            setFlash(false);
            completeCurrentEffect();
        };
        
        strobeHandler.postDelayed(currentStrobeRunnable, halfPeriod);
    }
    
    private void executeStrobeEffect(StrobeEffect effect, long remainingMs) {
        final long halfPeriod = effect.getHalfPeriodMs();
        final long endTime = System.currentTimeMillis() + remainingMs;
        
        if (halfPeriod <= 0) {
            Log.e(TAG, "Invalid frequency for strobe effect");
            completeCurrentEffect();
            return;
        }
        
        // Start strobe loop
        strobeLoop(halfPeriod, endTime, true);
    }
    
    private void strobeLoop(long halfPeriod, long endTime, boolean turnOn) {
        if (isStopped.get() || isPaused.get()) return;
        
        long now = System.currentTimeMillis();
        if (now >= endTime) {
            setFlash(false);
            completeCurrentEffect();
            return;
        }
        
        setFlash(turnOn);
        
        // Calculate next toggle time
        long nextDelay = Math.min(halfPeriod, endTime - now);
        
        currentStrobeRunnable = () -> strobeLoop(halfPeriod, endTime, !turnOn);
        strobeHandler.postDelayed(currentStrobeRunnable, nextDelay);
    }
    
    private void scheduleNextEffect(long delayMs) {
        currentStrobeRunnable = () -> {
            if (!isStopped.get() && !isPaused.get()) {
                completeCurrentEffect();
            }
        };
        strobeHandler.postDelayed(currentStrobeRunnable, delayMs);
    }
    
    private void completeCurrentEffect() {
        if (currentEffect != null) {
            String effectId = currentEffect.getId();
            notifyEffectCompleted(effectId);
        }
        processNextEffect();
    }
    
    private void setFlash(boolean on) {
        if (!hasFlashlight || cameraId == null) return;
        
        try {
            cameraManager.setTorchMode(cameraId, on);
            isFlashOn.set(on);
            Log.d(TAG, "Flash set to: " + on);
        } catch (CameraAccessException e) {
            Log.e(TAG, "Failed to set torch mode", e);
            notifyError("Failed to control flashlight: " + e.getMessage());
        } catch (Exception e) {
            Log.e(TAG, "Unexpected error setting torch", e);
        }
    }
    
    /**
     * Force flashlight off - guaranteed to turn off
     */
    public void forceOff() {
        Log.d(TAG, "Force turning off flashlight");
        
        // Stop everything first
        isStopped.set(true);
        isPaused.set(false);
        isRunning.set(false);
        
        if (strobeHandler != null) {
            strobeHandler.removeCallbacksAndMessages(null);
        }
        currentStrobeRunnable = null;
        
        // Multiple attempts to turn off flash
        for (int i = 0; i < 3; i++) {
            try {
                if (hasFlashlight && cameraId != null) {
                    cameraManager.setTorchMode(cameraId, false);
                    isFlashOn.set(false);
                    Log.d(TAG, "Force off attempt " + (i+1) + " succeeded");
                    break;
                }
            } catch (Exception e) {
                Log.e(TAG, "Force off attempt " + (i+1) + " failed", e);
            }
        }
    }
    
    private void setState(EngineState newState) {
        this.state = newState;
        notifyStateChanged(newState);
    }
    
    // Listener notifications
    private void notifyEffectStarted(String effectId) {
        if (listener != null) listener.onEffectStarted(effectId);
    }
    
    private void notifyEffectCompleted(String effectId) {
        if (listener != null) listener.onEffectCompleted(effectId);
    }
    
    private void notifyQueueEmpty() {
        if (listener != null) listener.onQueueEmpty();
    }
    
    private void notifyError(String message) {
        if (listener != null) listener.onError(message);
    }
    
    private void notifyStateChanged(EngineState state) {
        if (listener != null) listener.onStateChanged(state);
    }
    
    /**
     * Clean up resources
     */
    public void destroy() {
        stop();
        
        if (strobeThread != null) {
            strobeThread.quitSafely();
            strobeThread = null;
            strobeHandler = null;
        }
        
        Log.d(TAG, "StrobeEngine destroyed");
    }
}

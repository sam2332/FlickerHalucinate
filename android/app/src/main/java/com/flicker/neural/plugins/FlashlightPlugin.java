package com.flicker.neural.plugins;

import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Capacitor Plugin for controlling the phone's flashlight with strobe effects.
 * 
 * Provides:
 * - Basic on/off control
 * - Strobe effect queue management
 * - Pause/resume/stop functionality
 * - Real-time intensity threshold control
 */
@CapacitorPlugin(name = "FlashlightPlugin")
public class FlashlightPlugin extends Plugin implements StrobeEngine.StrobeEventListener {
    
    private static final String TAG = "FlashlightPlugin";
    
    private StrobeEngine strobeEngine;
    
    @Override
    public void load() {
        super.load();
        strobeEngine = new StrobeEngine(getContext());
        strobeEngine.setListener(this);
        Log.d(TAG, "FlashlightPlugin loaded");
    }
    
    /**
     * Check if flashlight is available on this device
     */
    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject result = new JSObject();
        result.put("value", strobeEngine.isFlashlightAvailable());
        call.resolve(result);
    }
    
    /**
     * Get current engine state
     */
    @PluginMethod
    public void getState(PluginCall call) {
        JSObject result = new JSObject();
        result.put("state", strobeEngine.getState().name());
        result.put("queueSize", strobeEngine.getQueueSize());
        call.resolve(result);
    }
    
    /**
     * Turn flashlight on immediately (bypasses queue)
     */
    @PluginMethod
    public void switchOn(PluginCall call) {
        try {
            strobeEngine.flashOn();
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to turn on flashlight", e);
        }
    }
    
    /**
     * Turn flashlight off immediately (bypasses queue)
     */
    @PluginMethod
    public void switchOff(PluginCall call) {
        try {
            strobeEngine.flashOff();
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to turn off flashlight", e);
        }
    }
    
    /**
     * Force flashlight off - guaranteed stop with multiple retry attempts
     * Use this when normal switchOff doesn't work
     */
    @PluginMethod
    public void forceOff(PluginCall call) {
        try {
            strobeEngine.forceOff();
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to force off flashlight", e);
        }
    }
    
    /**
     * Set flashlight based on intensity threshold
     * Used for real-time intensity-based control (e.g., sine wave modulation)
     * 
     * @param intensity Current intensity value (0-1)
     * @param threshold Threshold for on/off (default 0.5)
     */
    @PluginMethod
    public void setIntensity(PluginCall call) {
        double intensity = call.getDouble("intensity", 0.0);
        double threshold = call.getDouble("threshold", 0.5);
        
        try {
            strobeEngine.setIntensityThreshold(intensity, threshold);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to set intensity", e);
        }
    }
    
    /**
     * Enqueue a single strobe effect
     * 
     * Effect types:
     * - ON: Turn on for duration
     * - OFF: Turn off for duration
     * - STROBE: Strobe at frequency for duration
     * - PULSE: Single flash
     * 
     * @param type Effect type (ON, OFF, STROBE, PULSE)
     * @param durationMs Duration in milliseconds
     * @param frequency Frequency in Hz (for STROBE type)
     * @param intensity Intensity 0-1
     */
    @PluginMethod
    public void enqueue(PluginCall call) {
        try {
            JSONObject effectJson = new JSONObject();
            effectJson.put("type", call.getString("type", "STROBE"));
            effectJson.put("durationMs", call.getInt("durationMs", 1000));
            effectJson.put("frequency", call.getDouble("frequency", 10.0));
            effectJson.put("intensity", call.getDouble("intensity", 1.0));
            
            if (call.getString("id") != null) {
                effectJson.put("id", call.getString("id"));
            }
            
            StrobeEffect effect = StrobeEffect.fromJson(effectJson);
            strobeEngine.enqueue(effect);
            
            JSObject result = new JSObject();
            result.put("id", effect.getId());
            result.put("queueSize", strobeEngine.getQueueSize());
            call.resolve(result);
            
        } catch (JSONException e) {
            call.reject("Failed to parse effect", e);
        }
    }
    
    /**
     * Enqueue multiple effects at once
     * 
     * @param effects Array of effect objects
     */
    @PluginMethod
    public void enqueueAll(PluginCall call) {
        try {
            JSONArray effectsArray = call.getArray("effects");
            
            if (effectsArray == null || effectsArray.length() == 0) {
                call.reject("No effects provided");
                return;
            }
            
            StrobeEffect[] effects = new StrobeEffect[effectsArray.length()];
            for (int i = 0; i < effectsArray.length(); i++) {
                JSONObject effectJson = effectsArray.getJSONObject(i);
                effects[i] = StrobeEffect.fromJson(effectJson);
            }
            
            strobeEngine.enqueueAll(effects);
            
            JSObject result = new JSObject();
            result.put("count", effects.length);
            result.put("queueSize", strobeEngine.getQueueSize());
            call.resolve(result);
            
        } catch (JSONException e) {
            call.reject("Failed to parse effects array", e);
        }
    }
    
    /**
     * Start processing the effect queue
     */
    @PluginMethod
    public void start(PluginCall call) {
        try {
            strobeEngine.start();
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to start", e);
        }
    }
    
    /**
     * Pause the current session (can be resumed)
     */
    @PluginMethod
    public void pause(PluginCall call) {
        try {
            strobeEngine.pause();
            
            JSObject result = new JSObject();
            result.put("state", strobeEngine.getState().name());
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to pause", e);
        }
    }
    
    /**
     * Resume from pause
     */
    @PluginMethod
    public void resume(PluginCall call) {
        try {
            strobeEngine.resume();
            
            JSObject result = new JSObject();
            result.put("state", strobeEngine.getState().name());
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to resume", e);
        }
    }
    
    /**
     * Stop the session completely
     */
    @PluginMethod
    public void stop(PluginCall call) {
        try {
            strobeEngine.stop();
            
            JSObject result = new JSObject();
            result.put("state", strobeEngine.getState().name());
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to stop", e);
        }
    }
    
    /**
     * Clear the effect queue
     */
    @PluginMethod
    public void clearQueue(PluginCall call) {
        try {
            strobeEngine.clearQueue();
            
            JSObject result = new JSObject();
            result.put("queueSize", 0);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to clear queue", e);
        }
    }
    
    /**
     * Get current queue size
     */
    @PluginMethod
    public void getQueueSize(PluginCall call) {
        JSObject result = new JSObject();
        result.put("queueSize", strobeEngine.getQueueSize());
        call.resolve(result);
    }
    
    // StrobeEventListener implementation
    
    @Override
    public void onEffectStarted(String effectId) {
        JSObject data = new JSObject();
        data.put("effectId", effectId);
        notifyListeners("effectStarted", data);
    }
    
    @Override
    public void onEffectCompleted(String effectId) {
        JSObject data = new JSObject();
        data.put("effectId", effectId);
        notifyListeners("effectCompleted", data);
    }
    
    @Override
    public void onQueueEmpty() {
        notifyListeners("queueEmpty", new JSObject());
    }
    
    @Override
    public void onError(String message) {
        JSObject data = new JSObject();
        data.put("message", message);
        notifyListeners("error", data);
    }
    
    @Override
    public void onStateChanged(StrobeEngine.EngineState state) {
        JSObject data = new JSObject();
        data.put("state", state.name());
        notifyListeners("stateChanged", data);
    }
    
    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        if (strobeEngine != null) {
            strobeEngine.destroy();
        }
    }
}

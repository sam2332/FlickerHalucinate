package com.flicker.neural.plugins;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Represents a single strobe effect in the queue.
 * Can be a simple on/off, or a timed sequence with frequency.
 */
public class StrobeEffect {
    
    public enum EffectType {
        ON,           // Turn on for duration
        OFF,          // Turn off for duration
        STROBE,       // Strobe at frequency for duration
        PULSE         // Single pulse (on then off)
    }
    
    private EffectType type;
    private long durationMs;      // Duration in milliseconds
    private double frequency;     // Frequency in Hz (for STROBE type)
    private double intensity;     // Intensity 0-1 (may not be supported on all devices)
    private String id;            // Unique identifier for this effect
    
    public StrobeEffect(EffectType type, long durationMs) {
        this.type = type;
        this.durationMs = durationMs;
        this.frequency = 0;
        this.intensity = 1.0;
        this.id = generateId();
    }
    
    public StrobeEffect(EffectType type, long durationMs, double frequency) {
        this.type = type;
        this.durationMs = durationMs;
        this.frequency = frequency;
        this.intensity = 1.0;
        this.id = generateId();
    }
    
    public StrobeEffect(EffectType type, long durationMs, double frequency, double intensity) {
        this.type = type;
        this.durationMs = durationMs;
        this.frequency = frequency;
        this.intensity = intensity;
        this.id = generateId();
    }
    
    private String generateId() {
        return "effect_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 10000);
    }
    
    // Getters
    public EffectType getType() { return type; }
    public long getDurationMs() { return durationMs; }
    public double getFrequency() { return frequency; }
    public double getIntensity() { return intensity; }
    public String getId() { return id; }
    
    // Setters
    public void setId(String id) { this.id = id; }
    public void setIntensity(double intensity) { this.intensity = intensity; }
    
    /**
     * Calculate period in milliseconds for strobe frequency
     */
    public long getPeriodMs() {
        if (frequency <= 0) return 0;
        return (long)(1000.0 / frequency);
    }
    
    /**
     * Calculate half-period (time for ON or OFF state)
     */
    public long getHalfPeriodMs() {
        return getPeriodMs() / 2;
    }
    
    /**
     * Create from JSON object
     */
    public static StrobeEffect fromJson(JSONObject json) throws JSONException {
        String typeStr = json.optString("type", "STROBE");
        EffectType type = EffectType.valueOf(typeStr.toUpperCase());
        
        long durationMs = json.optLong("durationMs", 1000);
        double frequency = json.optDouble("frequency", 10.0);
        double intensity = json.optDouble("intensity", 1.0);
        
        StrobeEffect effect = new StrobeEffect(type, durationMs, frequency, intensity);
        
        if (json.has("id")) {
            effect.setId(json.getString("id"));
        }
        
        return effect;
    }
    
    /**
     * Convert to JSON object
     */
    public JSONObject toJson() throws JSONException {
        JSONObject json = new JSONObject();
        json.put("id", id);
        json.put("type", type.name());
        json.put("durationMs", durationMs);
        json.put("frequency", frequency);
        json.put("intensity", intensity);
        return json;
    }
    
    @Override
    public String toString() {
        return "StrobeEffect{" +
                "type=" + type +
                ", durationMs=" + durationMs +
                ", frequency=" + frequency +
                ", intensity=" + intensity +
                ", id='" + id + '\'' +
                '}';
    }
}

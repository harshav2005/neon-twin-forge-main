const mongoose = require('mongoose');

const TwinProfileSchema = new mongoose.Schema({
    user: { type: String, unique: true, required: true },
    version: { type: String, default: '2.0' },
    status: { type: String, default: 'active' },
    
    // Core Personality Traits
    personality: {
        analytical: { type: Number, default: 50 },
        creative: { type: Number, default: 50 },
        empathetic: { type: Number, default: 50 },
        adventurous: { type: Number, default: 50 },
        organized: { type: Number, default: 50 },
    },

    // Advanced Meta-Data
    tonePreference: { type: String, default: 'supportive and balanced' },
    goals: { type: [String], default: [] },
    stressTriggers: { type: [String], default: [] },
    communicationStyle: { type: String, default: 'reflective' },
    summary: { type: String, default: '' },
    
    // Privacy & Features
    memoryEnabled: { type: Boolean, default: true },
    
    // Metrics
    stressLevel: { type: String, default: 'normal' },
    energyLevel: { type: String, default: 'moderate' },
    mood: { type: String, default: 'neutral' },
    
    lastTrained: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("TwinProfile", TwinProfileSchema, "twins");

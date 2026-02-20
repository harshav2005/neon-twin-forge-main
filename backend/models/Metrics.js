const mongoose = require('mongoose');

const MetricsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    heartRate: Number,
    steps: Number,
    hydration: Number,
    protein: Number,
    stress: Number,
    sleepHours: Number,
    weight: Number,
    conversations: { type: Number, default: 0 },
    moodScore: { type: Number, default: 75 },
    decisionsMade: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Metrics", MetricsSchema);

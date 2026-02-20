const mongoose = require('mongoose');

const TwinSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    version: { type: String, default: '1.0' },
    status: { type: String, default: 'active' },
    personality: {
        analytical: { type: Number, default: 50 },
        creative: { type: Number, default: 50 },
        empathetic: { type: Number, default: 50 },
        adventurous: { type: Number, default: 50 },
        organized: { type: Number, default: 50 },
        social: { type: Number, default: 50 },
    },
    preferences: [{
        name: String,
        enabled: Boolean,
    }],
    lastTrained: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Twin", TwinSchema);

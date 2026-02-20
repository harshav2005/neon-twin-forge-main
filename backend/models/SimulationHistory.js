const mongoose = require('mongoose');

const SimulationHistorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    twin: { type: mongoose.Schema.Types.ObjectId, ref: 'Twin' },
    scenario: { type: String, required: true },
    result: { type: Object, required: true }, // Store the AI response structure
    provider: { type: String, enum: ['openai', 'gemini'], default: 'gemini' }
}, { timestamps: true });

module.exports = mongoose.model("SimulationHistory", SimulationHistorySchema);

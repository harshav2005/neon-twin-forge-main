const mongoose = require('mongoose');

const SurveySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    isComplete: { type: Boolean, default: false },
    responses: { type: Object, required: true },
    submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Survey", SurveySchema);

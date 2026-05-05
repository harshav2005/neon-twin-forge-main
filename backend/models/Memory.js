const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    category: {
        type: String,
        required: true,
        default: 'other'
    },
    originalText: {
        type: String,
        default: ""
    },
    analyzedSummary: {
        type: String,
        default: ""
    },
    embedding: {
        type: [Number],
        default: []
    },
    source: {
        type: String,
        default: 'twin_builder'
    },
    importance: {
        type: Number,
        default: 5
    },
    lastUsedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Add required indexes for user isolation and fast retrieval
MemorySchema.index({ userId: 1, category: 1 });
MemorySchema.index({ userId: 1, source: 1 });
MemorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Memory', MemorySchema);

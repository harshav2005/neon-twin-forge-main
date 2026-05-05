const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    title: { type: String, default: 'New Conversation' },
    messages: [
        {
            role: { type: String, enum: ['user', 'assistant'], required: true },
            content: { type: String, required: true },
            inputType: { type: String, enum: ['text', 'voice'], default: 'text' },
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);

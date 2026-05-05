const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    sender: {
        type: String,
        enum: ['user', 'twin'],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    emotion: {
        type: String,
        default: 'neutral'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', MessageSchema);

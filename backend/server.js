require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Validate AI keys at startup
const aiProvider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
if (aiProvider === 'gemini' && !process.env.GEMINI_API_KEY) {
    console.error('[AI CONFIG] ⚠️  WARNING: GEMINI_API_KEY is not set in .env. Chatbot will use local fallback mode.');
} else if (aiProvider === 'openai' && !process.env.OPENAI_API_KEY) {
    console.error('[AI CONFIG] ⚠️  WARNING: OPENAI_API_KEY is not set in .env. Chatbot will use local fallback mode.');
} else {
    console.log(`[AI CONFIG] ✅ AI provider: ${aiProvider.toUpperCase()} — key loaded from environment.`);
}

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api/docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

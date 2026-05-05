const axios = require('axios');
require('dotenv').config();

const geminiKey = process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1/models?key=${geminiKey}`;
        const response = await axios.get(url);
        console.log('Available Models:');
        response.data.models.forEach(m => console.log(m.name));
    } catch (error) {
        console.error('Error fetching models:', error.response?.data || error.message);
    }
}

listModels();

const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    console.log(`Listing available models...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        const response = await axios.get(url);
        const models = response.data.models;
        console.log("Available Models:");
        models.forEach(model => {
            console.log(`- ${model.name} (${model.displayName}): ${model.supportedGenerationMethods.join(', ')}`);
        });
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

listModels();

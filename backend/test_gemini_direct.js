const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.0-flash";

async function testGemini() {
    console.log(`Testing Gemini API with model: ${MODEL}`);
    // Updated URL for 2.0 models if needed, but usually it's the same pattern
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    const payload = {
        contents: [{
            parts: [{ text: "Hello, are you working?" }]
        }]
    };

    try {
        const response = await axios.post(url, payload);
        console.log("Success! Response:", response.data.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

testGemini();

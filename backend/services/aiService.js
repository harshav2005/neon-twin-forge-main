const { OpenAI } = require('openai');
const axios = require('axios');
require('dotenv').config();

const runSimulation = async (scenario, twinProfile, userMetrics) => {
    const provider = process.env.AI_PROVIDER || 'gemini';
    const systemPrompt = `
    You are a digital twin of the user. 
    Personality Traits:
    - Analytical: ${twinProfile?.personality?.analytical || 50}%
    - Creative: ${twinProfile?.personality?.creative || 50}%
    - Empathetic: ${twinProfile?.personality?.empathetic || 50}%
    - Adventurous: ${twinProfile?.personality?.adventurous || 50}%
    - Organized: ${twinProfile?.personality?.organized || 50}%
    - Social: ${twinProfile?.personality?.social || 50}%

    Recent Health Metrics:
    - Stress Level: ${userMetrics?.stress || 'Unknown'}
    - Sleep Hours: ${userMetrics?.sleepHours || 'Unknown'}
    - Mood Score: ${userMetrics?.moodScore || 'Unknown'}

    Your task is to analyze the following scenario as if you were the user, considering their personality and current state.
    Scenario: "${scenario}"

    Provide a JSON response with the following structure:
    {
        "simulationId": "generated_id",
        "steps": [
            { "id": 1, "title": "step_title", "description": "step_description", "probability": 0-100, "outcome": "positive/neutral/negative" },
            ...
        ],
        "summary": "overall_analysis_summary",
        "confidence": 0-100,
        "recommendation": "recommendation_text"
    }
    `;

    try {
        if (provider === 'openai') {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a helpful AI digital twin assistant. Output JSON only." },
                    { role: "user", content: systemPrompt }
                ],
                model: "gpt-4o-mini",
                response_format: { type: "json_object" }
            });
            return JSON.parse(completion.choices[0].message.content);

        } else {
            // Gemini via direct REST API (more reliable than SDK for model aliases)
            const API_KEY = process.env.GEMINI_API_KEY;
            const MODEL = "gemini-flash-latest";
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

            const payload = {
                contents: [{
                    parts: [{ text: systemPrompt + "\nOutput raw JSON only. Do not use markdown code blocks." }]
                }]
            };

            const response = await axios.post(url, payload);
            const text = response.data.candidates[0].content.parts[0].text;

            // Clean up markdown code blocks if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            // Handle cases where AI might add extra text
            const jsonStart = cleanText.indexOf('{');
            const jsonEnd = cleanText.lastIndexOf('}') + 1;
            if (jsonStart !== -1 && jsonEnd !== -1) {
                return JSON.parse(cleanText.substring(jsonStart, jsonEnd));
            }
            return JSON.parse(cleanText);
        }
    } catch (error) {
        console.error("AI Simulation Error:", error);
        console.error("Error details:", error.message);
        if (error.response) {
            console.error("API Response:", error.response.data);
        }
        throw new Error("Failed to generate AI simulation.");
    }
};

const chatWithTwin = async (message, twinProfile, userMetrics) => {
    const provider = process.env.AI_PROVIDER || 'gemini';
    console.log(`[AI Service] Using provider: ${provider}`);

    const systemPrompt = `
    You are a digital twin of the user. 
    Personality Traits:
    - Analytical: ${twinProfile?.personality?.analytical || 50}%
    - Creative: ${twinProfile?.personality?.creative || 50}%
    - Empathetic: ${twinProfile?.personality?.empathetic || 50}%
    - Adventurous: ${twinProfile?.personality?.adventurous || 50}%
    - Organized: ${twinProfile?.personality?.organized || 50}%
    - Social: ${twinProfile?.personality?.social || 50}%

    Recent Health Metrics:
    - Stress Level: ${userMetrics?.stressLevel || 'Unknown'}
    - Mood: ${userMetrics?.moodScore || 'Neutral'}

    User Message: "${message}"

    Respond naturally as the user's digital twin. Be helpful, empathetic, and reflective of the user's personality. Keep response concise (under 100 words).
    `;

    try {
        if (provider === 'openai') {
            console.log('[AI Service] Calling OpenAI...');
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a helpful AI digital twin." },
                    { role: "user", content: systemPrompt }
                ],
                model: "gpt-4o-mini",
            });
            return completion.choices[0].message.content;

        } else {
            // Gemini via direct REST API (more reliable than SDK for model aliases)
            const API_KEY = process.env.GEMINI_API_KEY;
            const MODEL = "gemini-flash-latest";
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

            const payload = {
                contents: [{
                    parts: [{ text: systemPrompt }]
                }]
            };

            const response = await axios.post(url, payload);
            console.log('[AI Service] Gemini response received');
            return response.data.candidates[0].content.parts[0].text;
        }
    } catch (error) {
        console.error("=== AI Chat Error ===");
        console.error("Error message:", error.message);
        if (error.response) {
            console.error("API Response status:", error.response.status);
            console.error("API Response data:", JSON.stringify(error.response.data, null, 2));

            const status = error.response.status;
            const message = error.response.data?.error?.message || "AI Service Error";

            const err = new Error(status === 429 ? "AI rate limit exceeded. Please wait a moment." : message);
            err.status = status;
            throw err;
        }
        console.error("===================");
        throw new Error("Failed to generate AI response.");
    }
};

module.exports = { runSimulation, chatWithTwin };

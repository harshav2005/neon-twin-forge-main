const { OpenAI } = require('openai');
const axios = require('axios');
require('dotenv').config();

/**
 * Deterministic local embedding (128-dimensional hash-based).
 * Used as fallback when no API key is configured or API call fails.
 * Consistent — same text always produces the same vector.
 */
const generateLocalEmbedding = (text) => {
    const dim = 128;
    const vec = new Array(dim).fill(0);
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);

    for (const word of words) {
        if (!word) continue;
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
            hash = ((hash << 5) - hash) + word.charCodeAt(i);
            hash |= 0;
        }
        const idx = Math.abs(hash) % dim;
        vec[idx] += 1;
    }

    // L2 normalize the vector
    let norm = 0;
    for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
    if (norm > 0) {
        const mag = Math.sqrt(norm);
        for (let i = 0; i < dim; i++) vec[i] /= mag;
    }
    return vec;
};

/**
 * Generates an embedding for a given text string.
 * Provider priority: gemini → openai → local fallback.
 * Always falls back to deterministic local embedding on any error.
 */
const generateEmbedding = async (text) => {
    if (!text || text.trim().length === 0) {
        return generateLocalEmbedding('empty');
    }

    const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // ── Try Gemini embeddings ────────────────────────────────────────────────
    if (provider === 'gemini' && geminiKey) {
        try {
            const model = 'gemini-embedding-001';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${geminiKey}`;
            const response = await axios.post(url, {
                model: `models/${model}`,
                content: { parts: [{ text }] }
            });
            const values = response.data?.embedding?.values;
            if (values && values.length > 0) return values;
        } catch (err) {
            console.warn('[Embedding] Gemini embedding failed, using local fallback:', err.message);
        }
    }

    // ── Try OpenAI embeddings ────────────────────────────────────────────────
    if (provider === 'openai' && openaiKey) {
        try {
            const openai = new OpenAI({ apiKey: openaiKey });
            const response = await openai.embeddings.create({
                model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
                input: text,
            });
            return response.data[0].embedding;
        } catch (err) {
            console.warn('[Embedding] OpenAI embedding failed, using local fallback:', err.message);
        }
    }

    // ── Local deterministic fallback (always works offline) ─────────────────
    console.log('[Embedding] Using local deterministic embedding.');
    return generateLocalEmbedding(text);
};

module.exports = { generateEmbedding, generateLocalEmbedding };

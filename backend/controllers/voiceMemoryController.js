const axios = require('axios');
const Memory = require('../models/Memory');
const { generateEmbedding } = require('../services/embeddingService');

/**
 * Saves voice transcript as a memory and generates an AI summary.
 */
const saveVoiceMemory = async (req, res) => {
    try {
        const { transcript } = req.body;
        const userId = req.user?.id || req.body.userId || req.query.userId;

        if (!transcript || !transcript.trim()) {
            return res.status(400).json({ error: 'Transcript is required' });
        }

        const cleanTranscript = transcript.trim();
        const geminiKey = process.env.GEMINI_API_KEY;

        // 1. Generate AI Summary/Analysis using Gemini
        let analyzedSummary = cleanTranscript;
        let title = "Voice Recording";
        let possibleIntent = "other";

        if (geminiKey) {
            try {
                const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
                const prompt = `Analyze this voice transcript from a user speaking to their Digital Twin assistant.

Transcript: ${JSON.stringify(cleanTranscript)}

Return a JSON object with ONLY these fields:
{
  "title": "Short 4-6 word title for this voice note",
  "summary": "One clear sentence summarizing what the user said",
  "possibleIntent": "one of: goal / reminder / personal thought / idea / stress / plan / preference"
}

Return ONLY valid JSON. No markdown, no extra text.`;

                const response = await axios.post(url, {
                    contents: [{ parts: [{ text: prompt }] }]
                }, { timeout: 15000 });

                const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (aiText) {
                    const cleaned = aiText.replace(/```json|```/g, '').trim();
                    const analysis = JSON.parse(cleaned);
                    analyzedSummary = analysis.summary || analyzedSummary;
                    title = analysis.title || title;
                    possibleIntent = analysis.possibleIntent || "other";
                }
                console.log(`[Voice] Gemini analysis complete: "${title}"`);
            } catch (e) {
                console.warn('[Voice Analysis Error]', e.message);
                // Fall back to using the raw transcript as summary
            }
        } else {
            console.warn('[Voice] No GEMINI_API_KEY — skipping AI analysis, using raw transcript.');
        }

        // 2. Generate Embedding
        let embedding;
        try {
            embedding = await generateEmbedding(cleanTranscript);
        } catch (e) {
            console.error('[Voice Embedding Error]', e.message);
            return res.status(500).json({ error: 'Failed to generate embedding for voice memory' });
        }

        // 3. Save to Memory
        const memory = await Memory.create({
            userId: String(userId),
            originalText: cleanTranscript,
            analyzedSummary,
            category: 'voice_memory',
            importance: 7,
            embedding,
            source: 'voice_recording'
        });

        console.log(`[Voice] Memory saved: ${memory._id} for user ${userId}`);

        res.status(201).json({
            message: 'Voice memory saved',
            memory: {
                ...memory.toObject(),
                title,
                possibleIntent
            }
        });
    } catch (error) {
        console.error('[Voice Memory Save Error]', error.message, error.stack);
        res.status(500).json({ error: 'Failed to save voice memory: ' + error.message });
    }
};

/**
 * Fetches user's voice memories.
 */
const getVoiceMemories = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId || req.query.userId;

        const memories = await Memory.find({ userId: String(userId), source: 'voice_recording' })
            .sort({ createdAt: -1 })
            .lean();
        
        console.log(`[Voice] Fetched ${memories.length} voice memories for user ${userId}`);
        res.json(memories);
    } catch (error) {
        console.error('[Voice Fetch Error]', error.message);
        res.status(500).json({ error: 'Failed to fetch voice memories' });
    }
};

/**
 * Deletes a voice memory.
 */
const deleteVoiceMemory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || req.body.userId || req.query.userId;

        const result = await Memory.findOneAndDelete({ _id: id, userId: String(userId) });
        if (!result) {
            return res.status(404).json({ error: 'Voice memory not found' });
        }
        
        console.log(`[Voice] Deleted memory ${id} for user ${userId}`);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('[Voice Delete Error]', error.message);
        res.status(500).json({ error: 'Deletion failed' });
    }
};

module.exports = {
    saveVoiceMemory,
    getVoiceMemories,
    deleteVoiceMemory
};

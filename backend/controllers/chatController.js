const TwinProfile = require('../models/TwinProfile');
const Metrics = require('../models/Metrics');
const Memory = require('../models/Memory');
const { generateEmbedding } = require('../services/embeddingService');
const { findSimilarMemories = () => [] } = require('../services/vectorSearchService');
const { generateChatResponse, detectIntent } = require('../services/aiService');
const { processAndSaveMemories } = require('../services/memoryService');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// ── Category-Specific Memory Fetcher ──────────────────────────────────────────
/**
 * For direct personal questions, fetch memories by exact category first.
 * This is MORE reliable than vector search for questions like "what are my goals?"
 */
async function getProfileMemories(userId, userMessage) {
    const lower = userMessage.toLowerCase();
    const uid = String(userId);

    // Category-specific keyword matching
    if (lower.includes('goal') || lower.includes('career') || lower.includes('ambition') || lower.includes('aspir')) {
        const memories = await Memory.find({ userId: uid, category: 'goals' }).lean();
        if (memories.length > 0) {
            console.log(`[Chat] Category match: goals → ${memories.length} memories found`);
            return memories;
        }
    }

    if (lower.includes('stress') || lower.includes('anxious') || lower.includes('anxiety') || lower.includes('trigger') || lower.includes('worried')) {
        const memories = await Memory.find({ userId: uid, category: 'stress_triggers' }).lean();
        if (memories.length > 0) {
            console.log(`[Chat] Category match: stress_triggers → ${memories.length} memories found`);
            return memories;
        }
    }

    if (lower.includes('motivat') || lower.includes('inspire') || lower.includes('drive') || lower.includes('passion')) {
        const memories = await Memory.find({ userId: uid, category: 'motivation' }).lean();
        if (memories.length > 0) {
            console.log(`[Chat] Category match: motivation → ${memories.length} memories found`);
            return memories;
        }
    }

    if (lower.includes('advice') || lower.includes('guide') || lower.includes('step by step') || lower.includes('how should') || lower.includes('coaching')) {
        const memories = await Memory.find({ userId: uid, category: 'advice_style' }).lean();
        if (memories.length > 0) {
            console.log(`[Chat] Category match: advice_style → ${memories.length} memories found`);
            return memories;
        }
    }

    if (lower.includes('personality') || lower.includes('about me') || lower.includes('about myself') || lower.includes('who am i') || lower.includes('trait')) {
        const memories = await Memory.find({ userId: uid, category: { $in: ['personality_summary', 'traits'] } }).lean();
        if (memories.length > 0) {
            console.log(`[Chat] Category match: personality/traits → ${memories.length} memories found`);
            return memories;
        }
    }

    if (lower.includes('communication') || lower.includes('how do i talk') || lower.includes('speaking style')) {
        const memories = await Memory.find({ userId: uid, category: 'communication_style' }).lean();
        if (memories.length > 0) {
            console.log(`[Chat] Category match: communication_style → ${memories.length} memories found`);
            return memories;
        }
    }

    // Broad personal queries — fetch all memories
    if (
        lower.includes('what do you know') ||
        lower.includes('tell me about') ||
        lower.includes('focus on') ||
        lower.includes('based on me') ||
        lower.includes('based on my') ||
        lower.includes('my profile') ||
        lower.includes('my strength') ||
        lower.includes('my weakness') ||
        lower.includes('improve') ||
        lower.includes('my plan') ||
        lower.includes('my progress')
    ) {
        const memories = await Memory.find({ userId: uid })
            .sort({ importance: -1, createdAt: -1 })
            .limit(20)
            .lean();
        console.log(`[Chat] Broad personal fetch → ${memories.length} memories found`);
        return memories;
    }

    // No specific category match — return null to fall through to generic flow
    return null;
}

/**
 * Handles RAG-enabled chat message with intent-aware memory retrieval.
 */
const sendChatMessage = async (req, res) => {
    try {
        console.log("====== CHAT API HIT ======");
        console.log("Body:", JSON.stringify(req.body).substring(0, 300));

        const { message, sessionId } = req.body;
        const userId = req.user?.id || req.body.userId || req.query.userId;

        console.log("Chat userId:", userId);
        console.log("User message:", message);

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // 1. Fetch user profile (no populate — user is a String field)
        let profile = null;
        try {
            profile = await TwinProfile.findOne({ user: userId });
        } catch (e) {
            console.warn('[Chat] TwinProfile fetch failed:', e.message);
        }
        if (!profile) {
            try {
                profile = await TwinProfile.create({
                    user: userId,
                    personality: { analytical: 60, creative: 60, empathetic: 60, organized: 60, adventurous: 50 },
                    tonePreference: 'supportive and practical',
                    communicationStyle: 'simple, clear, and structured',
                    memoryEnabled: true
                });
            } catch (e) {
                console.warn('[Chat] TwinProfile create failed:', e.message);
                profile = { memoryEnabled: true, communicationStyle: 'simple, practical, step-by-step' };
            }
        }

        // 2. Detect intent BEFORE retrieval to decide memory strategy
        const intent = detectIntent(message);
        console.log("Detected intent:", intent);

        let retrievedMemories = [];
        let allMemories = [];
        let adviceStyle = profile.communicationStyle || 'simple, practical, step-by-step';

        // 3. Fetch memories based on intent
        console.log("Chat retrieving memories for userId:", userId);
        if (intent === 'PERSONAL_MEMORY') {
            try {
                // FIRST: Try category-specific fetch (most reliable for direct questions)
                const categoryMemories = await getProfileMemories(userId, message);

                if (categoryMemories && categoryMemories.length > 0) {
                    allMemories = categoryMemories;
                    console.log(`[Chat] Category-specific fetch: ${allMemories.length} memories`);
                    console.log(`[Chat] Categories found: ${[...new Set(allMemories.map(m => m.category))].join(', ')}`);
                } else {
                    // FALLBACK: Fetch ALL memories for personal questions
                    const rawMemories = await Memory.find({ userId: String(userId) })
                        .sort({ importance: -1, createdAt: -1 })
                        .limit(20)
                        .lean();
                    allMemories = rawMemories;
                    console.log(`[Chat] Broad fallback fetch: ${allMemories.length} memories`);
                }

                // Also fetch advice style for response formatting
                if (!allMemories.some(m => m.category === 'advice_style')) {
                    const adviceMemory = await Memory.findOne({ userId: String(userId), category: 'advice_style' }).lean();
                    if (adviceMemory) {
                        adviceStyle = adviceMemory.analyzedSummary || adviceMemory.originalText || adviceStyle;
                        allMemories.push(adviceMemory);
                    }
                }
            } catch (memoryError) {
                console.error("Memory fetch failed:", memoryError.message);
                allMemories = [];
            }

            console.log("Fetched memories:", allMemories.length);
        } else {
            // For technical/mixed: use RAG vector search for relevant subset
            try {
                const queryEmbedding = await generateEmbedding(message);
                retrievedMemories = await findSimilarMemories(userId, queryEmbedding, 4, 0.45);
                console.log(`[Chat] Vector search returned: ${retrievedMemories.length} memories`);
            } catch (e) {
                console.warn('[Chat] Vector search failed, proceeding without memories:', e.message);
            }

            // Also try to get advice style from memory
            try {
                const adviceMemory = await Memory.findOne({ userId: String(userId), category: 'advice_style' }).lean();
                if (adviceMemory) {
                    adviceStyle = adviceMemory.analyzedSummary || adviceMemory.originalText || adviceStyle;
                }
            } catch (e) { /* ignore */ }
        }

        // 4. Generate response
        const aiReply = await generateChatResponse({
            message,
            retrievedMemories,
            allMemories,
            adviceStyle,
            intent
        });

        console.log("[Chat] AI reply generated, length:", aiReply?.length);

        // 5. Persist conversation (wrapped in try/catch — should NOT crash the chat)
        let conversationId = sessionId || null;
        try {
            let conversation = null;
            if (sessionId) {
                conversation = await Conversation.findOne({ userId, _id: sessionId }).catch(() => null);
            }
            if (!conversation) {
                conversation = await Conversation.create({
                    userId,
                    title: message.substring(0, 40) + '...',
                    messages: []
                });
            }
            conversation.messages.push({ role: 'user', content: message, inputType: 'text' });
            conversation.messages.push({ role: 'assistant', content: aiReply, inputType: 'text' });
            await conversation.save();
            conversationId = conversation._id.toString();

            // Legacy message save
            await Message.create({ user: userId, sender: 'user', text: message, sessionId: conversationId });
            await Message.create({ user: userId, sender: 'twin', text: aiReply, sessionId: conversationId, emotion: 'thoughtful' });
        } catch (persistError) {
            console.error('[Chat] Conversation persistence failed (non-fatal):', persistError.message);
        }

        // 6. Background memory extraction (only for personal chats)
        if (profile.memoryEnabled) {
            processAndSaveMemories(userId, message, aiReply).catch(e => console.warn('[Memory Save]', e.message));
        }

        res.json({
            response: aiReply,
            emotion: 'thoughtful',
            intent,
            sessionId: conversationId
        });

    } catch (error) {
        console.error('[Chat Controller Error]', error.message, error.stack);
        res.status(500).json({ error: 'Failed to process chat message.' });
    }
};

// ── Chat History ──────────────────────────────────────────────────────────────
const getChatHistory = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId || req.query.userId;
        const { sessionId } = req.query;
        let messages;
        if (sessionId) {
            const conv = await Conversation.findOne({ userId, _id: sessionId }).lean();
            messages = (conv?.messages || []).map(m => ({
                _id: m._id, sender: m.role === 'assistant' ? 'twin' : 'user',
                text: m.content, timestamp: m.createdAt || new Date(), emotion: 'thoughtful'
            }));
        } else {
            messages = await Message.find({ user: userId }).sort({ createdAt: 1 }).limit(50).lean();
        }
        res.json(messages);
    } catch (error) {
        console.error('[Chat History Error]', error.message);
        res.status(500).json({ error: 'Failed to fetch chat history.' });
    }
};

const clearChatHistory = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId || req.query.userId;
        const { sessionId } = req.body;
        if (sessionId) {
            await Conversation.findOneAndDelete({ userId, _id: sessionId });
        } else {
            await Message.deleteMany({ user: userId });
        }
        res.json({ message: 'Chat history cleared.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear history.' });
    }
};

const getSessions = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId || req.query.userId;
        const sessions = await Conversation.find({ userId }).sort({ updatedAt: -1 }).limit(20).lean();
        res.json(sessions.map(s => ({ _id: s._id, title: s.title, updatedAt: s.updatedAt })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions.' });
    }
};

module.exports = { sendChatMessage, getChatHistory, clearChatHistory, getSessions };

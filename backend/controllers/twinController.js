const TwinProfile = require('../models/TwinProfile');
const Memory = require('../models/Memory');
const { analyzeTwinProfile, extractMemoriesFromOnboarding } = require('../services/aiService');
const { saveOnboardingMemories } = require('../services/memoryService');
const { generateEmbedding } = require('../services/embeddingService');

/**
 * POST /api/twin/analyze
 * Analyzes onboarding form answers and returns:
 *   - Calibrated twin profile (personality traits, goals, etc.)
 *   - Preview of memories that WILL be saved (not persisted yet)
 * This is a preview-only call — nothing is written to DB here.
 */
const analyzeTwin = async (req, res) => {
    try {
        const { answers, transcript, text } = req.body;

        // Support both new structured format { answers[] } and legacy { text } format
        let inputText = text || '';
        let structuredAnswers = [];

        if (answers && Array.isArray(answers) && answers.length > 0) {
            structuredAnswers = answers.filter(a => a.answer && a.answer.trim());
            inputText = structuredAnswers.map(a => a.answer).join('. ');
        }
        if (transcript) inputText = (inputText + ' ' + transcript).trim();

        if (!inputText) {
            return res.status(400).json({ error: 'Please provide answers or transcript for analysis.' });
        }

        // 1. Analyze personality profile
        const profile = await analyzeTwinProfile(inputText);

        // 2. Extract memory preview (no DB write yet)
        const extractedMemories = await extractMemoriesFromOnboarding(structuredAnswers, transcript || '');

        res.json({
            profile,
            extractedMemories
        });

    } catch (error) {
        console.error('[Twin Analyze Error]', error.message);
        res.status(500).json({ error: 'Profile calibration failed. Please try again.' });
    }
};

/**
 * GET /api/twin/profile
 * Get or create the user's twin profile.
 */
const getTwinProfile = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId || req.query.userId;
        let profile = await TwinProfile.findOne({ user: userId });
        if (!profile) {
            profile = await TwinProfile.create({ user: userId });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch twin profile.' });
    }
};

/**
 * PUT /api/twin/update
 * Saves/updates the twin profile AND persists onboarding memories.
 */
const updateTwinProfile = async (req, res) => {
    try {
        const {
            personality, tonePreference, goals, stressTriggers,
            communicationStyle, summary, memoryEnabled, status,
            answers, transcript
        } = req.body;
        const userId = req.user?.id || req.body.userId || req.query.userId;

        // Build the profile update payload
        const updatePayload = {};
        if (personality !== undefined) updatePayload.personality = personality;
        if (tonePreference !== undefined) updatePayload.tonePreference = tonePreference;
        if (goals !== undefined) updatePayload.goals = Array.isArray(goals) ? goals : [goals].filter(Boolean);
        if (stressTriggers !== undefined) updatePayload.stressTriggers = Array.isArray(stressTriggers) ? stressTriggers : [stressTriggers].filter(Boolean);
        if (communicationStyle !== undefined) updatePayload.communicationStyle = communicationStyle;
        if (summary !== undefined) updatePayload.summary = summary;
        if (memoryEnabled !== undefined) updatePayload.memoryEnabled = memoryEnabled;
        if (status !== undefined) updatePayload.status = status;
        updatePayload.lastTrained = new Date();

        // 1. Save/update TwinProfile
        const profile = await TwinProfile.findOneAndUpdate(
            { user: userId },
            { $set: updatePayload },
            { new: true, upsert: true }
        );

        // 2. Persist onboarding memories (if memory is enabled and answers provided)
        let memorySummary = { saved: 0, updated: 0, skipped: 0 };
        let savedMemories = [];

        const hasAnswers = answers && Array.isArray(answers) && answers.some(a => a.answer && a.answer.trim());
        const hasTranscript = transcript && transcript.trim().length > 5;

        if (profile.memoryEnabled && (hasAnswers || hasTranscript)) {
            const extractedMemories = await extractMemoriesFromOnboarding(answers || [], transcript || '');
            if (extractedMemories.length > 0) {
                const result = await saveOnboardingMemories(userId, extractedMemories);
                memorySummary = { saved: result.saved, updated: result.updated, skipped: result.skipped };
                savedMemories = result.memories || [];
            }
        }

        res.json({
            profile,
            savedMemories,
            memorySummary,
            message: profile.memoryEnabled
                ? `Twin profile personalized and ${memorySummary.saved} long-term memories saved (${memorySummary.updated} updated).`
                : 'Twin profile personalized. Memory is disabled — answers were not saved as long-term memories.'
        });

    } catch (error) {
        console.error('[Twin Update Error]', error.message);
        res.status(500).json({ error: 'Failed to update twin profile.' });
    }
};

/**
 * Maps structured answers array [{question, answer}] to category-based memory objects.
 * The frontend sends 5 questions in order:
 *   0: goals, 1: stress, 2: advice style, 3: motivation, 4: stress handling
 */
function mapAnswersToMemories(userId, answersArray, analyzedProfile) {
    // Question keyword → category mapping
    const QUESTION_CATEGORY_MAP = [
        { keywords: ['goal'], category: 'goals', importance: 9, fallbackSummary: 'User wants to improve step by step, learn useful skills, become confident, make better decisions, manage time, and build a stable career.' },
        { keywords: ['anxious', 'stressed', 'stress'], category: 'stress_triggers', importance: 9, fallbackSummary: 'User feels stressed by too many tasks, close deadlines, uncertainty, and feeling unprepared.' },
        { keywords: ['advice', 'prefer'], category: 'advice_style', importance: 10, fallbackSummary: 'User prefers simple, clear, practical, step-by-step advice with examples and direct next actions.' },
        { keywords: ['motivat', 'inspir'], category: 'motivation', importance: 8, fallbackSummary: 'User is motivated by progress, completing small tasks, learning new things, growth, discipline, creativity, and success stories.' },
        { keywords: ['handle', 'difficult', 'coping'], category: 'coping_style', importance: 8, fallbackSummary: 'User handles stress by staying calm, breaking problems into smaller parts, taking breaks, asking for help, and continuing with clarity.' }
    ];

    const memories = [];

    for (const item of answersArray) {
        if (!item.answer || !item.answer.trim()) continue;

        const questionLower = item.question.toLowerCase();
        let matched = QUESTION_CATEGORY_MAP.find(m => m.keywords.some(kw => questionLower.includes(kw)));

        if (!matched) {
            matched = { category: 'other', importance: 6, fallbackSummary: item.answer };
        }

        // Build analyzed summary from profile data or use the answer itself
        let analyzedSummary = item.answer;
        if (matched.category === 'goals' && analyzedProfile.goals) {
            analyzedSummary = Array.isArray(analyzedProfile.goals) ? analyzedProfile.goals.join(', ') : analyzedProfile.goals;
        } else if (matched.category === 'stress_triggers' && analyzedProfile.stressTriggers) {
            analyzedSummary = Array.isArray(analyzedProfile.stressTriggers) ? analyzedProfile.stressTriggers.join(', ') : analyzedProfile.stressTriggers;
        } else if (matched.category === 'advice_style' && analyzedProfile.adviceStyle) {
            analyzedSummary = analyzedProfile.adviceStyle;
        } else if (matched.category === 'motivation' && analyzedProfile.motivationPattern) {
            analyzedSummary = analyzedProfile.motivationPattern;
        } else if (matched.category === 'coping_style') {
            analyzedSummary = item.answer;
        }

        memories.push({
            userId,
            category: matched.category,
            originalText: item.answer.trim(),
            analyzedSummary: analyzedSummary || matched.fallbackSummary,
            source: 'twin_builder',
            importance: matched.importance,
            embedding: []
        });
    }

    return memories;
}

/**
 * POST /api/twin/initialize
 * Purpose: Receive twin builder answers, analyze them,
 * save memories if longTermMemory is true, and return analyzed twin identity summary.
 * Uses direct Memory.insertMany for guaranteed saves.
 */
const initializeTwin = async (req, res) => {
    try {
        const { answers, transcript, longTermMemory } = req.body;
        const userId = req.user?.id || req.body.userId || req.query.userId;

        console.log("====== TWIN INITIALIZE API HIT ======");
        console.log("Body:", JSON.stringify(req.body).substring(0, 500));
        console.log("User ID:", userId);
        console.log("Long term memory:", longTermMemory);
        console.log("Answers:", answers);

        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ error: "Answers are required for initialization." });
        }

        // Filter out empty answers
        const validAnswers = answers.filter(a => a.answer && a.answer.trim().length > 0);
        if (validAnswers.length === 0) {
            return res.status(400).json({ error: "Answers cannot be empty." });
        }

        // Combine all answers into one text for global profile analysis
        const inputText = validAnswers.map(a => a.answer).join('. ') + (transcript ? ' ' + transcript : '');

        // 1. Analyze the global twin profile summary
        const analyzedProfile = await analyzeTwinProfile(inputText);
        console.log("Analyzed profile:", analyzedProfile);

        let savedMemories = [];

        // 2. Save memories directly if long-term memory is enabled
        if (longTermMemory === true) {
            // Delete previous twin_builder memories for this user (fresh start)
            await Memory.deleteMany({ userId, source: 'twin_builder' });
            console.log("Cleared previous twin_builder memories for user:", userId);

            // Map structured answers to category-based memory objects
            const memoriesToSave = mapAnswersToMemories(userId, validAnswers, analyzedProfile);
            console.log("Saving Twin Builder memory for user:", userId);
            console.log("Memories to save:", memoriesToSave.length);

            // Generate embeddings for each memory (don't block save on failure)
            for (const mem of memoriesToSave) {
                try {
                    mem.embedding = await generateEmbedding(mem.analyzedSummary || mem.originalText);
                } catch (err) {
                    console.error("Embedding failed, saving without vector:", err.message);
                    mem.embedding = [];
                }
            }

            // Direct insert — guaranteed to work
            savedMemories = await Memory.insertMany(memoriesToSave);
            console.log("Saved memories count:", savedMemories.length);

            // Update user's TwinProfile with analyzed traits
            await TwinProfile.findOneAndUpdate(
                { user: userId },
                {
                    $set: {
                        personality: analyzedProfile.traits || analyzedProfile,
                        communicationStyle: analyzedProfile.communicationStyle,
                        goals: analyzedProfile.goals,
                        stressTriggers: analyzedProfile.stressTriggers,
                        summary: analyzedProfile.personalitySummary,
                        memoryEnabled: true,
                        lastTrained: new Date()
                    }
                },
                { new: true, upsert: true }
            );
        } else {
            // Update profile but disable memory
            await TwinProfile.findOneAndUpdate(
                { user: userId },
                { $set: { memoryEnabled: false } },
                { new: true, upsert: true }
            );
        }

        return res.json({
            success: true,
            message: longTermMemory
                ? "Digital Twin initialized and saved to long-term memory."
                : "Digital Twin initialized for this session only.",
            profile: analyzedProfile,
            savedMemories,
            savedCount: savedMemories.length,
            memorySummary: { saved: savedMemories.length, updated: 0, skipped: 0 }
        });

    } catch (error) {
        console.error('[Twin Initialize Error]', error.message, error.stack);
        res.status(500).json({ error: 'Failed to initialize digital twin.' });
    }
};

module.exports = { analyzeTwin, getTwinProfile, updateTwinProfile, initializeTwin };

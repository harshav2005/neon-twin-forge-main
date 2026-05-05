const Memory = require('../models/Memory');
const TwinProfile = require('../models/TwinProfile');
const { generateEmbedding } = require('./embeddingService');
const { extractMemoriesFromConversation } = require('./aiService');
const { cosineSimilarity } = require('../utils/cosineSimilarity');

/**
 * Saves or deduplicates a single memory document for a user.
 * Checks for exact duplicates based on userId + category + source.
 */
const saveOrUpdateMemory = async (userId, memData) => {
    // Determine the text to embed: prefer analyzedSummary, fallback to originalText
    const textToEmbed = memData.analyzedSummary || memData.originalText || memData.memoryText || 'empty';
    let embedding = [];
    try {
        embedding = await generateEmbedding(textToEmbed);
    } catch (err) {
        console.error("Embedding failed, saving without vector:", err.message);
        embedding = [];
    }
    
    // Check for duplicate based on userId, category, and source
    const existing = await Memory.findOne({ 
        userId, 
        category: memData.category || 'other',
        source: memData.source || 'twin_builder'
    });

    if (existing) {
        // Update existing memory
        existing.originalText = memData.originalText || memData.memoryText || existing.originalText;
        existing.analyzedSummary = memData.analyzedSummary || existing.analyzedSummary;
        existing.importance = Math.max(memData.importance || 5, existing.importance || 5);
        existing.embedding = embedding;
        existing.lastUsedAt = new Date();
        await existing.save();
        return { action: 'updated', memory: existing };
    }

    // Create new memory
    const newMemory = await Memory.create({
        userId,
        originalText: memData.originalText || memData.memoryText || '',
        analyzedSummary: memData.analyzedSummary || '',
        category: memData.category || 'other',
        importance: memData.importance || 5,
        embedding,
        source: memData.source || 'twin_builder',
        lastUsedAt: new Date()
    });
    
    return { action: 'created', memory: newMemory };
};

/**
 * Saves onboarding form memories to the Memory collection.
 * Runs deduplication against existing memories.
 * Returns counts: { saved, updated, skipped }
 */
const saveOnboardingMemories = async (userId, rawMemories) => {
    const result = { saved: 0, updated: 0, skipped: 0, memories: [] };

    for (const memData of rawMemories) {
        if (!memData.analyzedSummary && !memData.originalText && !memData.memoryText) {
            result.skipped++;
            continue;
        }

        try {
            const outcome = await saveOrUpdateMemory(userId, {
                ...memData,
                source: 'twin_builder'
            });
            if (outcome.action === 'created') result.saved++;
            else result.updated++;
            result.memories.push(outcome.memory);
        } catch (err) {
            console.error('[MemoryService] Failed to save onboarding memory:', err.message);
            result.skipped++;
        }
    }

    return result;
};

/**
 * Processes and saves memories from a chat conversation exchange.
 * (Existing functionality — kept intact)
 */
const processAndSaveMemories = async (userId, userMsg, aiReply) => {
    try {
        const profile = await TwinProfile.findOne({ user: userId });
        if (!profile || !profile.memoryEnabled) {
            return { saved: 0, skipped: 'Memory disabled or profile missing' };
        }

        const extraction = await extractMemoriesFromConversation(userMsg, aiReply);
        if (!extraction.shouldSave || !extraction.memories.length) return { saved: 0 };

        let savedCount = 0;
        let updatedCount = 0;

        for (const memData of extraction.memories) {
            try {
                const outcome = await saveOrUpdateMemory(userId, {
                    ...memData,
                    source: 'chat'
                });
                if (outcome.action === 'created') savedCount++;
                else updatedCount++;
            } catch (err) {
                console.error('[MemoryService] Chat memory save error:', err.message);
            }
        }

        return { saved: savedCount, updated: updatedCount };
    } catch (error) {
        console.error('[Memory Service Error]', error.message);
        return { error: error.message };
    }
};

module.exports = { processAndSaveMemories, saveOnboardingMemories, saveOrUpdateMemory };

const Memory = require('../models/Memory');
const { generateEmbedding } = require('../services/embeddingService');
const { findSimilarMemories } = require('../services/vectorSearchService');

const getMemories = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId || req.query.userId;
        const memories = await Memory.find({ userId }).sort({ createdAt: -1 });
        console.log("Fetching memories for user:", userId);
        console.log("Fetched memory count:", memories.length);
        res.json(memories);
    } catch (error) {
        console.error("[Memory Fetch Error]", error.message);
        res.status(500).json({ error: "Failed to fetch memories." });
    }
};

const searchMemories = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: "Query is required" });
        const userId = req.user?.id || req.body.userId || req.query.userId;
        const queryEmbedding = await generateEmbedding(query);
        const results = await findSimilarMemories(userId, queryEmbedding, 5, 0.5);
        res.json(results);
    } catch (error) {
        console.error("[Memory Search Error]", error);
        res.status(500).json({ error: "Failed to search memories." });
    }
};

const saveManualMemory = async (req, res) => {
    try {
        const { originalText, analyzedSummary, category, importance } = req.body;
        const textToEmbed = analyzedSummary || originalText || '';
        const embedding = await generateEmbedding(textToEmbed);
        const userId = req.user?.id || req.body.userId || req.query.userId;
        console.log("Saving memory for userId:", userId);
        
        const memory = await Memory.create({
            userId,
            originalText,
            analyzedSummary,
            category,
            importance,
            embedding
        });
        
        res.status(201).json(memory);
    } catch (error) {
        res.status(500).json({ error: "Failed to save memory." });
    }
};

const updateMemory = async (req, res) => {
    try {
        const { originalText, analyzedSummary, category, importance } = req.body;
        const userId = req.user?.id || req.body.userId || req.query.userId;
        
        const updateData = { category, importance };
        
        // If text changed, update embedding
        if (analyzedSummary || originalText) {
            if (originalText) updateData.originalText = originalText;
            if (analyzedSummary) updateData.analyzedSummary = analyzedSummary;
            const textToEmbed = analyzedSummary || originalText;
            updateData.embedding = await generateEmbedding(textToEmbed);
        }

        const memory = await Memory.findOneAndUpdate(
            { _id: req.params.id, userId },
            { $set: updateData },
            { new: true }
        );
        
        if (!memory) return res.status(404).json({ error: "Memory not found." });
        res.json(memory);
    } catch (error) {
        res.status(500).json({ error: "Failed to update memory." });
    }
};

const deleteMemory = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId || req.query.userId;
        const memory = await Memory.deleteOne({ _id: req.params.id, userId });
        if (!memory) return res.status(404).json({ error: "Memory not found." });
        res.json({ message: "Memory deleted." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete memory." });
    }
};

const clearAllMemories = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId || req.query.userId;
        await Memory.deleteMany({ userId });
        res.json({ message: "All memories cleared." });
    } catch (error) {
        res.status(500).json({ error: "Failed to clear memories." });
    }
};

module.exports = { getMemories, searchMemories, saveManualMemory, updateMemory, deleteMemory, clearAllMemories };

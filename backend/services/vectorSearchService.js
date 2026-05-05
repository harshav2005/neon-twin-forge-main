const Memory = require('../models/Memory');
const { cosineSimilarity } = require('../utils/cosineSimilarity');

/**
 * Searches for relevant memories using vector similarity.
 * Attempts MongoDB Atlas Vector Search if available, otherwise falls back to local cosine similarity.
 */
const findSimilarMemories = async (userId, queryEmbedding, limit = 5, threshold = 0.7) => {
    try {
        // 1. Try MongoDB Atlas Vector Search (requires 'vector_index' on Memory collection)
        // This will fail on local MongoDB or without specific index, so we catch and fallback
        try {
            const atlasResults = await Memory.aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index", 
                        path: "embedding",
                        queryVector: queryEmbedding,
                        numCandidates: limit * 10,
                        limit: limit
                    }
                },
                {
                    $match: { userId: userId }
                },
                {
                    $project: {
                        originalText: 1,
                        analyzedSummary: 1,
                        category: 1,
                        score: { $meta: "vectorSearchScore" }
                    }
                }
            ]);

            if (atlasResults && atlasResults.length > 0) {
                return atlasResults.map(r => ({ text: r.analyzedSummary || r.originalText || r.memoryText, category: r.category, score: r.score }));
            }
        } catch (atlasError) {
            // Silently fall back to manual similarity if Atlas search is not configured
        }

        // 2. Manual Fallback (Fetch all user memories and sort by similarity)
        // Note: For a MVP/Final year project, this is fine. For millions of records, it's slow.
        const allMemories = await Memory.find({ userId: userId });
        
        const scoredMemories = allMemories.map(mem => {
            const score = cosineSimilarity(queryEmbedding, mem.embedding);
            return {
                text: mem.analyzedSummary || mem.originalText || mem.memoryText,
                category: mem.category,
                score
            };
        });

        // Filter by threshold and sort
        const results = scoredMemories
            .filter(m => m.score >= threshold)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return results;

    } catch (error) {
        console.error("[Vector Search Error]", error.message);
        return [];
    }
};

module.exports = { findSimilarMemories };

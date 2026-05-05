/**
 * Assembles a hyper-personalized RAG prompt data object for the Digital Twin.
 * Includes all profile fields so the AI can answer personal questions from memory.
 */
const buildTwinPromptData = ({ profile, retrievedMemories, message, metrics }) => {
    return {
        traits: profile?.personality || {},
        tonePreference: profile?.tonePreference || 'supportive and balanced',
        communicationStyle: profile?.communicationStyle || 'reflective',
        goals: profile?.goals || [],
        stressTriggers: profile?.stressTriggers || [],
        summary: profile?.summary || '',
        mood: metrics?.mood || 'neutral',
        stressLevel: metrics?.stressLevel || 'normal',
        energyLevel: metrics?.energyLevel || 'moderate',
        retrievedMemories: retrievedMemories || [],
        recentMessages: [],
        message: message
    };
};

module.exports = { buildTwinPromptData };

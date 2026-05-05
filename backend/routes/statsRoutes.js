const express = require('express');
const router = express.Router();
const { getGlobalStats } = require('../services/analyticsService');

// @desc    Get Global Public Stats
// @route   GET /api/stats/global
// @access  Public
router.get('/global', async (req, res) => {
    try {
        const rawStats = await getGlobalStats();
        
        // Format for frontend HeroSection
        const formattedStats = {
            activeUsers: `${(rawStats.activeMonthlyUsers / 1000).toFixed(1)}K+`,
            twinsCreated: `${(rawStats.totalTwins / 1000).toFixed(1)}K+`,
            conversations: `${(rawStats.estimatedConversations / 1000000).toFixed(1)}M+`
        };
        
        res.json(formattedStats);
    } catch (error) {
        console.error('Error fetching public stats:', error);
        res.status(500).json({ error: "Failed to fetch stats." });
    }
});

module.exports = router;

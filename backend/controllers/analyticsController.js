const Metrics = require('../models/Metrics');
const SimulationHistory = require('../models/SimulationHistory');

// @desc    Get aggregated analytics
// @route   GET /api/metrics/analytics
// @access  Private
const getAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Get Simulation Stats
        const totalSimulations = await SimulationHistory.countDocuments({ user: userId });

        // 2. Get Mood Trends (Last 7 entries)
        const recentMetrics = await Metrics.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(7)
            .select('moodScore createdAt');

        const moodData = recentMetrics.reverse().map(m => ({
            day: new Date(m.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
            value: m.moodScore || 50 // Default to neutral if missing
        }));

        // 3. Activity Heatmap (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activity = await SimulationHistory.find({
            user: userId,
            createdAt: { $gte: thirtyDaysAgo }
        }).select('createdAt');

        // Initialize 7 days x 4 time slots grid
        const heatmap = [
            { id: "Mon", data: [{ x: "Morning", y: 0 }, { x: "Afternoon", y: 0 }, { x: "Evening", y: 0 }, { x: "Night", y: 0 }] },
            { id: "Tue", data: [{ x: "Morning", y: 0 }, { x: "Afternoon", y: 0 }, { x: "Evening", y: 0 }, { x: "Night", y: 0 }] },
            { id: "Wed", data: [{ x: "Morning", y: 0 }, { x: "Afternoon", y: 0 }, { x: "Evening", y: 0 }, { x: "Night", y: 0 }] },
            { id: "Thu", data: [{ x: "Morning", y: 0 }, { x: "Afternoon", y: 0 }, { x: "Evening", y: 0 }, { x: "Night", y: 0 }] },
            { id: "Fri", data: [{ x: "Morning", y: 0 }, { x: "Afternoon", y: 0 }, { x: "Evening", y: 0 }, { x: "Night", y: 0 }] },
            { id: "Sat", data: [{ x: "Morning", y: 0 }, { x: "Afternoon", y: 0 }, { x: "Evening", y: 0 }, { x: "Night", y: 0 }] },
            { id: "Sun", data: [{ x: "Morning", y: 0 }, { x: "Afternoon", y: 0 }, { x: "Evening", y: 0 }, { x: "Night", y: 0 }] }
        ];

        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // getDay() returns 0 for Sunday

        activity.forEach(record => {
            const date = new Date(record.createdAt);
            const dayIndex = date.getDay(); // 0-6
            // Map Sunday(0) to index 6, others to dayIndex-1? No, let's match the heatmap array directly.
            // Heatmap array is Mon(0)..Sun(6).
            // getDay() is Sun(0), Mon(1)...Sat(6).
            // We need to map getDay() to heatmap index.
            let arrayIndex = dayIndex - 1;
            if (arrayIndex < 0) arrayIndex = 6; // Sunday becomes 6

            const hour = date.getHours();
            let timeSlot = 3; // Night
            if (hour >= 6 && hour < 12) timeSlot = 0; // Morning
            else if (hour >= 12 && hour < 17) timeSlot = 1; // Afternoon
            else if (hour >= 17 && hour < 22) timeSlot = 2; // Evening

            heatmap[arrayIndex].data[timeSlot].y += 1;
        });

        res.json({
            stats: {
                totalConversations: totalSimulations,
                avgMood: 75, // Placeholder or allow calculation
                stressLevel: 'Low'
            },
            moodData,
            heatmap
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ error: "Failed to fetch analytics." });
    }
};

module.exports = { getAnalytics };

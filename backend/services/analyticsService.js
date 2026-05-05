const User = require('../models/User');
const TwinProfile = require('../models/TwinProfile');
const Metrics = require('../models/Metrics');

const getGlobalStats = async () => {
    const totalUsers = await User.countDocuments();
    const totalTwins = await TwinProfile.countDocuments();
    const estimatedConversations = totalUsers * 50; // Simple estimation as per original

    // Aggregations for more detailed analytics
    const avgStress = await Metrics.aggregate([
        { $group: { _id: null, avgStress: { $avg: "$stress" } } }
    ]);

    const activeUsersLast30Days = await Metrics.distinct("user", {
        createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
    });

    return {
        totalUsers,
        totalTwins,
        estimatedConversations,
        avgStress: avgStress[0]?.avgStress ? Math.round(avgStress[0].avgStress) : 0,
        activeMonthlyUsers: activeUsersLast30Days.length
    };
};

module.exports = { getGlobalStats };

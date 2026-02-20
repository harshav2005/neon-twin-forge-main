const User = require('../models/User');
const Twin = require('../models/Twin');
const { getGlobalStats } = require('../services/analyticsService');

// @desc    Get All Users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users." });
    }
};

// @desc    Get All Twins
// @route   GET /api/admin/twins
// @access  Private/Admin
const getAllTwins = async (req, res) => {
    try {
        const twins = await Twin.find().populate('user', 'name email').sort({ createdAt: -1 });
        // Transform for table display if needed, but returning raw objects allows frontend flexibility
        const formattedTwins = twins.map(twin => ({
            _id: twin._id,
            name: `${twin.user?.name}'s Twin` || 'Unknown Twin',
            owner: twin.user?.name || 'Unknown',
            status: twin.status,
            version: twin.version,
            createdAt: twin.createdAt
        }));
        res.json(formattedTwins);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch twins." });
    }
};

// @desc    Get Global Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const stats = await getGlobalStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch dashboard stats." });
    }
};

module.exports = {
    getAllUsers,
    getAllTwins,
    getDashboardStats
};

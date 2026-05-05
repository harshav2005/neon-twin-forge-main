const Metrics = require('../models/Metrics');

// @desc    Add new metrics
// @route   POST /api/metrics
// @access  Private
const addMetrics = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId || req.query.userId;
        const data = await Metrics.create({
            user: String(userId),
            ...req.body
        });
        res.status(201).json({ message: "Metrics saved successfully.", data });
    } catch (error) {
        res.status(500).json({ error: "Failed to save metrics." });
    }
};

// @desc    Get latest metrics
// @route   GET /api/metrics/latest
// @access  Private
const getLatestMetrics = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId || req.query.userId;
        const latest = await Metrics.findOne({ user: String(userId) }).sort({ createdAt: -1 });
        res.json(latest || {});
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch latest metrics." });
    }
};

// @desc    Get monthly metrics
// @route   GET /api/metrics/monthly
// @access  Private
const getMonthlyMetrics = async (req, res) => {
    try {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        const userId = req.user?.id || req.body.userId || req.query.userId;

        const records = await Metrics.find({
            user: String(userId),
            createdAt: { $gte: monthAgo }
        }).sort({ createdAt: 1 });

        res.json(records);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch monthly report." });
    }
};

module.exports = {
    addMetrics,
    getLatestMetrics,
    getMonthlyMetrics
};
